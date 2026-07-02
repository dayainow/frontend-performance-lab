export type CustomerRecord = {
  id: number;
  name: string;
  plan: "Free" | "Pro" | "Team" | "Enterprise";
  activity: number;
  revenue: number;
};

const plans: CustomerRecord["plan"][] = ["Free", "Pro", "Team", "Enterprise"];

export function buildCustomerRecords(count = 96): CustomerRecord[] {
  return Array.from({ length: count }, (_, index) => ({
    id: index + 1,
    name: `DAYA-${String(index + 1).padStart(3, "0")}`,
    plan: plans[index % plans.length],
    activity: 30 + ((index * 17) % 71),
    revenue: 12000 + ((index * 4099) % 88000),
  }));
}

export function expensiveHealthScore(record: CustomerRecord) {
  let score = record.activity + record.revenue / 2400;

  for (let step = 0; step < 4200; step += 1) {
    score += Math.sin(record.id * step) * 0.004;
    score += Math.cos(record.revenue / (step + 1)) * 0.002;
  }

  return Math.max(0, Math.min(100, Math.round(score)));
}
