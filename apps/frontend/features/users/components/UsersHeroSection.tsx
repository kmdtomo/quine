export function UsersHeroSection() {
  return (
    <section className="flex items-end justify-between gap-6 pt-6 pb-5">
      <div className="flex min-w-0 flex-col gap-1">
        <span className="inline-flex text-[11px] font-bold tracking-[0.14em] text-primary uppercase">
          Engineers
        </span>
        <h1 className="mt-0.5 text-[28px] leading-[1.2] font-bold tracking-[-0.015em] text-white max-[520px]:text-[22px]">
          Discover engineers by stack
        </h1>
        <p className="mt-0.5 text-sm text-[#999]">
          Find engineers to work with — filter by role and the technologies
          they use.
        </p>
      </div>
    </section>
  );
}
