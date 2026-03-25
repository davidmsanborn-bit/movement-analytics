import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Processing — Movement Analytics",
  description: "Preparing your squat assessment.",
};

export default function ProcessingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
