import type { Competition, GroupId, SiteData } from "./types";

export const GROUPS: { id: GroupId; name: string; blurb: string }[] = [
  { id: "group-a", name: "Group A", blurb: "Popular team ball games" },
  { id: "group-b", name: "Group B", blurb: "Traditional Indian team sports" },
  { id: "group-c", name: "Group C", blurb: "Athletics and field events" },
];

export const AGE_CATEGORIES = [
  { id: "10-17", label: "10–17 years", min: 10, max: 17 },
  { id: "18-35", label: "18–35 years", min: 18, max: 35 },
  { id: "36-55", label: "36–55 years", min: 36, max: 55 },
];

export function newCompetition(
  base: Pick<Competition, "slug" | "type" | "name"> & Partial<Competition>,
): Competition {
  return {
    icon: base.type === "activity" ? "🏅" : "🎭",
    summary: `${base.name} competition for all eligible age categories.`,
    description: `Show your skill in the ${base.name} competition. Full event details will be announced by the organisers.`,
    prize: 5000,
    guidelines: [
      "Register before the last date announced by the organisers.",
      "Carry a valid ID and age proof on the event day.",
      "Report at the venue at least 30 minutes before your slot.",
    ],
    rules: [
      "The decision of the judges and referees is final.",
      "Participants must follow the schedule and venue instructions.",
      "Unfair means will lead to disqualification.",
    ],
    terms: [
      "Registration fee once paid is non-refundable.",
      "Organisers may change the date or venue if required.",
    ],
    extraInfo: "Sample information. Final details will be updated soon.",
    image: "",
    enabled: true,
    allowIndividual: true,
    allowGroup: true,
    individualFee: 300,
    groupFee: 3000,
    minMembers: 2,
    maxMembers: 10,
    ageCategories: AGE_CATEGORIES.map((a) => a.id),
    ...base,
  };
}

const game = (group: GroupId, slug: string, name: string, icon: string, extra: Partial<Competition> = {}) =>
  newCompetition({ type: "activity", group, slug, name, icon, individualFee: 500, groupFee: 5000, maxMembers: 15, ...extra });

const talent = (slug: string, name: string, icon: string) =>
  newCompetition({ type: "talent", slug, name, icon });

export const seedData: SiteData = {
  competitions: [
    game("group-a", "cricket", "Cricket", "🏏", { prize: 11000, groupFee: 20000, maxMembers: 30 }),
    game("group-a", "basketball", "Basketball", "🏀", { maxMembers: 12 }),
    game("group-a", "football", "Football", "⚽", { maxMembers: 18 }),
    game("group-a", "volleyball", "Volleyball", "🏐", { maxMembers: 12 }),
    game("group-b", "kabaddi", "Kabaddi", "🤼", { maxMembers: 12 }),
    game("group-b", "kho-kho", "Kho-Kho", "🏃"),
    game("group-b", "tug-of-war", "Tug of War", "🪢", { maxMembers: 10 }),
    game("group-c", "athletics", "Athletics", "👟"),
    game("group-c", "long-jump", "Long Jump", "🦘"),
    game("group-c", "high-jump", "High Jump", "🤸"),
    game("group-c", "shot-put", "Shot Put", "🏋️"),
    talent("drawing", "Drawing", "🎨"),
    talent("singing", "Singing", "🎤"),
    talent("dancing", "Dancing", "💃"),
    talent("storytelling", "Storytelling", "📖"),
    talent("gk-quiz", "GK Quiz", "🧠"),
    talent("modelling", "Modelling", "🕴️"),
    talent("craft-and-activity", "Craft and Activity", "✂️"),
  ],
  media: [],
  content: {
    announcement: { enabled: true, text: "Registrations are open. Choose your competition.", link: "/#categories" },
    event: { name: "AvenPro Sports & Talent Meet", date: "", venue: "" },
    faq: [
      { id: "f1", question: "Who can take part?", answer: "Anyone aged 10 to 55. There are three age categories: 10–17, 18–35 and 36–55 years." },
      { id: "f2", question: "Can I register alone, or do I need a team?", answer: "Each competition page shows whether individual entry, group entry or both are allowed, along with the team size limit." },
      { id: "f3", question: "How is the group fee shared?", answer: "The group fee is for the whole team. The registration form shows each member's share." },
      { id: "f4", question: "Do children need permission?", answer: "Yes. Entries in the 10–17 category need a parent or guardian's name, mobile number and consent." },
      { id: "f5", question: "How do I pay the fee?", answer: "Pay by UPI after registering, then submit the 12-digit UTR number and a screenshot. The organisers verify every payment." },
    ],
    hero: {
      title: "Universal Sports & Talent Competition",
      tagline: "One Platform, Unlimited Talent",
      intro: "Compete in sports and talent events, individually or as a team. Open to ages 10 to 55.",
      image: "",
      primaryCta: "Explore Activities",
      secondaryCta: "Explore Talent",
    },
    about: {
      heading: "About AvenPro",
      body: "AvenPro, the Universal Sports & Talent Federation (USTF), brings athletes and performers onto one platform. Our events encourage fitness, creativity, teamwork and confidence.\n\nThis is sample text and will be replaced with the organisation's own details.",
      image: "",
    },
    team: [
      { id: "t1", name: "Member Name", role: "President", about: "Details to be added.", image: "" },
      { id: "t2", name: "Member Name", role: "Event Coordinator", about: "Details to be added.", image: "" },
      { id: "t3", name: "Member Name", role: "Sports Head", about: "Details to be added.", image: "" },
    ],
    contact: {
      address: "Address to be added",
      phone: "Phone number to be added",
      email: "Email to be added",
      hours: "Timings to be added",
    },
    social: { instagram: "", facebook: "", youtube: "" },
    payment: { upiId: "", payeeName: "AvenPro" },
  },
};
