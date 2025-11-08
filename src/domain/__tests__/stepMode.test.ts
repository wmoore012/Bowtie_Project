import { describe, it, expect } from "vitest";
import { computeStepDiagram, type StepIndex } from "../stepMode";
import type { BowtieDiagram, BowtieNodeType } from "../bowtie.types";
import { highwayDrivingExample } from "../scenarios/highway_driving.example";
import { PREVENTION_GROUPS, MITIGATION_GROUPS } from "../scenarios/highway_driving.groups";

function countByType(d: BowtieDiagram): Record<BowtieNodeType, number> {
  const counts = {
    threat: 0,
    preventionBarrier: 0,
    hazard: 0,
    topEvent: 0,
    mitigationBarrier: 0,
    consequence: 0,
  } as Record<BowtieNodeType, number>;
  for (const n of d.nodes) counts[n.type]++;
  return counts;
}

function idsLen(groups: string[][], uptoInclusive: number): number {
  let n = 0;
  for (let i = 0; i <= uptoInclusive && i < groups.length; i++) {
    const g = groups[i];
    n += g ? g.length : 0;
  }
  return n;
}

describe("stepMode computeStepDiagram", () => {
  it("step 0 returns only hazard + topEvent", () => {
    const d = computeStepDiagram(highwayDrivingExample, {
      step: 0 as StepIndex,
      leftExpanded: true,
      rightExpanded: true,
      preventionGroups: PREVENTION_GROUPS,
      mitigationGroups: MITIGATION_GROUPS,
    });
    const c = countByType(d);
    expect(c.hazard).toBe(1);
    expect(c.topEvent).toBe(1);
    expect(c.threat + c.consequence + c.preventionBarrier + c.mitigationBarrier).toBe(0);
  });

  it("step 1 adds threats + consequences", () => {
    const d = computeStepDiagram(highwayDrivingExample, {
      step: 1 as StepIndex,
      leftExpanded: true,
      rightExpanded: true,
      preventionGroups: PREVENTION_GROUPS,
      mitigationGroups: MITIGATION_GROUPS,
    });
    const c = countByType(d);
    expect(c.hazard).toBe(1);
    expect(c.topEvent).toBe(1);
    expect(c.threat).toBeGreaterThan(0);
    expect(c.consequence).toBeGreaterThan(0);
    expect(c.preventionBarrier).toBe(0);
    expect(c.mitigationBarrier).toBe(0);
  });

  it("steps 2-5 cumulatively add prevention groups", () => {
    for (let s = 2 as StepIndex; s <= (5 as StepIndex); s = ((s + 1) as StepIndex)) {
      const d = computeStepDiagram(highwayDrivingExample, {
        step: s,
        leftExpanded: true,
        rightExpanded: true,
        preventionGroups: PREVENTION_GROUPS,
        mitigationGroups: MITIGATION_GROUPS,
      });
      const c = countByType(d);
      const expected = idsLen(PREVENTION_GROUPS, s - 2);
      expect(c.preventionBarrier).toBe(expected);
      expect(c.mitigationBarrier).toBe(0);
    }
  });

  it("step 6 shows all prevention barriers", () => {
    const d = computeStepDiagram(highwayDrivingExample, {
      step: 6 as StepIndex,
      leftExpanded: true,
      rightExpanded: true,
      preventionGroups: PREVENTION_GROUPS,
      mitigationGroups: MITIGATION_GROUPS,
    });
    const c = countByType(d);
    const totalPrev = idsLen(PREVENTION_GROUPS, PREVENTION_GROUPS.length - 1);
    expect(c.preventionBarrier).toBe(totalPrev);
  });

  it("steps 7-9 cumulatively add mitigation groups", () => {
    for (let s = 7 as StepIndex; s <= (9 as StepIndex); s = ((s + 1) as StepIndex)) {
      const d = computeStepDiagram(highwayDrivingExample, {
        step: s,
        leftExpanded: true,
        rightExpanded: true,
        preventionGroups: PREVENTION_GROUPS,
        mitigationGroups: MITIGATION_GROUPS,
      });
      const c = countByType(d);
      const expected = idsLen(MITIGATION_GROUPS, s - 7);
      expect(c.mitigationBarrier).toBe(expected);
    }
  });

  it("step 10 shows all nodes", () => {
    const d = computeStepDiagram(highwayDrivingExample, {
      step: 10 as StepIndex,
      leftExpanded: true,
      rightExpanded: true,
      preventionGroups: PREVENTION_GROUPS,
      mitigationGroups: MITIGATION_GROUPS,
    });
    const c = countByType(d);
    const totalPrev = idsLen(PREVENTION_GROUPS, PREVENTION_GROUPS.length - 1);
    const totalMit = idsLen(MITIGATION_GROUPS, MITIGATION_GROUPS.length - 1);
    expect(c.preventionBarrier).toBe(totalPrev);
    expect(c.mitigationBarrier).toBe(totalMit);
  });

  it("leftExpanded=false hides left wing even at step 10", () => {
    const d = computeStepDiagram(highwayDrivingExample, {
      step: 10 as StepIndex,
      leftExpanded: false,
      rightExpanded: true,
      preventionGroups: PREVENTION_GROUPS,
      mitigationGroups: MITIGATION_GROUPS,
    });
    const c = countByType(d);
    expect(c.threat).toBe(0);
    expect(c.preventionBarrier).toBe(0);
  });

  it("rightExpanded=false hides right wing even at step 10", () => {
    const d = computeStepDiagram(highwayDrivingExample, {
      step: 10 as StepIndex,
      leftExpanded: true,
      rightExpanded: false,
      preventionGroups: PREVENTION_GROUPS,
      mitigationGroups: MITIGATION_GROUPS,
    });
    const c = countByType(d);
    expect(c.consequence).toBe(0);
    expect(c.mitigationBarrier).toBe(0);
  });
});

