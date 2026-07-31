import type { Id } from "@convex/_generated/dataModel";

type GenerateUploadUrl = () => Promise<string>;

export async function uploadProductImage(
  file: File,
  generateUploadUrl: GenerateUploadUrl,
): Promise<Id<"_storage">> {
  const uploadUrl = await generateUploadUrl();
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

  return result.storageId as Id<"_storage">;
}
