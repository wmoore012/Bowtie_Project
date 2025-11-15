import type { BowtieDiagram } from "../bowtie.types";

const now = new Date().toISOString();

export const highwayDrivingExample: BowtieDiagram = {
  id: "highway-driving-bowtie",
  title: "Highway Driving Bowtie (Interactive)",
  createdAt: now,
  updatedAt: now,
  nodes: [
    {
      id: "hz-highway",
      type: "hazard",
      label: "H-1 ⚠️ Driving a vehicle on a highway",
      metadata: {
        eli5: "High-speed traffic leaves little margin for errors or failures.",
        details: [
          "Dense, fast traffic amplifies kinetic energy and reaction distance",
          "Any loss of control can immediately involve other vehicles",
        ],
      },
    },
    {
      id: "te-loss-control",
      type: "topEvent",
      label: "TE-1 🎯 Loss of control at highway speed",
      metadata: {
        eli5: "The driver no longer keeps the vehicle centred, stable, or slowed.",
        details: [
          "Moments before a crash when traction, attention, or control is lost",
          "Split-second transition between prevention and mitigation",
        ],
      },
    },
    // Threats
    {
      id: "th-intoxicated",
      type: "threat",
      label: "T-1 🍸 Intoxicated driving",
      metadata: {
        eli5: "Alcohol or drugs slow reaction time and judgement.",
        details: [
          "Policy defines BAC thresholds and impairment indicators",
          "Supervisors remove unfit drivers before dispatch",
          "Law enforcement partners share DUI trends",
        ],
        chips: ["Human", "Supervisor", "Policy"],
      },
    },
    {
      id: "th-miscalibrated",
      type: "threat",
      label: "T-2 🛰️ Miscalibrated assistance systems",
      metadata: {
        eli5: "Sensors or ADAS settings drift, giving the driver bad feedback.",
        details: [
          "Lane-keeping cameras require periodic calibration",
          "Shops log adjustments after glass or bumper work",
        ],
        chips: ["Maintenance", "Vendors"],
      },
    },
    {
      id: "th-distracted",
      type: "threat",
      label: "T-3 📱 Distracted driving (phone, GPS, infotainment)",
      metadata: {
        eli5: "Screen time steals the driver’s eyes and mind.",
        details: [
          "Hands-free policy enforced with spot checks",
          "Coaching program reviews camera events",
        ],
        chips: ["Policy", "Supervisor"],
      },
    },
    {
      id: "th-slippery",
      type: "threat",
      label: "T-4 🌧️ Slippery road surface",
      metadata: {
        eli5: "Rain, ice, or gravel erode tire grip and braking.",
        details: [
          "Dispatch receives route weather alerts",
          "Drivers slow down and increase following distance",
        ],
        chips: ["Operations", "Human"],
      },
    },
    {
      id: "th-impaired-vehicle",
      type: "threat",
      label: "T-5 🔧 Impaired vehicle condition",
      metadata: {
        eli5: "Mechanical defects mean the truck cannot respond.",
        details: [
          "CMMS logs inspections and corrective work",
          "Drivers escalate warning lights immediately",
        ],
        chips: ["Maintenance"],
      },
    },
    {
      id: "th-visibility",
      type: "threat",
      label: "T-6 🌫️ Poor visibility (controllable)",
      metadata: {
        eli5: "Fog, glare, and darkness hide hazards until too late.",
        details: [
          "Teams monitor weather and light conditions",
          "Fleet spec keeps running lights on",
        ],
        chips: ["Operations", "Active hardware"],
      },
    },
    // Escalation factors (left wing)
    {
      id: "ef-miscalibration",
      type: "escalationFactor",
      label: "EF-1 🛠️ Escalation: Calibration overdue",
      wing: "left",
      metadata: {
        eli5: "If ADAS calibration slips, threats escalate faster.",
        details: [
          "Glass replacements and collisions trigger recalibration",
          "Verification steps logged before return to service",
        ],
        chips: ["Maintenance"],
      },
    },
    {
      id: "ef-maint-backlog",
      type: "escalationFactor",
      label: "EF-2 📉 Escalation: Maintenance backlog",
      wing: "left",
      metadata: {
        eli5: "Known issues ignored make any threat harder to control.",
        details: [
          "Deferred defects tracked with risk ranking",
          "Critical items grounded until repaired",
        ],
        chips: ["Maintenance", "Policy"],
      },
    },
    // Escalation factors (right wing)
    {
      id: "ef-seatbelt",
      type: "escalationFactor",
      label: "EF-3 ❌ Escalation: Seatbelt non-compliance",
      wing: "right",
      metadata: {
        eli5: "If belts are unused, mitigation barriers fail.",
        details: [
          "Safety culture, incentives, and alarms reinforce use",
          "Audits tie PPE use to supervisor scorecards",
        ],
        chips: ["Human", "Supervisor"],
      },
    },
    {
      id: "ef-rollover",
      type: "escalationFactor",
      label: "EF-4 🌀 Escalation: Rollover response gaps",
      wing: "right",
      metadata: {
        eli5: "If crews aren’t ready for a rollover, impacts worsen.",
        details: [
          "Driver refreshers cover roll-stability events",
          "Emergency plans identify recovery partners",
        ],
        chips: ["Training", "Emergency"],
      },
    },
    // Prevention barriers
    {
      id: "pb-screening",
      type: "preventionBarrier",
      label: "PB-1.1 🧪 Periodical alcohol and drug screening",
      metadata: {
        eli5: "Regular testing keeps impaired drivers off the highway.",
        details: [
          "Random tests and pre-hire panels documented",
          "Third-party lab shares completion metrics",
        ],
        chips: ["Policy", "HR"],
      },
    },
    {
      id: "pb-designated-driver",
      type: "preventionBarrier",
      label: "PB-1.2 🧍‍♂️ Appointing a designated driver",
      metadata: {
        eli5: "Peer checks ensure a sober driver takes the wheel.",
        details: [
          "Dispatch pairs relief drivers for events",
          "Night shift captains sign off fitness",
        ],
        chips: ["Human", "Supervisor"],
      },
    },
    {
      id: "pb-ignition-lock",
      type: "preventionBarrier",
      label: "PB-1.3 🔐 Breath alcohol ignition interlock",
      metadata: {
        eli5: "Truck will not start until a sober test is complete.",
        details: [
          "Units calibrated quarterly",
          "Bypass attempts create automatic alerts",
        ],
        chips: ["Active hardware"],
      },
    },
    {
      id: "pb-lane-warning-t1",
      type: "preventionBarrier",
      label: "PB-1.4 Lane departure warning system",
      metadata: {
        eli5: "Alerts nudge drivers back between the lines.",
        details: [
          "Camera alignment verified after windshield work",
          "Drivers coached on response to alerts",
        ],
        chips: ["Active hardware", "Human"],
      },
    },
    {
      id: "pb-lane-warning-t3",
      type: "preventionBarrier",
      label: "PB-3.1 Lane departure warning system",
      metadata: {
        eli5: "Alerts nudge drivers back between the lines.",
        details: [
          "Camera alignment verified after windshield work",
          "Drivers coached on response to alerts",
        ],
        chips: ["Active hardware", "Human"],
      },
    },
    {
      id: "pb-calibration",
      type: "preventionBarrier",
      label: "PB-2.1 📏 Periodic calibration as per specification",
      metadata: {
        eli5: "Workshops reset ADAS sensors to OEM tolerances.",
        details: [
          "Calibration fixtures kept current",
          "Certificates stored in CMMS",
        ],
        chips: ["Maintenance"],
      },
    },
    {
      id: "pb-weather-report-t4",
      type: "preventionBarrier",
      label: "PB-4.1 🌧️ Listen to weather report",
      metadata: {
        eli5: "Teams monitor weather radio, alerts, and traffic cams.",
        details: [
          "Dispatch subscribes to real-time weather alerts",
          "Drivers note route conditions with ETAs",
        ],
        chips: ["Operations"],
      },
    },
    {
      id: "pb-weather-report-t6",
      type: "preventionBarrier",
      label: "PB-6.1 🌧️ Listen to weather report",
      metadata: {
        eli5: "Teams monitor weather radio, alerts, and traffic cams.",
        details: [
          "Dispatch subscribes to real-time weather alerts",
          "Drivers note route conditions with ETAs",
        ],
        chips: ["Operations"],
      },
    },

    {
      id: "pb-adjust-schedule-t4",
      type: "preventionBarrier",
      label: "PB-4.2 🗓️ Adjust driving schedule",
      metadata: {
        eli5: "Dispatch delays or reroutes to avoid hazardous windows.",
        details: [
          "Dynamic routing suggests safer corridors",
          "Coaching sessions reinforce compliance",
        ],
        chips: ["Operations", "Customer"],
      },
    },
    {
      id: "pb-adjust-schedule-t6",
      type: "preventionBarrier",
      label: "PB-6.2 🗓️ Adjust driving schedule",
      metadata: {
        eli5: "Dispatch delays or reroutes to avoid hazardous windows.",
        details: [
          "Dynamic routing suggests safer corridors",
          "Coaching sessions reinforce compliance",
        ],
        chips: ["Operations", "Customer"],
      },
    },

    {
      id: "pb-no-high-risk",
      type: "preventionBarrier",
      label: "PB-4.3 🚧 No driving in high-risk surface conditions",
      metadata: {
        eli5: "If traction is gone, we shut the lane down.",
        details: [
          "Route profile rules baked into dispatch system",
          "Drivers empowered to park without penalty",
        ],
        chips: ["Policy", "Operations"],
      },
    },
    {
      id: "pb-defensive-driving",
      type: "preventionBarrier",
      label: "PB-4.4 🛡️ Defensive driving coaching",
      metadata: {
        eli5: "Practice keeps slick-surface reactions automatic.",
        details: [
          "Quarterly clinics review skid recovery",
          "Simulators replay close calls",
        ],
        chips: ["Training", "Human"],
      },
    },
    {
      id: "pb-abs",
      type: "preventionBarrier",
      label: "PB-4.5 🛞 ABS braking system",
      metadata: {
        eli5: "Electronics pulse brakes to keep steering control.",
        details: [
          "ABS self-tests logged pre-trip",
          "Fault codes escalate to maintenance",
        ],
        chips: ["Active hardware"],
      },
    },
    {
      id: "pb-inspection-maint",
      type: "preventionBarrier",
      label: "PB-5.1 🧰 Inspection and maintenance",
      metadata: {
        eli5: "Scheduled PM finds defects before they matter.",
        details: [
          "Mechanics sign off repairs in CMMS",
          "DVIR close-out required before dispatch",
        ],
        chips: ["Maintenance"],
      },
    },
    {
      id: "pb-lights-always",
      type: "preventionBarrier",
      label: "PB-6.3 💡 Company vehicle lights always on",
      metadata: {
        eli5: "Running lights increase conspicuity in rain and fog.",
        details: [
          "Spec keeps DRL harness energized",
          "Photo sensors inspected weekly",
        ],
        chips: ["Active hardware"],
      },
    },
    {
      id: "pb-light-spec",
      type: "preventionBarrier",
      label: "PB-6.4 📝 Hire vehicles with specific light specs",
      metadata: {
        eli5: "Rental fleet must match our lighting policy.",
        details: [
          "Frame agreement lists lighting requirements",
          "Vendors supply compliance certificates",
        ],
        chips: ["Vendors", "Operations"],
      },
    },
    {
      id: "pb-preferred-hire",
      type: "preventionBarrier",
      label: "PB-6.5 🤝 Preferred car hire companies",
      metadata: {
        eli5: "Only vetted partners provide replacement vehicles.",
        details: [
          "Vendor scorecards track reliability",
          "Audit includes emergency lighting checks",
        ],
        chips: ["Vendors"],
      },
    },
    // Escalation barriers
    {
      id: "eb-calibration-discipline",
      type: "escalationBarrier",
      label: "EFB-1 📋 EF barrier: Calibration discipline",
      wing: "left",
      metadata: {
        eli5: "We track due dates and lock out overdue trucks.",
        details: [
          "Dashboard shows ADAS calibration expiry",
          "Supervisors approve variance only with mitigation",
        ],
        chips: ["Maintenance", "Policy"],
      },
    },
    {
      id: "eb-maintenance-discipline",
      type: "escalationBarrier",
      label: "EFB-2 🛠️ EF barrier: Maintenance escalation",
      wing: "left",
      metadata: {
        eli5: "Critical defects trigger hold-and-fix workflows.",
        details: [
          "Shop foreman assigns rapid-response crew",
          "Roadside vendor list pre-approved",
        ],
        chips: ["Maintenance"],
      },
    },
    {
      id: "eb-seatbelt-discipline",
      type: "escalationBarrier",
      label: "EFB-3 ✅ EF barrier: Seatbelt discipline",
      wing: "right",
      metadata: {
        eli5: "Leadership reinforces belt use every shift.",
        details: [
          "Coaching metrics tie to incentive plan",
          "Cab alerts escalate to fleet control",
        ],
        chips: ["Supervisor", "Human"],
      },
    },
    {
      id: "eb-rollover-readiness",
      type: "escalationBarrier",
      label: "EFB-4 🚒 EF barrier: Rollover readiness",
      wing: "right",
      metadata: {
        eli5: "Playbooks cover stabilization and occupant rescue.",
        details: [
          "Mutual-aid partners pre-contracted",
          "Drivers drilled on egress and radios",
        ],
        chips: ["Emergency", "Training"],
      },
    },
    // Mitigation barriers
    {
      id: "mb-forward-warning",
      type: "mitigationBarrier",
      label: "MB-1.1 🚨 Forward collision warning system",
      metadata: {
        eli5: "Radar/vision alerts give seconds to brake or steer.",
        details: [
          "OEM software kept current",
          "Alerts audited via telematics",
        ],
        chips: ["Active hardware"],
      },
    },
    {
      id: "mb-defensive-competence",
      type: "mitigationBarrier",
      label: "MB-1.2 🛡️ Defensive driving - slip recovery",
      metadata: {
        eli5: "Training helps recover after the first slide.",
        details: [
          "Road-tests simulate evasive maneuvers",
          "Coaches ride-along quarterly",
        ],
        chips: ["Training", "Human"],
      },
    },
    {
      id: "mb-crumple-zone",
      type: "mitigationBarrier",
      label: "MB-1.3 🧱 Crumple zone / vehicle structure",
      metadata: {
        eli5: "Structure absorbs energy before it hits people.",
        details: [
          "Spec includes reinforced bumpers",
          "Post-crash inspections verify alignment",
        ],
        chips: ["Engineering"],
      },
    },
    {
      id: "mb-airbag",
      type: "mitigationBarrier",
      label: "MB-1.4 🎈 Airbag deployment",
      metadata: {
        eli5: "Inflatable cushions slow the body.",
        details: [
          "Sensors tested via diagnostic port",
          "Recall campaigns tracked to closure",
        ],
        chips: ["Maintenance", "Active hardware"],
      },
    },
    {
      id: "mb-headrest",
      type: "mitigationBarrier",
      label: "MB-1.5 🪑 Adjust headrest to mitigate whiplash",
      metadata: {
        eli5: "Proper headrest height keeps the neck aligned.",
        details: [
          "Pre-trip checklist includes seating",
          "Posture coaching in simulator labs",
        ],
        chips: ["Human", "Supervisor"],
      },
    },
    {
      id: "mb-seatbelt-campaign",
      type: "mitigationBarrier",
      label: "MB-1.6 📣 Seatbelt awareness campaign",
      metadata: {
        eli5: "Stories, incentives, and metrics reinforce belt use.",
        details: [
          "Leadership highlights success cases",
          "Spot bonuses for perfect compliance",
        ],
        chips: ["Human", "Communications"],
      },
    },
    {
      id: "mb-seatbelt-alarm",
      type: "mitigationBarrier",
      label: "MB-1.7 🔔 Seatbelt warning alarm",
      metadata: {
        eli5: "Audible alarms nag until the belt clicks.",
        details: [
          "Telematics alerts when belts unlatched",
          "Supervisors follow up on repeat offenders",
        ],
        chips: ["Active hardware"],
      },
    },
    {
      id: "mb-rollover-protection",
      type: "mitigationBarrier",
      label: "MB-1.8 🛞 Roll-over protection",
      metadata: {
        eli5: "Reinforced roofs and cages keep space for people.",
        details: [
          "Spec includes rollover-strength cab",
          "Periodic inspections of welds and mounts",
        ],
        chips: ["Engineering", "Maintenance"],
      },
    },
    // Consequences
    {
      id: "c-fixed-object",
      type: "consequence",
      label: "C-1 💥 Crash into other vehicle or object",
      metadata: {
        eli5: "Impact with another car, barrier, or roadside asset.",
        details: [
          "Can trigger multi-vehicle pile ups",
          "Major property damage and injury risk",
        ],
        chips: ["Operations"],
      },
    },
    {
      id: "c-driver-impacts",
      type: "consequence",
      label: "C-2 🤕 Driver impacts vehicle interior",
      metadata: {
        eli5: "Occupants hit wheel, dash, or cabin surfaces.",
        details: [
          "Whiplash, blunt trauma, fractures",
          "Long-term lost time injuries",
        ],
        chips: ["Health"],
      },
    },
    {
      id: "c-seatbelt-missed",
      type: "consequence",
      label: "C-3 ⚠️ Forgetting or refusing to wear seatbelt",
      metadata: {
        eli5: "At crash moment the belt is unlatched.",
        details: [
          "People thrown around the cabin",
          "Higher fatality likelihood",
        ],
        chips: ["Human"],
      },
    },
    {
      id: "c-rollover",
      type: "consequence",
      label: "C-4 ❌ Vehicle roll-over",
      metadata: {
        eli5: "Vehicle tips onto side or roof, possibly ejecting people.",
        details: [
          "Cargo can spill and ignite",
          "Recovery takes hours and lanes",
        ],
        chips: ["Emergency"],
      },
    },
  ],
  edges: [
    { id: "edge-hazard-top", source: "hz-highway", target: "te-loss-control" },

    // Threat -> Prevention barrier
    { id: "edge-th1-pb-screen", source: "th-intoxicated", target: "pb-screening" },
    { id: "edge-th1-pb-designated", source: "th-intoxicated", target: "pb-designated-driver" },
    { id: "edge-th1-pb-ignition", source: "th-intoxicated", target: "pb-ignition-lock" },
    { id: "edge-th1-pb-lane", source: "th-intoxicated", target: "pb-lane-warning-t1" },

    { id: "edge-th2-pb-calibration", source: "th-miscalibrated", target: "pb-calibration" },

    { id: "edge-th3-pb-lane", source: "th-distracted", target: "pb-lane-warning-t3" },

    { id: "edge-th4-pb-weather", source: "th-slippery", target: "pb-weather-report-t4" },
    { id: "edge-th4-pb-adjust", source: "th-slippery", target: "pb-adjust-schedule-t4" },
    { id: "edge-th4-pb-no-risk", source: "th-slippery", target: "pb-no-high-risk" },
    { id: "edge-th4-pb-defensive", source: "th-slippery", target: "pb-defensive-driving" },
    { id: "edge-th4-pb-abs", source: "th-slippery", target: "pb-abs" },

    { id: "edge-th5-pb-inspection", source: "th-impaired-vehicle", target: "pb-inspection-maint" },

    { id: "edge-th6-pb-weather", source: "th-visibility", target: "pb-weather-report-t6" },
    { id: "edge-th6-pb-adjust", source: "th-visibility", target: "pb-adjust-schedule-t6" },
    { id: "edge-th6-pb-lights", source: "th-visibility", target: "pb-lights-always" },
    { id: "edge-th6-pb-light-spec", source: "th-visibility", target: "pb-light-spec" },
    { id: "edge-th6-pb-preferred", source: "th-visibility", target: "pb-preferred-hire" },

    // Prevention barrier -> Top event
    { id: "edge-pb-screen-top", source: "pb-screening", target: "te-loss-control" },
    { id: "edge-pb-designated-top", source: "pb-designated-driver", target: "te-loss-control" },
    { id: "edge-pb-ignition-top", source: "pb-ignition-lock", target: "te-loss-control" },
    { id: "edge-pb-lane-t1-top", source: "pb-lane-warning-t1", target: "te-loss-control" },
    { id: "edge-pb-lane-t3-top", source: "pb-lane-warning-t3", target: "te-loss-control" },
    { id: "edge-pb-calibration-top", source: "pb-calibration", target: "te-loss-control" },
    { id: "edge-pb-weather-t4-top", source: "pb-weather-report-t4", target: "te-loss-control" },
    { id: "edge-pb-weather-t6-top", source: "pb-weather-report-t6", target: "te-loss-control" },
    { id: "edge-pb-adjust-t4-top", source: "pb-adjust-schedule-t4", target: "te-loss-control" },
    { id: "edge-pb-adjust-t6-top", source: "pb-adjust-schedule-t6", target: "te-loss-control" },
    { id: "edge-pb-no-risk-top", source: "pb-no-high-risk", target: "te-loss-control" },
    { id: "edge-pb-defensive-top", source: "pb-defensive-driving", target: "te-loss-control" },
    { id: "edge-pb-abs-top", source: "pb-abs", target: "te-loss-control" },
    { id: "edge-pb-inspection-top", source: "pb-inspection-maint", target: "te-loss-control" },
    { id: "edge-pb-lights-top", source: "pb-lights-always", target: "te-loss-control" },
    { id: "edge-pb-light-spec-top", source: "pb-light-spec", target: "te-loss-control" },
    { id: "edge-pb-preferred-top", source: "pb-preferred-hire", target: "te-loss-control" },

    // Escalation factor chains
    { id: "edge-pb-calibration-eb-calibration", source: "pb-calibration", target: "eb-calibration-discipline" },
    { id: "edge-eb-calibration-ef-miscal", source: "eb-calibration-discipline", target: "ef-miscalibration" },

    { id: "edge-pb-inspection-eb-maint", source: "pb-inspection-maint", target: "eb-maintenance-discipline" },
    { id: "edge-eb-maint-ef-maint", source: "eb-maintenance-discipline", target: "ef-maint-backlog" },

    { id: "edge-mb-seatbelt-alarm-eb-seatbelt", source: "mb-seatbelt-alarm", target: "eb-seatbelt-discipline" },
    { id: "edge-eb-seatbelt-ef-seatbelt", source: "eb-seatbelt-discipline", target: "ef-seatbelt" },

    { id: "edge-mb-rollover-eb-rollover", source: "mb-rollover-protection", target: "eb-rollover-readiness" },
    { id: "edge-eb-rollover-ef-rollover", source: "eb-rollover-readiness", target: "ef-rollover" },

    // Top event -> Mitigation
    { id: "edge-top-mb-forward", source: "te-loss-control", target: "mb-forward-warning" },
    { id: "edge-top-mb-defensive", source: "te-loss-control", target: "mb-defensive-competence" },
    { id: "edge-top-mb-crumple", source: "te-loss-control", target: "mb-crumple-zone" },
    { id: "edge-top-mb-airbag", source: "te-loss-control", target: "mb-airbag" },
    { id: "edge-top-mb-headrest", source: "te-loss-control", target: "mb-headrest" },
    { id: "edge-top-mb-seatbelt-campaign", source: "te-loss-control", target: "mb-seatbelt-campaign" },
    { id: "edge-top-mb-seatbelt-alarm", source: "te-loss-control", target: "mb-seatbelt-alarm" },
    { id: "edge-top-mb-rollover", source: "te-loss-control", target: "mb-rollover-protection" },

    // Mitigation -> Consequence chains
    { id: "edge-mb-forward-consequence", source: "mb-forward-warning", target: "c-fixed-object" },
    { id: "edge-mb-defensive-consequence", source: "mb-defensive-competence", target: "c-fixed-object" },
    { id: "edge-mb-crumple-consequence", source: "mb-crumple-zone", target: "c-fixed-object" },

    { id: "edge-mb-airbag-consequence", source: "mb-airbag", target: "c-driver-impacts" },
    { id: "edge-mb-headrest-consequence", source: "mb-headrest", target: "c-driver-impacts" },

    { id: "edge-mb-seatbelt-campaign-consequence", source: "mb-seatbelt-campaign", target: "c-seatbelt-missed" },
    { id: "edge-mb-seatbelt-alarm-consequence", source: "mb-seatbelt-alarm", target: "c-seatbelt-missed" },

    { id: "edge-mb-rollover-consequence", source: "mb-rollover-protection", target: "c-rollover" },
  ],
};
