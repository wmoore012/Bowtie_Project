import { Handle, Position, type NodeProps } from "@xyflow/react";
import { memo } from "react";

import styles from "./ThreatNode.module.css";
import type { BowtieNodeData } from "../../../domain/bowtie.types";

function ThreatNode({ id, data }: NodeProps) {
  const d = data as BowtieNodeData;
  const title = d?.metadata?.eli5 ?? d?.label;
  const descId = `${id}-desc`;
  const labelText = d?.displayLabel ?? d?.label;
  const orientation = d?.orientation ?? "left";
  const widthHint = d?.widthHint ?? "medium";
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
        aria-label={`Threat: ${d?.label}`}
        aria-describedby={descId}
        title={title}
        onKeyDown={handleKeyDown}
        className={styles.card}
        data-highlight={d?.highlighted ? "true" : undefined}
        data-dimmed={d?.dimmed ? "true" : undefined}
        data-orientation={orientation}
        data-width={widthHint}
      >
        {d?.badge && (
          <span className={styles.badge} aria-hidden="true">
            {d.badge}
          </span>
        )}
        <div className={styles.content}>
          <div className={styles.title}>
            {d?.emoji && <span aria-hidden="true" className={styles.emoji}>{d.emoji}</span>}
            <span>{labelText}</span>
          </div>
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
export default memo(ThreatNode);
