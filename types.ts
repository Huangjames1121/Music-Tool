export enum TimeSignature {
  FourFour = '4/4',
  ThreeFour = '3/4',
  TwoFour = '2/4',
  SixEight = '6/8',
  FiveFour = '5/4',
  SevenEight = '7/8',
  NineEight = '9/8',
  TwelveEight = '12/8'
}

export interface MetronomeConfig {
  bpm: number;
  beatsPerBar: number;
  noteValue: number; // The denominator (4 for quarter, 8 for eighth)
  isPlaying: boolean;
}

export interface BarState {
  currentBar: number;
  currentBeat: number;
  totalBeats: number;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  isError?: boolean;
}