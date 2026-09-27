export type SpeakerType = 'kid' | 'nature' | 'people' | 'self' | 'traveler' | 'system' | 'dam';

export type BackgroundMood =
  | 'dream_forest'
  | 'sunlit_clearing'
  | 'elder_monolith'
  | 'rotary_river'
  | 'storm_dam'
  | 'highland_sanctuary'
  | 'sovereign_dawn';

export interface DialogueOption {
  text: string;
  aceBond?: 'nature' | 'people' | 'self';
  reflectionResponse: string;
}

export interface DialogueSlide {
  id: string;
  speakerName: string;
  speakerRole: string;
  speakerType: SpeakerType;
  avatarIcon: string;
  text: string;
  backgroundMood: BackgroundMood;
  optionChoice?: {
    prompt: string;
    options: DialogueOption[];
  };
}

export interface StoryChapter {
  id: number;
  chapterNumber: number;
  title: string;
  subtitle: string;
  levelReq: number;
  sketchIcon: string;
  summary: string;
  bgGradient: string;
  slides: DialogueSlide[];
  aceLore: {
    natureMessage: string;
    peopleMessage: string;
    selfMessage: string;
  };
}
