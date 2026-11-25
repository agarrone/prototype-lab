import type { Metadata } from "next";
import { PublicationFlow } from "./publication-flow";

export const metadata: Metadata = {
  title: "Publication de données géographiques — Prototype Lab",
  description:
    "Reproduction interactive du parcours actuel de publication d’un jeu de données sur data.gouv.fr.",
};

export default function PublicationDonneesGeographiquesPage() {
  return <PublicationFlow />;
}
