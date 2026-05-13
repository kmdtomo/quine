import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Confirm your tech stack — Quine",
};

export default function SignupTechStackPage() {
  return (
    <main className="min-h-svh flex items-center justify-center px-6 text-center">
      <div className="space-y-3">
        <h1 className="text-2xl font-semibold tracking-tight">
          Confirm your tech stack
        </h1>
        <p className="text-sm text-muted-foreground">
          このページは次のステップで実装されます。
        </p>
      </div>
    </main>
  );
}
