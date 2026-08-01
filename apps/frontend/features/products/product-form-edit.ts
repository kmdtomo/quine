export type ProductFormField =
  | "name"
  | "tagline"
  | "projectType"
  | "teamSize"
  | "productUrl"
  | "githubUrl"
  | "roles";

export type ProductFormProjectType = "personal" | "work" | "open_source";
export type ProductFormTeamSize = "solo" | "2-5" | "6-10" | "11-30" | "31+";

export type ProductFormEdit = {
  field: ProductFormField;
  label?: string;
  value: string | string[];
};

export type ProductFormProposal = {
  formEdits?: ProductFormEdit[];
  kind: "form_update";
};

export type ProductFormChanges = {
  githubUrl?: string;
  name?: string;
  productUrl?: string;
  projectType?: ProductFormProjectType;
  roles?: string[];
  tagline?: string;
  teamSize?: ProductFormTeamSize;
};

export type ApplyProductFormProposalResult =
  | {
      changes: ProductFormChanges;
      ok: true;
    }
  | {
      ok: false;
      reason: string;
    };

export function applyProductFormProposal(
  proposal: ProductFormProposal,
): ApplyProductFormProposalResult {
  const formEdits = proposal.formEdits ?? [];
  if (formEdits.length === 0) {
    return {
      ok: false,
      reason: "Form proposal does not contain field changes.",
    };
  }

  const changes: ProductFormChanges = {};
  for (const edit of formEdits) {
    const result = applyProductFormEdit(changes, edit);
    if (!result.ok) {
      return result;
    }
  }

  return { changes, ok: true };
}

export function getProductFormFieldLabel(field: ProductFormField) {
  if (field === "projectType") {
    return "Project Type";
  }
  if (field === "teamSize") {
    return "Team Size";
  }
  if (field === "productUrl") {
    return "Product URL";
  }
  if (field === "githubUrl") {
    return "GitHub URL";
  }
  if (field === "roles") {
    return "Roles";
  }
  if (field === "tagline") {
    return "Tagline";
  }
  return "Name";
}

export function formatProductFormValue(value: string | string[]) {
  if (Array.isArray(value)) {
    return value.length === 0 ? "(none)" : value.join(", ");
  }
  return value.length === 0 ? "(empty)" : value;
}

function applyProductFormEdit(
  changes: ProductFormChanges,
  edit: ProductFormEdit,
): ApplyProductFormProposalResult {
  if (edit.field === "roles") {
    if (!Array.isArray(edit.value)) {
      return invalidValue(edit.field);
    }
    changes.roles = edit.value
      .map((role) => role.trim())
      .filter((role) => role.length > 0);
    return { changes, ok: true };
  }

  if (typeof edit.value !== "string") {
    return invalidValue(edit.field);
  }

  const value = edit.value.trim();
  if (edit.field === "name") {
    changes.name = value;
    return { changes, ok: true };
  }
  if (edit.field === "tagline") {
    changes.tagline = value;
    return { changes, ok: true };
  }
  if (edit.field === "productUrl") {
    changes.productUrl = value;
    return { changes, ok: true };
  }
  if (edit.field === "githubUrl") {
    changes.githubUrl = value;
    return { changes, ok: true };
  }
  if (edit.field === "projectType") {
    const projectType = parseProductProjectType(value);
    if (projectType === null) {
      return invalidValue(edit.field);
    }
    changes.projectType = projectType;
    return { changes, ok: true };
  }
  if (edit.field === "teamSize") {
    const teamSize = parseProductTeamSize(value);
    if (teamSize === null) {
      return invalidValue(edit.field);
    }
    changes.teamSize = teamSize;
    return { changes, ok: true };
  }

  return invalidValue(edit.field);
}

function parseProductProjectType(value: string): ProductFormProjectType | null {
  if (value === "personal" || value === "work" || value === "open_source") {
    return value;
  }
  return null;
}

function parseProductTeamSize(value: string): ProductFormTeamSize | null {
  if (
    value === "solo" ||
    value === "2-5" ||
    value === "6-10" ||
    value === "11-30" ||
    value === "31+"
  ) {
    return value;
  }
  return null;
}

function invalidValue(field: ProductFormField): ApplyProductFormProposalResult {
  return {
    ok: false,
    reason: `Invalid value for ${getProductFormFieldLabel(field)}.`,
  };
}
