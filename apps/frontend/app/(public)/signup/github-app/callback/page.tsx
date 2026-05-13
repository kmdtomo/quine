import { redirect } from "next/navigation";

type SearchParams = Promise<{
  installation_id?: string;
  setup_action?: string;
}>;

export default async function GithubAppCallbackPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const target = params.installation_id
    ? `/signup/detecting?installation_id=${encodeURIComponent(params.installation_id)}`
    : "/signup/github-app";
  redirect(target);
}
