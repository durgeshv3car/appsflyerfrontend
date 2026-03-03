"use client";
import { SessionProvider } from "next-auth/react";
import NavigationProvider from "@/contentApi/navigationProvider";
import SettingSideBarProvider from "@/contentApi/settingSideBarProvider";

export const metadata = {
  title: "Automate | Dashboard",
  description: "Automate is a admin Dashboard create for multipurpose,",
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
