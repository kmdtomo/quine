import { TechnologyLogo } from "@/components/tech-stack/TechnologyLogo";

type TechStackDetailHeroSectionProps = {
  engineerCount: number;
  engineerCountIsTruncated: boolean;
  productCount: number;
  productCountIsTruncated: boolean;
  technologyName: string;
};

export function TechStackDetailHeroSection({
  engineerCount,
  engineerCountIsTruncated,
  productCount,
  productCountIsTruncated,
  technologyName,
}: TechStackDetailHeroSectionProps) {
  return (
    <section className="relative flex items-center gap-8 py-6 max-[720px]:flex-col max-[720px]:items-start max-[720px]:gap-5 max-[720px]:py-5">
      <div className="relative grid size-[140px] shrink-0 place-items-center overflow-hidden rounded-[28px] border border-white/[0.08] bg-[linear-gradient(135deg,rgba(255,255,255,0.04),rgba(255,255,255,0.01))] shadow-[0_20px_60px_-20px_rgba(0,0,0,0.5)] before:pointer-events-none before:absolute before:-inset-px before:rounded-[inherit] before:bg-[radial-gradient(circle_at_30%_20%,rgba(7,222,129,0.18),transparent_60%)] max-[720px]:size-[108px] max-[720px]:rounded-[22px]">
        <TechnologyLogo
          name={technologyName}
          backdrop="auto"
          className="relative z-[1] size-[78px] border-0 bg-transparent drop-shadow-[0_6px_16px_rgba(0,0,0,0.4)] max-[720px]:size-[60px]"
          fallbackClassName="text-2xl text-white"
          imageClassName="size-full"
          logoColor="auto"
        />
      </div>

      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <h1 className="m-0 text-5xl leading-none font-bold tracking-[-0.03em] text-white max-[720px]:text-4xl">
          {technologyName}
        </h1>
        <p className="m-0 text-base leading-6 text-[#999] max-[720px]:text-sm">
          Products built with {technologyName}.
        </p>
        <div className="mt-1 flex items-center gap-4">
          <span className="inline-flex items-baseline gap-1.5 text-[13px] text-[#999]">
            <strong className="text-[15px] font-bold tracking-[-0.01em] text-white">
              {formatCount(productCount, productCountIsTruncated)}
            </strong>
            products
          </span>
          <span className="h-3 w-px bg-white/[0.12]" aria-hidden="true" />
          <span className="inline-flex items-baseline gap-1.5 text-[13px] text-[#999]">
            <strong className="text-[15px] font-bold tracking-[-0.01em] text-white">
              {formatCount(engineerCount, engineerCountIsTruncated)}
            </strong>
            engineers
          </span>
        </div>
      </div>
    </section>
  );
}

function formatCount(count: number, isTruncated: boolean) {
  return isTruncated ? `${count}+` : String(count);
}
