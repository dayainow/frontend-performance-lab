import { describe, expect, it } from "vitest";
import { buildCustomerRecords, expensiveHealthScore } from "./rendering-utils";

describe("rendering lab utilities", () => {
  it("builds stable customer records", () => {
    const records = buildCustomerRecords(4);

    expect(records).toHaveLength(4);
    expect(records[0]).toMatchObject({ id: 1, name: "DAYA-001", plan: "Free" });
    expect(records[3].plan).toBe("Enterprise");
  });

  it("keeps expensive score inside a percentage range", () => {
    const [record] = buildCustomerRecords(1);
    const score = expensiveHealthScore(record);

    expect(score).toBeGreaterThanOrEqual(0);
    expect(score).toBeLessThanOrEqual(100);
  });
});
