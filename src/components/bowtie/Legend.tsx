import styles from "./Legend.module.css";
import { memo, useEffect, useState } from "react";


export const Legend = memo(function Legend() {
  const STORAGE_KEY = "bowtie.legend.expanded";
  const [expanded, setExpanded] = useState<boolean>(() => {
    if (typeof window === "undefined") return false; // SSR-safe default
    try {
      const v = window.localStorage?.getItem(STORAGE_KEY);
      if (v === "true") return true;
      if (v === "false") return false;
    } catch {}
    return false; // default: collapsed to maximize canvas
  });

  useEffect(() => {
    try { window?.localStorage?.setItem(STORAGE_KEY, expanded ? "true" : "false"); } catch {}
  }, [expanded]);

  const contentId = "legend-content";
  const titleId = "legend-title";
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

      <div className={styles.rowGroup}>
        <div className={styles.column}>
          <div className={styles.item}>
            <span className={`${styles.icon} ${styles.iconThreat}`} aria-hidden="true" />
            <div className={styles.textBlock}>
              <div className={styles.label}>Threats</div>
              <div className={styles.help}>Things that can start trouble (left)</div>
            </div>
          </div>

          <div className={styles.item}>
            <span className={`${styles.icon} ${styles.iconPrevention}`} aria-hidden="true" />
            <div className={styles.textBlock}>
              <div className={styles.label}>Prevention barriers</div>
              <div className={styles.help}>Stop trouble before control is lost</div>
            </div>
          </div>
        </div>

        <div className={styles.column}>
          <div className={styles.item}>
            <span className={`${styles.icon} ${styles.iconHazard}`} aria-hidden="true" />
            <div className={styles.textBlock}>
              <div className={styles.label}>Hazard</div>
              <div className={styles.help}>Risky situation you&apos;re managing</div>
            </div>
          </div>

          <div className={styles.item}>
            <span className={`${styles.icon} ${styles.iconTopEvent}`} aria-hidden="true" />
            <div className={styles.textBlock}>
              <div className={styles.label}>Top event</div>
              <div className={styles.help}>Moment you lose control</div>
            </div>
          </div>
        </div>

        <div className={styles.column}>
          <div className={styles.item}>
            <span className={`${styles.icon} ${styles.iconMitigation}`} aria-hidden="true" />
            <div className={styles.textBlock}>
              <div className={styles.label}>Mitigation barriers</div>
              <div className={styles.help}>Soften the impact after loss</div>
            </div>
          </div>

          <div className={styles.item}>
            <span className={`${styles.icon} ${styles.iconConsequence}`} aria-hidden="true" />
            <div className={styles.textBlock}>
              <div className={styles.label}>Consequences</div>
              <div className={styles.help}>What happens in the end (right)</div>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.note}>
        This simplified model intentionally excludes degradation factors.
      </div>
      </div>
    </aside>
  );
});