import { Handle, Position, type NodeProps } from "@xyflow/react";
import { memo } from "react";

import styles from "./BarrierNode.module.css";
import type { BowtieNodeData } from "../../../domain/bowtie.types";

function BarrierNode({ id, data }: NodeProps) {
  const d = data as BowtieNodeData;
  const role = d?.role === "prevention" ? "prevention" : "mitigation";
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
        aria-label={`Barrier: ${d?.label}`}
        aria-describedby={descId}
        title={title}
        onKeyDown={handleKeyDown}
        className={`${styles.card} ${role === "prevention" ? styles.prevention : styles.mitigation}`}
        data-testid="bowtie-barrier-node"
        data-label={d?.label}
        data-role={role}
      >
        <div className={`${styles.headerBar} ${styles[role]}`} />
        <div className={styles.content}>
          <div className={styles.title}>{d?.label}<span className={styles.infoIcon} aria-hidden="true">ⓘ</span></div>
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
        <Handle type="target" position={Position.Left} />
        <Handle type="source" position={Position.Right} />
      </div>

      <p id={descId} hidden>
        {d?.metadata?.eli5 ?? d?.label}
      </p>
    </>
  );


}
export default memo(BarrierNode);

