"use client";

import { useEffect } from "react";
import { AuthProvider } from "@/contexts/AuthContext";
import { FamilyMembersProvider } from "@/contexts/FamilyMembersContext";
import { MemberContentProvider } from "@/contexts/MemberContentContext";
import { FamilyCommunityProvider } from "@/contexts/FamilyCommunityContext";
import { Toaster } from "@/components/ui/toaster";

export default function ClientBody({
  children,
}: {
  children: React.ReactNode;
}) {
  // Remove any extension-added classes during hydration
  useEffect(() => {
    // This runs only on the client after hydration
    document.body.className = "antialiased";
  }, []);

  return (
    <div className="antialiased">
      <AuthProvider>
        <FamilyMembersProvider>
          <MemberContentProvider>
            <FamilyCommunityProvider>
              {children}
              <Toaster />
            </FamilyCommunityProvider>
          </MemberContentProvider>
        </FamilyMembersProvider>
      </AuthProvider>
    </div>
  );
}
