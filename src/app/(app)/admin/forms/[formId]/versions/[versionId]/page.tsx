import { redirect } from "next/navigation";

export default async function FormVersionPage({ params }: { params: Promise<{ formId: string }> }) {
  const { formId } = await params;
  redirect(`/admin/forms/${formId}`);
}
