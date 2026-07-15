// English levels (CEFR + native)
export const ENGLISH_LEVELS = [
  "A1",
  "A2",
  "B1",
  "B2",
  "C1",
  "C2",
  "NATIVE",
] as const;
export type EnglishLevel = (typeof ENGLISH_LEVELS)[number];

export const ENGLISH_LEVEL_LABEL: Record<EnglishLevel, string> = {
  A1: "A1 · Beginner",
  A2: "A2 · Elementary",
  B1: "B1 · Intermediate",
  B2: "B2 · Upper-intermediate",
  C1: "C1 · Advanced",
  C2: "C2 · Proficient",
  NATIVE: "Native speaker",
};

// Numero massimo di foto per profilo (limite di spazio)
export const MAX_PHOTOS = 3;

// Campus dorms (configurable — seeded into the DB)
export const DORMS = [
  "Butler Hall",
  "Academy Hall",
  "Gerard Hall",
  "Gaines Hall",
  "Lugari Hall",
  "Ursula Hall",
  "St. John's Hall",
] as const;

// Campus spots for the "blind date" variant
export const CAMPUS_PLACES = [
  "Main cafeteria",
  "Library — entrance",
  "Main lawn",
  "Gym",
  "Study room",
  "Campus bar",
  "Reception",
  "Sports field",
] as const;

// Common nationalities on an immersion campus (ISO 3166-1 alpha-2 code + English name)
export const COUNTRIES: { code: string; name: string }[] = [
  { code: "US", name: "United States" },
  { code: "CA", name: "Canada" },
  { code: "MX", name: "Mexico" },
  { code: "BR", name: "Brazil" },
  { code: "AR", name: "Argentina" },
  { code: "CL", name: "Chile" },
  { code: "CO", name: "Colombia" },
  { code: "PE", name: "Peru" },
  { code: "IT", name: "Italy" },
  { code: "FR", name: "France" },
  { code: "DE", name: "Germany" },
  { code: "ES", name: "Spain" },
  { code: "PT", name: "Portugal" },
  { code: "CH", name: "Switzerland" },
  { code: "AT", name: "Austria" },
  { code: "NL", name: "Netherlands" },
  { code: "BE", name: "Belgium" },
  { code: "GB", name: "United Kingdom" },
  { code: "IE", name: "Ireland" },
  { code: "JP", name: "Japan" },
  { code: "KR", name: "South Korea" },
  { code: "CN", name: "China" },
  { code: "HK", name: "Hong Kong" },
  { code: "TW", name: "Taiwan" },
  { code: "TH", name: "Thailand" },
  { code: "VN", name: "Vietnam" },
  { code: "ID", name: "Indonesia" },
  { code: "IN", name: "India" },
  { code: "TR", name: "Turkey" },
  { code: "SA", name: "Saudi Arabia" },
  { code: "AE", name: "United Arab Emirates" },
  { code: "RU", name: "Russia" },
  { code: "PL", name: "Poland" },
  { code: "CZ", name: "Czechia" },
  { code: "SE", name: "Sweden" },
  { code: "NO", name: "Norway" },
  { code: "DK", name: "Denmark" },
  { code: "FI", name: "Finland" },
  { code: "GR", name: "Greece" },
  { code: "HU", name: "Hungary" },
  { code: "RO", name: "Romania" },
  { code: "UA", name: "Ukraine" },
  { code: "EG", name: "Egypt" },
  { code: "MA", name: "Morocco" },
  { code: "ZA", name: "South Africa" },
  { code: "AU", name: "Australia" },
  { code: "NZ", name: "New Zealand" },
];

// Turns an ISO alpha-2 code into a flag emoji
export function flagEmoji(code: string): string {
  if (!code || code.length !== 2) return "🏳️";
  const base = 0x1f1e6;
  const chars = code
    .toUpperCase()
    .split("")
    .map((c) => base + (c.charCodeAt(0) - 65));
  return String.fromCodePoint(...chars);
}

export function countryName(code: string): string {
  return COUNTRIES.find((c) => c.code === code)?.name ?? code;
}
