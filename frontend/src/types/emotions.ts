import { EMOTION_TREE } from "../lib/utils";

export type EmotionEntry = {
  id: string;
  patientId: string;
  primaryEmotion: string;
  secondaryEmotion: string;
  createdAt: string;
};

export type PrimaryEmotion = keyof typeof EMOTION_TREE;
