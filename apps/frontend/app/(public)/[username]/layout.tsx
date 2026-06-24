import type { ReactNode } from "react";

export default function ProfileRouteLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="h-svh overflow-hidden bg-[#1A1A1A] text-white">
      {children}
    </div>
  );
}
