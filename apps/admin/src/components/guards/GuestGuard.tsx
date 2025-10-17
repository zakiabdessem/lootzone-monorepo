import { useRouter } from "next/navigation";
import React, { useEffect } from "react";

import useAuth from "@/hooks/useAuth";

interface GuestGuardType {
  children: React.ReactNode;
}

// For routes that can only be accessed by unauthenticated users (like sign-in page)
function GuestGuard({ children }: GuestGuardType) {
  const { isAuthenticated, isInitialized } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isInitialized && isAuthenticated) {
      router.push("/dashboard/analytics");
    }
  }, [isInitialized, isAuthenticated, router]);

  return isInitialized && !isAuthenticated ? (
    <React.Fragment>{children}</React.Fragment>
  ) : (
    <React.Fragment />
  );
}

export default GuestGuard;
