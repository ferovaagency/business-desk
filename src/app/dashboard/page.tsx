import { Suspense } from "react";
import { AuthProvider } from "@/components/auth-provider";
import { Dashboard } from "@/components/dashboard";

function DashboardContent() {
  return <Dashboard />;
}

export default function DashboardPage() {
  return (
    <AuthProvider>
      <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-[#cac4d0]">Cargando...</div>}>
        <DashboardContent />
      </Suspense>
    </AuthProvider>
  );
}
