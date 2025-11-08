import type { BowtieNode, NodeMetadata } from "../../domain/bowtie.types";
import styles from "./NodeDetailPanel.module.css";

export function NodeDetailPanel({ node, onClose }: { node: BowtieNode | null; onClose: () => void }) {
  if (!node) return null;
  const md = (node.metadata || {}) as NodeMetadata;
  return (
    <div role="dialog" aria-modal="true" aria-label="Node details" className={styles.panel}>
      <div className={styles.header}>
        <h3 className={styles.title}>{node.label}</h3>
        <button type="button" onClick={onClose} aria-label="Close node details">✕</button>
      </div>

      {md.eli5 && (
        <p style={{ marginTop: 12, fontStyle: "italic" }}>
          <strong>ELI5:</strong> {md.eli5}
        </p>
      )}

      {Array.isArray(md.chips) && md.chips.length > 0 && (
        <div className={styles.chips}>
          <div className={styles.chipsTitle}>Ownership / Roles</div>
          <div className={styles.chipRow}>
            {md.chips.map((c, i) => (
              <span key={i} className={styles.chip}>{c}</span>
            ))}
          </div>
        </div>
      )}

      {Array.isArray(md.kpis) && md.kpis.length > 0 && (
        <div>
          <div className={styles.sectionTitle}>KPIs</div>
          <ul>
            {md.kpis.map((k, i) => (
              <li key={i}>{k}</li>
            ))}
          </ul>
        </div>
      )}

      {Array.isArray(md.details) && md.details.length > 0 && (
        <div>
          <div className={styles.sectionTitle}>Details</div>
          <ul>
            {md.details.map((d, i) => (
              <li key={i}>{d}</li>
            ))}
          </ul>
        </div>
      )}

      {Array.isArray(md.failureModes) && md.failureModes.length > 0 && (
        <div>
          <div className={styles.sectionTitle}>Failure modes</div>
          <ul>
            {md.failureModes.map((f, i) => (
              <li key={i}>{f}</li>
            ))}
          </ul>
        </div>
      )}

      {md.sopLink && (
        <div className={styles.note}>
          <a href={md.sopLink} target="_blank" rel="noreferrer">Reference / SOP</a>
        </div>
      )}
    </div>
  );
}

