/** Rules a registration must satisfy. The server checks every submission with these. */
import { AGE_CATEGORIES } from "./seed";
import type { Competition, Registration, RegistrationInput } from "./types";
import { isEmail, isPhone } from "./utils";

const text = (value: unknown, max = 80) => (typeof value === "string" ? value.trim().slice(0, max) : "");

type Result = { error: string } | { data: Omit<Registration, "id" | "createdAt" | "paymentStatus"> };

export function checkRegistration(input: Partial<RegistrationInput> | null, c: Competition | undefined): Result {
  if (!input || !c || !c.enabled) return { error: "Registration is closed for this competition." };
  const type = input.type === "group" ? "group" : input.type === "individual" ? "individual" : null;
  if (!type || (type === "group" ? !c.allowGroup : !c.allowIndividual)) return { error: "Registration is closed for this competition." };

  const age = AGE_CATEGORIES.find((a) => a.id === input.ageCategory && c.ageCategories.includes(a.id));
  if (!age) return { error: "Select an age category." };
  const isGroup = type === "group";
  const participantName = text(input.participantName);
  const phone = text(input.phone, 10);
  const email = text(input.email, 120);
  const teamName = isGroup ? text(input.teamName) : "";
  if (isGroup && !teamName) return { error: "Enter the team name." };
  if (!participantName) return { error: "Enter the name." };
  if (!isPhone(phone)) return { error: "Enter a valid 10-digit mobile number." };
  if (email && !isEmail(email)) return { error: "Enter a valid email address." };

  const list = Array.isArray(input.members) ? input.members : [];
  const validSize = isGroup ? list.length >= c.minMembers && list.length <= c.maxMembers : list.length === 1;
  if (!validSize) return { error: "The number of members is not allowed for this competition. Reload the page and try again." };
  const members = list.map((m) => ({
    name: isGroup ? text(m?.name) : participantName,
    age: text(m?.age, 3),
    phone: isGroup ? text(m?.phone, 10) : phone,
  }));
  for (const member of members) {
    const years = Number(member.age);
    if (!member.name) return { error: "Enter the member's name." };
    if (!Number.isInteger(years) || years < age.min || years > age.max) return { error: "Every age must be inside the selected age category." };
    if (!isPhone(member.phone)) return { error: "Enter a valid 10-digit mobile number." };
  }

  const isMinor = age.max < 18;
  const guardianName = isMinor ? text(input.guardianName) : "";
  const guardianPhone = isMinor ? text(input.guardianPhone, 10) : "";
  if (isMinor && (!guardianName || !isPhone(guardianPhone) || input.consent !== true)) {
    return { error: "Parent or guardian consent is required." };
  }

  return {
    data: {
      type,
      competitionSlug: c.slug,
      competitionName: c.name,
      participantName,
      phone,
      email,
      city: text(input.city),
      teamName,
      members,
      ageCategory: age.label,
      guardianName,
      guardianPhone,
      // The price always comes from the saved competition, never from the visitor.
      amount: isGroup ? c.groupFee : c.individualFee,
    },
  };
}
