import { SignupDetectingContent } from "./SignupDetectingContent";

type SignupDetectingViewProps = {
  installationId: number | null;
};

export function SignupDetectingView({
  installationId,
}: SignupDetectingViewProps) {
  return <SignupDetectingContent installationId={installationId} />;
}
