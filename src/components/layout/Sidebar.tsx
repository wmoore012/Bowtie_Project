import { useEffect, useState } from "react";

import styles from "./Sidebar.module.css";

export type SidebarProps = {
  collapsed: boolean;
  onToggle(): void;
};

type DropdownPanel = "filters" | "actions" | "export" | null;

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const [mode, setMode] = useState<"demo" | "builder">("demo");
  const [openDropdown, setOpenDropdown] = useState<DropdownPanel>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const onMode = (e: Event) => {
      try {
        const d = (e as CustomEvent).detail as { mode?: "demo" | "builder" } | undefined;
        if (d?.mode) setMode(d.mode);
      } catch {}
    };
    window.addEventListener("bowtie:modeChanged", onMode as any);
    return () => {
      window.removeEventListener("bowtie:modeChanged", onMode as any);
    };
  }, []);

  // Close dropdown on Escape key
  useEffect(() => {
    if (!openDropdown) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpenDropdown(null);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [openDropdown]);

  const handleToggle = () => {
    try {
      if (typeof window !== "undefined") {
        localStorage.setItem("sidebarExpanded", String(!collapsed));
      }
    } catch {}
    onToggle();
  };

  const isCurrent = (hash: string) => {
    try {
      if (typeof window === "undefined") return undefined;
      return window.location.hash === hash ? ("page" as any) : undefined;
    } catch {
      return undefined;
    }
  };

  const dispatch = (type: string) => {
    if (typeof window === "undefined") return;
    window.dispatchEvent(new CustomEvent(type));
  };

  const toggleDropdown = (panel: DropdownPanel) => {
    setOpenDropdown((current) => (current === panel ? null : panel));
  };

  return (
    <aside
      className={`${styles.sidebar} ${collapsed ? styles.collapsed : styles.expanded}`}
      aria-label={collapsed ? "Primary navigation (collapsed)" : "Primary navigation"}
    >
      <div className={styles.top}>
        <div className={styles.brand}>{collapsed ? "\u22C8" : "Bowtie Builder Pro"}</div>
        <button
          className={styles.toggle}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          aria-expanded={!collapsed}
          onClick={handleToggle}
          title={collapsed ? "Expand" : "Collapse"}
          type="button"
        >
          {collapsed ? "\u2192" : "\u2190"}
        </button>
      </div>


      <nav className={styles.nav} aria-label="Primary">
        <a href="#dashboard" className={styles.navItem} aria-current={isCurrent("#dashboard")}>
          <span className={styles.icon}>🏠</span>
          {!collapsed && <span className={styles.label}>Dashboard</span>}
        </a>
        <a href="#bowtie" className={styles.navItem} aria-current={isCurrent("#bowtie") ?? ("page" as any)} style={{ display: "none" }}>
          <span className={styles.icon}>�</span>
          {!collapsed && <span className={styles.label}>Bowtie View</span>}
        </a>
        <a href="#bowtie" className={styles.navItem} aria-current={isCurrent("#bowtie") ?? ("page" as any)}>
          <span className={styles.icon}>{"\u{1F578}\uFE0F"}</span>
          {!collapsed && <span className={styles.label}>Bowtie View</span>}
        </a>

        <button
          type="button"
          className={styles.modeSwitch}
          role="switch"
          aria-checked={mode === "builder"}
          onClick={() => dispatch("bowtie:toggleBuilder")}
          aria-label="Mode switch"
        >
          {!collapsed && (
            <span className={styles.modeLabel}>Mode: {mode === "builder" ? "Builder" : "Demo"}</span>
          )}
          <span className={styles.switchTrack} data-mode={mode}>
            <span
              className={styles.switchThumb}
              data-mode={mode}
              style={{ ["--thumb-x" as any]: mode === "builder" ? "29px" : "3px" }}
              aria-hidden="true"
            />
          </span>
        </button>
        {/*

          <span className={styles.icon}>�</span>
        */}

        <button
          type="button"
          className={`${styles.navItem} ${openDropdown === "filters" ? styles.navItemActive : ""}`}
          onClick={() => toggleDropdown("filters")}
          aria-label="Toggle filters panel"
          aria-expanded={openDropdown === "filters"}
        >
          <span className={styles.icon}>{"\u{1F50E}"}</span>
          {!collapsed && <span className={styles.label}>Filters</span>}
          {!collapsed && <span className={styles.chevron}>{openDropdown === "filters" ? "▼" : "▶"}</span>}
        </button>
        {!collapsed && openDropdown === "filters" && (
          <div className={styles.dropdown} role="region" aria-label="Filters">
            <div className={styles.dropdownContent}>
              <p className={styles.dropdownHint}>Filter by role to focus discussion</p>
              <button
                className={styles.dropdownButton}
                type="button"
                onClick={() => dispatch("bowtie:toggleFilters")}
              >
                Open Filter Panel
              </button>
            </div>
          </div>
        )}

        <button
          type="button"
          className={`${styles.navItem} ${openDropdown === "actions" ? styles.navItemActive : ""}`}
          onClick={() => toggleDropdown("actions")}
          aria-label="Open actions panel"
          aria-expanded={openDropdown === "actions"}
        >
          <span className={styles.icon}>🛠️</span>
          {!collapsed && <span className={styles.label}>Actions</span>}
          {!collapsed && <span className={styles.chevron}>{openDropdown === "actions" ? "▼" : "▶"}</span>}
        </button>
        {!collapsed && openDropdown === "actions" && (
          <div className={styles.dropdown} role="region" aria-label="Actions">
            <div className={styles.dropdownContent}>
              <button
                className={styles.dropdownButton}
                type="button"
                onClick={() => {
                  dispatch("bowtie:clearDiagram");
                  setOpenDropdown(null);
                }}
              >
                🧹 Clear Diagram
              </button>
              <button
                className={styles.dropdownButton}
                type="button"
                onClick={() => dispatch("bowtie:toggleActions")}
              >
                🛠️ More Actions
              </button>
            </div>
          </div>
        )}

        <a href="#settings" className={styles.navItem} aria-current={isCurrent("#settings")}>
          <span className={styles.icon}>⚙️</span>
          {!collapsed && <span className={styles.label}>Settings</span>}
        </a>

        <button
          type="button"
          className={`${styles.navItem} ${styles.exportBtn} ${openDropdown === "export" ? styles.navItemActive : ""}`}
          onClick={() => toggleDropdown("export")}
          aria-label="Open export panel"
          title="Share / Export"
          aria-expanded={openDropdown === "export"}
        >
          <span className={styles.icon}>📤</span>
          {!collapsed && <span className={styles.label}>Share / Export</span>}
          {!collapsed && <span className={styles.chevron}>{openDropdown === "export" ? "▼" : "▶"}</span>}
        </button>
        {!collapsed && openDropdown === "export" && (
          <div className={styles.dropdown} role="region" aria-label="Export">
            <div className={styles.dropdownContent}>
              <button
                className={styles.dropdownButton}
                type="button"
                onClick={() => {
                  dispatch("bowtie:exportPng");
                  setOpenDropdown(null);
                }}
              >
                📤 Export PNG
              </button>
              <button
                className={styles.dropdownButton}
                type="button"
                disabled
                title="Coming soon"
              >
                📋 Copy Link
              </button>
              <button
                className={styles.dropdownButton}
                type="button"
                disabled
                title="Coming soon"
              >
                💾 Save JSON
              </button>
            </div>
          </div>
        )}
      </nav>

      <div className={styles.footer}>
        <button className={styles.themeBtn} type="button" title="Theme toggle - coming soon in future release" aria-label="Theme toggle">
          <span className={styles.icon}>🌙</span>
          {!collapsed && <span className={styles.label}>Theme</span>}
        </button>
        <button className={styles.profileBtn} type="button" title="User profile">
          <span className={styles.icon}>👤</span>
          {!collapsed && <span className={styles.label}>Profile</span>}
        </button>
      </div>
    </aside>
  );
}
