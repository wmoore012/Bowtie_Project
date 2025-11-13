import { Handle, Position, type NodeProps } from "@xyflow/react";
import { memo } from "react";

import styles from "./BarrierNode.module.css";
import animStyles from "../PreattentiveAnimations.module.css";
import type { BowtieNodeData } from "../../../domain/bowtie.types";

function BarrierNode({ id, data }: NodeProps) {
  const d = data as BowtieNodeData;
  const rawRole = d?.role;
  const role: "prevention" | "mitigation" | "escalation" =
    rawRole && rawRole.toString().startsWith("mitigation")
      ? "mitigation"
      : rawRole && rawRole.toString().startsWith("escalation")
        ? "escalation"
        : "prevention";
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
        aria-label={`Barrier: ${d?.label}`}
        aria-describedby={descId}
        title={title}
        onKeyDown={handleKeyDown}
        className={`${styles.card} ${styles[role] ?? ""}`}
        data-testid="bowtie-barrier-node"
        data-label={d?.label}
        data-role={role}
        data-highlight={d?.highlighted ? "true" : undefined}
        data-dimmed={d?.dimmed ? "true" : undefined}
        data-orientation={orientation}
        data-width={widthHint}
      >
        <div className={animStyles.animationWrapper} data-narrative-role={role}>
          {d?.badge && (
            <span className={styles.badge} aria-hidden="true">
              {d.badge}
            </span>
          )}
          <div className={`${styles.headerBar} ${styles[role]}`} />
          <div className={styles.content}>
            <div className={styles.title}>
              {d?.emoji && <span className={styles.emoji} aria-hidden="true">{d.emoji}</span>}
              <span>{labelText}</span>
              <span className={styles.infoIcon} aria-hidden="true">ⓘ</span>
            </div>
            {d?.metadata?.chips?.length ? (
              <div className={styles.chips}>
                {d.metadata!.chips!.map((c) => (
                  <span key={c} className={styles.chip}>
                    {c}
                  </span>
                ))}
              </div>
            ) : null}
          </div>
        </div>
        {d?.orientation === "right" ? (
          <>
            <Handle id="left" type="source" position={Position.Left} />
            <Handle id="right" type="target" position={Position.Right} />
          </>
        ) : (
          <>
            <Handle id="right" type="source" position={Position.Right} />
            <Handle id="left" type="target" position={Position.Left} />
          </>
        )}
      </div>

      <p id={descId} hidden>
        {d?.metadata?.eli5 ?? d?.label}
      </p>
    </>
  );


}
export default memo(BarrierNode);
