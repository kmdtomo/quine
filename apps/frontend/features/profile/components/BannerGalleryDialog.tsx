const BANNER_GALLERY_OPTIONS = [
  {
    alt: "Banner option 1",
    src: "/background/drew-beamer-pek8uLQauMk-unsplash.jpg",
  },
  { alt: "Banner option 2", src: "/lp/tech_stack_bg.jpg" },
  {
    alt: "Banner option 3",
    src: "/background/ivan-bandura-WhIff5iuW-E-unsplash.jpg",
  },
  { alt: "Banner option 4", src: "/profile/banner-city.jpg" },
  { alt: "Banner option 5", src: "/profile/banner-aurora.jpg" },
  { alt: "Banner option 6", src: "/profile/banner-field.jpg" },
];

export function BannerGalleryDialog({
  onClose,
  onSelect,
}: {
  onClose: () => void;
  onSelect: (src: string) => void;
}) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      <button
        type="button"
        className="absolute inset-0 bg-black/70 backdrop-blur"
        aria-label="Close banner gallery"
        onClick={onClose}
      />
      <section className="relative flex max-h-[calc(100vh-64px)] w-[720px] max-w-[calc(100vw-32px)] flex-col rounded-[16px] border border-[#3A3A3A] bg-[#272727] p-6 shadow-[0_8px_24px_rgba(0,0,0,0.4),0_4px_8px_rgba(0,0,0,0.2)]">
        <h3 className="mb-1 text-lg font-bold text-white">
          Choose a banner
        </h3>
        <p className="mb-4 text-xs text-[#999]">
          Pick from our default gallery
        </p>
        <div className="-mx-1.5 mt-[-6px] grid grid-cols-3 gap-4 overflow-y-auto px-1.5 pt-1.5 pb-4">
          {BANNER_GALLERY_OPTIONS.map((option) => (
            <button
              key={option.src}
              type="button"
              className="relative aspect-video w-full overflow-hidden rounded-lg border-2 border-transparent bg-[#1E1E1E] transition hover:border-primary hover:shadow-[0_0_0_1px_#07DE81,0_6px_16px_rgba(7,222,129,0.18)]"
              onClick={() => onSelect(option.src)}
            >
              <img
                src={option.src}
                alt={option.alt}
                className="size-full object-cover"
              />
            </button>
          ))}
        </div>
        <div className="mt-2 flex justify-end">
          <button
            type="button"
            className="rounded-full border border-[#444] px-4 py-2 text-sm font-medium text-[#999] transition hover:border-[#999] hover:text-[#D0D0D0]"
            onClick={onClose}
          >
            Cancel
          </button>
        </div>
      </section>
    </div>
  );
}
