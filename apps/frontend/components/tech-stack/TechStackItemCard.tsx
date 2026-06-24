import { TechnologyLogo } from "@/components/tech-stack/TechnologyLogo";
import { cn } from "@/lib/utils";

type TechStackItemCardProps = {
  className?: string;
  name: string;
};

export function TechStackItemCard({ className, name }: TechStackItemCardProps) {
  return (
    <div
      className={cn(
        "group relative flex size-24 cursor-pointer flex-col items-center justify-center overflow-hidden rounded-xl border border-[#4D494A] p-2 transition hover:border-primary/60",
        className,
      )}
    >
      <div
        className="absolute inset-0 bg-[url('/lp/tech_stack_bg.jpg')] bg-cover bg-center bg-no-repeat brightness-150"
        aria-hidden="true"
      />
      <TechnologyLogo
        name={name}
        backdrop="auto"
        className="relative z-[1] mb-2 size-10 border-0 bg-transparent"
        fallbackClassName="text-base text-white"
        imageClassName="size-full"
        logoColor="auto"
      />
      <div className="relative z-[1] w-full px-0.5 text-center">
        <span className="block w-full overflow-hidden text-ellipsis whitespace-nowrap text-center text-xs font-medium text-white">
          {name}
        </span>
      </div>
    </div>
  );
}
