import { AppNav } from "@/components/app-nav";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-full bg-[radial-gradient(ellipse_at_top,rgba(200,245,66,0.12),transparent_40%),linear-gradient(180deg,#f7fbf8,#eef4f0)]">
      <AppNav />
      <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
        {children}
      </main>
    </div>
  );
}
