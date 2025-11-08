import styles from "./Sidebar.module.css";

export type SidebarProps = {
  collapsed: boolean;
  onToggle(): void;
};

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  return (
    <aside
      className={`${styles.sidebar} ${collapsed ? styles.collapsed : styles.expanded}`}
      aria-label="Primary"
    >
      <div className={styles.header}>
        {!collapsed && <strong>Bowtie</strong>}
        <button
          className={styles.toggle}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          aria-expanded={!collapsed}
          onClick={onToggle}
          title={collapsed ? "Expand" : "Collapse"}
        >
          {collapsed ? "\u2192" : "\u2190"}
        </button>
      </div>
      <nav className={styles.nav}>
        <a href="#dashboard" className={styles.item}>
          <span className={styles.icon}>🏠</span>
          {!collapsed && <span className={styles.label}>Dashboard</span>}
        </a>
        <a href="#bowtie" className={styles.item} aria-current="page">
          <span className={styles.icon}>🕸️</span>
          {!collapsed && <span className={styles.label}>Bowtie View</span>}
        </a>
        <a href="#filters" className={styles.item}>
          <span className={styles.icon}>🔎</span>
          {!collapsed && <span className={styles.label}>Filters</span>}
        </a>
        <a href="#settings" className={styles.item}>
          <span className={styles.icon}>⚙️</span>
          {!collapsed && <span className={styles.label}>Settings</span>}
        </a>
      </nav>
      <div className={styles.footer}>{!collapsed && <span>v0.1</span>}</div>
    </aside>
  );
}

