import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { NetworkIndicator } from "@/components/sync-status";

export default function PagesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <NetworkIndicator />
      {children}
      <Toaster />
    </>
  );
}
