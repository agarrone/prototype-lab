import type { Metadata } from "next";
import Link from "next/link";
import { chartPrompt } from "@/app/api/prototypes/explorateur-sql-et-ia/agent/prompts/chart";
import { mapPrompt } from "@/app/api/prototypes/explorateur-sql-et-ia/agent/prompts/map";
import { plannerPrompt } from "@/app/api/prototypes/explorateur-sql-et-ia/agent/prompts/planner";
import { sqlPrompt } from "@/app/api/prototypes/explorateur-sql-et-ia/agent/prompts/sql";
import { synthesisPrompt } from "@/app/api/prototypes/explorateur-sql-et-ia/agent/prompts/synthesis";
import { systemPrompt } from "@/app/api/prototypes/explorateur-sql-et-ia/agent/prompts/system";

export const metadata: Metadata = {
  title: "Fonctionnement technique de l’assistant — Prototype data.gouv.fr",
  description:
    "Architecture, prompts, outils, modèle, sécurité et feedback du prototype d’assistant d’exploration de données.",
};

const phases = [
  {
    name: "1. Planifier",
    detail:
      "Cadre la demande, évalue les ambiguïtés et choisit entre une réponse directe, une clarification, les métadonnées, le schéma ou une analyse SQL.",
  },
  {
    name: "2. Inspecter",
    detail:
      "Charge le schéma réel du Parquet dans le navigateur : table, nombre de lignes, colonnes, types et exemples.",
  },
  {
    name: "3. Interroger",
    detail:
      "Génère un SELECT DuckDB, le valide, puis l’exécute localement. Une requête en échec peut être corrigée, dans la limite de trois tentatives.",
  },
  {
    name: "4. Synthétiser",
    detail:
      "Rédige la réponse uniquement à partir du schéma et des résultats SQL effectivement obtenus.",
  },
  {
    name: "5. Visualiser",
    detail:
      "Si la question le demande, transforme le résultat SQL en graphique ou en carte, sans relire tout le fichier.",
  },
];

const tools = [
  {
    name: "get_dataset_metadata",
    runs: "Serveur",
    input: "Référence du jeu de données courant.",
    output:
      "Titre, description, producteur, licence, qualité, date, page et liste des ressources.",
    implementation:
      "Interroge les métadonnées publiques data.gouv.fr. Il ne lit pas les valeurs du fichier.",
  },
  {
    name: "inspect_schema",
    runs: "Navigateur",
    input: "Ressource Parquet sélectionnée.",
    output: "Nom de table, nombre de lignes, colonnes, types et exemples.",
    implementation:
      "Utilise DuckDB-WASM. Le résultat est mémorisé pour éviter les inspections redondantes.",
  },
  {
    name: "execute_sql",
    runs: "Navigateur",
    input: "Une requête SQL et une courte description.",
    output: "Colonnes, lignes retournées et nombre de lignes.",
    implementation:
      "Exécute un unique SELECT ou WITH en lecture seule. Les opérations de modification, chargement ou attachement sont refusées.",
  },
  {
    name: "create_chart",
    runs: "Modèle puis navigateur",
    input: "Question, schéma, SQL final et résultat SQL.",
    output: "Spécification légère inspirée de Vega-Lite.",
    implementation:
      "Le navigateur convertit la spécification en graphique Chart.js. Barres, lignes, nuages de points et anneaux sont pris en charge.",
  },
  {
    name: "create_map",
    runs: "Modèle puis navigateur",
    input: "Question, schéma, SQL final et résultat SQL géographique.",
    output: "Spécification de carte de points ou de choroplèthe.",
    implementation:
      "MapLibre affiche les points ou joint les régions et départements aux contours administratifs 2025 de data.gouv.fr. Un fallback déterministe détecte coordonnées, codes et noms si la spécification du modèle est inexploitable.",
  },
];

const promptSections = [
  { id: "system-prompt", title: "System prompt", prompt: systemPrompt },
  { id: "planner-prompt", title: "Sous-prompt de planification", prompt: plannerPrompt },
  { id: "sql-prompt", title: "Sous-prompt SQL", prompt: sqlPrompt },
  { id: "synthesis-prompt", title: "Sous-prompt de synthèse", prompt: synthesisPrompt },
  { id: "chart-prompt", title: "Sous-prompt graphique", prompt: chartPrompt },
  { id: "map-prompt", title: "Sous-prompt cartographique", prompt: mapPrompt },
];

const sectionClass = "border-t border-[#dddddd] py-10";

export default function AssistantTechnicalDocumentationPage() {
  const configuredModel = process.env.ALBERT_MODEL ?? "albert-large";
  const configuredApi = process.env.ALBERT_API_URL
    ? "Endpoint configuré par ALBERT_API_URL"
    : "Endpoint Albert API par défaut";

  return (
    <main className="min-h-dvh bg-white text-[#161616]">
      <div className="mx-auto w-full max-w-[960px] px-4 py-8 sm:px-6 lg:py-12">
        <Link
          href="/prototypes/test-assistant/documentation"
          className="text-[14px] font-medium text-[#000091] underline underline-offset-4 hover:text-[#1212ff]"
        >
          Retour à la documentation
        </Link>

        <header className="mt-10 pb-10">
          <p className="text-[14px] font-medium text-[#666666]">
            Documentation technique du prototype
          </p>
          <h1 className="mt-3 max-w-3xl text-3xl font-bold leading-tight tracking-[-0.02em] sm:text-[42px]">
            Comment fonctionne l’agent d’exploration ?
          </h1>
          <p className="mt-5 max-w-3xl text-[17px] leading-7 text-[#3a3a3a]">
            Cette page décrit l’implémentation actuelle : orchestration, modèle,
            outils, données échangées, prompts complets, visualisations,
            mécanisme de feedback et garde-fous. Elle documente un prototype,
            pas une architecture cible définitive.
          </p>
        </header>

        <nav aria-label="Sommaire" className="border border-[#dddddd] bg-[#f6f6f6] p-5">
          <p className="text-[13px] font-bold uppercase tracking-[0.04em] text-[#666666]">
            Sommaire
          </p>
          <ol className="mt-3 grid gap-2 text-[14px] sm:grid-cols-2">
            {[
              ["architecture", "Architecture et cycle d’une réponse"],
              ["model", "Modèle et sortie structurée"],
              ["tools", "Outils disponibles"],
              ["security", "Exécution et sécurité"],
              ["visualizations", "Graphiques et cartes"],
              ["feedback", "Mécanisme de feedback"],
              ["prompts", "Prompts complets"],
              ["limits", "Limites connues"],
            ].map(([href, label]) => (
              <li key={href}>
                <a className="text-[#000091] underline underline-offset-2" href={`#${href}`}>
                  {label}
                </a>
              </li>
            ))}
          </ol>
        </nav>

        <section id="architecture" className={sectionClass}>
          <SectionTitle
            eyebrow="Orchestration"
            title="Architecture et cycle d’une réponse"
            description="Le navigateur orchestre le parcours. La route serveur appelle le modèle, mais le fichier Parquet et DuckDB-WASM restent côté client."
          />
          <ol className="mt-7 grid gap-3">
            {phases.map((phase) => (
              <li key={phase.name} className="border-l-4 border-[#000091] bg-[#f6f6f6] px-4 py-3">
                <strong className="text-[15px]">{phase.name}</strong>
                <p className="mt-1 text-[14px] leading-6 text-[#3a3a3a]">{phase.detail}</p>
              </li>
            ))}
          </ol>
          <div className="mt-7 space-y-4 text-[15px] leading-7 text-[#3a3a3a]">
            <p>
              L’historique transmis est limité aux <strong>huit derniers messages</strong>,
              chacun tronqué à 1 200 caractères côté serveur. Le schéma et les
              métadonnées déjà récupérés sont réutilisés. Certaines réponses simples,
              comme le nombre de lignes ou la liste des colonnes, peuvent être produites
              directement depuis le schéma sans nouvel appel SQL.
            </p>
            <p>
              Pour une analyse, le navigateur autorise jusqu’à <strong>trois exécutions SQL</strong>.
              Une erreur DuckDB est renvoyée à la phase de génération suivante afin que
              le modèle puisse corriger la requête. Seules les preuves effectivement
              obtenues alimentent la synthèse finale.
            </p>
          </div>
        </section>

        <section id="model" className={sectionClass}>
          <SectionTitle
            eyebrow="Génération"
            title="Modèle et sortie structurée"
            description="Le backend utilise une API compatible avec le format Chat Completions et exige des objets JSON structurés."
          />
          <dl className="mt-7 grid gap-px overflow-hidden border border-[#dddddd] bg-[#dddddd] sm:grid-cols-2">
            <Fact label="Modèle réellement configuré" value={configuredModel} />
            <Fact label="Service" value={configuredApi} />
            <Fact label="Température par défaut" value="0,1" />
            <Fact label="Température de synthèse" value="0,2" />
            <Fact label="Format demandé" value="response_format: json_object" />
            <Fact label="Réparation JSON" value="Une seconde tentative maximum" />
          </dl>
          <div className="mt-6 border-l-4 border-[#e4794a] bg-[#fff3e9] p-4 text-[14px] leading-6 text-[#3a3a3a]">
            <strong className="text-[#161616]">Point d’attention :</strong> la puce
            visible dans l’interface affiche actuellement « gpt-oss-120b » en dur,
            alors que la réponse de l’API contient le modèle réellement configuré.
            Dans cet environnement, ce modèle est <code>{configuredModel}</code>. Ces
            deux informations devraient être alignées avant une mise en production.
          </div>
          <div className="mt-6 space-y-4 text-[15px] leading-7 text-[#3a3a3a]">
            <p>
              Chaque phase associe le system prompt à un sous-prompt spécialisé. Si la
              première réponse n’est pas un objet JSON exploitable, une seconde requête
              demande uniquement une reformulation JSON. Les tokens des deux tentatives
              sont additionnés.
            </p>
            <p>
              Le champ « Raisonnement » visible dans l’interface n’est pas une chaîne de
              pensée interne. Le prompt demande une justification observable de trois à
              six phrases décrivant la méthode et ses limites.
            </p>
          </div>
        </section>

        <section id="tools" className={sectionClass}>
          <SectionTitle
            eyebrow="Capacités"
            title="Outils disponibles"
            description="Le modèle choisit un outil, mais l’application valide son contrat et reste responsable de son exécution."
          />
          <div className="mt-7 space-y-4">
            {tools.map((tool) => (
              <article key={tool.name} className="border border-[#dddddd] p-5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h3 className="font-mono text-[15px] font-bold text-[#000091]">{tool.name}</h3>
                  <span className="bg-[#eeeeee] px-2 py-1 text-[11px] font-medium text-[#3a3a3a]">
                    {tool.runs}
                  </span>
                </div>
                <dl className="mt-4 space-y-2 text-[14px] leading-6 text-[#3a3a3a]">
                  <div><dt className="inline font-bold text-[#161616]">Entrée : </dt><dd className="inline">{tool.input}</dd></div>
                  <div><dt className="inline font-bold text-[#161616]">Sortie : </dt><dd className="inline">{tool.output}</dd></div>
                  <div><dt className="inline font-bold text-[#161616]">Implémentation : </dt><dd className="inline">{tool.implementation}</dd></div>
                </dl>
              </article>
            ))}
          </div>
        </section>

        <section id="security" className={sectionClass}>
          <SectionTitle
            eyebrow="Garde-fous"
            title="Exécution, données transmises et sécurité"
            description="Le prototype sépare l’accès au fichier, l’appel au modèle et le rendu des résultats."
          />
          <div className="mt-7 grid gap-6 text-[15px] leading-7 text-[#3a3a3a] sm:grid-cols-2">
            <div>
              <h3 className="font-bold text-[#161616]">Ce qui reste dans le navigateur</h3>
              <ul className="mt-3 list-disc space-y-2 pl-5 marker:text-[#000091]">
                <li>Le chargement et l’interrogation de la ressource Parquet.</li>
                <li>L’instance DuckDB-WASM et l’exécution SQL.</li>
                <li>Le rendu Chart.js et MapLibre.</li>
                <li>L’état de conversation et les évaluations pouce haut/bas.</li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold text-[#161616]">Ce qui est envoyé au modèle</h3>
              <ul className="mt-3 list-disc space-y-2 pl-5 marker:text-[#000091]">
                <li>La question et une portion de l’historique récent.</li>
                <li>Le schéma inspecté et, si nécessaire, les métadonnées.</li>
                <li>Les requêtes SQL, leurs erreurs et les résultats ciblés.</li>
                <li>Le résultat final utilisé pour la synthèse ou la visualisation.</li>
              </ul>
            </div>
          </div>
          <div className="mt-7 space-y-3 text-[15px] leading-7 text-[#3a3a3a]">
            <p>
              Le validateur SQL accepte uniquement une requête commençant par
              <code> SELECT </code> ou <code>WITH</code>, refuse les instructions de
              modification ou de chargement et interdit les requêtes multiples séparées
              par un point-virgule.
            </p>
            <p>
              Les appels de tools sont normalisés puis validés. Une carte ne peut utiliser
              que les champs de points ou de choroplèthe connus. Les contenus affichés dans
              les infobulles cartographiques sont échappés avant insertion HTML.
            </p>
          </div>
        </section>

        <section id="visualizations" className={sectionClass}>
          <SectionTitle
            eyebrow="Rendu"
            title="Graphiques et cartes"
            description="Les visualisations sont créées après le SQL, à partir d’un résultat déjà borné et vérifiable."
          />
          <div className="mt-7 space-y-4 text-[15px] leading-7 text-[#3a3a3a]">
            <p>
              <strong>Graphiques :</strong> le modèle propose une spécification légère
              compatible avec les concepts Vega-Lite. Le client en extrait les champs et
              la marque, puis crée le rendu Chart.js. Les graphiques en barres peuvent être
              copiés en PNG ou SVG avec leur source.
            </p>
            <p>
              <strong>Cartes de points :</strong> latitude et longitude sont obligatoires.
              Les points peuvent être dimensionnés par une mesure et regroupés en clusters.
              Une carte est limitée à 5 000 lignes par le prompt SQL.
            </p>
            <p>
              <strong>Choroplèthes :</strong> les valeurs sont jointes par code ou nom aux
              contours 2025 régions/départements de data.gouv.fr, généralisés à 1 000 m.
              Le cadrage initial privilégie la France hexagonale et la Corse. Les zones sans
              correspondance restent visibles avec un style distinct.
            </p>
            <p>
              Si le modèle ne produit pas une spécification cartographique exploitable, le
              client tente une détection déterministe des coordonnées, codes, noms et
              mesures dans le résultat SQL.
            </p>
          </div>
        </section>

        <section id="feedback" className={sectionClass}>
          <SectionTitle
            eyebrow="Amélioration continue"
            title="Mécanisme de feedback"
            description="Chaque réponse peut être évaluée rapidement, puis documentée avec un formulaire détaillé."
          />
          <ol className="mt-7 list-decimal space-y-3 pl-5 text-[15px] leading-7 text-[#3a3a3a] marker:font-bold marker:text-[#000091]">
            <li>L’utilisateur sélectionne le pouce haut ou le pouce bas sous une réponse.</li>
            <li>L’évaluation et le contexte de la réponse sont immédiatement envoyés à la table Grist de feedback via une route serveur.</li>
            <li>Le lien « Partager plus de détails » reste disponible et ouvre un formulaire Grist intégré dans une fenêtre modale.</li>
            <li>Le formulaire est prérempli avec l’évaluation, la question, la réponse, la ressource, le modèle déclaré et l’horodatage.</li>
            <li>L’utilisateur complète et envoie volontairement le formulaire.</li>
          </ol>
          <div className="mt-6 border-l-4 border-[#000091] bg-[#ececfe] p-4 text-[14px] leading-6 text-[#3a3a3a]">
            L’interface indique que l’identité n’est ni collectée ni transmise. La question
            est limitée à 2 000 caractères et la réponse à 5 000 caractères lors du
            préremplissage. Cliquer seulement sur un pouce ne déclenche pas, dans
            préremplissage. En cas d’échec de l’envoi immédiat, l’interface propose de réessayer.
          </div>
        </section>

        <section id="prompts" className={sectionClass}>
          <SectionTitle
            eyebrow="Instructions du modèle"
            title="Prompts complets"
            description="Ces blocs sont importés directement depuis les fichiers utilisés par l’agent afin que cette page reste synchronisée avec l’implémentation."
          />
          <div className="mt-7 space-y-8">
            {promptSections.map((section) => (
              <article key={section.id} id={section.id} className="scroll-mt-6">
                <h3 className="text-xl font-bold leading-7">{section.title}</h3>
                <PromptBlock content={section.prompt} />
              </article>
            ))}
          </div>
        </section>

        <section id="limits" className={sectionClass}>
          <SectionTitle
            eyebrow="État du prototype"
            title="Limites connues et points à surveiller"
            description="Ces limites sont importantes pour interpréter correctement une démonstration ou un test utilisateur."
          />
          <ul className="mt-7 list-disc space-y-3 pl-5 text-[15px] leading-7 text-[#3a3a3a] marker:text-[#000091]">
            <li>Le modèle peut mal interpréter une colonne ou produire un JSON valide mais sémantiquement incorrect.</li>
            <li>Une limite SQL peut masquer des lignes ou des ex æquo ; l’interface ajoute un avertissement lorsque cette limite est atteinte.</li>
            <li>Les résultats SQL ciblés sont envoyés au service de génération pour rédiger la réponse.</li>
            <li>La qualité des cartes dépend de la qualité des coordonnées et des clés géographiques présentes dans le fichier.</li>
            <li>La puce de modèle affichée et la configuration backend doivent être alignées.</li>
            <li>Le formulaire détaillé crée un retour complémentaire séparé du signal immédiat envoyé par le pouce.</li>
            <li>Le système ne journalise pas encore un identifiant de trace complet reliant planification, SQL, synthèse et feedback.</li>
          </ul>
        </section>

        <footer className="border-t border-[#dddddd] py-8 text-[14px] text-[#666666]">
          <Link
            href="/prototypes/test-assistant"
            className="font-medium text-[#000091] underline underline-offset-4"
          >
            Tester l’assistant
          </Link>
        </footer>
      </div>
    </main>
  );
}

function SectionTitle({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <div className="max-w-3xl">
      <p className="text-[12px] font-bold uppercase tracking-[0.05em] text-[#666666]">{eyebrow}</p>
      <h2 className="mt-2 text-2xl font-bold leading-8">{title}</h2>
      <p className="mt-3 text-[15px] leading-7 text-[#3a3a3a]">{description}</p>
    </div>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-white p-4">
      <dt className="text-[12px] font-bold uppercase tracking-[0.04em] text-[#666666]">{label}</dt>
      <dd className="mt-1 break-words font-mono text-[14px] text-[#161616]">{value}</dd>
    </div>
  );
}

function PromptBlock({ content }: { content: string }) {
  return (
    <pre className="mt-4 max-h-[560px] overflow-auto border border-[#dddddd] bg-[#161616] p-4 font-mono text-[12px] leading-5 whitespace-pre-wrap text-[#f6f6f6]">
      <code>{content}</code>
    </pre>
  );
}
