export type GroupId = "group-a" | "group-b" | "group-c";
export type CompetitionType = "activity" | "talent";
export type RegistrationType = "individual" | "group";

export interface Competition {
  slug: string;
  type: CompetitionType;
  group?: GroupId;
  name: string;
  icon: string;
  summary: string;
  description: string;
  prize: number;
  guidelines: string[];
  rules: string[];
  terms: string[];
  extraInfo: string;
  image: string;
  enabled: boolean;
  allowIndividual: boolean;
  allowGroup: boolean;
  individualFee: number;
  groupFee: number;
  minMembers: number;
  maxMembers: number;
  ageCategories: string[];
}

export interface TeamMember {
  name: string;
  age: string;
}

export interface Registration {
  id: string;
  type: RegistrationType;
  competitionSlug: string;
  competitionName: string;
  participantName: string;
  phone: string;
  email: string;
  city: string;
  teamName: string;
  members: TeamMember[];
  ageCategory: string;
  guardianName: string;
  guardianPhone: string;
  amount: number;
  paymentStatus: "Pending" | "Test payment verified";
  paymentId?: string;
  createdAt: string;
}

export interface TeamPerson {
  id: string;
  name: string;
  role: string;
  about: string;
  image: string;
}

export interface MediaItem {
  id: string;
  name: string;
  kind: "image" | "video";
  inGallery: boolean;
}

export interface Faq {
  id: string;
  question: string;
  answer: string;
}

export interface SiteContent {
  announcement: { enabled: boolean; text: string; link: string };
  event: { name: string; date: string; venue: string };
  faq: Faq[];
  hero: { title: string; tagline: string; intro: string; image: string; primaryCta: string; secondaryCta: string };
  about: { heading: string; body: string; image: string; video?: string };
  team: TeamPerson[];
  contact: { address: string; phone: string; email: string; hours: string };
  social: { instagram: string; facebook: string; youtube: string };
  payment: { upiEnabled: boolean; razorpayEnabled: boolean; qrImage: string };
}

export interface SiteData {
  competitions: Competition[];
  registrations: Registration[];
  media: MediaItem[];
  content: SiteContent;
}
