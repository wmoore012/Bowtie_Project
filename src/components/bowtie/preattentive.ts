export type RoleCue = {
  icon: string;
  label: string;
  hue: string;
  meaning: string;
  motion: string;
};

export type TypographyCue = {
  style: string;
  usage: string;
  example: string;
  voice: string;
};

export type MotionCue = {
  name: string;
  effect: string;
  purpose: string;
};

export const ROLE_CUES: RoleCue[] = [
  { icon: "⚡️", label: "Hazard", hue: "Amber stripe", meaning: "Baseline context / energy source", motion: "Static anchor" },
  { icon: "🚚", label: "Threat", hue: "Sand / amber fill", meaning: "What can trigger loss", motion: "Fade-in from left" },
  { icon: "🛡", label: "Prevention barrier", hue: "Cyan-green shell", meaning: "Stops trouble early", motion: "Soft pulse" },
  { icon: "🔥", label: "Top event", hue: "Red-orange knot", meaning: "Moment control is lost", motion: "Zoom-in pulse" },
  { icon: "🛡", label: "Mitigation barrier", hue: "Blue shell", meaning: "Reduces impact after loss", motion: "Fade-in from right" },
  { icon: "⚡️", label: "Escalation factor", hue: "Yellow stripe", meaning: "Degradation that accelerates failure", motion: "Ping pulse" },
  { icon: "❌", label: "Consequence", hue: "Light red", meaning: "Outcome we want to avoid", motion: "Tilt-right fade" },
  { icon: "👷", label: "Human / manual", hue: "Graphite underline", meaning: "Actions owned by people", motion: "Single ping" },
  { icon: "📅", label: "Time / cadence", hue: "Slate border", meaning: "Scheduled or periodic tasks", motion: "Slide-up" },
];

export const TYPOGRAPHY_CUES: TypographyCue[] = [
  { style: "<strong>Bold</strong>", usage: "Primary label / role", example: "TOP EVENT: Loss of control", voice: "Confident, clipped" },
  { style: "<em>Italic</em>", usage: "Emotional nuance / reflection", example: "drivers feel the sudden yaw", voice: "Softer, reflective" },
  { style: "<u>Underline</u>", usage: "Human handoff / time trigger", example: "<u>Supervisor sign-off</u>", voice: "Deliberate emphasis" },
  { style: "ALL CAPS", usage: "System category or call-to-action", example: "THREAT • BARRIER • CONSEQUENCE", voice: "Authoritative" },
];

export const MOTION_CUES: MotionCue[] = [
  { name: "Fade-in left", effect: "Slides from left wing", purpose: "Prevention becoming active" },
  { name: "Fade-in right", effect: "Slides from right wing", purpose: "Recovery / mitigation focus" },
  { name: "Zoom pulse", effect: "Brief scale-up", purpose: "Top event moment / climax" },
  { name: "Ping", effect: "Quick highlight flash", purpose: "Human touchpoint or alert" },
  { name: "Tilt-right", effect: "Subtle lean & reset", purpose: "Vehicle rollover storytelling" },
  { name: "Slide-up", effect: "Rises vertically", purpose: "Schedule / cadence reminder" },
];

