import { redirect } from "next/navigation";

export default async function RubsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  redirect(`/cook/${id}/guide`);
}
