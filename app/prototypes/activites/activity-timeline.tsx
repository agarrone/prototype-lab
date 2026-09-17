import Image from "next/image";
import Link from "next/link";
import { RiRobot3Line, RiUserLine } from "@remixicon/react";

export type Activity = {
  id: string;
  actor: string;
  initials: string;
  actorType: "human" | "robot" | "deleted";
  avatar?: string;
  summary: string;
  date: string;
  rangeStart?: string;
  details?: ActivityDetail[];
  resourceDeleted?: boolean;
  actorHref?: string;
  resourceHref?: string;
};

export type ActivityDetail = {
  label: string;
  value: string;
  href?: string;
};

export const prototypeActivities: Activity[] = [
  {
    id: "sequence-septembre",
    actor: "Marie Dupont",
    initials: "MD",
    actorType: "human",
    avatar: "/prototypes/activites/marie-dupont.png",
    summary: "a modifié le jeu de données et ses ressources",
    date: "16 septembre 2026 à 14 h 32",
    rangeStart: "14 h 12",
    details: [
      { label: "Métadonnées modifiées", value: "Description, Licence, Mots-clés" },
      { label: "Ressource ajoutée", value: "Export CSV septembre 2026", href: "#ressource" },
      { label: "Ressource mise à jour", value: "Données consolidées", href: "#ressource" },
    ],
  },
  {
    id: "robot",
    actor: "Robot datagouv",
    initials: "RB",
    actorType: "robot",
    avatar: "/prototypes/activites/robot-datagouv.png",
    summary: "a mis à jour la ressource Points de recharge consolidés",
    date: "15 septembre 2026 à 03 h 10",
  },
  {
    id: "ajout",
    actor: "Karim Benali",
    initials: "KB",
    actorType: "human",
    avatar: "/prototypes/activites/karim-benali.png",
    summary: "a ajouté la ressource Export national, septembre 2026",
    date: "12 septembre 2026 à 09 h 18",
  },
  {
    id: "robot-septembre",
    actor: "Robot datagouv",
    initials: "RB",
    actorType: "robot",
    avatar: "/prototypes/activites/robot-datagouv.png",
    summary: "a mis à jour la ressource Points de recharge consolidés",
    date: "8 septembre 2026 à 03 h 08",
  },
  {
    id: "suppression",
    actor: "Claire Martin",
    initials: "CM",
    actorType: "human",
    avatar: "/prototypes/activites/claire-martin.png",
    summary: "a supprimé la ressource Export provisoire août 2026",
    date: "2 septembre 2026 à 17 h 46",
    resourceDeleted: true,
  },
  {
    id: "sequence-aout",
    actor: "Marie Dupont",
    initials: "MD",
    actorType: "human",
    avatar: "/prototypes/activites/marie-dupont.png",
    summary: "a modifié le jeu de données et deux ressources",
    date: "29 août 2026 à 15 h 12",
    rangeStart: "14 h 48",
    details: [
      { label: "Métadonnées modifiées", value: "Description, Fréquence de mise à jour" },
      { label: "Ressource mise à jour", value: "Données consolidées", href: "#ressource" },
      { label: "Ressource mise à jour", value: "Documentation des champs", href: "#ressource" },
    ],
  },
  {
    id: "ressource-juillet",
    actor: "Karim Benali",
    initials: "KB",
    actorType: "human",
    avatar: "/prototypes/activites/karim-benali.png",
    summary: "a modifié la ressource Export national, juillet 2026",
    date: "15 juillet 2026 à 10 h 41",
  },
  {
    id: "robot-juillet",
    actor: "Robot datagouv",
    initials: "RB",
    actorType: "robot",
    avatar: "/prototypes/activites/robot-datagouv.png",
    summary: "a ajouté la ressource Points de recharge consolidés, juillet 2026",
    date: "1 juillet 2026 à 03 h 05",
  },
  {
    id: "metadonnees-mai",
    actor: "Claire Martin",
    initials: "CM",
    actorType: "human",
    avatar: "/prototypes/activites/claire-martin.png",
    summary: "a modifié les métadonnées",
    date: "22 mai 2026 à 16 h 27",
    details: [{ label: "Métadonnées modifiées", value: "Licence, Couverture géographique, Mots-clés" }],
  },
  {
    id: "ajout-avril",
    actor: "Marie Dupont",
    initials: "MD",
    actorType: "human",
    avatar: "/prototypes/activites/marie-dupont.png",
    summary: "a ajouté la ressource Schéma des données IRVE",
    date: "7 avril 2026 à 09 h 53",
  },
  {
    id: "compte-supprime",
    actor: "Compte supprimé",
    initials: "",
    actorType: "deleted",
    summary: "a modifié les métadonnées",
    date: "18 juin 2024 à 11 h 05",
    details: [{ label: "Métadonnées modifiées", value: "Fréquence de mise à jour, Couverture temporelle" }],
  },
  {
    id: "ressource-2023",
    actor: "Marie Dupont",
    initials: "MD",
    actorType: "human",
    avatar: "/prototypes/activites/marie-dupont.png",
    summary: "a ajouté la ressource Documentation du format des données",
    date: "6 novembre 2023 à 14 h 08",
  },
  {
    id: "mise-a-jour-2022",
    actor: "Compte supprimé",
    initials: "",
    actorType: "deleted",
    summary: "a modifié la ressource Export national 2022",
    date: "13 octobre 2022 à 11 h 37",
  },
  {
    id: "creation",
    actor: "Marie Dupont",
    initials: "MD",
    actorType: "human",
    avatar: "/prototypes/activites/marie-dupont.png",
    summary: "a créé le jeu de données",
    date: "14 janvier 2022 à 10 h 24",
  },
];

function Avatar({ activity }: { activity: Activity }) {
  const robot = activity.actorType === "robot";
  const deleted = activity.actorType === "deleted";
  return (
    <span
      aria-hidden="true"
      className={`pointer-events-none relative z-20 mt-2 flex h-4 w-4 shrink-0 items-center justify-center overflow-hidden rounded-full ring-1 ring-[#cecece] text-[7px] font-bold ${
        robot
          ? "bg-[#eeeeee] text-[#161616]"
          : deleted
            ? "bg-[#eeeeee] text-[#666666]"
            : "bg-[#feecc2] text-[#714f00]"
      }`}
    >
      {robot ? (
        <RiRobot3Line aria-hidden="true" className="h-3 w-3 text-[#161616]" />
      ) : deleted ? (
        <RiUserLine aria-hidden="true" className="h-3 w-3 text-[#666666]" />
      ) : activity.avatar ? (
          <Image
            src={activity.avatar}
            alt=""
            width={32}
            height={32}
            sizes="16px"
            quality={100}
            className="h-full w-full object-cover"
          />
      ) : activity.initials}
    </span>
  );
}

function StatusBadge({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex min-h-5 items-center rounded-sm bg-[#eeeeee] px-1.5 text-[11px] font-normal leading-5 text-[#666666]">
      {children}
    </span>
  );
}

function ActivityText({ text, deleted = false, href = "#ressource" }: { text: string; deleted?: boolean; href?: string }) {
  const match = text.match(/^(.*?\bressource )(.+)$/);
  if (!match) return <>{text}</>;

  return (
    <>
      {match[1]}
      {deleted ? (
        <span className="text-[#3a3a3a]">{match[2]}</span>
      ) : (
        <Link href={href} className="pointer-events-auto text-[#161616] underline underline-offset-2 hover:decoration-2">
          {match[2]}
        </Link>
      )}
    </>
  );
}

function DetailItem({ detail }: { detail: ActivityDetail }) {
  return (
    <li className="grid gap-0.5 sm:grid-cols-[172px_1fr] sm:gap-3">
      <span className="text-[#161616]">{detail.label}</span>
      {detail.href ? (
        <Link href={detail.href} className="pointer-events-auto relative z-30 w-fit text-[#161616] underline underline-offset-2 hover:decoration-2">
          {detail.value}
        </Link>
      ) : (
        <span className="text-[#666666]">{detail.value}</span>
      )}
    </li>
  );
}

function ActivityItem({ activity }: { activity: Activity }) {
  const day = activity.date.split(" à ")[0];
  const dayWithoutYear = day.replace(/\s\d{4}$/, "");
  const time = activity.date.split(" à ")[1];
  const displayedDate = activity.rangeStart
    ? `${dayWithoutYear}, de ${activity.rangeStart} à ${time}`
    : `${dayWithoutYear} à ${time}`;
  const hasDetails = Boolean(activity.details?.length);

  return (
    <li className={`relative flex gap-2 ${hasDetails ? "pb-6" : "pb-4"} last:pb-0`}>
      <Avatar activity={activity} />
      <article className="min-w-0 flex-1">
        <div className="relative py-1 text-left">
          <span className="relative z-20 min-w-0">
            <span className="flex items-start gap-2 text-[14px] leading-6 text-[#161616]">
              <span className="flex min-w-0 flex-1 flex-wrap items-center gap-x-1.5 gap-y-1">
                {activity.actorType !== "deleted" ? (
                  <Link href={activity.actorHref ?? "#profil"} className="relative z-30 font-medium text-[#161616] underline underline-offset-2 hover:decoration-2">
                    {activity.actor}
                  </Link>
                ) : null}
                {activity.actorType === "deleted" ? <StatusBadge>Compte supprimé</StatusBadge> : null}
                <span>
                  <ActivityText text={activity.summary} deleted={activity.resourceDeleted} href={activity.resourceHref} />
                </span>
                {activity.resourceDeleted ? <StatusBadge>Ressource supprimée</StatusBadge> : null}
                <span aria-hidden="true" className="text-[#929292]">·</span>
                <time className="text-[13px] text-[#666666]">{displayedDate}</time>
              </span>
            </span>
          </span>
        </div>

        {hasDetails ? (
          <ul className="ml-2 mt-2 space-y-2 pl-3 text-[14px] leading-5">
            {activity.details?.map((detail) => (
              <DetailItem key={`${detail.label}-${detail.value}`} detail={detail} />
            ))}
          </ul>
        ) : null}
      </article>
    </li>
  );
}

export function ActivityTimeline({ activities = prototypeActivities }: { activities?: Activity[] }) {
  const activitiesByMonth = activities.reduce<Record<string, Activity[]>>((groups, activity) => {
    const [, month, year] = activity.date.split(" à ")[0].split(" ");
    const monthKey = month && year ? `${month} ${year}` : "Date inconnue";
    groups[monthKey] = [...(groups[monthKey] ?? []), activity];
    return groups;
  }, {});

  return (
    <div className="space-y-7">
      {Object.entries(activitiesByMonth).map(([month, monthActivities], index) => {
        const headingId = `month-${index}`;
        const displayedMonth = month.charAt(0).toUpperCase() + month.slice(1);

        return (
        <section key={month} aria-labelledby={headingId}>
          <div className="mb-4 flex items-center gap-3">
            <h3 id={headingId} className="text-[13px] font-medium leading-5 text-[#3a3a3a]">{displayedMonth}</h3>
            <span aria-hidden="true" className="h-px flex-1 bg-[#dddddd]" />
          </div>
          <ol>
            {monthActivities.map((activity) => <ActivityItem key={activity.id} activity={activity} />)}
          </ol>
        </section>
        );
      })}
    </div>
  );
}
