import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Exploration des prix des carburants - Prototype Lab",
  description: "Intégration de l’explorateur carburants dans une page data.gouv.fr.",
};

export default function Layout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
