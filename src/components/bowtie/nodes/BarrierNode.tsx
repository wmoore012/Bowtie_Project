import { Handle, Position, type NodeProps } from "@xyflow/react";
import styles from "./BarrierNode.module.css";
import type { BowtieNodeData } from "../../../domain/bowtie.types";

export default function BarrierNode({ id, data }: NodeProps) {
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
      >
        <div className={styles.headerBar} />
        <div className={styles.content}>
          <div className={styles.title}>{d?.label}</div>
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
