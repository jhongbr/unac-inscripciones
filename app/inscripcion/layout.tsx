import { StepIndicator } from "@/components/inscripcion/StepIndicator";
import { InscripcionGuard } from "@/components/inscripcion/InscripcionGuard";
import { AspiranteHeader } from "@/components/layout/AspiranteHeader";

export default function InscripcionLayout({
  children,
}: LayoutProps<"/inscripcion">) {
  return (
    <div className="min-h-screen bg-cream">
      <AspiranteHeader />

      <div className="mx-auto max-w-5xl px-6 py-8">
        <StepIndicator />
      </div>

      <main className="mx-auto max-w-3xl px-6 pb-20">
        <InscripcionGuard>{children}</InscripcionGuard>
      </main>
    </div>
  );
}
