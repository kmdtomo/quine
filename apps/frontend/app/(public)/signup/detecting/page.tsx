import { redirect } from "next/navigation";

export default function SignupDetectingPage() {
  redirect("/tech-stack/edit?onboarding=1");
}
