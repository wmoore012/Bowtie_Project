// Group prevention barriers by their source threats (two per threat in the example)
export const PREVENTION_GROUPS: string[][] = [
  ["pb-dui-enforcement", "pb-fit-duty"],          // Intoxication threat
  ["pb-handsfree", "pb-coaching"],                // Distraction threat
  ["pb-tire-tread", "pb-speed-gap"],              // Slippery conditions
  ["pb-lighting", "pb-signage-markings"],         // Visibility conditions
];

// Group mitigation barriers by their target consequences
export const MITIGATION_GROUPS: string[][] = [
  ["mb-guardrails", "mb-scene-protection"],        // Fixed object collisions
  ["mb-occupant-protection", "mb-ems"],            // Driver impacts
  ["mb-stability-rollover"],                        // Rollover
];

