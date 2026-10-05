export type DeathRecord = {
  id: string;
  lastName: string;
  firstNames: string;
  birthDate: string;
  birthPlace: string;
  deathDate: string;
  deathPlace: string;
  sex: string;
  actNumber: string;
  birthCommuneCode: string;
  deathCommuneCode: string;
  birthCountry: string;
  deathCountry: string;
  sourceFile: string;
};

const names = ["Marie Louise", "Jean Pierre", "Françoise", "Michel André", "Jacqueline", "Bernard", "Monique", "Émile Louis", "Élisabeth", "André", "Anne Marie", "René Paul", "Madeleine", "Pierre", "Claire", "Louis"];
export const places = ["Lyon (69)", "Bordeaux (33)", "Lille (59)", "Nantes (44)", "Paris (75)", "Rennes (35)", "Tours (37)", "Dijon (21)"];

const communeCodes = ["69123", "33063", "59350", "44109", "75056", "35238", "37261", "21231"];

// Source schema; records remain local demonstration fixtures.
export type DeathSource = {
  nom: string; prenoms: string; sexe: "M" | "F";
  date_naissance: string; code_insee_naissance: string; commune_naissance: string; pays_naissance: string;
  date_deces: string; code_insee_deces: string; numero_acte_deces: string;
  fichier_origine: string; opposition: boolean;
};
export const deathSources: DeathSource[] = ["Martin", "Dupont", "Bernard", "Petit", "Moreau", "Lefebvre", "Robert", "García"].flatMap((nom, family) =>
  names.map((prenoms, index) => ({
    nom, prenoms: prenoms.split(" ").join(","),
    sexe: [0, 2, 4, 6, 8, 10, 12, 14].includes(index) ? "F" as const : "M" as const,
    date_naissance: index === 14 ? `${1920 + index * 2 + family}0000` : index === 15 ? "00000000" : `${1920 + index * 2 + family}0${1 + index % 9}${index === 13 ? "00" : String(3 + index).padStart(2, "0")}`,
    code_insee_naissance: communeCodes[(index + family) % places.length],
    commune_naissance: places[(index + family) % places.length].replace(/ \(.*\)/, ""),
    pays_naissance: "France (FRA)",
    date_deces: `${2001 + index % 9 + family}0${1 + index % 9}${String(3 + index).padStart(2, "0")}`,
    code_insee_deces: communeCodes[(index + family + 3) % places.length],
    numero_acte_deces: String(23 + family * 16 + index),
    fichier_origine: `deces-${2001 + index % 9 + family}.txt`,
    opposition: family === 7 && index === 15,
  })),
);

// Local geographic enrichment, separate from the source fields.
function geography(code: string) {
  const index = communeCodes.indexOf(code);
  return { place: index < 0 ? `Lieu non renseigné (${code})` : places[index], country: index < 0 ? "Non renseigné" : "France (FRA)" };
}
export const deathRecords: DeathRecord[] = deathSources.flatMap((source, index) => {
  if (source.opposition) return [];
  return [{
    id: `demo-${Math.floor(index / names.length)}-${index % names.length}`,
    lastName: source.nom, firstNames: source.prenoms.split(",").map((name) => name.trim()).join(", "),
    sex: source.sexe === "F" ? "Féminin" : "Masculin",
    birthDate: source.date_naissance, deathDate: source.date_deces,
    birthPlace: `${source.commune_naissance}${geography(source.code_insee_naissance).place.match(/ \([^)]+\)$/)?.[0] ?? ""}`,
    deathPlace: geography(source.code_insee_deces).place,
    birthCountry: source.pays_naissance, deathCountry: geography(source.code_insee_deces).country,
    birthCommuneCode: source.code_insee_naissance, deathCommuneCode: source.code_insee_deces,
    actNumber: source.numero_acte_deces, sourceFile: source.fichier_origine,
  }];
});

export function normalizeName(value: string) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[,–’'-]/g, " ").replace(/\s+/g, " ").trim();
}

export type DeathFilters = { birthYears: string; deathYears: string; birthPlace: string; deathPlace: string; sex: string; age: string; birthDepartment: string; deathDepartment: string; birthCountry: string; deathCountry: string };
export const emptyFilters: DeathFilters = { birthYears: "", deathYears: "", birthPlace: "", deathPlace: "", sex: "", age: "", birthDepartment: "", deathDepartment: "", birthCountry: "", deathCountry: "" };
export const filterLabels: Record<keyof DeathFilters, string> = { birthYears: "Naissance", deathYears: "Décès", birthPlace: "Lieu de naissance", deathPlace: "Commune de décès", sex: "Sexe", age: "Âge au décès", birthDepartment: "Département de naissance", deathDepartment: "Département de décès", birthCountry: "Pays de naissance", deathCountry: "Pays de décès" };
export const departments = ["Rhône (69)", "Gironde (33)", "Nord (59)", "Loire-Atlantique (44)", "Paris (75)", "Ille-et-Vilaine (35)", "Indre-et-Loire (37)", "Côte-d’Or (21)"];

function dateBounds(value: string): [string, string] | null {
  const parts = value.trim().split(/\s*[-–]\s*/);
  if (parts.length > 2) return null;
  function point(text: string, end: boolean): string | null {
    if (/^\d{4}$/.test(text) && Number(text) > 0) return `${text}-${end ? "12-31" : "01-01"}`;
    const match = text.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
    if (!match || Number(match[3]) === 0) return null;
    const iso = `${match[3]}-${match[2]}-${match[1]}`;
    const date = new Date(`${iso}T00:00:00Z`);
    return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === iso ? iso : null;
  }
  const start = point(parts[0], false);
  const end = point(parts[1] ?? parts[0], true);
  return start && end && start <= end ? [start, end] : null;
}
export function validateYears(value: string) { return !value.trim() || !!dateBounds(value); }
export function validateAge(value: string) {
  if (!value.trim()) return true;
  const match = value.trim().match(/^(\d{1,3})(?:\s*[-–]\s*(\d{1,3}))?$/);
  return !!match && Number(match[1]) <= Number(match[2] ?? match[1]) && Number(match[2] ?? match[1]) <= 130;
}
function matchesYears(date: string, value: string) {
  if (!value.trim()) return true;
  const bounds = dateBounds(value);
  if (!bounds) return false;
  const components = [date.slice(0, 4), date.slice(4, 6), date.slice(6, 8)];
  if (components[0] === "0000") return false;
  // A partial date only matches if its entire possible period is within the requested interval.
  const start = `${components[0]}-${components[1] === "00" ? "01" : components[1]}-${components[2] === "00" ? "01" : components[2]}`;
  const month = components[1] === "00" ? 12 : Number(components[1]);
  const lastDay = new Date(Date.UTC(Number(components[0]), month, 0)).getUTCDate();
  const end = `${components[0]}-${String(month).padStart(2, "0")}-${components[2] === "00" ? lastDay : components[2]}`;
  return start >= bounds[0] && end <= bounds[1];
}
function matchesAge(age: number | null, value: string) {
  if (!value.trim()) return true;
  const [start, end = start] = value.trim().split(/\s*[-–]\s*/).map(Number);
  return age !== null && age >= start && age <= end;
}
export function placeLabel(value: string) {
  if (!value.startsWith("dept:")) return value;
  return departments.find((place) => place.endsWith(`(${value.slice(5)})`)) ?? value;
}
function matchesPlace(place: string, value: string) {
  return !value || (value.startsWith("dept:") ? place.endsWith(`(${value.slice(5)})`) : normalizeName(place).includes(normalizeName(value)));
}
function matchesDepartment(place: string, value: string) {
  const department = departments.find((item) => item.match(/\(([^)]+)\)/)?.[1] === place.match(/\(([^)]+)\)/)?.[1]);
  return !!department && normalizeName(department).includes(normalizeName(value));
}
export function ageAtDeath(person: DeathRecord) {
  if ([person.birthDate, person.deathDate].some((date) => date.slice(0, 4) === "0000" || date.slice(4, 6) === "00" || date.slice(6, 8) === "00")) return null;
  const years = Number(person.deathDate.slice(0, 4)) - Number(person.birthDate.slice(0, 4));
  return years - (person.deathDate.slice(4) < person.birthDate.slice(4) ? 1 : 0);
}
export function searchDeaths(lastName: string, firstNames: string, filters: DeathFilters = emptyFilters) {
  const last = normalizeName(lastName);
  const first = normalizeName(firstNames).split(" ").filter(Boolean);
  if (!last && !first.length && !Object.values(filters).some(Boolean)) return [];
  return deathRecords.filter((record) => normalizeName(record.lastName).includes(last)
    && first.every((part) => normalizeName(record.firstNames).includes(part))
    && matchesYears(record.birthDate, filters.birthYears) && matchesYears(record.deathDate, filters.deathYears)
    && (!filters.sex || record.sex === filters.sex) && matchesAge(ageAtDeath(record), filters.age)
    && (!filters.birthDepartment || matchesDepartment(record.birthPlace, filters.birthDepartment))
    && (!filters.deathDepartment || matchesDepartment(record.deathPlace, filters.deathDepartment))
    && (!filters.birthCountry || normalizeName(record.birthCountry).includes(normalizeName(filters.birthCountry)))
    && (!filters.deathCountry || normalizeName(record.deathCountry).includes(normalizeName(filters.deathCountry)))
    && matchesPlace(record.birthPlace, filters.birthPlace) && matchesPlace(record.deathPlace, filters.deathPlace));
}

export function ageLabel(person: DeathRecord) {
  const age = ageAtDeath(person);
  return age === null ? "Âge non déterminé" : `${age} ans`;
}
export function formatDate(value: string) {
  const year = value.slice(0, 4), month = value.slice(4, 6), day = value.slice(6, 8);
  if (year === "0000") {
    if (month === "00") return day === "00" ? "Date inconnue" : `Jour ${Number(day)}, mois et année inconnus`;
    const monthLabel = new Intl.DateTimeFormat("fr-FR", { month: "long", timeZone: "UTC" }).format(new Date(`2000-${month}-01`));
    return `${day === "00" ? "" : `${Number(day)} `}${monthLabel} (année inconnue)`;
  }
  if (month === "00") return day === "00" ? year : `${year} (jour ${Number(day)}, mois inconnu)`;
  const date = new Date(`${year}-${month}-${day === "00" ? "01" : day}T00:00:00Z`);
  return new Intl.DateTimeFormat("fr-FR", { ...(day !== "00" ? { day: "numeric" as const } : {}), month: "long", year: "numeric", timeZone: "UTC" }).format(date);
}
