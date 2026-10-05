import PatientForm from "@/components/PatientForm";

/** Link da ficha de cada psicóloga: /f/<slug> */
export default async function FichaDoPsicologo({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <PatientForm slug={slug.toLowerCase()} />;
}
