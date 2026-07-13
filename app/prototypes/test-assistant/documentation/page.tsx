import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Comprendre l’assistant d’exploration — Prototype data.gouv.fr",
  description:
    "Fonctionnement, outils et limites du prototype d’assistant d’exploration de données.",
};

const tools = [
  {
    title: "Lire les métadonnées",
    description:
      "Consulte le titre, la description, le producteur, la licence et les ressources publiques du jeu de données sur data.gouv.fr.",
  },
  {
    title: "Inspecter la structure",
    description:
      "Identifie les colonnes, leurs types et les informations nécessaires pour comprendre comment interroger la ressource.",
  },
  {
    title: "Interroger les données",
    description:
      "Génère puis exécute des requêtes SQL en lecture seule sur la ressource Parquet sélectionnée.",
  },
  {
    title: "Présenter les résultats",
    description:
      "Peut restituer une réponse en texte, sous forme de tableau ou avec une visualisation lorsque cela facilite la lecture.",
  },
];

export default function AssistantDocumentationPage() {
  return (
    <main className="min-h-dvh bg-white text-[#161616]">
      <div className="mx-auto w-full max-w-[720px] px-4 py-8 sm:px-6 lg:py-12">
        <Link
          href="/prototypes/test-assistant"
          className="text-[14px] font-medium text-[#000091] underline underline-offset-4 hover:text-[#1212ff]"
        >
          Retour à l’assistant d’exploration
        </Link>

        <header className="mt-10 max-w-3xl border-b border-[#dddddd] pb-10">
          <p className="text-[14px] font-medium text-[#666666]">Documentation du prototype</p>
          <h1 className="mt-3 text-3xl font-bold leading-tight tracking-[-0.02em] sm:text-[42px]">
            Comprendre l’assistant d’exploration
          </h1>
          <p className="mt-5 text-[17px] leading-7 text-[#3a3a3a]">
            Cette expérimentation étudie comment une conversation en langage naturel peut aider à comprendre et explorer les données publiées sur data.gouv.fr.
          </p>
        </header>

        <div className="divide-y divide-[#dddddd]">
          <DocumentationSection title="Pourquoi cette expérimentation ?">
            <p>
              Un fichier tabulaire peut être difficile à aborder : noms de colonnes peu explicites, formats techniques ou besoin d’écrire une requête. Nous testons l’idée d’un assistant placé directement à côté du tableau pour aider l’utilisateur à formuler une question et obtenir une réponse appuyée sur les données.
            </p>
            <p>
              Le service est un prototype, pas une fonctionnalité finalisée de data.gouv.fr. Les usages, l’interface et les capacités présentés ici peuvent évoluer à partir des retours recueillis.
            </p>
          </DocumentationSection>

          <DocumentationSection title="Comment fonctionne une réponse ?">
            <ul className="list-disc space-y-2 pl-5 marker:text-[#000091]">
              <li>L’assistant interprète la question et détermine les informations nécessaires.</li>
              <li>Il choisit un ou plusieurs outils adaptés, sans modifier le jeu de données d’origine.</li>
              <li>Il analyse les résultats obtenus et rédige une réponse dans la langue de l’utilisateur.</li>
              <li>En cas de doute important, il doit demander une précision plutôt que supposer une interprétation.</li>
            </ul>
          </DocumentationSection>

          <DocumentationSection title="Les outils disponibles">
            <ul className="list-disc space-y-2 pl-5 marker:text-[#000091]">
              {tools.map((tool) => (
                <li key={tool.title}>
                  <strong className="text-[#161616]">{tool.title} :</strong>{" "}
                  {tool.description}
                </li>
              ))}
            </ul>
          </DocumentationSection>

          <DocumentationSection title="Le modèle utilisé">
            <p>
              Le prototype s’appuie actuellement sur un grand modèle de langage open source exécuté sur une infrastructure opérée par la DINUM. L’interface présente le modèle <strong>gpt-oss-120b</strong>. Cette configuration est expérimentale et pourra changer pendant les tests.
            </p>
            <p>
              Le modèle ne lit pas spontanément tout le fichier : il raisonne à partir de la question, puis utilise les outils autorisés pour consulter la structure, les métadonnées ou exécuter une analyse ciblée.
            </p>
          </DocumentationSection>

          <DocumentationSection title="Données et confidentialité">
            <p>
              L’analyse porte sur des jeux de données publics et leurs versions Parquet. Les requêtes sont exécutées en lecture seule : l’assistant ne modifie ni la ressource ni sa page sur data.gouv.fr.
            </p>
            <p>
              Lorsque vous envoyez un retour, nous pouvons accéder à la question concernée pour comprendre le problème, mais pas à votre identité. Évitez néanmoins d’écrire des informations personnelles ou sensibles dans vos questions et commentaires.
            </p>
          </DocumentationSection>

          <DocumentationSection title="Limites à garder en tête">
            <ul className="list-disc space-y-2 pl-5 marker:text-[#000091]">
              <li>Une réponse peut contenir une erreur d’interprétation, de calcul ou de formulation.</li>
              <li>La qualité du résultat dépend de la structure et de la documentation du jeu de données.</li>
              <li>Les résultats doivent être vérifiés avant toute décision importante ou réutilisation.</li>
              <li>Certains fichiers volumineux ou atypiques peuvent ne pas être correctement analysés.</li>
            </ul>
          </DocumentationSection>
        </div>
      </div>
    </main>
  );
}

function DocumentationSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="py-9">
      <h2 className="text-xl font-bold leading-7">{title}</h2>
      <div className="mt-4 space-y-4 text-[15px] leading-7 text-[#3a3a3a]">{children}</div>
    </section>
  );
}
