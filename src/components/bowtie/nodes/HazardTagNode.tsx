import { Handle, Position, type NodeProps } from "@xyflow/react";
import { memo } from "react";

import styles from "./HazardTagNode.module.css";
import type { BowtieNodeData } from "../../../domain/bowtie.types";

function HazardTagNode({ id, data }: NodeProps) {
  const d = data as BowtieNodeData;
  const title = d?.metadata?.eli5 ?? d?.label;
  const descId = `${id}-desc`;
  return (
    <>
      <button
        type="button"
        className={styles.tag}
        aria-label={`Hazard: ${d?.label}`}
        aria-describedby={descId}
        title={title}
        data-testid="bowtie-hazard-node"
        data-label={d?.label}
      >
        <span className={styles.icon} aria-hidden="true">⚠</span>
        <span className="sr-only">Hazard</span>
        <span className={styles.label}>{d?.label}</span>
        <Handle type="target" position={Position.Left} />
        <Handle type="source" position={Position.Right} />
      </button>
      <p id={descId} hidden>
        {d?.metadata?.eli5 ?? d?.label}
      </p>
    </>
  );
}
export default memo(HazardTagNode);


