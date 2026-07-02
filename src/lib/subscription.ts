// Shared helper: does this subscription row grant unlimited access right now?
// Honors trialing, active, past_due (Stripe still retrying), and the
// cancel-at-period-end grace period.
export type SubscriptionRow = {
  status: string | null;
  current_period_end: string | null;
  cancel_at_period_end?: boolean | null;
} | null | undefined;

export function isSubscriptionActive(sub: SubscriptionRow): boolean {
  if (!sub || !sub.status) return false;
  const periodEnd = sub.current_period_end ? new Date(sub.current_period_end).getTime() : null;
  const stillInPeriod = periodEnd === null || periodEnd > Date.now();
  if ((sub.status === "active" || sub.status === "trialing" || sub.status === "past_due") && stillInPeriod) {
    return true;
  }
  // Canceled but paid through the current period.
  if (sub.status === "canceled" && periodEnd !== null && periodEnd > Date.now()) {
    return true;
  }
  return false;
}
