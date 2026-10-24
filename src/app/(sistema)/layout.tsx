import MainLayout from "@/components/layout/MainLayout";
import AuthGuard from "@/modules/auth/views/AuthGuard";

export default function SistemaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard>
      <MainLayout>{children}</MainLayout>
    </AuthGuard>
  );
}
