import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { createClient } from "@/lib/supabase/server";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Movement Analytics — Squat assessment",
  description:
    "Upload a side-view bodyweight squat video and get movement quality feedback—scores, observations, and coaching cues.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const fullName =
    user?.user_metadata && typeof user.user_metadata.full_name === "string"
      ? user.user_metadata.full_name
      : null;
  const metadataName =
    user?.user_metadata && typeof user.user_metadata.name === "string"
      ? user.user_metadata.name
      : null;

  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[var(--bg-page)] text-[var(--text-primary)]">
        <SiteHeader
          user={
            user
              ? {
                  id: user.id,
                  email: user.email ?? null,
                  fullName,
                  metadataName,
                }
              : null
          }
        />
        <div className="flex-1">{children}</div>
      </body>
    </html>
  );
}
