export enum AppTab {
  HUD = 'HUD',
  COACH = 'COACH',
  STABILITY = 'STABILITY',
  LAB = 'LAB',
  PROFILE = 'PROFILE'
}

export interface SensorData {
  speed: number; // m/s
  pps: number; // paws per second
  acceleration: number; // m/s^2
  totalSteps: number; // total steps
}

export interface StabilityData {
  tiltX: number; // Lateral tilt in degrees
  tiltY: number; // Forward/Back tilt in degrees
  vibration: number; // Z-axis jitter
  symmetryScore: number; // 0-100%
}

export enum MessageRole {
  USER = 'user',
  MODEL = 'model'
}

export interface ChatMessage {
  id: string;
  role: MessageRole;
  text: string;
  isThinking?: boolean;
  groundingUrls?: Array<{title: string, uri: string}>;
}

export interface RodentProfile {
  name: string;
  species: string;
  age: number; // Months
  weight: number; // Grams
  goals: {
    pps: number; // Target Paws Per Second
    speed: number; // Target Speed in m/s
  };
  preferences: {
    haptics: boolean;
    audio: boolean;
  };
}

export const DEFAULT_PROFILE: RodentProfile = {
  name: 'Nibbles',
  species: 'Syrian Hamster',
  age: 6, // Months
  weight: 120, // Grams
  goals: { pps: 8.5, speed: 1.2 }, // Hamsters are fast movers!
  preferences: { haptics: true, audio: true }
};