import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { NavigationWrapper } from "@/components/navigation-wrapper";

export default function PagesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {children}
      <Toaster />
      <NavigationWrapper />
    </>
  );
}
