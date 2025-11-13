import { Handle, Position, type NodeProps } from "@xyflow/react";
import { memo } from "react";

import styles from "./TopEventKnotNode.module.css";
import animStyles from "../PreattentiveAnimations.module.css";
import type { BowtieNodeData } from "../../../domain/bowtie.types";

function TopEventKnotNode({ id, data }: NodeProps) {
  const d = data as BowtieNodeData;
  const title = d?.metadata?.eli5 ?? d?.label;
  const descId = `${id}-desc`;
  const labelText = d?.displayLabel ?? d?.label;
  return (
    <>
      <button
        type="button"
        className={styles.wrap}
        aria-label={`Top Event: ${d?.label}`}
        aria-describedby={descId}
        title={title}
        data-highlight={d?.highlighted ? "true" : undefined}
        data-dimmed={d?.dimmed ? "true" : undefined}
      >
        <div className={animStyles.animationWrapper} data-narrative-role="topEvent">
          <div className={styles.knot}>
            <span className={styles.icon} aria-hidden="true"></span>
            {d?.badge && <span className={styles.badge} aria-hidden="true">{d.badge}</span>}
            <span className={styles.label}>{labelText}</span>
          </div>
        </div>
        <Handle id="top-event-hazard" type="target" position={Position.Top} />
        <Handle id="left"  type="target" position={Position.Left} />
        <Handle id="right" type="target" position={Position.Right} />
      </button>
      <p id={descId} hidden>
        {d?.metadata?.eli5 ?? d?.label}
      </p>
    </>
  );
}
export default memo(TopEventKnotNode);
