// Dati di un profilo mostrati nel deck di swipe (già formattati per il client)
export type Candidate = {
  id: string;
  firstName: string;
  age: number;
  nationality: string; // codice ISO
  englishLevel: string;
  dorm: string | null;
  timeRemaining: string;
  bio: string | null;
  photos: string[];
};

export type MatchVariant = "MEETUP" | "CHAT";
