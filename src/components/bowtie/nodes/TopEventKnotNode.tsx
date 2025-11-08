import { Handle, Position, type NodeProps } from "@xyflow/react";
import styles from "./TopEventKnotNode.module.css";
import type { BowtieNodeData } from "../../../domain/bowtie.types";

export default function TopEventKnotNode({ id, data }: NodeProps) {
  const d = data as BowtieNodeData;
  const title = d?.metadata?.eli5 ?? d?.label;
  const descId = `${id}-desc`;
  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      (e.currentTarget as HTMLDivElement).click();
    }
  };
  return (
    <>
      <div
        role="button"
        tabIndex={0}
        aria-label={`Top Event: ${d?.label}`}
        aria-describedby={descId}
        title={title}
        onKeyDown={handleKeyDown}
        className={styles.wrap}
      >
        <div className={styles.knot}>
          <span className={styles.icon} aria-hidden="true">525</span>
          <span className={styles.label}>{d?.label}</span>
        </div>
        <Handle type="target" position={Position.Left} />
        <Handle type="source" position={Position.Right} />
      </div>
      <p id={descId} hidden>
        {d?.metadata?.eli5 ?? d?.label}
      </p>
    </>
  );
}

