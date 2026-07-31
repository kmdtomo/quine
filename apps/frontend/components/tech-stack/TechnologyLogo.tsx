import {
  getTechnologyLogo,
  getTechnologyLogoBackdrop,
  getTechnologyLogoForeground,
  type TechnologyLogoBackdrop,
  type TechnologyLogoForeground,
} from "@/lib/technology-logo";
import { cn } from "@/lib/utils";

type TechnologyLogoBackdropMode = TechnologyLogoBackdrop | "auto" | "none";
type TechnologyLogoColorMode = TechnologyLogoForeground | "auto";

type TechnologyLogoProps = {
  alt?: string;
  backdrop?: TechnologyLogoBackdropMode;
  className?: string;
  fallbackClassName?: string;
  imageClassName?: string;
  logoColor?: TechnologyLogoColorMode;
  name: string;
};

export function TechnologyLogo({
  alt = "",
  backdrop = "none",
  className,
  fallbackClassName,
  imageClassName,
  logoColor = "brand",
  name,
}: TechnologyLogoProps) {
  const resolvedBackdrop =
    backdrop === "auto"
      ? getTechnologyLogoBackdrop(name)
      : backdrop === "none"
        ? null
        : backdrop;
  const resolvedLogoColor =
    logoColor === "auto" ? getTechnologyLogoForeground(name) : logoColor;
  const logo = getTechnologyLogo(name, resolvedLogoColor);

  return (
    <span
      className={cn(
        "relative grid shrink-0 place-items-center overflow-hidden rounded-[10px] border border-black/5 bg-zinc-100",
        className,
      )}
    >
      {resolvedBackdrop ? (
        <span
          className={cn(
            "pointer-events-none absolute inset-0 bg-white",
            resolvedBackdrop === "square" ? "rounded-[22%]" : "rounded-full",
          )}
          aria-hidden="true"
        />
      ) : null}
      {logo ? (
        <img
          src={logo}
          alt={alt}
          className={cn("relative z-[1] size-[70%] object-contain", imageClassName)}
        />
      ) : (
        <span
          className={cn(
            "relative z-[1] text-xs font-bold text-zinc-950",
            fallbackClassName,
          )}
        >
          {name.slice(0, 1)}
        </span>
      )}
    </span>
  );
}
