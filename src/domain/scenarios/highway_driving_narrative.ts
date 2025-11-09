export type StoryStep = {
  title: string;
  body: string;
  focusIds?: string[];
  revealIds?: string[];
};

export const highwayDrivingNarrative: StoryStep[] = [
  // NORMAL STATE
  {
    title: "🛣️ NORMAL: Fleet Operations Running Smooth",
    body: "<strong>40 trucks</strong> running interstate routes.<br>• Drivers sober and trained<br>• Vehicles maintained and inspected<br>• ADAS systems calibrated<br>• Weather monitoring active<br><em>Every barrier in place, every shift.</em>",
    focusIds: ["hz-highway", "te-loss-control"],
  },

  // THREAT LANDSCAPE
  {
    title: "⚠️ SIX THREATS: What Can Go Wrong",
    body: "<strong>Any one can trigger loss of control:</strong><br>• 🍸 <strong>Intoxicated driver</strong> (impaired judgment)<br>• 🛰️ <strong>Sensor drift</strong> (bad feedback)<br>• 📱 <strong>Distraction</strong> (eyes off road)<br>• 🌧️ <strong>Slippery surface</strong> (no traction)<br>• 🔧 <strong>Mechanical failure</strong> (brakes, steering)<br>• 🌫️ <strong>Poor visibility</strong> (fog, darkness)",
    focusIds: ["th-intoxicated", "th-miscalibrated", "th-distracted", "th-slippery", "th-impaired-vehicle", "th-visibility"],
  },

  // LATENT CONDITIONS
  {
    title: "🕳️ LATENT: Cracks in the Foundation",
    body: "<strong>Hidden weaknesses building over months:</strong><br>• <strong>ADAS calibration overdue</strong> after windshield replacements<br>• <strong>ABS faults ignored</strong>—not escalated to maintenance<br>• <strong>Seatbelt alarms disconnected</strong> by drivers (too annoying)<br>• <strong>Weather alerts skipped</strong> when dispatch busy<br>• <strong>Defensive training postponed</strong> 6 months (budget cuts)",
    focusIds: ["ef-miscalibration", "ef-maint-backlog", "ef-seatbelt", "pb-weather-report", "pb-defensive-driving"],
  },

  // PREVENTION: Intoxication
  {
    title: "🛡 PREVENTION: Stopping Impaired Driving",
    body: "<strong>Four barriers between 🍸 intoxication and the wheel:</strong><br>• <strong>Random alcohol & drug screening</strong> (pre-hire + periodic testing)<br>• <strong>Designated driver pairs</strong> for company events<br>• <strong>Breath interlock ignition locks</strong> won't start truck without sober test<br>• <strong>Lane departure warnings</strong> catch impaired drift early<br><em>Screening catches problems before keys turn.</em>",
    focusIds: ["th-intoxicated", "pb-screening", "pb-designated-driver", "pb-ignition-lock", "pb-lane-warning"],
    revealIds: ["pb-screening", "pb-designated-driver", "pb-ignition-lock", "pb-lane-warning"],
  },

  // PREVENTION: Weather & Visibility
  {
    title: "🛡 PREVENTION: Handling Bad Weather",
    body: "<strong>Six barriers for 🌧️ slippery roads and 🌫️ low visibility:</strong><br>• 🌧️ <strong>Hourly weather alerts</strong> to dispatch<br>• 🗓️ <strong>Schedule adjustments</strong>—shift to safer routes/times<br>• 🚧 <strong>No-drive thresholds</strong> when conditions critical<br>• 🛡️ <strong>Defensive driving training</strong> for slick-surface recovery<br>• 🛞 <strong>ABS braking</strong> preserves steering control<br>• 💡 <strong>Running lights always on</strong> increases visibility",
    focusIds: ["th-slippery", "th-visibility", "pb-weather-report", "pb-adjust-schedule", "pb-no-high-risk", "pb-defensive-driving", "pb-abs", "pb-lights-always"],
    revealIds: ["pb-weather-report", "pb-adjust-schedule", "pb-no-high-risk", "pb-defensive-driving", "pb-abs", "pb-lights-always"],
  },

  // PREVENTION: Maintenance
  {
    title: "🛡 PREVENTION: Mechanical Integrity",
    body: "<strong>Catching 🔧 defects before they matter:</strong><br>• 🧰 <strong>Scheduled PM inspections</strong> every 5,000 miles<br>• 📝 <strong>Pre-trip DVIR</strong>—no truck leaves with open defects<br>• 🚨 <strong>Warning light protocol</strong>—immediate escalation<br>• 🛠️ <strong>Critical defects ground trucks</strong> until repaired",
    focusIds: ["th-impaired-vehicle", "pb-inspection-maint", "ef-maint-backlog", "eb-maintenance-discipline"],
    revealIds: ["pb-inspection-maint", "eb-maintenance-discipline"],
  },

  // DEVIATION BEGINS
  {
    title: "🌧️ DEVIATION: Storm Hits, Alert Missed",
    body: "<strong>Friday 4:00 PM:</strong> Freezing rain moving toward I-80.<br>• <strong>WHO:</strong> Dispatcher handling 6 simultaneous calls<br>• <strong>WHAT:</strong> Weather alert system not checked<br>• <strong>WHY:</strong> Staffing shortage, no backup protocol<br>• <strong>IMPACT:</strong> Driver unaware—first barrier down",
    focusIds: ["th-slippery", "pb-weather-report"],
  },

  {
    title: "📱 DEVIATION: Eyes Off Road for 5 Seconds",
    body: "<strong>Friday 5:15 PM:</strong> Driver checks phone to reroute around traffic.<br>• <strong>WHO:</strong> Driver with clean 10-year record<br>• <strong>WHAT:</strong> Lane departure warning doesn't trigger<br>• <strong>WHY:</strong> ADAS calibration overdue 3 months<br>• <strong>IMPACT:</strong> Two barriers down—distraction + failed detection",
    focusIds: ["th-distracted", "pb-lane-warning", "ef-miscalibration"],
  },

  // ESCALATION
  {
    title: "❄️ ESCALATION: Black Ice Forms",
    body: "<strong>Friday 5:17 PM:</strong> Temperature drops under bridge, pavement ices.<br>• <strong>WHAT:</strong> Rear wheels lose traction at 65 mph<br>• <strong>COMPOUNDING FACTOR:</strong> ABS fault from last week not fixed<br>• <strong>WHY:</strong> Maintenance backlog—non-critical items deferred<br>• <strong>IMPACT:</strong> Braking asymmetric, truck starts rotating",
    focusIds: ["th-slippery", "th-impaired-vehicle", "ef-maint-backlog"],
  },

  // TOP EVENT
  {
    title: "🎯 TOP EVENT: Loss of Control",
    body: "<strong>Friday 5:17:03 PM:</strong> Truck rotates 45° in lane, crosses centerline.<br><em>Prevention has failed. Mitigation is now the only hope.</em>",
    focusIds: ["te-loss-control"],
  },

  // MITIGATION ENGAGES
  {
    title: "🛡 MITIGATION: Tech + Training Respond",
    body: "<strong>Friday 5:17:04 PM:</strong> Three mitigation barriers activate:<br>• 🚨 <strong>Forward collision radar</strong> chirps—car 200 feet ahead<br>• 🛡️ <strong>Defensive training kicks in</strong>—driver countersteers smoothly<br>• 🧱 <strong>Crumple zone ready</strong> if impact occurs<br><em>Driver fighting for control.</em>",
    focusIds: ["mb-forward-warning", "mb-defensive-competence", "mb-crumple-zone"],
    revealIds: ["mb-forward-warning", "mb-defensive-competence", "mb-crumple-zone"],
  },

  {
    title: "🛡 MITIGATION: Occupant Protection Standby",
    body: "<strong>If crash occurs, three more barriers:</strong><br>• 🎈 <strong>Airbags ready</strong> (sensors tested quarterly)<br>• 🪑 <strong>Headrest adjusted properly</strong> (prevents whiplash)<br>• 🔔 <strong>Seatbelt alarm active</strong>—except driver bypassed it last month<br><em>One mitigation barrier already compromised.</em>",
    focusIds: ["mb-airbag", "mb-headrest", "mb-seatbelt-alarm", "ef-seatbelt"],
    revealIds: ["mb-airbag", "mb-headrest", "mb-seatbelt-alarm"],
  },

  // OUTCOME: BARRIER WIN
  {
    title: "✅ BARRIER WIN: Control Regained",
    body: "<strong>Friday 5:17:08 PM:</strong> Driver regains lane position.<br>• <strong>WHAT WORKED:</strong> Radar alert + defensive training<br>• <strong>RESULT:</strong> No collision, truck intact<br>• <strong>HUMAN COST:</strong> Driver's hands shaking, heart racing<br><em>Mitigation held—this time.</em>",
    focusIds: ["mb-forward-warning", "mb-defensive-competence"],
  },

  // ALTERNATE OUTCOME
  {
    title: "💥 ALTERNATE: If Mitigation Failed",
    body: "<strong>Without radar and training, four consequences likely:</strong><br>• 💥 <strong>Crash into barrier</strong> at 40 mph (property damage)<br>• 🤕 <strong>Driver impacts interior</strong> (whiplash, head trauma)<br>• ⚠️ <strong>Unbuckled = ejection risk</strong> (potential fatality)<br>• 🌀 <strong>Rollover</strong> if shoulder unstable (cargo spill, multi-vehicle)<br><em>Every near-miss is a warning.</em>",
    focusIds: ["c-fixed-object", "c-driver-impacts", "c-seatbelt-missed", "c-rollover"],
  },

  // RECOVERY
  {
    title: "🛠️ RECOVERY: Near-Miss Triggers Changes",
    body: "<strong>Actions taken within 48 hours:</strong><br>• 🔧 <strong>Fleet-wide ADAS calibration</strong> (3-day blitz)<br>• 🌧️ <strong>Weather alert automation</strong> with failsafe backup<br>• 🛡️ <strong>Defensive driving refreshers</strong> moved up 6 months<br>• 🔔 <strong>Seatbelt alarm bypass = disciplinary action</strong><br>• 🛠️ <strong>ABS faults escalation protocol</strong> revised",
    focusIds: ["pb-calibration", "pb-weather-report", "pb-defensive-driving", "mb-seatbelt-alarm", "pb-abs"],
    revealIds: ["pb-calibration", "pb-weather-report", "pb-defensive-driving"],
  },

  // HUMAN FACTORS
  {
    title: "👷 ROOT CAUSES: System Failed People First",
    body: "<strong>Three decision points where the system set people up to fail:</strong><br>• <strong>Dispatcher:</strong> No backup when call volume spikes (staffing issue)<br>• <strong>Maintenance:</strong> Deferred calibration under budget pressure (prioritization issue)<br>• <strong>Driver:</strong> Bypassed alarm due to annoyance (design issue)<br><em>People adapted to broken systems—until the day they couldn't.</em>",
    focusIds: ["pb-weather-report", "ef-miscalibration", "ef-seatbelt"],
  },

  // LESSONS
  {
    title: "🎯 LESSONS: The Swiss Cheese Aligned",
    body: "<strong>Why control was nearly lost:</strong><br>• <strong>Economic pressure</strong> (deferred maintenance)<br>• <strong>Workload spikes</strong> (dispatcher bandwidth)<br>• <strong>Normalization of deviance</strong> (bypassing alarms)<br>• <strong>Environmental surprise</strong> (black ice)<br><br><strong>Why mitigation held:</strong><br>• <strong>Redundant barriers</strong> (radar + training)<br>• <strong>Investment in fundamentals</strong> (defensive driving)<br><em>Defense in depth saved a life.</em>",
    focusIds: ["hz-highway", "te-loss-control", "mb-forward-warning", "mb-defensive-competence"],
  },

  // CULTURE WINS (positive examples)
  {
    title: "💚 CULTURE WIN: Weather Intel Prevents Incident",
    body: "<strong>Tuesday morning:</strong> Dispatcher sees radar, adjusts schedule.<br>• <strong>WHAT:</strong> Driver parks before hail hits<br>• <strong>RESULT:</strong> Threat never touches top event<br>• <strong>IMPACT:</strong> Shared exhale across ops team<br><em>Barriers working as designed.</em>",
    focusIds: ["pb-weather-report", "pb-adjust-schedule", "pb-no-high-risk"],
    revealIds: ["pb-weather-report", "pb-adjust-schedule", "pb-no-high-risk"],
  },

  {
    title: "💚 CULTURE WIN: Maintenance Heroes",
    body: "<strong>Wednesday night shift:</strong> Technicians close backlog in single push.<br>• <strong>WHO:</strong> 4 mechanics, overtime approved<br>• <strong>WHAT:</strong> ABS faults, calibration tickets, brake wear—all cleared<br>• <strong>WHY:</strong> Leadership prioritized fleet readiness over cost<br>• <strong>IMPACT:</strong> Every truck leaves inspection bay safe<br><em>Greasy smiles and clear defect boards.</em>",
    focusIds: ["pb-inspection-maint", "ef-maint-backlog", "eb-maintenance-discipline"],
    revealIds: ["pb-inspection-maint", "eb-maintenance-discipline"],
  },

  {
    title: "💚 CULTURE WIN: Seatbelt Save Story",
    body: "<strong>Friday stand-up:</strong> Driver shares how belt saved them in rear-end collision.<br>• <strong>IMPACT:</strong> Campaign messaging reinforced by lived experience<br>• <strong>RESULT:</strong> Compliance rises, alarm bypass stops<br>• <strong>FEELING:</strong> Pride, not preaching<br><em>Culture change through storytelling.</em>",
    focusIds: ["mb-seatbelt-campaign", "mb-seatbelt-alarm", "eb-seatbelt-discipline"],
    revealIds: ["mb-seatbelt-campaign", "mb-seatbelt-alarm", "eb-seatbelt-discipline"],
  },

  // CLOSING
  {
    title: "🏁 EVERY ROLE MATTERS",
    body: "<strong>Keeping the bowtie balanced requires:</strong><br>• <strong>Operations:</strong> Weather monitoring, schedule adjustments<br>• <strong>Maintenance:</strong> Inspections, calibrations, defect closure<br>• <strong>Drivers:</strong> Training, pre-trip checks, protocol adherence<br>• <strong>Vendors:</strong> Quality parts, timely service<br>• <strong>Leadership:</strong> Budget prioritization, culture reinforcement<br><em>Barriers only work when everyone commits.</em>",
    focusIds: ["hz-highway", "th-intoxicated", "pb-screening", "mb-seatbelt-campaign", "eb-rollover-readiness", "c-fixed-object"],
  },

  {
    title: "📤 SHARE THIS STORY",
    body: "<strong>Use this bowtie in your stand-ups and safety briefings.</strong><br>• Export clean PNG for presentations<br>• Arrow keys navigate the timeline<br>• Filters show role-specific accountability<br><em>Every near-miss is a gift—unwrap the lessons before the real crash.</em>",
    focusIds: ["hz-highway", "te-loss-control"],
  },
];