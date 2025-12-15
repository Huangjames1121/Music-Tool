import { TimeSignature } from "./types";

export const MIN_BPM = 30;
export const MAX_BPM = 300;
export const DEFAULT_BPM = 120;

export const SIGNATURE_CONFIGS: Record<TimeSignature, { beats: number; value: number }> = {
  [TimeSignature.FourFour]: { beats: 4, value: 4 },
  [TimeSignature.ThreeFour]: { beats: 3, value: 4 },
  [TimeSignature.TwoFour]: { beats: 2, value: 4 },
  [TimeSignature.FiveFour]: { beats: 5, value: 4 },
  [TimeSignature.SixEight]: { beats: 6, value: 8 },
  [TimeSignature.SevenEight]: { beats: 7, value: 8 },
  [TimeSignature.NineEight]: { beats: 9, value: 8 },
  [TimeSignature.TwelveEight]: { beats: 12, value: 8 },
};

export const TEMPO_MARKINGS = [
  { label: "Grave", min: 0, max: 40 },
  { label: "Largo", min: 40, max: 60 },
  { label: "Larghetto", min: 60, max: 66 },
  { label: "Adagio", min: 66, max: 76 },
  { label: "Andante", min: 76, max: 108 },
  { label: "Moderato", min: 108, max: 120 },
  { label: "Allegro", min: 120, max: 156 },
  { label: "Vivace", min: 156, max: 176 },
  { label: "Presto", min: 176, max: 200 },
  { label: "Prestissimo", min: 200, max: 999 }
];

export const getTempoMarking = (bpm: number): string => {
  const match = TEMPO_MARKINGS.find(t => bpm >= t.min && bpm < t.max);
  return match ? match.label : "Tempo";
};