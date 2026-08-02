import type { Id } from "@convex/_generated/dataModel";

type CreateUploadIntent = () => Promise<{
  uploadIntentId: Id<"uploadIntents">;
  uploadUrl: string;
}>;

type FinalizeUpload = (args: {
  storageId: Id<"_storage">;
  uploadIntentId: Id<"uploadIntents">;
}) => Promise<null>;

export async function uploadProductImage(
  file: File,
  createUploadIntent: CreateUploadIntent,
  finalizeUpload: FinalizeUpload,
): Promise<Id<"_storage">> {
  const { uploadIntentId, uploadUrl } = await createUploadIntent();
  const response = await fetch(uploadUrl, {
    body: file,
    headers: {
      "Content-Type": file.type,
    },
    method: "POST",
  });

  if (!response.ok) {
    throw new Error("IMAGE_UPLOAD_FAILED");
  }

  const result: unknown = await response.json();
  if (
    typeof result !== "object" ||
    result === null ||
    !("storageId" in result) ||
    typeof result.storageId !== "string"
  ) {
    throw new Error("INVALID_UPLOAD_RESPONSE");
  }

  const storageId = result.storageId as Id<"_storage">;
  await finalizeUpload({ storageId, uploadIntentId });
  return storageId;
}
