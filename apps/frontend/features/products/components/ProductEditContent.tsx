"use client";

import type { ChangeEvent } from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";

import { api } from "@convex/_generated/api";
import {
  useAction,
  useMutation,
  usePreloadedQuery,
  type Preloaded,
} from "convex/react";

import { AppHeader } from "@/components/app/AppHeader";
import { techStackCategories } from "@data/tech-stack";

import {
  ProductAiAssistantShell,
  type ProductAiProductContext,
} from "./ProductAiAssistantShell";
import { ProductEditFormSection } from "./ProductEditFormSection";
import { ProductEditHeroSection } from "./ProductEditHeroSection";
import {
  ProductRepoImportModal,
  type ProductImportRepository,
} from "./ProductRepoImportModal";
import { ProductTechPanelSection } from "./ProductTechPanelSection";
import { ProductTechSelectionModal } from "./ProductTechSelectionModal";
import { getProductHref } from "./product-ui";
import {
  applyMarkdownProposal,
  type MarkdownProposal,
  type MarkdownSelection,
} from "../markdown-edit";
import {
  applyProductFormProposal,
  type ProductFormProposal,
} from "../product-form-edit";
import type { ProductScreenshotDraft } from "../product-screenshot-draft";
import { getProductErrorMessage } from "../product-error";
import { uploadProductImage } from "../upload-product-image";
import {
  productEditFormSchema,
  type ProductEditFormValues,
} from "../product-form-schema";

type ProductEditContentProps = {
  draftKey?: string;
  preloadedProduct: Preloaded<typeof api.products.getForEdit>;
  preloadedProductAiState: Preloaded<typeof api.productAi.getEditorState>;
};

const MAX_SOURCE_IMAGE_BYTES = 6 * 1024 * 1024;
const MAX_PRODUCT_SCREENSHOTS = 8;

export function ProductEditContent({
  draftKey,
  preloadedProduct,
  preloadedProductAiState,
}: ProductEditContentProps) {
  const router = useRouter();
  const editData = usePreloadedQuery(preloadedProduct);
  const listProductRepositories = useAction(api.githubAction.listProductRepositories);
  const importProductRepository = useAction(api.githubAction.importProductRepository);
  const createUploadIntent = useMutation(api.files.createUploadIntent);
  const finalizeUpload = useMutation(api.files.finalizeUpload);
  const saveProduct = useMutation(api.products.saveForm);
  const product = editData?.product ?? null;
  const isCreating = editData !== null && product === null;

  const {
    control,
    formState,
    getValues,
    handleSubmit,
    reset,
    setValue,
  } = useForm<ProductEditFormValues>({
    defaultValues: {
      content: product?.content ?? "",
      githubUrl: product?.githubUrl ?? "",
      isPublic: product?.isPublic ?? true,
      name: product?.name ?? "",
      productUrl: product?.productUrl ?? "",
      projectType: product?.projectType ?? "personal",
      roles:
        product?.roles && product.roles.length > 0
          ? product.roles
          : ["Creator"],
      tagline: product?.tagline ?? "",
      teamSize: product?.teamSize ?? "",
      technologyKeys:
        product?.technologies.map(
          (technology: { technologyKey: string }) => technology.technologyKey,
        ) ?? [],
    },
    resolver: zodResolver(productEditFormSchema),
  });
  const content = useWatch({ control, name: "content" });
  const githubUrl = useWatch({ control, name: "githubUrl" });
  const name = useWatch({ control, name: "name" });
  const productUrl = useWatch({ control, name: "productUrl" });
  const projectType = useWatch({ control, name: "projectType" });
  const roles = useWatch({ control, name: "roles" });
  const tagline = useWatch({ control, name: "tagline" });
  const teamSize = useWatch({ control, name: "teamSize" });
  const selectedTechKeys = useWatch({ control, name: "technologyKeys" });
  const [logo, setLogo] = useState<string | undefined>(product?.logo);
  const [logoStorageId, setLogoStorageId] = useState(product?.logoStorageId);
  const [logoChanged, setLogoChanged] = useState(false);
  const [screenshots, setScreenshots] = useState<ProductScreenshotDraft[]>(
    product?.screenshotAssets.map(
      (screenshot: {
        storageId: ProductScreenshotDraft["storageId"];
        url: string;
      }) => ({
        previewUrl: screenshot.url,
        storageId: screenshot.storageId,
      }),
    ) ?? [],
  );
  const [screenshotsChanged, setScreenshotsChanged] = useState(false);
  const [contentSelection, setContentSelection] =
    useState<MarkdownSelection | null>(null);
  const [repoModalOpen, setRepoModalOpen] = useState(isCreating);
  const [repoImportLoaded, setRepoImportLoaded] = useState(false);
  const [repoImportLoading, setRepoImportLoading] = useState(false);
  const [repoImportError, setRepoImportError] = useState<string | null>(null);
  const [repoImportNotInstalled, setRepoImportNotInstalled] = useState(false);
  const [importingRepository, setImportingRepository] = useState<string | null>(null);
  const [repositories, setRepositories] = useState<ProductImportRepository[]>([]);
  const repoImportRequestStartedRef = useRef(false);
  const localObjectUrlsRef = useRef(new Set<string>());
  const [techModalOpen, setTechModalOpen] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const saving = formState.isSubmitting;
  const validationError =
    formState.errors.name?.message ??
    formState.errors.tagline?.message ??
    formState.errors.content?.message ??
    formState.errors.projectType?.message ??
    formState.errors.teamSize?.message ??
    formState.errors.roles?.message ??
    formState.errors.productUrl?.message ??
    formState.errors.githubUrl?.message ??
    formState.errors.isPublic?.message ??
    formState.errors.technologyKeys?.message ??
    null;

  const selectedTechGroups = useMemo(() => {
    const selectedKeySet = new Set(selectedTechKeys);

    return techStackCategories.flatMap((category) => {
      const technologies = category.technologies
        .filter((technology) => selectedKeySet.has(technology.key))
        .map((technology) => ({
          categoryName: category.name,
          key: technology.key,
          name: technology.name,
        }));

      if (technologies.length === 0) {
        return [];
      }

      return [{ categoryName: category.name, technologies }];
    });
  }, [selectedTechKeys]);

  const productAiContext = useMemo<ProductAiProductContext>(
    () => ({
      githubUrl,
      name,
      productUrl,
      projectType,
      roles,
      tagline,
      teamSize,
      technologyKeys: selectedTechKeys,
    }),
    [
      githubUrl,
      name,
      productUrl,
      projectType,
      roles,
      selectedTechKeys,
      tagline,
      teamSize,
    ],
  );

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
          getProductErrorMessage(
            unknownError,
            "Could not load GitHub repositories.",
          ),
        );
      })
      .finally(() => {
        setRepoImportLoading(false);
      });
  }, [listProductRepositories, repoImportLoaded, repoModalOpen]);

  useEffect(() => {
    const localObjectUrls = localObjectUrlsRef.current;
    return () => {
      for (const objectUrl of localObjectUrls) {
        URL.revokeObjectURL(objectUrl);
      }
      localObjectUrls.clear();
    };
  }, []);

  if (editData === null) {
    return (
      <div className="h-svh bg-[#1A1A1A] text-white">
        <AppHeader />
        <main className="grid h-svh place-items-center px-6 pt-[68px] text-center">
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
  const newProductHref =
    draftKey === undefined
      ? "/products/new"
      : `/products/new?draft=${encodeURIComponent(draftKey)}`;

  function handleImportRepository(repositoryFullName: string) {
    if (product?._id === undefined && draftKey === undefined) {
      setRepoImportError("Reload this page to restore the product draft.");
      return;
    }
    setImportingRepository(repositoryFullName);
    setRepoImportError(null);

    importProductRepository({
      repositoryFullName,
      ...(product?._id === undefined
        ? { draftKey }
        : { productId: product._id }),
    })
      .then((result) => {
        const draft = result.draft;
        reset(
          {
            ...getValues(),
            githubUrl: draft.githubUrl,
            name: draft.name,
            productUrl: draft.productUrl ?? "",
            projectType: draft.projectType,
            roles: [],
            technologyKeys: draft.technologyKeys,
          },
          {
            keepErrors: false,
          },
        );
        setRepoModalOpen(false);
      })
      .catch((unknownError: unknown) => {
        setRepoImportError(
          getProductErrorMessage(
            unknownError,
            "Could not import that repository.",
          ),
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

    setUploadingImages((count) => count + 1);
    try {
      const storageId = await uploadProductImage(
        file,
        () => createUploadIntent({ purpose: "product_logo" }),
        finalizeUpload,
      );
      const previewUrl = URL.createObjectURL(file);
      localObjectUrlsRef.current.add(previewUrl);
      releaseLocalObjectUrl(logo);
      setLogo(previewUrl);
      setLogoStorageId(storageId);
      setLogoChanged(true);
      setError(null);
    } catch {
      setError("Could not upload that logo.");
    } finally {
      setUploadingImages((count) => count - 1);
      input.value = "";
    }
  }

  function handleLogoRemove() {
    releaseLocalObjectUrl(logo);
    setLogo(undefined);
    setLogoStorageId(undefined);
    setLogoChanged(true);
  }

  async function handleScreenshotAdd(event: ChangeEvent<HTMLInputElement>) {
    const input = event.currentTarget;
    const files = Array.from(input.files ?? []);
    input.value = "";
    if (files.length === 0) {
      return;
    }

    const availableSlots = MAX_PRODUCT_SCREENSHOTS - screenshots.length;
    if (files.length > availableSlots) {
      setError(`You can add up to ${MAX_PRODUCT_SCREENSHOTS} screenshots.`);
      return;
    }
    const invalidFile = files.find(
      (file) => !file.type.startsWith("image/") || file.size > MAX_SOURCE_IMAGE_BYTES,
    );
    if (invalidFile !== undefined) {
      setError("Each screenshot must be an image no larger than 6MB.");
      return;
    }

    setUploadingImages((count) => count + files.length);
    let uploadedCount = 0;
    try {
      for (const file of files) {
        const storageId = await uploadProductImage(
          file,
          () => createUploadIntent({ purpose: "product_screenshot" }),
          finalizeUpload,
        );
        const previewUrl = URL.createObjectURL(file);
        localObjectUrlsRef.current.add(previewUrl);
        setScreenshots((current) => [...current, { previewUrl, storageId }]);
        uploadedCount += 1;
      }
      setScreenshotsChanged(true);
      setError(null);
    } catch {
      if (uploadedCount > 0) {
        setScreenshotsChanged(true);
      }
      setError("Could not upload one of the screenshots.");
    } finally {
      setUploadingImages((count) => Math.max(0, count - files.length));
    }
  }

  function handleScreenshotMove(index: number, direction: -1 | 1) {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= screenshots.length) {
      return;
    }
    setScreenshots((current) => {
      const next = [...current];
      const currentItem = next[index];
      const targetItem = next[targetIndex];
      if (currentItem === undefined || targetItem === undefined) {
        return current;
      }
      next[index] = targetItem;
      next[targetIndex] = currentItem;
      return next;
    });
    setScreenshotsChanged(true);
  }

  function handleScreenshotRemove(index: number) {
    const screenshot = screenshots[index];
    if (screenshot === undefined) {
      return;
    }
    releaseLocalObjectUrl(screenshot.previewUrl);
    setScreenshots((current) => current.filter((_, itemIndex) => itemIndex !== index));
    setScreenshotsChanged(true);
  }

  function releaseLocalObjectUrl(url: string | undefined) {
    if (url === undefined || !localObjectUrlsRef.current.has(url)) {
      return;
    }
    URL.revokeObjectURL(url);
    localObjectUrlsRef.current.delete(url);
  }

  async function handleValidSubmit(values: ProductEditFormValues) {
    if (product?._id === undefined && draftKey === undefined) {
      setError("Reload this page to restore the product draft.");
      return;
    }
    if (uploadingImages > 0) {
      setError("Please wait for image uploads to finish.");
      return;
    }

    setError(null);
    try {
      const result = await saveProduct({
        content: values.content,
        ...(product?._id === undefined ? { draftKey } : {}),
        ...(values.githubUrl.trim().length === 0
          ? {}
          : { githubUrl: values.githubUrl }),
        isPublic: values.isPublic,
        ...(logoChanged ? { logoStorageId: logoStorageId ?? null } : {}),
        name: values.name,
        ...(product?._id === undefined ? {} : { productId: product._id }),
        ...(values.productUrl.trim().length === 0
          ? {}
          : { productUrl: values.productUrl }),
        projectType: values.projectType,
        roles: values.roles,
        ...(isCreating || screenshotsChanged
          ? { screenshotStorageIds: screenshots.map(({ storageId }) => storageId) }
          : {}),
        tagline: values.tagline,
        ...(values.teamSize === "" ? {} : { teamSize: values.teamSize }),
        technologyKeys: values.technologyKeys,
      });

      router.push(getProductHref(viewerUsername, result.slug));
    } catch (unknownError: unknown) {
      setError(
        getProductErrorMessage(unknownError, "Could not save product."),
      );
    }
  }

  const handleSubmitForm = handleSubmit(handleValidSubmit);

  function handleApplyMarkdownProposal(
    proposal: MarkdownProposal,
  ) {
    const result = applyMarkdownProposal(content, proposal, contentSelection);
    if (result.ok) {
      setValue("content", result.markdown, {
        shouldDirty: true,
        shouldValidate: formState.isSubmitted,
      });
    }
    return result;
  }

  function handleApplyFormProposal(proposal: ProductFormProposal) {
    const result = applyProductFormProposal(proposal);
    if (!result.ok) {
      return result;
    }

    const changes = result.changes;
    if (changes.name !== undefined) {
      setValue("name", changes.name, {
        shouldDirty: true,
        shouldValidate: formState.isSubmitted,
      });
    }
    if (changes.tagline !== undefined) {
      setValue("tagline", changes.tagline, {
        shouldDirty: true,
        shouldValidate: formState.isSubmitted,
      });
    }
    if (changes.projectType !== undefined) {
      setValue("projectType", changes.projectType, {
        shouldDirty: true,
        shouldValidate: formState.isSubmitted,
      });
    }
    if (changes.teamSize !== undefined) {
      setValue("teamSize", changes.teamSize, {
        shouldDirty: true,
        shouldValidate: formState.isSubmitted,
      });
    }
    if (changes.productUrl !== undefined) {
      setValue("productUrl", changes.productUrl, {
        shouldDirty: true,
        shouldValidate: formState.isSubmitted,
      });
    }
    if (changes.githubUrl !== undefined) {
      setValue("githubUrl", changes.githubUrl, {
        shouldDirty: true,
        shouldValidate: formState.isSubmitted,
      });
    }
    if (changes.roles !== undefined) {
      setValue("roles", changes.roles, {
        shouldDirty: true,
        shouldValidate: formState.isSubmitted,
      });
    }
    return result;
  }

  return (
    <div className="h-svh overflow-hidden bg-[#1A1A1A] text-white">
      <AppHeader />

      <main className="relative h-svh overflow-y-auto pt-[68px]">
        <div className="mx-auto w-full max-w-[1280px] px-4 pb-12">
          <ProductEditHeroSection
            isEditing={product !== null}
          />

          <div className="grid grid-cols-[minmax(0,1fr)_320px] items-start gap-8 max-lg:grid-cols-1">
            <ProductEditFormSection
              content={content}
              error={error ?? validationError}
              githubUrl={githubUrl}
              isEditing={product !== null}
              logo={logo}
              name={name}
              productUrl={productUrl}
              projectType={projectType}
              roles={roles}
              saving={saving || uploadingImages > 0}
              screenshots={screenshots}
              tagline={tagline}
              teamSize={teamSize}
              onCancel={() => router.back()}
              onContentChange={(value) =>
                setValue("content", value, {
                  shouldDirty: true,
                  shouldValidate: formState.isSubmitted,
                })
              }
              onGithubUrlChange={(value) =>
                setValue("githubUrl", value, {
                  shouldDirty: true,
                  shouldValidate: formState.isSubmitted,
                })
              }
              onLogoChange={handleLogoChange}
              onLogoRemove={handleLogoRemove}
              onNameChange={(value) =>
                setValue("name", value, {
                  shouldDirty: true,
                  shouldValidate: formState.isSubmitted,
                })
              }
              onProductUrlChange={(value) =>
                setValue("productUrl", value, {
                  shouldDirty: true,
                  shouldValidate: formState.isSubmitted,
                })
              }
              onProjectTypeChange={(value) =>
                setValue("projectType", value, {
                  shouldDirty: true,
                  shouldValidate: formState.isSubmitted,
                })
              }
              onRolesChange={(value) =>
                setValue("roles", value, {
                  shouldDirty: true,
                  shouldValidate: formState.isSubmitted,
                })
              }
              onScreenshotAdd={handleScreenshotAdd}
              onScreenshotMove={handleScreenshotMove}
              onScreenshotRemove={handleScreenshotRemove}
              onSelectionChange={setContentSelection}
              onSubmit={handleSubmitForm}
              onTaglineChange={(value) =>
                setValue("tagline", value, {
                  shouldDirty: true,
                  shouldValidate: formState.isSubmitted,
                })
              }
              onTeamSizeChange={(value) =>
                setValue("teamSize", value, {
                  shouldDirty: true,
                  shouldValidate: formState.isSubmitted,
                })
              }
            />

            <ProductTechPanelSection
              groups={selectedTechGroups}
              onEdit={() => setTechModalOpen(true)}
            />
          </div>
        </div>

        <ProductAiAssistantShell
          currentMarkdown={content}
          draftKey={draftKey}
          preloadedEditorState={preloadedProductAiState}
          productContext={productAiContext}
          productId={product?._id}
          selection={contentSelection}
          onApplyFormProposal={handleApplyFormProposal}
          onApplyProposal={handleApplyMarkdownProposal}
        />
      </main>

      {repoModalOpen ? (
        <ProductRepoImportModal
          connectHref={`/api/signup/github-app/connect?return_to=${encodeURIComponent(newProductHref)}`}
          error={repoImportError}
          importingRepository={importingRepository}
          installHref={`/api/signup/github-app/install?return_to=${encodeURIComponent(newProductHref)}`}
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
          onApply={(technologyKeys) =>
            setValue("technologyKeys", technologyKeys, {
              shouldDirty: true,
              shouldValidate: formState.isSubmitted,
            })
          }
          onClose={() => setTechModalOpen(false)}
        />
      ) : null}
    </div>
  );
}
