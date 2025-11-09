// Group prevention barriers by threat branch (used by guided stepper)
export const PREVENTION_GROUPS: string[][] = [
  ["pb-screening", "pb-designated-driver", "pb-ignition-lock", "pb-lane-warning"], // Intoxicated driving
  ["pb-calibration"], // Miscalibrated systems
  ["pb-lane-warning"], // Distracted driving
  ["pb-weather-report", "pb-adjust-schedule", "pb-no-high-risk", "pb-defensive-driving", "pb-abs"], // Slippery surface
  ["pb-inspection-maint"], // Impaired vehicle condition
  ["pb-weather-report", "pb-adjust-schedule", "pb-lights-always", "pb-light-spec", "pb-preferred-hire"], // Visibility
];

// Group mitigation barriers by their target consequences
export const MITIGATION_GROUPS: string[][] = [
  ["mb-forward-warning", "mb-defensive-competence", "mb-crumple-zone"], // Crash into object/vehicle
  ["mb-airbag", "mb-headrest"], // Driver impacts interior
  ["mb-seatbelt-campaign", "mb-seatbelt-alarm"], // Seatbelt compliance consequence
  ["mb-rollover-protection"], // Vehicle roll-over
];
