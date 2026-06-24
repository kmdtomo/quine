import type { ChangeEvent, FormEvent } from "react";

import { ProductEditActionsSection } from "./ProductEditActionsSection";
import { ProductEditContentEditorSection } from "./ProductEditContentEditorSection";
import { ProductEditProjectHeaderSection } from "./ProductEditProjectHeaderSection";
import { ProductEditProjectInfoSection } from "./ProductEditProjectInfoSection";
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
  onNameChange: (value: string) => void;
  onProductUrlChange: (value: string) => void;
  onProjectTypeChange: (value: ProductProjectType) => void;
  onRolesChange: (roles: string[]) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onTaglineChange: (value: string) => void;
  onTeamSizeChange: (value: ProductTeamSize) => void;
  productUrl: string;
  projectType: ProductProjectType;
  roles: string[];
  saving: boolean;
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
  onNameChange,
  onProductUrlChange,
  onProjectTypeChange,
  onRolesChange,
  onSubmit,
  onTaglineChange,
  onTeamSizeChange,
  productUrl,
  projectType,
  roles,
  saving,
  tagline,
  teamSize,
}: ProductEditFormSectionProps) {
  return (
    <form className="flex min-w-0 flex-col gap-5" autoComplete="off" onSubmit={onSubmit}>
      <section className="flex flex-col gap-6 rounded-[8px] border border-white/[0.04] bg-[#212121] p-5">
        <ProductEditProjectHeaderSection
          logo={logo}
          name={name}
          tagline={tagline}
          onLogoChange={onLogoChange}
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

      <ProductEditContentEditorSection
        content={content}
        onContentChange={onContentChange}
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
