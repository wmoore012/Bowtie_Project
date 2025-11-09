import { Handle, Position, type NodeProps } from "@xyflow/react";
import { memo } from "react";

import styles from "./TopEventKnotNode.module.css";
import type { BowtieNodeData } from "../../../domain/bowtie.types";

function TopEventKnotNode({ id, data }: NodeProps) {
  const d = data as BowtieNodeData;
  const title = d?.metadata?.eli5 ?? d?.label;
  const descId = `${id}-desc`;
  return (
    <>
      <button
        type="button"
        className={styles.wrap}
        aria-label={`Top Event: ${d?.label}`}
        aria-describedby={descId}
        title={title}
      >
        <div className={styles.knot}>
          <span className={styles.icon} aria-hidden="true"></span>
          <span className={styles.label}>{d?.label}</span>
        </div>
        <Handle type="target" position={Position.Left} />
        <Handle type="source" position={Position.Right} />
      </button>
      <p id={descId} hidden>
        {d?.metadata?.eli5 ?? d?.label}
      </p>
    </>
  );
}
export default memo(TopEventKnotNode);


