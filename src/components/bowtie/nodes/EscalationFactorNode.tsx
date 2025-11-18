import { Handle, Position, type NodeProps } from "@xyflow/react";
import { memo } from "react";

import styles from "./EscalationFactorNode.module.css";
import animStyles from "../PreattentiveAnimations.module.css";
import type { BowtieNodeData } from "../../../domain/bowtie.types";

function EscalationFactorNode({ id, data }: NodeProps) {
  const d = data as BowtieNodeData;
  const descId = `${id}-desc`;
  const title = d?.metadata?.eli5 ?? d?.label;
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
        aria-label={`Escalation factor: ${d?.label}`}
        aria-describedby={descId}
        title={title}
        onKeyDown={handleKeyDown}
        className={styles.card}
        data-highlight={d?.highlighted ? "true" : undefined}
        data-dimmed={d?.dimmed ? "true" : undefined}
      >
        <div className={animStyles.animationWrapper} data-narrative-role="escalation">
          <div className={styles.badge}>Escalation</div>
          <div className={styles.content}>
            <div className={styles.title}>{d?.label}</div>
          </div>
        </div>
        {d?.orientation === "right" ? (
          <Handle id="left" type="target" position={Position.Left} />
        ) : (
          <Handle id="right" type="target" position={Position.Right} />
        )}
      </div>
      <p id={descId} hidden>
        {d?.metadata?.eli5 ?? d?.label}
      </p>
    </>
  );
}

export default memo(EscalationFactorNode);
