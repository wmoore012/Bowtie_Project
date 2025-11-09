import styles from "./PreAttentiveHelp.module.css";
import { ROLE_CUES, TYPOGRAPHY_CUES, MOTION_CUES } from "./preattentive";

interface Props {
  onClose: () => void;
}

export function PreAttentiveHelp({ onClose }: Props) {
  return (
    <div
      className={styles.backdrop}
      role="dialog"
      aria-modal="true"
      aria-labelledby="help-title"
      onClick={onClose}
    >
      <div className={styles.panel} onClick={(e) => e.stopPropagation()}>
        <header className={styles.header}>
          <div>
            <p className={styles.kicker}>Visual system</p>
            <h2 id="help-title">How to read the bowtie at a glance</h2>
          </div>
          <button type="button" className={styles.close} aria-label="Close help" onClick={onClose}>×</button>
        </header>

        <section>
          <div className={styles.sectionHeader}>
            <h3>Role cues</h3>
            <p>Icon + hue + motion = instant meaning</p>
          </div>
          <div className={styles.table}>
            <div className={styles.tableHead}>
              <span>Role</span>
              <span>Hue &amp; motion</span>
              <span>Meaning</span>
            </div>
            {ROLE_CUES.map((cue) => (
              <div key={cue.label} className={styles.tableRow}>
                <span className={styles.roleCell}><strong>{cue.icon}</strong> {cue.label}</span>
                <span>{cue.hue}<br /><em>{cue.motion}</em></span>
                <span>{cue.meaning}</span>
              </div>
            ))}
          </div>
        </section>

        <section>
          <div className={styles.sectionHeader}>
            <h3>Typography cues</h3>
            <p>How we speak while the nodes animate</p>
          </div>
          <div className={styles.table}>
            <div className={styles.tableHead}>
              <span>Style</span>
              <span>Usage</span>
              <span>Example &amp; voice</span>
            </div>
            {TYPOGRAPHY_CUES.map((cue) => (
              <div key={cue.style} className={styles.tableRow}>
                <span dangerouslySetInnerHTML={{ __html: cue.style }} />
                <span>{cue.usage}</span>
                <span>
                  <span dangerouslySetInnerHTML={{ __html: cue.example }} />
                  <br />
                  <em>{cue.voice}</em>
                </span>
              </div>
            ))}
          </div>
        </section>

        <section>
          <div className={styles.sectionHeader}>
            <h3>Motion cues</h3>
            <p>Animation rhythm for the story</p>
          </div>
          <div className={styles.table}>
            <div className={styles.tableHead}>
              <span>Motion</span>
              <span>Effect</span>
              <span>Purpose</span>
            </div>
            {MOTION_CUES.map((cue) => (
              <div key={cue.name} className={styles.tableRow}>
                <span>{cue.name}</span>
                <span>{cue.effect}</span>
                <span>{cue.purpose}</span>
              </div>
            ))}
          </div>
        </section>

        <footer className={styles.footer}>
          <p><strong>Tip:</strong> One cue at a time. Color → pulse → size in that order so the story never feels noisy.</p>
        </footer>
      </div>
    </div>
  );
}
