"use client";

import { useState } from "react";

export function DescriptionPreview() {
  const [expanded, setExpanded] = useState(false);

  return (
    <section aria-labelledby="description-title" className="relative">
      <h2
        id="description-title"
        className="mb-1 text-[14px] font-bold leading-6 text-[#161616]"
      >
        Description
      </h2>
      <div
        className={`relative overflow-hidden text-[14px] leading-6 text-[#161616] transition-[max-height] duration-300 ${
          expanded ? "max-h-[1200px]" : "max-h-[342px]"
        }`}
      >
        <p className="mb-5 font-bold italic">
          Avertissement : L’Insee, en aucune façon, n’est lié au site MatchID
          comme à tout autre site utilisant les données mises à disposition
          depuis cette page. Toutes réclamations ou questions concernant ces
          sites doit leur être adressées directement.
        </p>
        <p className="mb-5 font-bold">
          Les fichiers nominatifs diffusés ici ne sont pas des fichiers
          aisément manipulables pour des calculs statistiques et ne sont
          actualisés que tous les mois. Ils incluent les décès survenus à
          l’étranger. Pour avoir les derniers résultats des décès comptabilisés
          sur le territoire français durant la pandémie du Covid 19 et en
          suivre l’évolution, il est recommandé de se référer aux données
          relatives aux décès quotidiens.
        </p>
        <p className="mb-5">
          L&apos;Insee reçoit des communes les décès enregistrés.
        </p>
        <p className="mb-5">
          Les informations des fichiers de personnes décédées ne sont pas des
          données à caractère personnel, ni ne relèvent du secret de la vie
          privée. Les droits prévus par l’article 85 de la loi Informatique et
          libertés s’appliquent néanmoins au motif de l’exécution de directives
          post-mortem. L’INSEE étant soumis à une obligation légale de
          diffusion, cet article ne s’applique pas à l’Insee.
        </p>
        <p className="mb-5">
          Les proches de personnes décédées peuvent toutefois s’opposer à la
          rediffusion par des tiers de données en demandant l’inscription du ou
          des décès dans le fichier des oppositions à la rediffusion en
          s’adressant à l’Insee par message électronique.
        </p>
        <p className="mb-5">
          Les rediffuseurs sont invités à exclure du champ des données qu’ils
          publient les informations relatives aux décès qui figurent dans ce
          fichier d’opposition.
        </p>
        {!expanded ? (
          <div className="pointer-events-none absolute inset-x-0 bottom-0 flex justify-center bg-gradient-to-b from-white/0 via-white/95 to-white pb-2 pt-10">
            <button
              type="button"
              className="pointer-events-auto text-[14px] font-medium leading-5 text-[#161616] hover:text-[#000091]"
              onClick={() => setExpanded(true)}
            >
              Lire plus
            </button>
          </div>
        ) : null}
      </div>
      {expanded ? (
        <button
          type="button"
          className="mt-1 text-[14px] font-medium leading-5 text-[#161616] hover:text-[#000091]"
          onClick={() => setExpanded(false)}
        >
          Lire moins
        </button>
      ) : null}
    </section>
  );
}
