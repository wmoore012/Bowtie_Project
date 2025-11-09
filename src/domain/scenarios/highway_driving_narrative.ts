export type StoryStep = {
  title: string;
  body: string;
  focusIds?: string[];
  revealIds?: string[];
};

export const highwayDrivingNarrative: StoryStep[] = [
  {
    title: "⚠️ Framing the hazard",
    body: "<span style=\"color:#ea580c;font-weight:700;\">⚠️ Hazard</span> → <span style=\"color:#ef4444;font-weight:700;\">🎯 Top event</span>. The yellow striped card feeds the glowing knot so everyone immediately sees where energy flows.",
    focusIds: ["hz-highway", "te-loss-control"],
  },
  {
    title: "🎯 Threat landscape",
    body: "Threat wing roll call: 🍸 intoxication, 🛰️ miscalibration, 📱 distraction, 🌧️ slippery roads, 🔧 impaired vehicles, and 🌫️ visibility. Each blue card is a single click from exposing its defenses.",
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
    body: "Yellow ⚡️ escalation tiles (🛠️ calibration, 📉 backlog, ❌ seatbelts, 🌀 rollover) stay pinned so degradation is never out of sight, even when barriers remain collapsed.",
    focusIds: ["ef-miscalibration", "ef-maint-backlog", "ef-seatbelt", "ef-rollover"],
  },
  {
    title: "🛡 Preventing intoxicated driving",
    body: "Select 🍸 Intoxicated driving to reveal 🧪 screening, 🧍‍♂️ designated drivers, 🔐 ignition locks, and 🚨 lane warnings. Each chip glows cyan so facilitators can see ownership instantly.",
    focusIds: ["th-intoxicated", "pb-screening", "pb-designated-driver", "pb-ignition-lock", "pb-lane-warning"],
    revealIds: ["pb-screening", "pb-designated-driver", "pb-ignition-lock", "pb-lane-warning"],
  },
  {
    title: "🌧 Managing slippery or low-visibility routes",
    body: "🌧️ <span style=\"color:#0369a1;font-weight:600;\">Weather intel</span>, 🗓️ <span style=\"color:#7c3aed;font-weight:600;\">scheduling</span>, 🛡️ defensive driving, 🛞 ABS, and 💡 lighting policy each get its own emoji + color so the slippery + visibility story is scannable. These controls only appear when their threat cards are open.",
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
    body: "If 🎯 fires, the right wing pulses: 🚨 forward warning, 🛡️ slip recovery, and 🧱 crumple structure form the crash-to-object chain feeding 💥 consequences.",
    focusIds: ["mb-forward-warning", "mb-defensive-competence", "mb-crumple-zone", "c-fixed-object"],
    revealIds: ["mb-forward-warning", "mb-defensive-competence", "mb-crumple-zone"],
  },
  {
    title: "🧍 Occupant protection",
    body: "Occupant storyline glows purple: 🎈 airbags plus 🪑 headrests defend against 🤕 interior impacts, so everyone in the room sees which levers soften injuries.",
    focusIds: ["mb-airbag", "mb-headrest", "c-driver-impacts"],
    revealIds: ["mb-airbag", "mb-headrest"],
  },
  {
    title: "🔔 Seatbelt compliance loop",
    body: "Seatbelt culture loop: 📣 campaigns + 🔔 alarms fight ⚠️ belt refusal while ✅ EF barriers remind us that leadership discipline keeps the loop tight.",
    focusIds: ["mb-seatbelt-campaign", "mb-seatbelt-alarm", "c-seatbelt-missed", "ef-seatbelt", "eb-seatbelt-discipline"],
    revealIds: ["mb-seatbelt-campaign", "mb-seatbelt-alarm", "eb-seatbelt-discipline"],
  },
  {
    title: "🔄 Rollover readiness",
    body: "🛞 Rollover cages + 🚒 readiness barriers illuminate together with the 🌀 escalation factor so teams track how response plans control 🚗💫 outcomes.",
    focusIds: ["mb-rollover-protection", "c-rollover", "ef-rollover", "eb-rollover-readiness"],
    revealIds: ["mb-rollover-protection", "eb-rollover-readiness"],
  },
  {
    title: "📤 Export & present",
    body: "📤 Share/Export hides chrome for screenshots, while ⌨️ arrow keys advance the glowing story. Restart snaps the bowtie back to its minimal threat/hazard spine for the next audience.",
    focusIds: ["hz-highway", "te-loss-control"],
  },
];
