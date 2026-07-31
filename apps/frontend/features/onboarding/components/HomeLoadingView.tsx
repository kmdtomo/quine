import { LoaderCircleIcon } from "lucide-react";

export function HomeLoadingView() {
  return (
    <main className="grid min-h-svh place-items-center bg-[#1A1A1A] text-white">
      <div className="flex flex-col items-center gap-4">
        <LoaderCircleIcon
          className="size-7 animate-spin text-primary"
          aria-hidden="true"
        />
        <p className="text-xs font-semibold tracking-[0.14em] text-white/55 uppercase">
          Loading your profile
        </p>
      </div>
    </main>
  );
}
