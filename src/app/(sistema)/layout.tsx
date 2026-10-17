import MainLayout from "@/components/layout/MainLayout";

export default function SistemaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <MainLayout>{children}</MainLayout>;
}
