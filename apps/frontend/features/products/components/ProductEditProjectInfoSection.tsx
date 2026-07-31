import {
  BriefcaseBusinessIcon,
  LinkIcon,
  TagIcon,
  UsersIcon,
} from "lucide-react";

import { DropdownMultiSelect } from "@/components/controls/DropdownMultiSelect";
import { DropdownSelect } from "@/components/controls/DropdownSelect";

import {
  FieldGroup,
  GithubIcon,
  UrlField,
} from "./ProductEditPrimitives";
import {
  PRODUCT_ROLE_OPTIONS,
  PROJECT_TYPE_OPTIONS,
  isProductProjectType,
  isProductTeamSize,
  type ProductProjectType,
  type ProductTeamSize,
  TEAM_SIZE_OPTIONS,
} from "./product-ui";

type ProductEditProjectInfoSectionProps = {
  githubUrl: string;
  onGithubUrlChange: (value: string) => void;
  onProductUrlChange: (value: string) => void;
  onProjectTypeChange: (value: ProductProjectType) => void;
  onRolesChange: (roles: string[]) => void;
  onTeamSizeChange: (value: ProductTeamSize) => void;
  productUrl: string;
  projectType: ProductProjectType;
  roles: string[];
  teamSize: ProductTeamSize | "";
};

const ROLE_DROPDOWN_OPTIONS = [
  ...PRODUCT_ROLE_OPTIONS.map((role) => ({ label: role, value: role })),
];

const dropdownTriggerClass =
  "min-w-0 rounded-[6px] border-[#2A2A2A] bg-[#0D0D0D] px-3 text-[13px] text-[#E0E0E0] shadow-none transition hover:border-white/20 hover:bg-[#111111] focus-visible:border-white/35 focus-visible:ring-white/10 data-[size=default]:h-8 [&_svg]:size-3.5 [&_svg]:text-[#D0D0D0]";

export function ProductEditProjectInfoSection({
  githubUrl,
  onGithubUrlChange,
  onProductUrlChange,
  onProjectTypeChange,
  onRolesChange,
  onTeamSizeChange,
  productUrl,
  projectType,
  roles,
  teamSize,
}: ProductEditProjectInfoSectionProps) {
  return (
    <>
      <h2 className="border-b border-white/[0.06] pb-2 text-[11px] font-medium tracking-[0.08em] text-[#888888] uppercase">
        Project info
      </h2>

      <div className="grid grid-cols-3 gap-4 max-md:grid-cols-1">
        <FieldGroup label="Project Type">
          <div className="flex items-center gap-2 text-[13px] text-white">
            <TagIcon className="size-5 shrink-0" aria-hidden="true" />
            <DropdownSelect
              ariaLabel="Project Type"
              className="min-w-[110px] flex-1"
              options={PROJECT_TYPE_OPTIONS}
              triggerClassName={dropdownTriggerClass}
              value={projectType}
              onValueChange={(value) => {
                if (isProductProjectType(value)) {
                  onProjectTypeChange(value);
                }
              }}
            />
          </div>
        </FieldGroup>

        <FieldGroup label="Team Size">
          <div className="flex items-center gap-2 text-[13px] text-white">
            <UsersIcon className="size-5 shrink-0" aria-hidden="true" />
            <DropdownSelect
              ariaLabel="Team Size"
              className="min-w-[220px] flex-1"
              options={TEAM_SIZE_OPTIONS}
              placeholder="Select"
              triggerClassName={dropdownTriggerClass}
              value={teamSize}
              valueClassName={teamSize === "" ? "text-[#7A7A7A]" : undefined}
              onValueChange={(value) => {
                if (isProductTeamSize(value)) {
                  onTeamSizeChange(value);
                }
              }}
            />
          </div>
        </FieldGroup>

        <FieldGroup label="Role">
          <div className="flex items-center gap-2 text-[13px] text-white">
            <BriefcaseBusinessIcon className="size-5 shrink-0" aria-hidden="true" />
            <DropdownMultiSelect
              ariaLabel="Role"
              className="min-w-[160px] max-w-[280px] flex-1"
              options={ROLE_DROPDOWN_OPTIONS}
              placeholder="Select roles"
              triggerClassName={dropdownTriggerClass}
              value={roles}
              valueClassName={roles.length === 0 ? "text-[#7A7A7A]" : undefined}
              onValueChange={onRolesChange}
            />
          </div>
        </FieldGroup>
      </div>

      <div className="grid grid-cols-2 gap-4 max-sm:grid-cols-1">
        <UrlField
          icon={<LinkIcon className="size-5" aria-hidden="true" />}
          label="Product URL"
          placeholder="https://..."
          value={productUrl}
          onChange={onProductUrlChange}
        />
        <UrlField
          icon={<GithubIcon className="size-5" />}
          label="GitHub URL"
          placeholder="https://github.com/..."
          value={githubUrl}
          onChange={onGithubUrlChange}
        />
      </div>
    </>
  );
}
