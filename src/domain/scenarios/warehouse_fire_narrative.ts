export type StoryStep = {
  title: string;
  body: string;
  focusIds?: string[];
  revealIds?: string[];
};

export const warehouseFireNarrative: StoryStep[] = [
  {
    title: "⚡️ HAZARD: Lithium‑ion Battery Storage in Warehouse",
    body: "We are assessing warehouse <span style=\"color: #dc2626; font-weight: 700;\">🔥 fire risk</span> due to high‑density <span style=\"color: #d97706; font-weight: 600;\">Li‑ion battery storage</span> and <span style=\"color: #d97706; font-weight: 600;\">charging activities</span>.",
  },
  {
    title: "🔥 TOP EVENT: Thermal Runaway Begins",
    body: "The central knot represents the <span style=\"color: #dc2626; font-weight: 700;\">🔥 thermal runaway event</span> that splits the bowtie into <span style=\"color: #059669; font-weight: 700;\">🛡 prevention</span> (left) and <span style=\"color: #059669; font-weight: 700;\">🛡 mitigation</span> (right).",
  },
  {
    title: "🚚 THREAT: Damaged Pallet / Impact",
    body: "<span style=\"color: #d97706; font-weight: 600;\">Mechanical damage</span> during handling can <span style=\"color: #dc2626; font-weight: 700;\">puncture cells</span>. <span style=\"color: #059669; font-weight: 700;\">🛡 Prevention barriers</span> reduce the likelihood of this threat leading to the top event.",
  },
  {
    title: "🛡 PREVENTION: Incoming QA and Quarantine",
    body: "<strong>Barrier:</strong> Incoming QA inspection with 24‑hour quarantine<br>\n• <strong>Failed when:</strong> Damaged pallet from overseas shipment bypassed quarantine during peak season<br>\n• <strong>Responsible:</strong> Receiving supervisor (authorized override to meet delivery deadline)<br>\n• <strong>Why it failed:</strong> Bonus structure incentivized throughput over safety compliance<br>\n• <strong>Impact:</strong> Swollen cells entered storage undetected, began off‑gassing within 6 hours",
  },
  {
    title: "🛡 PREVENTION: Thermal Monitoring System",
    body: "<strong>Barrier:</strong> Continuous thermal imaging cameras in storage zones<br>\n• <strong>Failed when:</strong> Battery temperature exceeded 60°C but alarm didn't trigger<br>\n• <strong>Responsible:</strong> Maintenance team (sensor calibration overdue by 3 months)<br>\n• <strong>Why it failed:</strong> Budget cuts delayed preventive maintenance schedule<br>\n• <strong>Impact:</strong> <span style=\"color: #dc2626; font-weight: 700;\">🔥 Thermal runaway</span> began undetected for 8 minutes",
  },
  {
    title: "🛡 PREVENTION: Segregated Storage and Spacing",
    body: "<strong>Barrier:</strong> Maintain 1.2m aisle spacing and segregated SKU zones<br>\n• <strong>Failed when:</strong> Black Friday inventory surge reduced aisles to 0.6m<br>\n• <strong>Responsible:</strong> Warehouse manager (approved temporary density increase)<br>\n• <strong>Why it failed:</strong> No written policy for maximum storage density during peak periods<br>\n• <strong>Impact:</strong> <span style=\"color: #dc2626; font-weight: 700;\">🔥 Fire spread</span> to adjacent rack in 4 minutes instead of design basis 15 minutes",
  },
  {
    title: "🛡 PREVENTION: Charging SOP and Supervision",
    body: "<strong>Barrier:</strong> Listed chargers only, no overnight charging without supervision<br>\n• <strong>Failed when:</strong> Night shift used non‑listed charger for e‑bike batteries<br>\n• <strong>Responsible:</strong> Night supervisor (allowed personal device charging in warehouse)<br>\n• <strong>Why it failed:</strong> SOP training only provided in English, 40% of night crew Spanish‑speaking<br>\n• <strong>Impact:</strong> Overcharge condition triggered <span style=\"color: #dc2626; font-weight: 700;\">🔥 thermal event</span> at 2:30 AM with no supervision",
  },
  {
    title: "🛡 MITIGATION: Early Detection System",
    body: "<strong>Barrier:</strong> Aspirating smoke detection with 90‑second alarm response<br>\n• <strong>Failed when:</strong> Detector alarmed but was silenced as \"nuisance alarm\"<br>\n• <strong>Responsible:</strong> Security guard (3rd nuisance alarm that week from dust)<br>\n• <strong>Why it failed:</strong> No procedure to investigate before silencing, detector sensitivity not adjusted for warehouse environment<br>\n• <strong>Impact:</strong> <span style=\"color: #d97706; font-weight: 600;\">Smoldering</span> progressed to <span style=\"color: #dc2626; font-weight: 700;\">🔥 open flame</span> before manual discovery 12 minutes later",
  },
  {
    title: "🛡 MITIGATION: Automatic Sprinkler System",
    body: "<strong>Barrier:</strong> ESFR sprinklers designed for Class ABC fires<br>\n• <strong>Failed when:</strong> <span style=\"color: #dc2626; font-weight: 700;\">🔥 Fire</span> reached rack 3 but sprinklers didn't activate<br>\n• <strong>Responsible:</strong> Installation contractor (wrong sprinkler head type for lithium fires)<br>\n• <strong>Why it failed:</strong> Spec called for Class D suppression but standard wet pipe was installed to save $47K<br>\n• <strong>Impact:</strong> <span style=\"color: #dc2626; font-weight: 700;\">🔥 Fire spread</span> to 4 adjacent racks within 6 minutes, <span style=\"color: #3b82f6; font-weight: 700;\">💧 manual firefighting</span> only option",
  },
  {
    title: "🛡 MITIGATION: Fire Brigade Response",
    body: "<strong>Barrier:</strong> On‑site fire brigade with lithium fire training and <span style=\"color: #3b82f6; font-weight: 700;\">💧 Class D extinguishers</span><br>\n• <strong>Failed when:</strong> Brigade arrived but had no <span style=\"color: #3b82f6; font-weight: 700;\">💧 water supply</span> (hydrant valve seized)<br>\n• <strong>Responsible:</strong> Facilities team (annual hydrant flow test skipped 2 years running)<br>\n• <strong>Why it failed:</strong> Testing budget reallocated to new construction project<br>\n• <strong>Impact:</strong> 8‑minute delay waiting for municipal fire department, <span style=\"color: #dc2626; font-weight: 700;\">🔥 fire</span> reached 800°C",
  },
  {
    title: "🛡 MITIGATION: Emergency Ventilation",
    body: "<strong>Barrier:</strong> Powered smoke exhaust fans to clear toxic fumes<br>\n• <strong>Failed when:</strong> Fans activated but drew <span style=\"color: #d97706; font-weight: 600;\">smoke</span> toward occupied office area<br>\n• <strong>Responsible:</strong> HVAC designer (exhaust direction not coordinated with egress routes)<br>\n• <strong>Why it failed:</strong> Design review didn't include fire safety engineer, only mechanical contractor<br>\n• <strong>Impact:</strong> 12 office workers trapped by <span style=\"color: #d97706; font-weight: 600;\">smoke</span>, required rescue via aerial ladder",
  },
  {
    title: "🔥 CONSEQUENCE: Full Rack Involvement",
    body: "Without effective mitigation, <span style=\"color: #dc2626; font-weight: 700;\">🔥 thermal runaway</span> escalated to <span style=\"color: #dc2626; font-weight: 700;\">🔥 rack‑level fire</span> involving 240,000 cells. Peak temperature 950°C. <span style=\"color: #d97706; font-weight: 600;\">Smoke and heat damage</span> extended to 40% of facility. Total loss $8.2M.",
  },
  {
    title: "🏭 CONSEQUENCE CONTROL: Compartmentation",
    body: "<strong>Barrier:</strong> 2‑hour rated fire walls and self‑closing fire doors<br>\n• <strong>Partially effective:</strong> Fire wall held but door was propped open with pallet jack<br>\n• <strong>Responsible:</strong> Warehouse crew (door closer too stiff, created bottleneck)<br>\n• <strong>Why it failed:</strong> No automatic door release system, no enforcement of door policy<br>\n• <strong>Impact:</strong> <span style=\"color: #dc2626; font-weight: 700;\">🔥 Fire spread</span> to adjacent compartment, doubled property loss",
  },
  {
    title: "👷 Human Factors: Decision Points",
    body: "Three critical decisions where intervention could have changed outcome:<br>\n• <strong>Day 1:</strong> Receiving supervisor chose throughput over quarantine (root: incentive misalignment)<br>\n• <strong>Week 8:</strong> Maintenance manager deferred sensor calibration (root: budget pressure)<br>\n• <strong>Night of fire:</strong> Security guard silenced alarm without investigation (root: inadequate training)",
  },
  {
    title: "🎯 ROLES / LENSES",
    body: "Filter by role (<span style=\"color: #059669; font-weight: 700;\">Ops, Safety, Facilities, Vendors</span>) to focus discussion. Each barrier failure shows <strong>who</strong> was responsible and <strong>why</strong> the system failed them.",
  },
  {
    title: "📤 EXPORT AND PRESENT",
    body: "Use <span style=\"color: #059669; font-weight: 700;\">Share/Export</span> to save a PNG. Presentation mode hides UI chrome for clean review. <span style=\"color: #059669; font-weight: 700;\">Arrow keys</span> navigate steps when menus are closed.",
  },
];

