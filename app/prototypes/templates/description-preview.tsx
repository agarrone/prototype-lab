"use client";

import { useState } from "react";

export function DescriptionPreview({ description }: { description: string }) {
  const [expanded, setExpanded] = useState(false);
  const paragraphs = toDescriptionParagraphs(description);

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
        {paragraphs.map((paragraph, index) => (
          <p
            key={`${paragraph.text}-${index}`}
            className={`mb-5 ${paragraph.strong ? "font-bold" : ""} ${
              paragraph.italic ? "italic" : ""
            }`}
          >
            {paragraph.text}
          </p>
        ))}
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

function toDescriptionParagraphs(description: string) {
  const cleanBlocks = description
    .split(/\n{2,}/)
    .map((block) => block.trim())
    .filter(Boolean)
    .slice(0, 8);

  if (cleanBlocks.length === 0) {
    return [{ text: "Aucune description disponible.", strong: false, italic: false }];
  }

  return cleanBlocks.map((block) => {
    const italic = block.startsWith("_") && block.endsWith("_");
    const withoutItalic = block.replace(/^_+|_+$/g, "");
    const strong =
      withoutItalic.startsWith("**") && withoutItalic.endsWith("**");
    const text = withoutItalic
      .replace(/\*\*/g, "")
      .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
      .replace(/<!--.*?-->/g, "")
      .replace(/[#>*`]/g, "")
      .trim();

    return { text, strong, italic };
  });
}
