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