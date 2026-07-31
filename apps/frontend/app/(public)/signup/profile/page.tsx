import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Complete your profile — Quine",
};

export default function SignupProfilePage() {
  redirect("/home");
}
