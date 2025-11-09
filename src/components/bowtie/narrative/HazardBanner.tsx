import styles from "./HazardBanner.module.css";

export function HazardBanner() {
  return (
    <div className={styles.banner} role="status" aria-live="polite" aria-atomic="true">
      <span className={styles.text}>Hazard: Lithium-ion Battery Fire Risk</span>
    </div>
  );
}

