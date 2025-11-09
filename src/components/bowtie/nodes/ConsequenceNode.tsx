import { Handle, Position, type NodeProps } from "@xyflow/react";
import { memo } from "react";

import styles from "./ConsequenceNode.module.css";
import animStyles from "../PreattentiveAnimations.module.css";
import type { BowtieNodeData } from "../../../domain/bowtie.types";

function ConsequenceNode({ id, data }: NodeProps) {
  const d = data as BowtieNodeData;
  const title = d?.metadata?.eli5 ?? d?.label;
  const descId = `${id}-desc`;
  const labelText = d?.displayLabel ?? d?.label;
  const orientation = d?.orientation ?? "right";
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
        aria-label={`Consequence: ${d?.label}`}
        aria-describedby={descId}
        title={title}
        onKeyDown={handleKeyDown}
        className={styles.card}
        data-highlight={d?.highlighted ? "true" : undefined}
        data-dimmed={d?.dimmed ? "true" : undefined}
        data-orientation={orientation}
        data-width={widthHint}
      >
        <div className={animStyles.animationWrapper} data-narrative-role="consequence">
          {d?.badge && (
            <span className={styles.badge} aria-hidden="true">
              {d.badge}
            </span>
          )}
          <div className={styles.content}>
            <div className={styles.title}>
              {d?.emoji && <span className={styles.emoji} aria-hidden="true">{d.emoji}</span>}
              <span>{labelText}</span>
            </div>
            {d?.metadata?.chips?.length ? (
              <div className={styles.chips}>
                {d.metadata!.chips!.map((c) => (
                  <span key={c} className={styles.chip}>{c}</span>
                ))}
              </div>
            ) : null}
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
export default memo(ConsequenceNode);
