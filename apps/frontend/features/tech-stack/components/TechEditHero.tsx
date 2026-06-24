export function TechEditHero() {
  return (
    <section className="flex shrink-0 py-6 pb-5">
      <div className="flex min-w-0 flex-col gap-1">
        <span className="inline-flex text-[11px] font-bold tracking-[0.14em] text-primary uppercase">
          Tech Stack
        </span>
        <div className="mt-0.5 flex min-w-0 flex-wrap items-baseline gap-x-3 gap-y-1">
          <h1 className="shrink-0 text-[28px] leading-tight font-bold tracking-[-0.015em] text-white">
            Build your skillset
          </h1>
          <p className="max-w-[620px] text-sm text-[#999]">
            Select technologies, set your years of experience, and arrange how
            they appear on your profile.
          </p>
        </div>
      </div>
    </section>
  );
}
