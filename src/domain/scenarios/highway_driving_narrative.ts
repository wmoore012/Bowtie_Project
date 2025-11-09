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
    body: "<strong>Threat roll call:</strong> 🍸 intoxication, 🛰️ miscalibration, 📱 distraction, 🌧️ slippery roads, 🔧 impaired machines, 🌫️ visibility. <em>Blue frames = anticipation.</em> Tap any card and watch its cyan shields slide in from the left.",
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
    body: "⚡️ <strong>Degradation guardrail:</strong> 🛠️ calibration slips, 📉 backlog drag, ❌ seatbelt drift, 🌀 rollover readiness. <u>Yellow stripes never hide</u> so facilitators can call out frailty before it grows.",
    focusIds: ["ef-miscalibration", "ef-maint-backlog", "ef-seatbelt", "ef-rollover"],
  },
  {
    title: "🛡 Preventing intoxicated driving",
    body: "🍸 threat opens to <strong>PB-1.x</strong>: 🧪 screening, 🧍‍♂️ designated buddies, 🔐 ignition locks, 🚨 lane nudges. Cyan underline = <u>human checkpoints</u> so the room instantly spots accountability.",
    focusIds: ["th-intoxicated", "pb-screening", "pb-designated-driver", "pb-ignition-lock", "pb-lane-warning"],
    revealIds: ["pb-screening", "pb-designated-driver", "pb-ignition-lock", "pb-lane-warning"],
  },
  {
    title: "🌧 Managing slippery or low-visibility routes",
    body: "<strong>PB-4 / PB-6 carousel:</strong> 🌧️ <span style=\"color:#0369a1;font-weight:600;\">weather intel</span>, 🗓️ <span style=\"color:#7c3aed;font-style:italic;\">schedule shifts</span>, 🛡️ defensive coaching, 🛞 ABS pulse, 💡 lighting policy. Each icon locks to its card so crews can skim left wing like a dashboard.",
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
    body: "When 🎯 flashes, the right wing fans out: 🚨 forward-warning radar, 🛡️ slip recovery coaching, and 🚙 crumple structure (<em>car shell emoji, not a brick</em>) feed the 💥 crash chain. <u>Blue glow means reaction, not panic.</u>",
    focusIds: ["mb-forward-warning", "mb-defensive-competence", "mb-crumple-zone", "c-fixed-object"],
    revealIds: ["mb-forward-warning", "mb-defensive-competence", "mb-crumple-zone"],
  },
  {
    title: "🧍 Occupant protection",
    body: "<strong>Occupant comfort sequence:</strong> 🎈 airbags lift the impact, 🪑 headrests steady the spine, 🤕 interior injury node shifts from red to lavender. Mention the calm, not the glow.",
    focusIds: ["mb-airbag", "mb-headrest", "c-driver-impacts"],
    revealIds: ["mb-airbag", "mb-headrest"],
  },
  {
    title: "🔔 Seatbelt compliance loop",
    body: "<u>Culture loop:</u> 📣 campaigns, 🔔 cab alarms, ⚠️ refusal consequence, ✅ EF discipline. Speak to trust, incentives, and peer pressure—not software.",
    focusIds: ["mb-seatbelt-campaign", "mb-seatbelt-alarm", "c-seatbelt-missed", "ef-seatbelt", "eb-seatbelt-discipline"],
    revealIds: ["mb-seatbelt-campaign", "mb-seatbelt-alarm", "eb-seatbelt-discipline"],
  },
  {
    title: "🔄 Rollover readiness",
    body: "🔄 <strong>Rollover duet:</strong> 🛞 cage structure + 🚒 readiness drills counter the 🌀 escalation factor. Describe the relief of watching a truck stay upright, not the animation.",
    focusIds: ["mb-rollover-protection", "c-rollover", "ef-rollover", "eb-rollover-readiness"],
    revealIds: ["mb-rollover-protection", "eb-rollover-readiness"],
  },
  {
    title: "💚 Barrier win: sober start",
    body: "PB-1.x shines: 🧪 screening, 🧍‍♂️ buddies, 🔐 ignition locks catch impairment before wheels roll. Celebrate the calm breath supervisors take when every truck leaves clear.",
    focusIds: ["pb-screening", "pb-designated-driver", "pb-ignition-lock", "pb-lane-warning"],
    revealIds: ["pb-screening", "pb-designated-driver", "pb-ignition-lock", "pb-lane-warning"],
  },
  {
    title: "🌤 Weather shift handled",
    body: "Dispatcher sees the radar, taps 🗓️ adjust schedule, and the driver parks before hail hits. Mention the shared exhale when 🌧 threat cards fade without ever touching the knot.",
    focusIds: ["pb-weather-report", "pb-adjust-schedule", "pb-no-high-risk"],
    revealIds: ["pb-weather-report", "pb-adjust-schedule", "pb-no-high-risk"],
  },
  {
    title: "🚨 Radar nudge saves a family",
    body: "Forward warning + slip coaching kick in together: 🚨 radar chirps, 🛡 coach training takes over, 🚙 crumple shell never has to burn energy. Tell the room what stayed whole.",
    focusIds: ["mb-forward-warning", "mb-defensive-competence", "mb-crumple-zone"],
    revealIds: ["mb-forward-warning", "mb-defensive-competence", "mb-crumple-zone"],
  },
  {
    title: "👷 Rescue choreography",
    body: "Emergency partners drill the playbook: 🚒 readiness, ✅ EF discipline, ❌ consequence shrinks. Shine a light on people shaking hands after a clean lift-out.",
    focusIds: ["eb-seatbelt-discipline", "eb-rollover-readiness", "mb-seatbelt-campaign", "mb-rollover-protection"],
    revealIds: ["eb-seatbelt-discipline", "eb-rollover-readiness"],
  },
  {
    title: "📊 Lessons loop back",
    body: "Fleet reviews near-miss telemetry, pins it to 📣 campaign boards, updates 📅 cadence. Close the story on the feeling of teams learning faster than the risk mutates.",
    focusIds: ["hz-highway", "pb-coaching", "pb-inspection-maint", "mb-seatbelt-alarm"],
    revealIds: ["pb-coaching", "pb-inspection-maint", "mb-seatbelt-alarm"],
  },
  {
    title: "📤 Export & present",
    body: "📤 Share/Export hides chrome for screenshots, while ⌨️ arrow keys advance the glowing story. Restart snaps the bowtie back to its minimal threat/hazard spine for the next audience.",
    focusIds: ["hz-highway", "te-loss-control"],
  },
];
