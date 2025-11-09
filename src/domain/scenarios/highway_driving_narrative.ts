export type StoryStep = {
  title: string;
  body: string;
  focusIds?: string[];
  revealIds?: string[];
};

export const highwayDrivingNarrative: StoryStep[] = [
  {
    title: "⚠️ Framing the hazard",
    body: "We start with the <strong>hazard</strong> — driving a vehicle on a highway — feeding the <strong>top event</strong> when control is lost. Every branch we explore pivots around this pair.",
    focusIds: ["hz-highway", "te-loss-control"],
  },
  {
    title: "🎯 Threat landscape",
    body: "Six threat families feed the top event: intoxication, system miscalibration, distraction, slippery roads, impaired vehicle condition, and controllable visibility. Each is shown in blue on the left wing.",
    focusIds: [
      "th-intoxicated",
      "th-miscalibrated",
      "th-distracted",
      "th-slippery",
      "th-impaired-vehicle",
      "th-visibility",
    ],
  },
  {
    title: "⚡️ Escalation factors",
    body: "Escalation (yellow) accelerates failure when calibration or maintenance backlogs exist. We surface them even in the collapsed view so facilitators can talk about degradation early.",
    focusIds: ["ef-miscalibration", "ef-maint-backlog"],
  },
  {
    title: "🛡 Preventing intoxicated driving",
    body: "Clicking any threat reveals its prevention barriers. Here we show four controls for intoxication: screening, designated drivers, ignition interlocks, and lane departure warnings.",
    focusIds: ["th-intoxicated", "pb-screening", "pb-designated-driver", "pb-ignition-lock", "pb-lane-warning"],
    revealIds: ["pb-screening", "pb-designated-driver", "pb-ignition-lock", "pb-lane-warning"],
  },
  {
    title: "🌧 Managing slippery or low-visibility routes",
    body: "Weather intel, scheduling, defensive driving, ABS, and lighting policies fight the slippery + visibility threats. They pop into view only when the related cards are active.",
    focusIds: [
      "th-slippery",
      "th-visibility",
      "pb-weather-report",
      "pb-adjust-schedule",
      "pb-no-high-risk",
      "pb-defensive-driving",
      "pb-abs",
      "pb-lights-always",
      "pb-light-spec",
      "pb-preferred-hire",
    ],
    revealIds: [
      "pb-weather-report",
      "pb-adjust-schedule",
      "pb-no-high-risk",
      "pb-defensive-driving",
      "pb-abs",
      "pb-lights-always",
      "pb-light-spec",
      "pb-preferred-hire",
    ],
  },
  {
    title: "🚧 Crash mitigation barriers",
    body: "When the top event fires, mitigation barriers glow on the right. Forward collision warnings, defensive competence, and crumple structures steer energy away from other vehicles.",
    focusIds: ["mb-forward-warning", "mb-defensive-competence", "mb-crumple-zone", "c-fixed-object"],
    revealIds: ["mb-forward-warning", "mb-defensive-competence", "mb-crumple-zone"],
  },
  {
    title: "🧍 Occupant protection",
    body: "Airbags and correct headrest positioning cut down internal occupant injuries. These nodes pulse together with the “Driver impacts interior” consequence.",
    focusIds: ["mb-airbag", "mb-headrest", "c-driver-impacts"],
    revealIds: ["mb-airbag", "mb-headrest"],
  },
  {
    title: "🔔 Seatbelt compliance loop",
    body: "Seatbelt campaigns and alarms defend against the ‘forgetting/refusing’ consequence. Right-side escalation factors show how culture can erode these controls.",
    focusIds: ["mb-seatbelt-campaign", "mb-seatbelt-alarm", "c-seatbelt-missed", "ef-seatbelt", "eb-seatbelt-discipline"],
    revealIds: ["mb-seatbelt-campaign", "mb-seatbelt-alarm", "eb-seatbelt-discipline"],
  },
  {
    title: "🔄 Rollover readiness",
    body: "Rollover protection, response training, and mutual-aid agreements keep space for occupants and speed recovery. Highlighting ties the EF chain directly back to the top event.",
    focusIds: ["mb-rollover-protection", "c-rollover", "ef-rollover", "eb-rollover-readiness"],
    revealIds: ["mb-rollover-protection", "eb-rollover-readiness"],
  },
  {
    title: "📤 Export & present",
    body: "Use Share/Export for clean PNGs or stay in this guided mode. Arrow keys advance slides when menus are closed. Restarting the story collapses the diagram back to the base view.",
    focusIds: ["hz-highway", "te-loss-control"],
  },
];
