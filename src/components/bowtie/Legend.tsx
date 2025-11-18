import styles from "./Legend.module.css";
import { memo, useEffect, useState } from "react";
import { ROLE_CUES } from "./preattentive";


export const Legend = memo(function Legend() {
  const STORAGE_KEY = "bowtie.legend.expanded";
  const [expanded, setExpanded] = useState<boolean>(() => {
    if (typeof window === "undefined") return false; // SSR-safe default
    try {
      const v = window.localStorage?.getItem(STORAGE_KEY);
      if (v === "true") return true;
      if (v === "false") return false;
    } catch {
      // Ignore localStorage errors
    }
    return false; // default: collapsed to maximize canvas
  });

  useEffect(() => {
    try {
      window?.localStorage?.setItem(STORAGE_KEY, expanded ? "true" : "false");
    } catch {
      // Ignore localStorage errors
    }
  }, [expanded]);

  const contentId = "legend-content";
  const titleId = "legend-title";

  const iconClassMap: Record<string, string | undefined> = {
    Hazard: styles.iconHazard,
    Threat: styles.iconThreat,
    "Prevention barrier": styles.iconPrevention,
    "Mitigation barrier": styles.iconMitigation,
    "Top event": styles.iconTopEvent,
    Consequence: styles.iconConsequence,
    "Escalation factor": styles.iconEscalation,
  };
  return (
    <aside className={styles.legend} aria-label="Bowtie legend">
      <div className={styles.header}>
        <div id={titleId} className={styles.title}>How to read this diagram</div>
        <button
          className={styles.toggle}
          aria-expanded={expanded}
          aria-controls={contentId}
          type="button"
          onClick={() => setExpanded((e) => !e)}
        >
          <span className={styles.chevron} aria-hidden="true">{expanded ? "▼" : "▶"}</span>
          {expanded ? "Hide legend" : "Show legend"}
        </button>
      </div>

      <div
        id={contentId}
        className={`${styles.content} ${expanded ? styles.contentOpen : styles.contentClosed}`}
        role="region"
        aria-labelledby={titleId}
        aria-hidden={!expanded}
      >
        <div className={styles.tableContainer}>
          <div className={styles.columnHeaders}>
            <div className={styles.columnHeader}>LEFT WING</div>
            <div className={styles.columnHeader}>CENTER KNOT</div>
            <div className={styles.columnHeader}>RIGHT WING</div>
          </div>

          <div className={styles.columns}>
            <div className={styles.column}>
              {["Threat", "Prevention barrier", "Escalation factor"].map((label) => {
                const cue = ROLE_CUES.find((c) => c.label === label);
                if (!cue) return null;
                return (
                  <div key={label} className={styles.item}>
                    <span className={`${styles.icon} ${iconClassMap[label] ?? styles.iconGeneric}`} aria-hidden="true">
                      {iconClassMap[label] ? "" : cue.icon}
                    </span>
                    <div className={styles.textBlock}>
                      <div className={styles.label}>{cue.label}</div>
                      <div className={styles.help}>{cue.meaning}</div>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className={styles.column}>
              {["Hazard", "Top event"].map((label) => {
                const cue = ROLE_CUES.find((c) => c.label === label);
                if (!cue) return null;
                return (
                  <div key={label} className={styles.item}>
                    <span className={`${styles.icon} ${iconClassMap[label] ?? styles.iconGeneric}`} aria-hidden="true">
                      {iconClassMap[label] ? "" : cue.icon}
                    </span>
                    <div className={styles.textBlock}>
                      <div className={styles.label}>{cue.label}</div>
                      <div className={styles.help}>{cue.meaning}</div>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className={styles.column}>
              {["Consequence", "Mitigation barrier"].map((label) => {
                const cue = ROLE_CUES.find((c) => c.label === label);
                if (!cue) return null;
                return (
                  <div key={label} className={styles.item}>
                    <span className={`${styles.icon} ${iconClassMap[label] ?? styles.iconGeneric}`} aria-hidden="true">
                      {iconClassMap[label] ? "" : cue.icon}
                    </span>
                    <div className={styles.textBlock}>
                      <div className={styles.label}>{cue.label}</div>
                      <div className={styles.help}>{cue.meaning}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className={styles.note}>
          Badges (PB-1.2, MB-1.6, etc.) show sequence order; wings stay collapsed until you click a card or run the story.
        </div>
      </div>
    </aside>
  );
});
