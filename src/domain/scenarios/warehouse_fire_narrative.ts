export type StoryStep = {
  title: string;
  body: string;
  focusIds?: string[];
  revealIds?: string[];
};

export const warehouseFireNarrative: StoryStep[] = [
  // NORMAL STATE
  {
    title: "⚡️ NORMAL: High-Density Battery Storage",
    body: "<strong>240,000 lithium-ion cells</strong> stored across 6 racks in warehouse.<br>• 1.2-meter aisles maintained<br>• Continuous thermal monitoring<br>• Listed chargers only<br>• 24-hour incoming quarantine<br><em>Design basis: 15 minutes to rack involvement.</em>",
    focusIds: ["hz-battery-storage"],
  },

  // LATENT CONDITIONS
  {
    title: "🕳️ LATENT: Three Years of Erosion",
    body: "<strong>Budget cuts and shortcuts compromise barriers:</strong><br>• <strong>Thermal sensor calibration</strong> deferred 3 months (maintenance budget cut)<br>• <strong>Wrong sprinkler heads installed</strong> to save $47K (spec substitution)<br>• <strong>Hydrant flow tests skipped</strong> 2 years (budget reallocated to new construction)<br>• <strong>Receiving bonus structure</strong> rewards throughput over compliance<br>• <strong>Training only in English</strong> (40% of night crew Spanish-speaking)",
    focusIds: ["pb-thermal-monitoring", "mb-sprinkler", "mb-fire-brigade", "pb-incoming-qa", "pb-charging-sop"],
  },

  {
    title: "🕳️ LATENT: Normalization of Deviance",
    body: "<strong>Small workarounds become standard practice:</strong><br>• <strong>Fire doors propped open</strong> with pallet jacks (closers too stiff)<br>• <strong>Smoke alarms</strong> nuisance-silenced 3 times that week (dust sensitivity)<br>• <strong>Peak season density increases</strong> have no written policy limits<br><em>Every workaround was justified individually—no one saw the pattern.</em>",
    focusIds: ["c-compartmentation", "mb-early-detection", "pb-segregated-storage"],
  },

  // DEVIATION 1
  {
    title: "🚚 DEVIATION: Damaged Pallet Bypasses Quarantine",
    body: "<strong>Day 1, 3:00 PM:</strong> Overseas shipment arrives with visible pallet damage.<br>• <strong>WHO:</strong> Receiving supervisor with 8 years experience<br>• <strong>WHAT:</strong> Override 24-hour quarantine protocol<br>• <strong>WHY:</strong> Bonus tied to meeting delivery deadline (peak season pressure)<br>• <strong>IMPACT:</strong> Swollen cells enter storage undetected, begin off-gassing within 6 hours<br><em>First barrier down—economics over safety.</em>",
    focusIds: ["th-damaged-pallet", "pb-incoming-qa"],
    revealIds: ["pb-incoming-qa"],
  },

  // DEVIATION 2
  {
    title: "🏗️ DEVIATION: Black Friday Crushes Spacing",
    body: "<strong>Week -2, Monday:</strong> Inventory surge for Black Friday anticipated.<br>• <strong>WHO:</strong> Warehouse manager under pressure from regional VP<br>• <strong>WHAT:</strong> Reduce aisles from 1.2m to 0.6m (50% reduction)<br>• <strong>WHY:</strong> No written policy for peak density limits—manager has discretion<br>• <strong>IMPACT:</strong> Fire spread design basis cut from 15 min to 4 min<br><em>Second barrier down—capacity over code.</em>",
    focusIds: ["pb-segregated-storage"],
    revealIds: ["pb-segregated-storage"],
  },

  // DEVIATION 3
  {
    title: "🔌 DEVIATION: Non-Listed Charger on Night Shift",
    body: "<strong>Night of fire, 10:00 PM:</strong> Night supervisor allows personal e-bike charging.<br>• <strong>WHO:</strong> Night supervisor (first month in role)<br>• <strong>WHAT:</strong> Crew member plugs in non-listed charger<br>• <strong>WHY:</strong> SOP training only in English—crew didn't understand policy<br>• <strong>IMPACT:</strong> Overcharge condition set up, no supervision per protocol<br><em>Third barrier down—communication breakdown.</em>",
    focusIds: ["th-charging-sop-violation", "pb-charging-sop"],
    revealIds: ["pb-charging-sop"],
  },

  // DETECTION FAILURE
  {
    title: "🚨 DETECTION FAILS: Alarm Silenced",
    body: "<strong>2:30 AM:</strong> Temperature in damaged pallet reaches 60°C.<br>• <strong>WHO:</strong> Security guard on solo graveyard shift<br>• <strong>WHAT:</strong> Thermal sensor doesn't alarm (calibration overdue)<br>• <strong>THEN:</strong> Smoke detector triggers at 2:35 AM<br>• <strong>WHAT:</strong> Guard silences alarm without investigating<br>• <strong>WHY:</strong> Third nuisance alarm that week—assumed false positive<br>• <strong>IMPACT:</strong> Smoldering progresses undetected for 8 minutes<br><em>Detection barrier down—pattern blindness.</em>",
    focusIds: ["pb-thermal-monitoring", "mb-early-detection"],
    revealIds: ["mb-early-detection"],
  },

  // ESCALATION
  {
    title: "🔥 ESCALATION: Thermal Runaway Begins",
    body: "<strong>2:38 AM:</strong> Swollen cells reach thermal runaway temperature.<br>• <strong>WHAT:</strong> Off-gassing accelerates, temperature hits 300°C<br>• <strong>COMPOUNDING:</strong> Tight aisles (0.6m) enable rapid propagation<br>• <strong>MANUAL DISCOVERY:</strong> 2:42 AM by passing forklift operator<br>• <strong>TIME LOST:</strong> 12 minutes from first alarm to human awareness<br><em>Small fire becoming big fire.</em>",
    focusIds: ["te-thermal-runaway"],
  },

  {
    title: "⚠️ ESCALATION: Adjacent Racks Involved",
    body: "<strong>2:46 AM:</strong> Fire spreads to Rack 3 (4 minutes vs. 15-minute design basis).<br>• <strong>WHAT:</strong> Reduced aisle spacing accelerates propagation<br>• <strong>TEMPERATURE:</strong> Now 600°C and climbing<br>• <strong>SMOKE:</strong> Filling warehouse, visibility dropping<br>• <strong>TIME TO FULL INVOLVEMENT:</strong> Estimated 6 more minutes<br><em>Window for effective mitigation closing fast.</em>",
    focusIds: ["te-thermal-runaway", "c-rack-fire"],
  },

  // MITIGATION FAILURE 1
  {
    title: "💧 MITIGATION FAILS: Sprinklers Ineffective",
    body: "<strong>2:48 AM:</strong> Automatic sprinklers activate over Rack 3.<br>• <strong>WHAT:</strong> Standard ESFR (wet pipe) heads spray water<br>• <strong>PROBLEM:</strong> Lithium fires require Class D suppression (dry powder/sand)<br>• <strong>WHO DECIDED:</strong> Installation contractor substituted to save $47K<br>• <strong>WHY ALLOWED:</strong> Value engineering approval without fire safety engineer review<br>• <strong>IMPACT:</strong> Water ineffective—fire spreads to 4 racks in next 6 minutes<br><em>Mitigation barrier down—wrong tool for the job.</em>",
    focusIds: ["mb-sprinkler", "c-rack-fire"],
    revealIds: ["mb-sprinkler"],
  },

  // MITIGATION FAILURE 2
  {
    title: "🚒 MITIGATION FAILS: No Water Supply",
    body: "<strong>2:52 AM:</strong> On-site fire brigade arrives with Class D extinguishers.<br>• <strong>WHO:</strong> 6-person trained fire brigade<br>• <strong>EQUIPMENT:</strong> Proper dry powder extinguishers ready<br>• <strong>PROBLEM:</strong> Hydrant valve seized—won't open<br>• <strong>WHY:</strong> Annual flow tests skipped 2 years (budget reallocated)<br>• <strong>DELAY:</strong> 8 minutes waiting for municipal fire department<br>• <strong>TEMPERATURE NOW:</strong> 800°C, approaching flashover<br><em>Mitigation barrier down—infrastructure neglect.</em>",
    focusIds: ["mb-fire-brigade"],
    revealIds: ["mb-fire-brigade"],
  },

  // MITIGATION FAILURE 3
  {
    title: "🌫️ MITIGATION FAILS: Ventilation Traps Workers",
    body: "<strong>2:55 AM:</strong> Emergency ventilation fans activate automatically.<br>• <strong>DESIGN INTENT:</strong> Clear toxic smoke from warehouse<br>• <strong>ACTUAL RESULT:</strong> Fans draw smoke toward occupied office area<br>• <strong>WHO DESIGNED:</strong> HVAC contractor (no fire safety engineer coordination)<br>• <strong>IMPACT:</strong> 12 office workers on night shift trapped by smoke<br>• <strong>RESCUE:</strong> Aerial ladder required, 6 minutes to evacuate all<br><em>Mitigation barrier down—design coordination failure.</em>",
    focusIds: ["mb-ventilation"],
    revealIds: ["mb-ventilation"],
  },

  // TOP EVENT CONSEQUENCES
  {
    title: "💥 TOP EVENT: Full Rack Involvement",
    body: "<strong>3:04 AM:</strong> Four racks fully involved, thermal runaway chain reaction.<br>• <strong>CELLS INVOLVED:</strong> 240,000 lithium-ion cells<br>• <strong>PEAK TEMPERATURE:</strong> 950°C<br>• <strong>SMOKE/HEAT DAMAGE:</strong> 40% of facility<br>• <strong>FIREFIGHTING:</strong> Municipal FD battles blaze for 4 hours<br>• <strong>TOTAL LOSS:</strong> $8.2 million<br><em>Every prevention barrier failed. Every mitigation barrier failed.</em>",
    focusIds: ["c-rack-fire"],
  },

  // CONSEQUENCE CONTROL
  {
    title: "🚪 CONSEQUENCE: Fire Wall Breached",
    body: "<strong>3:15 AM:</strong> Fire reaches 2-hour rated compartment wall.<br>• <strong>GOOD NEWS:</strong> Wall holds as designed<br>• <strong>BAD NEWS:</strong> Fire door propped open with pallet jack<br>• <strong>WHO:</strong> Warehouse crew (door closer too stiff, created bottleneck)<br>• <strong>WHY ALLOWED:</strong> No automatic door release, no enforcement<br>• <strong>IMPACT:</strong> Fire spreads to adjacent compartment, property loss doubled<br><em>Final consequence barrier compromised by workaround.</em>",
    focusIds: ["c-compartmentation"],
    revealIds: ["c-compartmentation"],
  },

  // HUMAN FACTORS
  {
    title: "👷 ROOT CAUSES: Five Critical Decisions",
    body: "<strong>Where people were set up to fail:</strong><br><br><strong>Day 1 (Receiving):</strong><br>• <strong>WHO:</strong> Supervisor with throughput bonus<br>• <strong>DECISION:</strong> Bypass quarantine<br>• <strong>ROOT:</strong> Incentive misalignment<br><br><strong>Week -8 (Maintenance):</strong><br>• <strong>WHO:</strong> Manager under budget pressure<br>• <strong>DECISION:</strong> Defer sensor calibration<br>• <strong>ROOT:</strong> Cost prioritization<br><br><strong>Night of fire (Security):</strong><br>• <strong>WHO:</strong> Guard on solo shift<br>• <strong>DECISION:</strong> Silence alarm<br>• <strong>ROOT:</strong> Pattern blindness + inadequate training<br><br><strong>Week -2 (Operations):</strong><br>• <strong>WHO:</strong> Warehouse manager<br>• <strong>DECISION:</strong> Reduce aisle spacing<br>• <strong>ROOT:</strong> No written policy limits<br><br><strong>Year -2 (Facilities):</strong><br>• <strong>WHO:</strong> Budget committee<br>• <strong>DECISION:</strong> Skip hydrant testing<br>• <strong>ROOT:</strong> Reallocation to new construction",
    focusIds: ["pb-incoming-qa", "pb-thermal-monitoring", "mb-early-detection", "pb-segregated-storage", "mb-fire-brigade"],
  },

  // RECOVERY
  {
    title: "🛠️ RECOVERY: What Changed After $8.2M Loss",
    body: "<strong>Actions implemented within 60 days:</strong><br>• <strong>Incentive reform:</strong> Safety metrics in all bonuses (25% weight minimum)<br>• <strong>Bilingual SOPs:</strong> + mandatory translation verification<br>• <strong>Preventive maintenance:</strong> Ring-fenced budget (cannot be reallocated)<br>• <strong>Alarm protocol:</strong> Investigate before silencing (no exceptions)<br>• <strong>Peak density policy:</strong> Written maximum with safety approval required<br>• <strong>Compartmentation audit:</strong> All fire doors on automatic release<br>• <strong>Design review process:</strong> Fire safety engineer sign-off required<br><em>Lessons paid for in dollars, not lives—this time.</em>",
    focusIds: ["pb-incoming-qa", "pb-charging-sop", "pb-thermal-monitoring", "mb-early-detection", "pb-segregated-storage", "c-compartmentation"],
  },

  // LESSONS
  {
    title: "🎯 LESSONS: Barrier Failure Patterns",
    body: "<strong>Why every barrier failed:</strong><br><br><strong>Economic pressure:</strong><br>• Budget cuts to maintenance<br>• Throughput bonuses over safety compliance<br>• Value engineering without safety review<br><br><strong>Communication breakdown:</strong><br>• Language barriers (training only in English)<br>• No written policies for edge cases<br>• Cross-discipline coordination gaps<br><br><strong>Drift from spec:</strong><br>• Substitutions to save cost<br>• Deferred maintenance schedules<br>• Design shortcuts<br><br><strong>Normalization of deviance:</strong><br>• Propped doors became normal<br>• Nuisance alarms ignored<br>• Peak season overrides accepted<br><br><em>No single failure caused this—it took a perfect storm of erosion.</em>",
    focusIds: ["hz-battery-storage", "te-thermal-runaway", "c-rack-fire"],
  },

  // REFLECTION
  {
    title: "🔎 DOES THIS LOOK FAMILIAR?",
    body: "<strong>Questions for your organization:</strong><br>• Are bonuses tied to throughput over compliance?<br>• Is preventive maintenance budget protected or flexible?<br>• Do you have written policies for peak season operations?<br>• Are training materials available in all languages?<br>• When was the last time you tested emergency systems?<br>• Do substitutions require safety engineering review?<br>• Are nuisance alarms investigated or just silenced?<br><br><em>Every organization has latent conditions—find yours before the fire does.</em>",
    focusIds: ["hz-battery-storage", "pb-incoming-qa", "pb-thermal-monitoring", "mb-sprinkler", "mb-fire-brigade"],
  },

  // CLOSING
  {
    title: "📤 SHARE THIS STORY",
    body: "<strong>Use this bowtie in your safety briefings and leadership reviews.</strong><br>• Export clean PNG for presentations<br>• Arrow keys navigate the timeline<br>• Filters show role-specific accountability<br>• Share with ops, maintenance, facilities, leadership<br><br><em>The goal isn't to scare people—it's to show how systems fail people before people fail systems.</em>",
    focusIds: ["hz-battery-storage"],
  },
];