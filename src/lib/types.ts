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
  phone: string;
}

/** What the registration form sends. The server decides price, id and status. */
export interface RegistrationInput {
  type: RegistrationType;
  competitionSlug: string;
  participantName: string;
  phone: string;
  email: string;
  city: string;
  teamName: string;
  members: TeamMember[];
  ageCategory: string;
  guardianName: string;
  guardianPhone: string;
  consent: boolean;
}

/** Pending: not paid yet. Submitted: waiting for the admin to check. */
export type PaymentStatus = "Pending" | "Submitted" | "Approved" | "Rejected";

/** The part of a registration that its owner can see. */
export interface PublicRegistration {
  id: string;
  type: RegistrationType;
  competitionName: string;
  memberCount: number;
  amount: number;
  paymentStatus: PaymentStatus;
  utr?: string;
  rejectReason?: string;
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
  paymentStatus: PaymentStatus;
  utr?: string;
  submittedAt?: string;
  reviewedAt?: string;
  rejectReason?: string;
  rejectedUtr?: string;
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
  payment: { upiId: string; payeeName: string };
}

/** Stored in the database. The version stops one save from overwriting another. */
export interface SiteDocument {
  version: number;
  competitions: Competition[];
  content: SiteContent;
}

export interface SiteData {
  competitions: Competition[];
  media: MediaItem[];
  content: SiteContent;
}
