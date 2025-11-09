export type StoryStep = { title: string; body: string };

export const warehouseFireNarrative: StoryStep[] = [
  {
    title: "Hazard: Lithium‑ion battery storage in warehouse",
    body: "We are assessing warehouse fire risk due to high‑density Li‑ion battery storage and charging activities.",
  },
  {
    title: "Top Event: Thermal runaway begins",
    body: "The central knot represents the thermal runaway event that splits the bowtie into prevention (left) and mitigation (right).",
  },
  {
    title: "Threat example: Damaged pallet / impact",
    body: "Mechanical damage during handling can puncture cells. Prevention barriers reduce the likelihood of this threat leading to the top event.",
  },
  {
    title: "Prevention barrier: Incoming QA and quarantine",
    body: "Establish QA checks and a 24‑hour quarantine for suspect pallets. Look for swelling, odor, and temperature anomalies.",
  },
  {
    title: "Prevention barrier: Segregated storage and spacing",
    body: "Maintain aisle spacing, segregated SKU zones, and rack load limits to slow fire propagation and enable access.",
  },
  {
    title: "Prevention barrier: Charging SOP and supervision",
    body: "Use listed chargers, enforce charging windows, and supervise overnight charging with thermal monitoring where practical.",
  },
  {
    title: "Mitigation barrier: Early detection",
    body: "Aspirating smoke detection or multi‑criteria detectors help detect smoldering before full ignition.",
  },
  {
    title: "Mitigation barrier: Containment and cooling",
    body: "Class ABC sprinklers, water supply, and on‑site fire brigade coordination focus on cooling and containment.",
  },
  {
    title: "Consequence example: Full rack involvement",
    body: "Without effective mitigation, thermal runaway can escalate to a rack‑level fire with severe smoke and heat damage.",
  },
  {
    title: "Consequence control: Compartmentation",
    body: "Rated partitions and fire doors help limit spread beyond the affected zone and protect egress routes.",
  },
  {
    title: "Roles / Lenses",
    body: "Filter by role (Ops, Safety, Facilities, Vendors) to focus discussion. Chips toggle on/off and the Clear button resets.",
  },
  {
    title: "Export and Present",
    body: "Use Share/Export to save a PNG. Presentation mode hides UI chrome for clean review. Arrow keys navigate steps when menus are closed.",
  },
];

