"use client";
import { AppSidebar } from "@/components/app-sidebar";
import LoadingIndicator from "@/components/LoadingIndicator";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AuthContext } from "@/contexts/AuthContext";
import { useContext } from "react";
import { redirect } from "next/navigation";
import { Toaster } from "sonner";

function Userlayout({ children }: { children: React.ReactNode }) {
  const auth = useContext(AuthContext);

  if (!auth?.isInitialized) {
    return (
      <div className="absolute inset-0 flex items-center justify-center">
        <LoadingIndicator />
      </div>
    );
  }

  if (!auth?.isAuthenticated) {
    return redirect("/auth/login");
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <Toaster />
      <SidebarTrigger />
      {children}
    </SidebarProvider>
  );
}

export default Userlayout;
