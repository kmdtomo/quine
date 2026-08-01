import type { ChangeEvent, FormEvent } from "react";

import { ProductEditActionsSection } from "./ProductEditActionsSection";
import {
  ProductEditContentEditorSection,
  type ProductEditContentSelection,
} from "./ProductEditContentEditorSection";
import { ProductEditProjectHeaderSection } from "./ProductEditProjectHeaderSection";
import { ProductEditProjectInfoSection } from "./ProductEditProjectInfoSection";
import { ProductEditScreenshotsSection } from "./ProductEditScreenshotsSection";
import type { ProductScreenshotDraft } from "../product-screenshot-draft";
import {
  type ProductProjectType,
  type ProductTeamSize,
} from "./product-ui";

type ProductEditFormSectionProps = {
  content: string;
  error: string | null;
  githubUrl: string;
  isEditing: boolean;
  logo: string | undefined;
  name: string;
  onCancel: () => void;
  onContentChange: (value: string) => void;
  onGithubUrlChange: (value: string) => void;
  onLogoChange: (event: ChangeEvent<HTMLInputElement>) => void;
  onLogoRemove: () => void;
  onNameChange: (value: string) => void;
  onProductUrlChange: (value: string) => void;
  onProjectTypeChange: (value: ProductProjectType) => void;
  onRolesChange: (roles: string[]) => void;
  onScreenshotAdd: (event: ChangeEvent<HTMLInputElement>) => void;
  onScreenshotMove: (index: number, direction: -1 | 1) => void;
  onScreenshotRemove: (index: number) => void;
  onSelectionChange: (selection: ProductEditContentSelection) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onTaglineChange: (value: string) => void;
  onTeamSizeChange: (value: ProductTeamSize) => void;
  productUrl: string;
  projectType: ProductProjectType;
  roles: string[];
  saving: boolean;
  screenshots: ProductScreenshotDraft[];
  tagline: string;
  teamSize: ProductTeamSize | "";
};

export function ProductEditFormSection({
  content,
  error,
  githubUrl,
  isEditing,
  logo,
  name,
  onCancel,
  onContentChange,
  onGithubUrlChange,
  onLogoChange,
  onLogoRemove,
  onNameChange,
  onProductUrlChange,
  onProjectTypeChange,
  onRolesChange,
  onScreenshotAdd,
  onScreenshotMove,
  onScreenshotRemove,
  onSelectionChange,
  onSubmit,
  onTaglineChange,
  onTeamSizeChange,
  productUrl,
  projectType,
  roles,
  saving,
  screenshots,
  tagline,
  teamSize,
}: ProductEditFormSectionProps) {
  return (
    <form
      noValidate
      className="flex min-w-0 flex-col gap-5"
      autoComplete="off"
      onSubmit={onSubmit}
    >
      <section className="flex flex-col gap-6 rounded-[8px] border border-white/[0.04] bg-[#212121] p-5">
        <ProductEditProjectHeaderSection
          logo={logo}
          name={name}
          tagline={tagline}
          onLogoChange={onLogoChange}
          onLogoRemove={onLogoRemove}
          onNameChange={onNameChange}
          onTaglineChange={onTaglineChange}
        />
        <ProductEditProjectInfoSection
          githubUrl={githubUrl}
          productUrl={productUrl}
          projectType={projectType}
          roles={roles}
          teamSize={teamSize}
          onGithubUrlChange={onGithubUrlChange}
          onProductUrlChange={onProductUrlChange}
          onProjectTypeChange={onProjectTypeChange}
          onRolesChange={onRolesChange}
          onTeamSizeChange={onTeamSizeChange}
        />
      </section>

      <ProductEditScreenshotsSection
        disabled={saving}
        screenshots={screenshots}
        onAdd={onScreenshotAdd}
        onMove={onScreenshotMove}
        onRemove={onScreenshotRemove}
      />

      <ProductEditContentEditorSection
        content={content}
        onContentChange={onContentChange}
        onSelectionChange={onSelectionChange}
      />
      <ProductEditActionsSection
        error={error}
        isEditing={isEditing}
        saving={saving}
        onCancel={onCancel}
      />
    </form>
  );
}
