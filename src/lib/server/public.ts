/** Server only: the few details a visitor may see about their registration. */
import type { PublicRegistration, Registration } from "../types";

export const publicRegistration = (r: Registration): PublicRegistration => ({
  id: r.id,
  type: r.type,
  competitionName: r.competitionName,
  memberCount: r.members.length,
  amount: r.amount,
  paymentStatus: r.paymentStatus,
  utr: r.utr,
  rejectReason: r.rejectReason,
});
