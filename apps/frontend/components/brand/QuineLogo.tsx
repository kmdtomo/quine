import Image from "next/image";
import Link from "next/link";

import { cn } from "@/lib/utils";

type QuineLogoProps = {
  className?: string;
  href?: string;
  priority?: boolean;
};

type QuineMarkProps = {
  className?: string;
};

export function QuineLogo({ className, href, priority = false }: QuineLogoProps) {
  const image = (
    <Image
      src="/lp/quine_logo.png"
      alt="Quine"
      width={140}
      height={44}
      className={cn("h-11 w-auto", className)}
      priority={priority}
    />
  );

  if (!href) {
    return image;
  }

  return (
    <Link href={href} aria-label="Quine">
      {image}
    </Link>
  );
}

export function QuineMark({ className }: QuineMarkProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className={cn("size-6 text-white", className)}
      aria-hidden="true"
    >
      <path
        d="m12 3 9 5-9 5-9-5 9-5Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="m3 13 9 5 9-5M3 17l9 5 9-5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
