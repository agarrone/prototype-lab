import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Exploration immobilière (DVF) - Prototype Lab",
  description: "Intégration de l’explorateur DVF dans une page data.gouv.fr.",
};

export default function Layout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
