import { redirect } from "next/navigation";

export default async function EditRequestPage({
  params,
}: {
  params: Promise<{ requestId: string }>;
}) {
  const { requestId } = await params;
  redirect(`/requests/${requestId}`);
}
