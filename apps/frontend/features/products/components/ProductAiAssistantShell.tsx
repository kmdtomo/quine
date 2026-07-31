"use client";

import { useEffect, useRef, useState, type ChangeEvent } from "react";
import {
  CheckIcon,
  ChevronDownIcon,
  Loader2Icon,
  PaperclipIcon,
  XIcon,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import { api } from "@convex/_generated/api";
import type { Id } from "@convex/_generated/dataModel";
import {
  useMutation,
  usePreloadedQuery,
  type Preloaded,
} from "convex/react";

import { cn } from "@/lib/utils";

import type {
  ApplyMarkdownProposalResult,
  MarkdownEdit,
  MarkdownEditKind,
  MarkdownProposal,
  MarkdownSelection,
} from "../lib/markdown-edit";
import type {
  ApplyProductFormProposalResult,
  ProductFormEdit,
  ProductFormProposal,
} from "../lib/product-form-edit";
import { getProductErrorMessage } from "../lib/product-error";
import {
  formatProductFormValue,
  getProductFormFieldLabel,
} from "../lib/product-form-edit";
import { uploadProductImage } from "../lib/upload-product-image";
import {
  ArrowUpIcon,
  ExpandIcon,
  SparkleIcon,
} from "./ProductEditPrimitives";

export type ProductAiProductContext = {
  githubUrl?: string;
  name?: string;
  productUrl?: string;
  projectType?: "personal" | "work" | "open_source";
  roles: string[];
  tagline?: string;
  teamSize?: "" | "solo" | "2-5" | "6-10" | "11-30" | "31+";
  technologyKeys: string[];
};

type ProductAiAssistantShellProps = {
  currentMarkdown: string;
  draftKey?: string;
  onApplyFormProposal: (
    proposal: ProductFormProposal,
  ) => ApplyProductFormProposalResult;
  onApplyProposal: (proposal: MarkdownProposal) => ApplyMarkdownProposalResult;
  preloadedEditorState: Preloaded<typeof api.productAi.getEditorState>;
  productContext: ProductAiProductContext;
  productId: Id<"products"> | undefined;
  selection: MarkdownSelection | null;
};

type AttachmentDraft = {
  id: string;
  mimeType: string;
  name: string;
  size: number;
  storageId: Id<"_storage">;
};

type ProductAiMessageItem = {
  _id: Id<"productAiMessages">;
  content: string;
  role: "assistant" | "user";
};

type ProductAiProposalItem = {
  _id: Id<"productAiProposals">;
  assistantMessageId?: Id<"productAiMessages">;
  baseContentHash: string;
  edits: MarkdownEdit[];
  formEdits?: ProductFormEdit[];
  kind: MarkdownEditKind | "form_update";
  status: "applied" | "discarded" | "pending";
  summary: string;
  title: string;
};

const MAX_ATTACHMENT_BYTES = 6 * 1024 * 1024;
const MAX_ATTACHMENTS = 4;

export function ProductAiAssistantShell({
  currentMarkdown,
  draftKey,
  onApplyFormProposal,
  onApplyProposal,
  preloadedEditorState,
  productContext,
  productId,
  selection,
}: ProductAiAssistantShellProps) {
  const [open, setOpen] = useState(true);
  const [expanded, setExpanded] = useState(false);
  const [message, setMessage] = useState("");
  const [attachments, setAttachments] = useState<AttachmentDraft[]>([]);
  const [starting, setStarting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [resolvingProposalId, setResolvingProposalId] =
    useState<Id<"productAiProposals"> | null>(null);
  const [localError, setLocalError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const locallyAppliedProposalIdsRef = useRef(
    new Set<Id<"productAiProposals">>(),
  );
  const pendingIdempotencyKeyRef = useRef<string | null>(null);
  const generateUploadUrl = useMutation(api.files.generateUploadUrl);
  const startRun = useMutation(api.productAi.startRun);
  const retryRun = useMutation(api.productAi.retryRun);
  const setProposalStatus = useMutation(api.productAi.setProposalStatus);
  const editorState = usePreloadedQuery(preloadedEditorState);
  const latestRun = editorState.runs[0];
  const runActive =
    latestRun?.status === "queued" || latestRun?.status === "running";
  const sending = starting || uploading || runActive;
  const proposalGroups = groupProposalsByAssistantMessage(
    editorState.proposals.slice().reverse(),
  );

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ block: "end" });
  }, [editorState.messages.length, editorState.proposals.length, runActive]);

  function closeAssistant() {
    setExpanded(false);
    setOpen(false);
  }

  async function handleSubmit() {
    const trimmedMessage = message.trim();
    if (sending || (trimmedMessage.length === 0 && attachments.length === 0)) {
      return;
    }
    if (productId === undefined && draftKey === undefined) {
      setLocalError("Reload this page to restore the product draft.");
      return;
    }

    setStarting(true);
    setLocalError(null);
    try {
      const idempotencyKey =
        pendingIdempotencyKeyRef.current ?? crypto.randomUUID();
      pendingIdempotencyKeyRef.current = idempotencyKey;
      await startRun({
        attachments: attachments.map((attachment) => ({
          mimeType: attachment.mimeType,
          name: attachment.name,
          size: attachment.size,
          storageId: attachment.storageId,
        })),
        currentMarkdown,
        idempotencyKey,
        message:
          trimmedMessage ||
          "画像を見て、必要なら内容やフォームに反映できる提案を作ってください。",
        productContext: normalizeProductAiContext(productContext),
        ...(productId === undefined ? { draftKey } : { productId }),
        ...(selection === null || selection.start === selection.end
          ? {}
          : { selectionContext: selection }),
      });
      pendingIdempotencyKeyRef.current = null;
      setMessage("");
      setAttachments([]);
    } catch (unknownError: unknown) {
      setLocalError(
        getProductErrorMessage(unknownError, "Could not send message."),
      );
    } finally {
      setStarting(false);
    }
  }

  async function handleApplyProposal(
    proposal: ProductAiProposalItem,
  ) {
    if (!locallyAppliedProposalIdsRef.current.has(proposal._id)) {
      const result =
        proposal.kind === "form_update"
          ? onApplyFormProposal({
              formEdits: proposal.formEdits,
              kind: "form_update",
            })
          : onApplyProposal({
              baseContentHash: proposal.baseContentHash,
              edits: proposal.edits,
              kind: proposal.kind,
            });
      if (!result.ok) {
        setLocalError(result.reason);
        return;
      }
      locallyAppliedProposalIdsRef.current.add(proposal._id);
    }

    setLocalError(null);
    setResolvingProposalId(proposal._id);
    try {
      await setProposalStatus({
        proposalId: proposal._id,
        status: "applied",
      });
      locallyAppliedProposalIdsRef.current.delete(proposal._id);
    } catch (unknownError: unknown) {
      setLocalError(getMutationErrorMessage(unknownError, "Could not apply proposal."));
    } finally {
      setResolvingProposalId(null);
    }
  }

  async function handleDiscardProposal(proposalId: Id<"productAiProposals">) {
    setLocalError(null);
    setResolvingProposalId(proposalId);
    try {
      await setProposalStatus({
        proposalId,
        status: "discarded",
      });
    } catch (unknownError: unknown) {
      setLocalError(
        getMutationErrorMessage(unknownError, "Could not discard proposal."),
      );
    } finally {
      setResolvingProposalId(null);
    }
  }

  async function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const input = event.currentTarget;
    const file = input.files?.[0];
    if (!file) {
      input.value = "";
      return;
    }

    if (!file.type.startsWith("image/")) {
      setLocalError("Only image attachments are supported right now.");
      input.value = "";
      return;
    }
    if (file.size > MAX_ATTACHMENT_BYTES) {
      setLocalError("Image attachment must be 6MB or smaller.");
      input.value = "";
      return;
    }
    if (attachments.length >= MAX_ATTACHMENTS) {
      setLocalError(`Attach at most ${MAX_ATTACHMENTS} images.`);
      input.value = "";
      return;
    }

    setUploading(true);
    try {
      const storageId = await uploadProductImage(file, () =>
        generateUploadUrl({}),
      );
      setAttachments((current) => [
        ...current,
        {
          id: crypto.randomUUID(),
          mimeType: file.type,
          name: file.name,
          size: file.size,
          storageId,
        },
      ]);
      pendingIdempotencyKeyRef.current = null;
      setLocalError(null);
    } catch {
      setLocalError("Could not upload that image.");
    } finally {
      setUploading(false);
      input.value = "";
    }
  }

  async function handleRetryRun() {
    if (
      latestRun === undefined ||
      latestRun.status !== "failed" ||
      latestRun.attempt >= latestRun.maxAttempts
    ) {
      return;
    }
    setStarting(true);
    setLocalError(null);
    try {
      await retryRun({ runId: latestRun._id });
    } catch (unknownError: unknown) {
      setLocalError(
        getMutationErrorMessage(unknownError, "Could not retry Product AI."),
      );
    } finally {
      setStarting(false);
    }
  }

  return (
    <div className="fixed right-5 bottom-5 z-[65] max-sm:right-3 max-sm:bottom-3 max-sm:left-3">
      <button
        type="button"
        className={cn(
          "grid size-14 place-items-center rounded-full bg-[linear-gradient(180deg,#07DE81_0%,#11998E_100%)] text-[#06140F] shadow-[0_12px_40px_rgba(7,222,129,0.24),0_20px_70px_rgba(0,0,0,0.45)] transition hover:scale-105 max-sm:ml-auto",
          open && "hidden",
        )}
        aria-label="Open AI assistant"
        onClick={() => setOpen(true)}
      >
        <SparkleIcon className="size-6" />
      </button>

      <section
        className={cn(
          "relative flex flex-col overflow-hidden rounded-[18px] border border-white/[0.08] bg-[#101010]/95 shadow-[0_20px_70px_rgba(0,0,0,0.55)] backdrop-blur-[22px] transition-[width,height] duration-200 max-sm:h-[calc(100vh-24px)] max-sm:w-auto",
          expanded
            ? "h-[min(780px,calc(100vh-100px))] w-[min(720px,calc(100vw-40px))]"
            : "h-[520px] w-[360px]",
          !open && "hidden",
        )}
      >
        <div className="pointer-events-none absolute inset-0 rounded-[18px] bg-[radial-gradient(circle_at_20%_0%,rgba(7,222,129,0.16),transparent_36%),linear-gradient(180deg,rgba(255,255,255,0.05),transparent_24%)]" />
        <header className="relative flex items-center justify-between gap-3 border-b border-white/[0.08] px-4 py-3">
          <div className="flex min-w-0 items-center gap-2.5">
            <span className="grid size-8 shrink-0 place-items-center rounded-[9px] bg-[linear-gradient(180deg,#07DE81_0%,#11998E_100%)] text-[#06140F]">
              <SparkleIcon className="size-4" />
            </span>
            <div className="min-w-0">
              <h3 className="truncate text-sm font-bold text-white">Quine AI</h3>
              {editorState.repoContext ? (
                <p className="truncate text-[11px] text-[#888888]">
                  {editorState.repoContext.repositoryFullName}
                </p>
              ) : null}
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button
              type="button"
              className="grid size-7 place-items-center rounded-[6px] text-[#888888] transition hover:bg-white/[0.06] hover:text-white"
              aria-label="Expand"
              aria-pressed={expanded}
              onClick={() => setExpanded((current) => !current)}
            >
              <ExpandIcon className="size-3.5" />
            </button>
            <button
              type="button"
              className="grid size-7 place-items-center rounded-[6px] text-[#888888] transition hover:bg-white/[0.06] hover:text-white"
              aria-label="Minimize"
              onClick={closeAssistant}
            >
              <ChevronDownIcon className="size-4" aria-hidden="true" />
            </button>
          </div>
        </header>

        <div className="relative flex-1 overflow-y-auto px-4 py-4" aria-live="polite">
          <div className="flex flex-col gap-3">
            {editorState.messages.map((item: ProductAiMessageItem) => (
              <div key={item._id} className="flex w-full flex-col gap-2">
                <MessageBubble content={item.content} role={item.role} />
                {item.role === "assistant"
                  ? (proposalGroups.byMessage.get(item._id) ?? []).map(
                      (proposal) => (
                        <ProposalSurface
                          busy={resolvingProposalId === proposal._id}
                          key={proposal._id}
                          proposal={proposal}
                          onApply={() => handleApplyProposal(proposal)}
                          onDiscard={() => handleDiscardProposal(proposal._id)}
                        />
                      ),
                    )
                  : null}
              </div>
            ))}

            {proposalGroups.orphaned.map((proposal) => (
              <ProposalSurface
                busy={resolvingProposalId === proposal._id}
                key={proposal._id}
                proposal={proposal}
                onApply={() => handleApplyProposal(proposal)}
                onDiscard={() => handleDiscardProposal(proposal._id)}
              />
            ))}

            {sending ? (
              <div className="flex items-center gap-2 rounded-[8px] border border-white/[0.06] bg-white/[0.03] px-3 py-2 text-xs text-[#A0A0A0]">
                <Loader2Icon className="size-3.5 animate-spin" aria-hidden="true" />
                {uploading ? "Uploading attachment" : "Thinking"}
              </div>
            ) : null}
            {latestRun?.status === "failed" ? (
              <div className="rounded-[8px] border border-red-400/15 bg-red-400/[0.07] px-3 py-2 text-xs text-red-100">
                <p>{getRunErrorMessage(latestRun.errorCode)}</p>
                {latestRun.attempt < latestRun.maxAttempts ? (
                  <button
                    type="button"
                    className="mt-2 rounded-md border border-red-200/20 px-2 py-1 font-semibold transition hover:bg-red-200/10 disabled:opacity-50"
                    disabled={starting}
                    onClick={() => void handleRetryRun()}
                  >
                    Retry
                  </button>
                ) : null}
              </div>
            ) : null}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {localError ? (
          <p className="relative border-t border-red-400/10 bg-red-400/10 px-4 py-2 text-xs leading-5 text-red-200">
            {localError}
          </p>
        ) : null}

        <form
          className="relative border-t border-white/[0.08] p-3"
          onSubmit={(event) => {
            event.preventDefault();
            void handleSubmit();
          }}
        >
          {attachments.length > 0 ? (
            <div className="mb-2 flex flex-wrap gap-2">
              {attachments.map((attachment) => (
                <button
                  key={attachment.id}
                  type="button"
                  className="inline-flex max-w-full items-center gap-1.5 rounded-full border border-white/[0.08] bg-white/[0.05] px-2.5 py-1 text-[11px] text-[#D0D0D0]"
                  onClick={() =>
                    setAttachments((current) => {
                      pendingIdempotencyKeyRef.current = null;
                      return current.filter((item) => item.id !== attachment.id);
                    })
                  }
                >
                  <PaperclipIcon className="size-3 shrink-0" aria-hidden="true" />
                  <span className="truncate">{attachment.name}</span>
                  <XIcon className="size-3 shrink-0" aria-hidden="true" />
                </button>
              ))}
            </div>
          ) : null}

          <div className="rounded-[14px] border border-white/[0.08] bg-black/30 p-2 transition focus-within:border-[#07DE81]/40">
            <textarea
              className="max-h-32 min-h-10 w-full resize-none bg-transparent px-2 py-1 text-sm text-white outline-none placeholder:text-[#777777]"
              placeholder="Send a message..."
              rows={2}
              value={message}
              onChange={(event) => {
                pendingIdempotencyKeyRef.current = null;
                setMessage(event.currentTarget.value);
              }}
              onKeyDown={(event) => {
                if (event.key === "Enter" && (event.metaKey || event.ctrlKey)) {
                  event.preventDefault();
                  void handleSubmit();
                }
              }}
            />
            <div className="flex items-center justify-between pt-1">
              <div className="flex items-center gap-1">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  disabled={sending || attachments.length >= MAX_ATTACHMENTS}
                  onChange={(event) => void handleFileChange(event)}
                />
                <button
                  type="button"
                  className="grid size-7 place-items-center rounded-[7px] text-[#888888] transition hover:bg-white/[0.06] hover:text-white"
                  aria-label="Attach image"
                  disabled={sending || attachments.length >= MAX_ATTACHMENTS}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <PaperclipIcon className="size-3.5" />
                </button>
              </div>
              <button
                type="submit"
                className="grid size-8 place-items-center rounded-[9px] bg-white text-black transition hover:bg-[#07DE81] disabled:pointer-events-none disabled:opacity-50"
                aria-label="Send"
                disabled={sending}
              >
                {sending ? (
                  <Loader2Icon className="size-4 animate-spin" aria-hidden="true" />
                ) : (
                  <ArrowUpIcon className="size-4" />
                )}
              </button>
            </div>
          </div>
        </form>
      </section>
    </div>
  );
}

function MessageBubble({
  content,
  role,
}: {
  content: string;
  role: "assistant" | "user";
}) {
  return (
    <div
      className={cn(
        "max-w-[88%] rounded-[10px] px-3 py-2 text-sm leading-6",
        role === "user"
          ? "self-end whitespace-pre-wrap bg-[#07DE81] text-[#06140F]"
          : "self-start border border-white/[0.06] bg-white/[0.04] text-[#E5E5E5]",
      )}
    >
      {role === "user" ? content : <MarkdownMessage content={content} />}
    </div>
  );
}

function MarkdownMessage({ content }: { content: string }) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        a: ({ children, href }) => (
          <a
            href={href}
            className="font-semibold text-[#07DE81] underline decoration-[#07DE81]/40 underline-offset-2 transition hover:decoration-[#07DE81]"
            target="_blank"
            rel="noreferrer"
          >
            {children}
          </a>
        ),
        blockquote: ({ children }) => (
          <blockquote className="my-2 border-l border-white/[0.14] pl-3 text-[#BDBDBD]">
            {children}
          </blockquote>
        ),
        code: ({ children }) => (
          <code className="rounded-[4px] border border-white/[0.08] bg-black/30 px-1 py-0.5 text-[0.92em] text-[#DCDCDC]">
            {children}
          </code>
        ),
        li: ({ children }) => <li className="pl-0.5">{children}</li>,
        ol: ({ children }) => (
          <ol className="my-2 list-decimal space-y-1 pl-5">{children}</ol>
        ),
        p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
        pre: ({ children }) => (
          <pre className="my-2 overflow-auto rounded-[7px] border border-white/[0.06] bg-black/30 p-2 text-[11px] leading-5 text-[#CFCFCF]">
            {children}
          </pre>
        ),
        strong: ({ children }) => (
          <strong className="font-bold text-white">{children}</strong>
        ),
        ul: ({ children }) => (
          <ul className="my-2 list-disc space-y-1 pl-5">{children}</ul>
        ),
      }}
    >
      {content}
    </ReactMarkdown>
  );
}

function ProposalCard({
  busy,
  onApply,
  onDiscard,
  proposal,
}: {
  busy: boolean;
  onApply: () => void;
  onDiscard: () => void;
  proposal: ProductAiProposalItem;
}) {
  const pending = proposal.status === "pending";

  return (
    <article className="rounded-[8px] border border-[#07DE81]/20 bg-[#07DE81]/[0.06] p-3">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-sm font-bold text-white">{proposal.title}</p>
          <p className="mt-1 text-xs leading-5 text-[#BDBDBD]">{proposal.summary}</p>
        </div>
        <span className="shrink-0 rounded-full border border-white/[0.08] px-2 py-0.5 text-[10px] font-bold text-[#A0A0A0] uppercase">
          {proposal.kind.replace("_", " ")}
        </span>
      </div>

      <ProposalPreview proposal={proposal} />

      <div className="mt-3 flex items-center justify-between gap-3">
        <span className="text-[11px] text-[#888888]">
          {pending ? "Pending" : proposal.status}
        </span>
        {pending ? (
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              className="inline-flex h-7 items-center gap-1 rounded-[7px] border border-white/[0.08] px-2.5 text-xs font-bold text-[#D0D0D0] transition hover:bg-white/[0.06]"
              disabled={busy}
              onClick={onDiscard}
            >
              <XIcon className="size-3" aria-hidden="true" />
              Discard
            </button>
            <button
              type="button"
              className="inline-flex h-7 items-center gap-1 rounded-[7px] bg-white px-2.5 text-xs font-bold text-black transition hover:bg-[#07DE81]"
              disabled={busy}
              onClick={onApply}
            >
              <CheckIcon className="size-3" aria-hidden="true" />
              Apply
            </button>
          </div>
        ) : null}
      </div>
    </article>
  );
}

function ProposalSurface({
  busy,
  onApply,
  onDiscard,
  proposal,
}: {
  busy: boolean;
  onApply: () => void;
  onDiscard: () => void;
  proposal: ProductAiProposalItem;
}) {
  if (proposal.status !== "pending") {
    return <ProposalHistoryLine proposal={proposal} />;
  }

  return (
    <ProposalCard
      busy={busy}
      proposal={proposal}
      onApply={onApply}
      onDiscard={onDiscard}
    />
  );
}

function ProposalHistoryLine({
  proposal,
}: {
  proposal: ProductAiProposalItem;
}) {
  const applied = proposal.status === "applied";
  const Icon = applied ? CheckIcon : XIcon;

  return (
    <div className="flex items-center gap-2 rounded-[7px] border border-white/[0.05] bg-white/[0.025] px-2.5 py-1.5 text-[11px] text-[#8F8F8F]">
      <Icon
        className={cn(
          "size-3 shrink-0",
          applied ? "text-[#07DE81]" : "text-[#A0A0A0]",
        )}
        aria-hidden="true"
      />
      <span className="min-w-0 flex-1 truncate">
        {applied ? "Applied" : "Discarded"}: {proposal.title}
      </span>
      <span className="shrink-0 rounded-full border border-white/[0.06] px-1.5 py-0.5 font-bold uppercase">
        {proposal.kind.replace("_", " ")}
      </span>
    </div>
  );
}

function ProposalPreview({ proposal }: { proposal: ProductAiProposalItem }) {
  if (proposal.kind === "form_update") {
    const formEdits = proposal.formEdits ?? [];
    if (formEdits.length === 0) {
      return null;
    }

    return (
      <div className="mt-3 space-y-1.5 rounded-[7px] border border-white/[0.06] bg-black/25 p-2">
        {formEdits.map((edit, index) => (
          <div
            key={`${edit.field}-${index}`}
            className="flex items-start justify-between gap-3 text-[11px] leading-5"
          >
            <span className="shrink-0 font-semibold text-[#A0A0A0]">
              {edit.label ?? getProductFormFieldLabel(edit.field)}
            </span>
            <span className="min-w-0 text-right break-words text-[#CFCFCF]">
              {formatProductFormValue(edit.value)}
            </span>
          </div>
        ))}
      </div>
    );
  }

  const preview = proposal.edits
    .map((edit) => edit.markdown)
    .find((markdown) => markdown !== undefined);
  if (preview === undefined || preview.trim().length === 0) {
    return null;
  }

  return (
    <pre className="mt-3 max-h-36 overflow-auto rounded-[7px] border border-white/[0.06] bg-black/25 p-2 text-[11px] leading-5 whitespace-pre-wrap text-[#CFCFCF]">
      {preview}
    </pre>
  );
}

function groupProposalsByAssistantMessage(proposals: ProductAiProposalItem[]) {
  const byMessage = new Map<Id<"productAiMessages">, ProductAiProposalItem[]>();
  const orphaned: ProductAiProposalItem[] = [];

  for (const proposal of proposals) {
    const messageId = proposal.assistantMessageId;
    if (messageId === undefined) {
      orphaned.push(proposal);
      continue;
    }

    const current = byMessage.get(messageId);
    if (current === undefined) {
      byMessage.set(messageId, [proposal]);
    } else {
      current.push(proposal);
    }
  }

  return { byMessage, orphaned };
}

function getMutationErrorMessage(unknownError: unknown, fallback: string) {
  return getProductErrorMessage(unknownError, fallback);
}

function getRunErrorMessage(errorCode: string | undefined) {
  const messages: Record<string, string> = {
    PRODUCT_AI_ATTACHMENT_UNAVAILABLE:
      "An attachment is no longer available. Send the request again with a new upload.",
    PRODUCT_AI_ATTACHMENT_UNSUPPORTED:
      "One of the attachments is not a supported image.",
    PRODUCT_AI_CONFIGURATION_ERROR:
      "Product AI is not configured. Please contact the administrator.",
    PRODUCT_AI_CONTEXT_UNAVAILABLE:
      "The Product AI context could not be loaded.",
    PRODUCT_AI_EXECUTION_FAILED:
      "Product AI could not complete this request.",
  };
  return messages[errorCode ?? ""] ?? "Product AI could not complete this request.";
}

function normalizeProductAiContext(context: ProductAiProductContext) {
  return {
    roles: context.roles,
    ...(context.githubUrl === undefined ? {} : { githubUrl: context.githubUrl }),
    ...(context.name === undefined ? {} : { name: context.name }),
    ...(context.productUrl === undefined ? {} : { productUrl: context.productUrl }),
    ...(context.projectType === undefined
      ? {}
      : { projectType: context.projectType }),
    ...(context.tagline === undefined ? {} : { tagline: context.tagline }),
    ...(context.teamSize === "" || context.teamSize === undefined
      ? {}
      : { teamSize: context.teamSize }),
    technologyKeys: context.technologyKeys,
  };
}
