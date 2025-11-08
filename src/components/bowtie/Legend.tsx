import styles from "./Legend.module.css";

export function Legend() {
  return (
    <aside className={styles.legend} aria-label="Bowtie legend">
      <div className={styles.title}>How to read this bowtie</div>

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
    </aside>
  );
}