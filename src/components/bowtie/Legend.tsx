import styles from "./Legend.module.css";

export function Legend() {
  return (
    <div className={styles.legend}>
      <div className={styles.title}>Legend</div>
      <ul className={styles.list}>
        <li>Threats: causes on the left</li>
        <li>Prevention Barriers: controls that stop threats</li>
        <li>Hazard: the risky situation</li>
        <li>Top Event: the moment control is lost</li>
        <li>Mitigation Barriers: controls that reduce harm afterward</li>
        <li>Consequences: outcomes on the right</li>
      </ul>
      <div className={styles.note}>Note: This model excludes degradation factors by design.</div>
    </div>
  );
}

