import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Confirm your tech stack — Quine",
};

export default function SignupTechStackPage() {
  redirect("/tech-stack/edit?onboarding=1");
}
