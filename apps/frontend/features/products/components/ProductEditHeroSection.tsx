export function ProductEditHeroSection({
  isEditing,
}: {
  isEditing: boolean;
}) {
  return (
    <section className="flex items-end justify-between gap-6 py-6 max-lg:items-start max-sm:flex-col">
      <div className="flex min-w-0 flex-col gap-1">
        <span className="inline-flex items-center text-[11px] font-bold tracking-[0.14em] text-[#07DE81] uppercase">
          Product
        </span>
        <div className="mt-0.5 flex min-w-0 flex-wrap items-baseline gap-x-4 gap-y-1">
          <h1 className="shrink-0 text-[28px] leading-[1.2] font-bold tracking-normal text-white">
            {isEditing ? "Edit Product" : "Create New Product"}
          </h1>
          <p className="min-w-0 text-sm text-[#999999]">
            Share your project with the community. Fill in the details below to showcase your work.
          </p>
        </div>
      </div>
    </section>
  );
}
