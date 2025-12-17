"use client";
import { SessionProvider } from "next-auth/react";
import NavigationProvider from "@/contentApi/navigationProvider";
import SettingSideBarProvider from "@/contentApi/settingSideBarProvider";

export const metadata = {
  title: "Duralux | Dashboard",
  description: "Duralux is a admin Dashboard create for multipurpose,",
};

export default function ClientLayout({ children }) {
  return (
    <SessionProvider>
      <SettingSideBarProvider>
        <NavigationProvider>{children}</NavigationProvider>
      </SettingSideBarProvider>
    </SessionProvider>
  );
}
