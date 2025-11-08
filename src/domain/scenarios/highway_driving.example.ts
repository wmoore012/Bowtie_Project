import type { BowtieDiagram } from "../bowtie.types";

export const highwayDrivingExample: BowtieDiagram = {
  id: "highway-driving-bowtie",
  title: "Highway Driving Risk (Neutral Teaching Scenario)",
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  nodes: [
    // Threats (column 0)
    {
      id: "t-intoxicated",
      type: "threat",
      label: "Driving while impaired by alcohol or drugs",
      collapsed: true,
      metadata: {
        eli5: "A driver is not fully in control because of alcohol or drugs.",
        details: [
          "BAC limits and impairment thresholds defined in policy",
          "Random testing program covers all safety-sensitive roles",
          "Supervisors trained to remove unfit drivers from service",
        ],
        chips: ["Human", "Supervisor", "Law enforcement"],
        sopLink: "https://example.com/sop/dui-policy",
      },
    },
    {
      id: "t-distracted",
      type: "threat",
      label: "Taking eyes and mind off the road",
      collapsed: true,
      metadata: {
        eli5: "Looking at a phone or screen means you miss things ahead.",
        details: [
          "Company policy bans handheld phone use while moving",
          "In-cab lockouts disable video/entertainment in motion",
          "Quarterly refresher talks reinforce scanning habits",
        ],
        chips: ["Human", "Policy", "Supervisor"],
        sopLink: "https://example.com/sop/stay-focused",
      },
    },
    {
      id: "t-slippery",
      type: "threat",
      label: "Driving on a slippery road surface",
      collapsed: true,
      metadata: {
        eli5: "Rain, ice, or oil make tires lose grip on the road.",
        details: [
          "Tread depth inspections recorded before dispatch",
          "Winter kits issued and installed by maintenance",
          "Drivers adjust speed and gaps in wet/icy weather",
        ],
        chips: ["Maintenance", "Human", "Supervisor"],
        sopLink: "https://example.com/sop/wet-weather-driving",
      },
    },
    {
      id: "t-visibility",
      type: "threat",
      label: "Driving with poor visibility conditions",
      collapsed: true,
      metadata: {
        eli5: "Fog, darkness, or glare make it hard to see hazards.",
        details: [
          "Automatic headlights tested at PM service",
          "Windshield and wipers inspected weekly",
          "Route guidance flags low-visibility segments",
        ],
        chips: ["Maintenance", "Active hardware", "Operations"],
        sopLink: "https://example.com/sop/visibility-driving",
      },
    },

    // Prevention Barriers (column 1) - two per threat (8 total)
    {
      id: "pb-dui-enforcement",
      type: "preventionBarrier",
      label: "Sobriety checkpoints and DUI enforcement",
      collapsed: true,
      metadata: {
        eli5: "Police stops catch impaired drivers before they cause harm.",
        details: ["Checkpoint coverage coordinated with state police", "Drivers deterred by visible enforcement"],
        chips: ["Law enforcement"],
        kpis: ["Checkpoint hours per corridor", "DUI arrests per 100k miles"],
        failureModes: ["Limited coverage on rural routes", "Holiday surge overwhelms staffing"],
        sopLink: "https://example.com/sop/dui-enforcement",
      },
    },
    {
      id: "pb-fit-duty",
      type: "preventionBarrier",
      label: "Fit-for-duty checks and random testing",
      collapsed: true,
      metadata: {
        eli5: "We check drivers are sober and alert before they drive.",
        details: ["Supervisors complete checklist before dispatch", "Random tests cover 25% of drivers annually"],
        chips: ["Supervisor", "Policy"],
        kpis: ["% drivers cleared fit-for-duty", "Random test completion rate"],
        failureModes: ["Supervisor skips checklist", "Testing vendor delays"],
        sopLink: "https://example.com/sop/fit-for-duty",
      },
    },
    {
      id: "pb-handsfree",
      type: "preventionBarrier",
      label: "Hands-free policy and in-cab lockouts",
      collapsed: true,
      metadata: {
        eli5: "The cab disables distracting features while moving.",
        details: ["Mobile device MDM blocks apps over 5 mph", "Infotainment lockout wired to speed signal"],
        chips: ["Policy", "Active hardware"],
        kpis: ["Distraction alerts per 1k miles", "Policy violations per month"],
        failureModes: ["Driver bypasses lockout", "Device not enrolled in MDM"],
        sopLink: "https://example.com/sop/hands-free",
      },
    },
    {
      id: "pb-coaching",
      type: "preventionBarrier",
      label: "Driver coaching with video telematics",
      collapsed: true,
      metadata: {
        eli5: "Cameras flag risky moments so coaches can help drivers improve.",
        details: ["Event-based video triggers coach review", "Scorecards discussed monthly with drivers"],
        chips: ["Supervisor", "Telematics"],
        kpis: ["Coaching sessions completed", "Distraction score trend"],
        failureModes: ["False positives ignored", "No time scheduled for coaching"],
        sopLink: "https://example.com/sop/driver-coaching",
      },
    },
    {
      id: "pb-tire-tread",
      type: "preventionBarrier",
      label: "Tire maintenance and tread depth checks",
      collapsed: true,
      metadata: {
        eli5: "Good tires grip the road so the truck can stop.",
        details: ["Tread depth logged in CMMS", "Out-of-spec tires pulled immediately"],
        chips: ["Maintenance"],
        kpis: ["% tires above 6/32\" tread", "Roadside tire failures per 100k miles"],
        failureModes: ["Missed inspections", "Parts shortages delay replacement"],
        sopLink: "https://example.com/sop/tire-care",
      },
    },
    {
      id: "pb-speed-gap",
      type: "preventionBarrier",
      label: "Speed management and following-distance policy",
      collapsed: true,
      metadata: {
        eli5: "Slowing down and leaving space gives time to react.",
        details: ["Adaptive cruise used when safe", "Company speed limiters set to 65 mph"],
        chips: ["Policy", "Human"],
        kpis: ["Hard braking events per 1k miles", "Average headway time"],
        failureModes: ["Tailgating due to schedule pressure", "Speed limiter tampered"],
        sopLink: "https://example.com/sop/following-distance",
      },
    },
    {
      id: "pb-lighting",
      type: "preventionBarrier",
      label: "Headlights, wipers, and automatic lighting",
      collapsed: true,
      metadata: {
        eli5: "Good lights and wipers help the driver see the road.",
        details: ["Auto-lights verified at PM", "Wiper blades replaced on schedule"],
        chips: ["Active hardware", "Maintenance"],
        kpis: ["% vehicles with auto-light faults", "Wiper replacement compliance"],
        failureModes: ["Sensor blocked by dirt", "Blown fuse not replaced"],
        sopLink: "https://example.com/sop/lighting",
      },
    },
    {
      id: "pb-signage-markings",
      type: "preventionBarrier",
      label: "Reflective markings and weather signage",
      collapsed: true,
      metadata: {
        eli5: "Clear lines and warning signs guide drivers in bad weather.",
        details: ["DOT maintains reflectivity standard", "Work zones include high-visibility signs"],
        chips: ["Operations", "Agency"],
        kpis: ["Retroreflectivity audits passed", "Sign replacement cycle time"],
        failureModes: ["Faded paint not refreshed", "Damaged signs not reported"],
        sopLink: "https://example.com/sop/signage",
      },
    },

    // Hazard (column 2)
    {
      id: "hz-highway",
      type: "hazard",
      label: "Driving a commercial vehicle on a highway",
      metadata: {
        eli5: "Fast traffic at highway speed leaves little room for mistakes.",
        details: ["High kinetic energy at 60+ mph", "Limited stopping time and space"],
        sopLink: "https://example.com/sop/highway-hazard",
      },
    },

    // Top Event (column 3)
    {
      id: "te-loss-control",
      type: "topEvent",
      label: "Loss of control at highway speed",
      metadata: {
        eli5: "The driver can no longer steer or stop safely.",
        details: ["Run-off-road", "Rear-end", "Rollover start"],
        sopLink: "https://example.com/sop/collision-response",
      },
    },

    // Mitigation Barriers (column 4)
    {
      id: "mb-guardrails",
      type: "mitigationBarrier",
      label: "Roadside barriers and crash cushions",
      collapsed: true,
      metadata: {
        eli5: "Guardrails and cushions absorb energy and redirect vehicles.",
        details: ["MASH-rated systems at curves and bridges", "Maintenance fixes damaged sections"],
        chips: ["Active hardware", "Agency"],
        kpis: ["% critical segments protected", "Repair time for damaged rails"],
        failureModes: ["Impact beyond protected zone", "Damaged section not repaired"],
        sopLink: "https://example.com/sop/roadside-barriers",
      },
    },
    {
      id: "mb-occupant-protection",
      type: "mitigationBarrier",
      label: "Seatbelts, airbags, and crumple zones",
      collapsed: true,
      metadata: {
        eli5: "The cab protects people by spreading out crash forces.",
        details: ["Seatbelt use over 98% in fleet", "Airbags maintained per OEM recalls"],
        chips: ["Active hardware", "Human"],
        kpis: ["Seatbelt usage rate", "Airbag recall completion"],
        failureModes: ["Driver not belted", "Aftermarket modification blocks airbag"],
        sopLink: "https://example.com/sop/occupant-protection",
      },
    },
    {
      id: "mb-stability-rollover",
      type: "mitigationBarrier",
      label: "Stability control and rollover protection",
      collapsed: true,
      metadata: {
        eli5: "Electronics help prevent skids and reduce rollover chance.",
        details: ["ESC calibrations verified at PM", "Load securement training completed"],
        chips: ["Active hardware", "Maintenance"],
        kpis: ["Loss-of-control events per 1k miles", "Roll stability interventions"],
        failureModes: ["ESC fault not repaired", "Overloaded or poorly secured cargo"],
        sopLink: "https://example.com/sop/esc-rollover",
      },
    },
    {
      id: "mb-ems",
      type: "mitigationBarrier",
      label: "Emergency response and post-crash care",
      collapsed: true,
      metadata: {
        eli5: "Trained responders arrive fast to treat injuries and stabilize.",
        details: ["911 call protocols followed", "First-aid kits and AEDs in fleet depots"],
        chips: ["EMS", "Supervisor"],
        kpis: ["Average response time", "On-scene to transport time"],
        failureModes: ["Rural delays", "Miscommunication on location"],
        sopLink: "https://example.com/sop/ems-response",
      },
    },
    {
      id: "mb-scene-protection",
      type: "mitigationBarrier",
      label: "Scene protection and traffic control",
      collapsed: true,
      metadata: {
        eli5: "Cones, flares, and warnings prevent more cars from crashing.",
        details: ["Reflective vests and triangles carried", "DOT assists with closures and detours"],
        chips: ["Operations", "Agency"],
        kpis: ["Secondary crashes per incident", "Time to establish control"],
        failureModes: ["Insufficient equipment on scene", "Poor visibility of responders"],
        sopLink: "https://example.com/sop/scene-protection",
      },
    },

    // Consequences (column 5)
    {
      id: "c-fixed-object",
      type: "consequence",
      label: "Crash into a fixed roadside object",
      collapsed: true,
      metadata: {
        eli5: "The vehicle hits a barrier, pole, or wall.",
        details: ["Property damage and potential injury", "May block lanes or cause fires"],
      },
    },
    {
      id: "c-driver-impacts",
      type: "consequence",
      label: "Driver impacts vehicle interior surfaces",
      collapsed: true,
      metadata: {
        eli5: "People inside are thrown against belts, airbags, or the cab.",
        details: ["Whiplash, bruising, fractures possible", "Severity reduced by restraints"],
      },
    },
    {
      id: "c-rollover",
      type: "consequence",
      label: "Vehicle roll-over with potential ejection",
      collapsed: true,
      metadata: {
        eli5: "The vehicle tips onto its side or roof, sometimes throwing people out.",
        details: ["High risk of severe injury", "Cargo may spill and block road"],
      },
    },
  ],
  edges: [
    // Threats -> Prevention (2 per threat)
    { id: "e1", source: "t-intoxicated", target: "pb-dui-enforcement" },
    { id: "e2", source: "t-intoxicated", target: "pb-fit-duty" },

    { id: "e3", source: "t-distracted", target: "pb-handsfree" },
    { id: "e4", source: "t-distracted", target: "pb-coaching" },

    { id: "e5", source: "t-slippery", target: "pb-tire-tread" },
    { id: "e6", source: "t-slippery", target: "pb-speed-gap" },

    { id: "e7", source: "t-visibility", target: "pb-lighting" },
    { id: "e8", source: "t-visibility", target: "pb-signage-markings" },

    // Prevention -> Hazard
    { id: "e9", source: "pb-dui-enforcement", target: "hz-highway" },
    { id: "e10", source: "pb-fit-duty", target: "hz-highway" },
    { id: "e11", source: "pb-handsfree", target: "hz-highway" },
    { id: "e12", source: "pb-coaching", target: "hz-highway" },
    { id: "e13", source: "pb-tire-tread", target: "hz-highway" },
    { id: "e14", source: "pb-speed-gap", target: "hz-highway" },
    { id: "e15", source: "pb-lighting", target: "hz-highway" },
    { id: "e16", source: "pb-signage-markings", target: "hz-highway" },

    // Hazard -> Top Event
    { id: "e17", source: "hz-highway", target: "te-loss-control" },

    // Top Event -> Mitigation
    { id: "e18", source: "te-loss-control", target: "mb-guardrails" },
    { id: "e19", source: "te-loss-control", target: "mb-occupant-protection" },
    { id: "e20", source: "te-loss-control", target: "mb-stability-rollover" },
    { id: "e21", source: "te-loss-control", target: "mb-ems" },
    { id: "e22", source: "te-loss-control", target: "mb-scene-protection" },

    // Mitigation -> Consequences
    { id: "e23", source: "mb-guardrails", target: "c-fixed-object" },
    { id: "e24", source: "mb-occupant-protection", target: "c-driver-impacts" },
    { id: "e25", source: "mb-stability-rollover", target: "c-rollover" },
    { id: "e26", source: "mb-ems", target: "c-driver-impacts" },
    { id: "e27", source: "mb-scene-protection", target: "c-fixed-object" },
  ],
};
