import type { ReactNode } from "react";

type PageSectionProps = {
  children: ReactNode;
  className?: string;
  id?: string;
};

export function PageSection({ children, className = "", id }: PageSectionProps) {
  return (
    <section id={id} className={`mx-auto max-w-6xl px-6 ${className}`}>
      {children}
    </section>
  );
}
