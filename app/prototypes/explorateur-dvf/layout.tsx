import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Explorateur de données de valeurs foncières - DVF",
  description:
    "Prototype haute fidélité de l’explorateur des demandes de valeurs foncières.",
};

export default function ExplorateurDvfLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return children;
}
