import { Hero } from "@/components/landing/Hero";
import { ValueProps } from "@/components/landing/ValueProps";

export default function Home() {
  return (
    <main className="min-h-full">
      <Hero />
      <ValueProps />
    </main>
  );
}
