"use client";

import type { ChangeEvent, FormEvent } from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import { api } from "@convex/_generated/api";
import {
  useAction,
  useMutation,
  usePreloadedQuery,
  type Preloaded,
} from "convex/react";

import { AppHeader } from "@/components/app/AppHeader";
import { getTechnologyByKey } from "@data/tech-stack";

import { ProductAiAssistantShell } from "./ProductAiAssistantShell";
import { ProductEditFormSection } from "./ProductEditFormSection";
import { ProductEditHeroSection } from "./ProductEditHeroSection";
import {
  ProductRepoImportModal,
  type ProductImportRepository,
} from "./ProductRepoImportModal";
import {
  ProductTechPanelSection,
  type ProductEditTechnology,
} from "./ProductTechPanelSection";
import { ProductTechSelectionModal } from "./ProductTechSelectionModal";
import {
  getProfileHref,
  getProductHref,
  type ProductProjectType,
  type ProductTeamSize,
} from "./product-ui";

type ProductEditContentProps = {
  preloadedProduct: Preloaded<typeof api.products.getForEdit>;
};

const MAX_SOURCE_IMAGE_BYTES = 6 * 1024 * 1024;
const LOGO_SIZE = 512;

export function ProductEditContent({
  preloadedProduct,
}: ProductEditContentProps) {
  const router = useRouter();
  const editData = usePreloadedQuery(preloadedProduct);
  const listProductRepositories = useAction(api.githubAction.listProductRepositories);
  const importProductRepository = useAction(api.githubAction.importProductRepository);
  const saveProduct = useMutation(api.products.saveForm);
  const product = editData?.product ?? null;
  const isCreating = editData !== null && product === null;

  const [name, setName] = useState(product?.name ?? "");
  const [tagline, setTagline] = useState(product?.tagline ?? "");
  const [content, setContent] = useState(product?.content ?? "");
  const [projectType, setProjectType] = useState<ProductProjectType>(
    product?.projectType ?? "personal",
  );
  const [teamSize, setTeamSize] = useState<ProductTeamSize | "">(
    product?.teamSize ?? "",
  );
  const [roles, setRoles] = useState<string[]>(
    product?.roles && product.roles.length > 0 ? product.roles : ["Creator"],
  );
  const [productUrl, setProductUrl] = useState(product?.productUrl ?? "");
  const [githubUrl, setGithubUrl] = useState(product?.githubUrl ?? "");
  const [logo, setLogo] = useState<string | undefined>(product?.logo);
  const [screenshots] = useState<string[]>(product?.screenshots ?? []);
  const [isPublic] = useState(product?.isPublic ?? true);
  const [selectedTechKeys, setSelectedTechKeys] = useState<string[]>(
    product?.technologies.map((technology) => technology.technologyKey) ?? [],
  );
  const [repoModalOpen, setRepoModalOpen] = useState(isCreating);
  const [repoImportLoaded, setRepoImportLoaded] = useState(false);
  const [repoImportLoading, setRepoImportLoading] = useState(false);
  const [repoImportError, setRepoImportError] = useState<string | null>(null);
  const [repoImportNotInstalled, setRepoImportNotInstalled] = useState(false);
  const [importingRepository, setImportingRepository] = useState<string | null>(null);
  const [repositories, setRepositories] = useState<ProductImportRepository[]>([]);
  const repoImportRequestStartedRef = useRef(false);
  const [techModalOpen, setTechModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectedTechGroups = useMemo(() => {
    const groups: {
      categoryName: string;
      technologies: ProductEditTechnology[];
    }[] = [];

    for (const technologyKey of selectedTechKeys) {
      const technology = getTechnologyByKey(technologyKey);
      if (!technology) {
        continue;
      }

      const categoryName = technology.categoryName ?? "Technology";
      const group = groups.find((item) => item.categoryName === categoryName);
      const item = {
        categoryName,
        key: technology.key,
        name: technology.name,
      };

      if (group) {
        group.technologies.push(item);
      } else {
        groups.push({ categoryName, technologies: [item] });
      }
    }

    return groups;
  }, [selectedTechKeys]);

  useEffect(() => {
    if (!repoModalOpen || repoImportLoaded || repoImportRequestStartedRef.current) {
      return;
    }

    repoImportRequestStartedRef.current = true;
    setRepoImportLoading(true);
    setRepoImportError(null);
    setRepoImportNotInstalled(false);

    listProductRepositories({})
      .then((result) => {
        if (result.status === "not_installed") {
          setRepositories([]);
          setRepoImportNotInstalled(true);
        } else {
          setRepositories(result.repositories);
          setRepoImportNotInstalled(false);
        }
        setRepoImportLoaded(true);
      })
      .catch((unknownError: unknown) => {
        setRepoImportError(
          unknownError instanceof Error
            ? unknownError.message
            : "Could not load GitHub repositories.",
        );
      })
      .finally(() => {
        setRepoImportLoading(false);
      });
  }, [listProductRepositories, repoImportLoaded, repoModalOpen]);

  if (editData === null) {
    return (
      <div className="h-svh bg-[#1A1A1A] text-white">
        <AppHeader activeItem="create" homeHref="/" />
        <main className="grid h-svh place-items-center px-6 text-center">
          <div>
            <p className="text-sm font-semibold tracking-[0.14em] text-primary uppercase">
              Quine
            </p>
            <h1 className="mt-3 text-2xl font-semibold">Product not found</h1>
          </div>
        </main>
      </div>
    );
  }

  const viewerUsername = editData.viewer.username;
  const homeHref = getProfileHref(viewerUsername);

  function handleImportRepository(repositoryFullName: string) {
    setImportingRepository(repositoryFullName);
    setRepoImportError(null);

    importProductRepository({ repositoryFullName })
      .then((result) => {
        const draft = result.draft;
        setName(draft.name);
        setRoles([]);
        setGithubUrl(draft.githubUrl);
        setProductUrl(draft.productUrl ?? "");
        if (
          draft.projectType === "personal" ||
          draft.projectType === "work" ||
          draft.projectType === "open_source"
        ) {
          setProjectType(draft.projectType);
        }
        setSelectedTechKeys(draft.technologyKeys);
        setRepoModalOpen(false);
      })
      .catch((unknownError: unknown) => {
        setRepoImportError(
          unknownError instanceof Error
            ? unknownError.message
            : "Could not import that repository.",
        );
      })
      .finally(() => setImportingRepository(null));
  }

  async function handleLogoChange(event: ChangeEvent<HTMLInputElement>) {
    const input = event.currentTarget;
    const file = input.files?.[0];
    if (!file) {
      input.value = "";
      return;
    }
    if (!file.type.startsWith("image/")) {
      setError("Logo must be an image.");
      input.value = "";
      return;
    }
    if (file.size > MAX_SOURCE_IMAGE_BYTES) {
      setError("Logo must be 6MB or smaller.");
      input.value = "";
      return;
    }

    try {
      const dataUrl = await resizeImageFile(file, {
        maxHeight: LOGO_SIZE,
        maxWidth: LOGO_SIZE,
      });
      setLogo(dataUrl);
      setError(null);
    } catch {
      setError("Could not read that logo.");
    } finally {
      input.value = "";
    }
  }

  async function handleSubmit() {
    const trimmedName = name.trim();
    const trimmedTagline = tagline.trim();
    if (!trimmedName) {
      setError("Product name is required.");
      return;
    }
    if (!trimmedTagline) {
      setError("Product tagline is required.");
      return;
    }

    setSaving(true);
    setError(null);
    try {
      const result = await saveProduct({
        content,
        ...(githubUrl.trim().length === 0 ? {} : { githubUrl }),
        isPublic,
        ...(logo === undefined ? {} : { logo }),
        name: trimmedName,
        ...(product?._id === undefined ? {} : { productId: product._id }),
        ...(productUrl.trim().length === 0 ? {} : { productUrl }),
        projectType,
        roles,
        screenshots,
        tagline: trimmedTagline,
        ...(teamSize === "" ? {} : { teamSize }),
        technologyKeys: selectedTechKeys,
      });

      router.push(getProductHref(viewerUsername, result.slug));
    } catch (unknownError: unknown) {
      setError(
        unknownError instanceof Error
          ? unknownError.message
          : "Could not save product.",
      );
    } finally {
      setSaving(false);
    }
  }

  function handleSubmitForm(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void handleSubmit();
  }

  return (
    <div className="h-svh overflow-hidden bg-[#1A1A1A] text-white">
      {isCreating ? null : (
        <AppHeader activeItem="create" homeHref={homeHref} />
      )}

      <main
        className={
          isCreating
            ? "relative h-svh overflow-y-auto"
            : "relative h-svh overflow-y-auto pt-[68px]"
        }
      >
        {isCreating ? (
          <div className="pt-3">
            <AppHeader activeItem="create" fixed={false} homeHref={homeHref} />
          </div>
        ) : null}

        <div className="mx-auto w-full max-w-[1280px] px-4 pb-12">
          <ProductEditHeroSection
            isEditing={product !== null}
          />

          <div className="grid grid-cols-[minmax(0,1fr)_320px] items-start gap-8 max-lg:grid-cols-1">
            <ProductEditFormSection
              content={content}
              error={error}
              githubUrl={githubUrl}
              isEditing={product !== null}
              logo={logo}
              name={name}
              productUrl={productUrl}
              projectType={projectType}
              roles={roles}
              saving={saving}
              tagline={tagline}
              teamSize={teamSize}
              onCancel={() => router.back()}
              onContentChange={setContent}
              onGithubUrlChange={setGithubUrl}
              onLogoChange={handleLogoChange}
              onNameChange={setName}
              onProductUrlChange={setProductUrl}
              onProjectTypeChange={setProjectType}
              onRolesChange={setRoles}
              onSubmit={handleSubmitForm}
              onTaglineChange={setTagline}
              onTeamSizeChange={setTeamSize}
            />

            <ProductTechPanelSection
              groups={selectedTechGroups}
              onEdit={() => setTechModalOpen(true)}
            />
          </div>
        </div>

        <ProductAiAssistantShell />
      </main>

      {repoModalOpen ? (
        <ProductRepoImportModal
          error={repoImportError}
          importingRepository={importingRepository}
          installHref="/api/signup/github-app/install?return_to=/products/new"
          loading={repoImportLoading}
          notInstalled={repoImportNotInstalled}
          repositories={repositories}
          onClose={() => setRepoModalOpen(false)}
          onImport={handleImportRepository}
        />
      ) : null}

      {techModalOpen ? (
        <ProductTechSelectionModal
          selectedTechKeys={selectedTechKeys}
          onApply={setSelectedTechKeys}
          onClose={() => setTechModalOpen(false)}
        />
      ) : null}
    </div>
  );
}

function resizeImageFile(
  file: File,
  {
    maxHeight,
    maxWidth,
  }: {
    maxHeight: number;
    maxWidth: number;
  },
) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();

    reader.addEventListener("error", () => reject(new Error("read failed")));
    reader.addEventListener("load", () => {
      if (typeof reader.result !== "string") {
        reject(new Error("read failed"));
        return;
      }

      const image = new Image();
      image.addEventListener("error", () => reject(new Error("decode failed")));
      image.addEventListener("load", () => {
        const sourceWidth = image.naturalWidth || maxWidth;
        const sourceHeight = image.naturalHeight || maxHeight;
        const scale = Math.min(
          1,
          maxWidth / sourceWidth,
          maxHeight / sourceHeight,
        );
        const width = Math.max(1, Math.round(sourceWidth * scale));
        const height = Math.max(1, Math.round(sourceHeight * scale));
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;

        const context = canvas.getContext("2d");
        if (!context) {
          reject(new Error("canvas failed"));
          return;
        }

        context.drawImage(image, 0, 0, width, height);
        resolve(canvas.toDataURL("image/jpeg", 0.82));
      });
      image.src = reader.result;
    });

    reader.readAsDataURL(file);
  });
}
