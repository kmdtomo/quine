export type MarkdownEditKind =
  | "replace_all"
  | "replace_selection"
  | "insert"
  | "patch"
  | "outline"
  | "comment_only";

export type MarkdownInsertPosition =
  | "start"
  | "end"
  | "before_selection"
  | "after_selection"
  | "after_heading";

export type MarkdownEdit = {
  end?: number;
  insertPosition?: MarkdownInsertPosition;
  kind: MarkdownEditKind;
  markdown?: string;
  start?: number;
  targetHeading?: string;
};

export type MarkdownProposal = {
  baseContentHash: string;
  edits: MarkdownEdit[];
  kind: MarkdownEditKind;
};

export type MarkdownSelection = {
  end: number;
  start: number;
  text: string;
};

export type ApplyMarkdownProposalResult =
  | {
      markdown: string;
      ok: true;
    }
  | {
      ok: false;
      reason: string;
    };

export function createMarkdownContentHash(content: string) {
  let hash = 2166136261;
  for (let index = 0; index < content.length; index += 1) {
    hash ^= content.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }

  return `fnv1a:${(hash >>> 0).toString(16).padStart(8, "0")}:${content.length}`;
}

export function applyMarkdownProposal(
  currentMarkdown: string,
  proposal: MarkdownProposal,
  selection: MarkdownSelection | null,
): ApplyMarkdownProposalResult {
  if (proposal.kind === "comment_only") {
    return {
      ok: false,
      reason: "This proposal is feedback only.",
    };
  }

  const currentHash = createMarkdownContentHash(currentMarkdown);
  if (proposal.baseContentHash !== currentHash) {
    return {
      ok: false,
      reason: "Markdown changed after this proposal was created.",
    };
  }

  if (proposal.kind === "replace_all" || proposal.kind === "outline") {
    const markdown = findFirstMarkdown(proposal.edits);
    if (markdown === null) {
      return {
        ok: false,
        reason: "Proposal does not contain Markdown.",
      };
    }
    return { markdown, ok: true };
  }

  if (proposal.kind === "replace_selection") {
    const edit = proposal.edits[0];
    const markdown = edit?.markdown;
    if (edit === undefined || markdown === undefined) {
      return {
        ok: false,
        reason: "Selection proposal does not contain replacement Markdown.",
      };
    }
    const range = getEditRange(edit, selection);
    if (range === null || !isValidRange(currentMarkdown, range)) {
      return {
        ok: false,
        reason: "Selection is no longer available.",
      };
    }
    return {
      markdown: replaceRange(currentMarkdown, range.start, range.end, markdown),
      ok: true,
    };
  }

  if (proposal.kind === "insert") {
    return applyInsertEdits(currentMarkdown, proposal.edits, selection);
  }

  if (proposal.kind === "patch") {
    return applyPatchEdits(currentMarkdown, proposal.edits);
  }

  return {
    ok: false,
    reason: "Unsupported Markdown proposal.",
  };
}

function applyInsertEdits(
  currentMarkdown: string,
  edits: MarkdownEdit[],
  selection: MarkdownSelection | null,
): ApplyMarkdownProposalResult {
  let markdown = currentMarkdown;

  for (const edit of edits) {
    if (edit.markdown === undefined) {
      return {
        ok: false,
        reason: "Insert proposal does not contain Markdown.",
      };
    }

    const index = getInsertIndex(markdown, edit, selection);
    if (index === null) {
      return {
        ok: false,
        reason: "Insert target could not be found.",
      };
    }

    markdown = replaceRange(
      markdown,
      index,
      index,
      formatInsertion(markdown, index, edit.markdown),
    );
  }

  return { markdown, ok: true };
}

function applyPatchEdits(
  currentMarkdown: string,
  edits: MarkdownEdit[],
): ApplyMarkdownProposalResult {
  const patchEdits = edits
    .filter((edit) => edit.markdown !== undefined)
    .filter((edit) => edit.start !== undefined && edit.end !== undefined)
    .sort((left, right) => (right.start ?? 0) - (left.start ?? 0));

  if (patchEdits.length === 0) {
    return {
      ok: false,
      reason: "Patch proposal does not contain valid ranges.",
    };
  }

  let markdown = currentMarkdown;
  for (const edit of patchEdits) {
    const range = getEditRange(edit, null);
    if (range === null || !isValidRange(markdown, range)) {
      return {
        ok: false,
        reason: "Patch range is no longer valid.",
      };
    }
    markdown = replaceRange(markdown, range.start, range.end, edit.markdown ?? "");
  }

  return { markdown, ok: true };
}

function findFirstMarkdown(edits: MarkdownEdit[]) {
  for (const edit of edits) {
    if (edit.markdown !== undefined) {
      return edit.markdown;
    }
  }
  return null;
}

function getEditRange(
  edit: MarkdownEdit,
  selection: MarkdownSelection | null,
) {
  if (edit.start !== undefined && edit.end !== undefined) {
    return {
      end: edit.end,
      start: edit.start,
    };
  }

  if (selection === null) {
    return null;
  }

  return {
    end: selection.end,
    start: selection.start,
  };
}

function getInsertIndex(
  markdown: string,
  edit: MarkdownEdit,
  selection: MarkdownSelection | null,
) {
  if (edit.insertPosition === "start") {
    return 0;
  }
  if (edit.insertPosition === "before_selection") {
    return selection?.start ?? null;
  }
  if (edit.insertPosition === "after_selection") {
    return selection?.end ?? null;
  }
  if (edit.insertPosition === "after_heading") {
    return edit.targetHeading === undefined
      ? null
      : findHeadingInsertionIndex(markdown, edit.targetHeading);
  }
  if (edit.start !== undefined) {
    return edit.start;
  }

  return markdown.length;
}

function findHeadingInsertionIndex(markdown: string, targetHeading: string) {
  const normalizedTarget = normalizeHeading(targetHeading);
  if (!normalizedTarget) {
    return null;
  }

  const lines = markdown.split("\n");
  let offset = 0;
  for (const line of lines) {
    const headingMatch = /^#{1,6}\s+(.+)$/.exec(line.trim());
    const lineEndOffset = offset + line.length;
    if (
      headingMatch &&
      normalizeHeading(headingMatch[1] ?? "") === normalizedTarget
    ) {
      return lineEndOffset + (lineEndOffset < markdown.length ? 1 : 0);
    }
    offset = lineEndOffset + 1;
  }

  return null;
}

function normalizeHeading(value: string) {
  return value
    .replace(/^#{1,6}\s+/, "")
    .trim()
    .toLowerCase();
}

function formatInsertion(markdown: string, index: number, insertion: string) {
  const trimmedInsertion = insertion.trim();
  if (!trimmedInsertion) {
    return "";
  }

  const before = markdown.slice(0, index);
  const after = markdown.slice(index);
  const prefix =
    before.length === 0 ? "" : before.endsWith("\n\n") ? "" : before.endsWith("\n") ? "\n" : "\n\n";
  const suffix =
    after.length === 0 ? "" : after.startsWith("\n\n") ? "" : after.startsWith("\n") ? "\n" : "\n\n";

  return `${prefix}${trimmedInsertion}${suffix}`;
}

function isValidRange(
  markdown: string,
  range: {
    end: number;
    start: number;
  },
) {
  return (
    range.start >= 0 &&
    range.end >= range.start &&
    range.end <= markdown.length
  );
}

function replaceRange(
  markdown: string,
  start: number,
  end: number,
  replacement: string,
) {
  return `${markdown.slice(0, start)}${replacement}${markdown.slice(end)}`;
}
