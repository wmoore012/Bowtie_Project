import { useMemo } from "react";
import type { Node as RFNode } from "@xyflow/react";
import type { BowtieNodeData, BuilderNodeFields, BuilderNodeStatus } from "../../domain/bowtie.types";
import { ensureBuilderData } from "./builderFields";
import styles from "./BuilderInspector.module.css";

type BuilderInspectorChange = {
  label?: string;
  builder?: Partial<BuilderNodeFields>;
};

interface BuilderInspectorProps {
  node: RFNode<BowtieNodeData> | null;
  open: boolean;
  onClose: () => void;
  onChange: (nodeId: string, change: BuilderInspectorChange) => void;
}

const ROLE_LABEL: Record<string, string> = {
  hazard: "HAZARD",
  topEvent: "TOP EVENT",
  threat: "THREAT",
  preventionBarrier: "PREVENTION BARRIER",
  mitigationBarrier: "MITIGATION BARRIER",
  consequence: "CONSEQUENCE",
  escalationFactor: "ESCALATION FACTOR",
  escalationBarrier: "ESCALATION CONTROL",
};

const STATUS_LABELS: Record<BuilderNodeStatus, string> = {
  ok: "Healthy",
  weak: "Weak link",
  failed: "Failed",
};

const LIKELIHOOD_OPTIONS = [
  { value: "rare", label: "Rare" },
  { value: "unlikely", label: "Unlikely" },
  { value: "possible", label: "Possible" },
  { value: "likely", label: "Likely" },
  { value: "frequent", label: "Frequent" },
];

const SEVERITY_OPTIONS = [
  { value: "minor", label: "Minor" },
  { value: "serious", label: "Serious" },
  { value: "major", label: "Major" },
  { value: "catastrophic", label: "Catastrophic" },
];

export function BuilderInspector({ node, open, onClose, onChange }: BuilderInspectorProps) {
  const hasNode = !!node;
  const nodeData = useMemo(() => {
    if (!node) return null;
    return ensureBuilderData(node.data as BowtieNodeData);
  }, [node]);

  const builderFields = nodeData?.builder;
  const roleLabel = node ? ROLE_LABEL[node.type] ?? node.type.toUpperCase() : "Select a node";
  const nodeLabel = nodeData?.label ?? "Select a node to edit";
  const tagsValue = builderFields?.tags?.join(", ") ?? "";

  const handleBuilderChange = (patch: Partial<BuilderNodeFields>) => {
    if (!node) return;
    onChange(node.id, { builder: patch });
  };

  const handleLabelChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!node) return;
    onChange(node.id, { label: e.target.value.trimStart() === "" ? "" : e.target.value });
  };

  const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) =>
    handleBuilderChange({ description: e.target.value });

  const handleOwnerChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    handleBuilderChange({ owner: e.target.value });

  const handleTagsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleBuilderChange({
      tags: e.target.value
        .split(",")
        .map((token) => token.trim())
        .filter(Boolean),
    });
  };

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) =>
    handleBuilderChange({ status: e.target.value as BuilderNodeStatus });

  const handleLikelihoodChange = (e: React.ChangeEvent<HTMLSelectElement>) =>
    handleBuilderChange({ likelihood: e.target.value as BuilderNodeFields["likelihood"] });

  const handleSeverityChange = (e: React.ChangeEvent<HTMLSelectElement>) =>
    handleBuilderChange({ severity: e.target.value as BuilderNodeFields["severity"] });

  const handleTestIntervalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    handleBuilderChange({ testIntervalDays: val === "" ? null : Number(val) });
  };

  const handleCheckboxChange = (field: keyof BuilderNodeFields) => (e: React.ChangeEvent<HTMLInputElement>) =>
    handleBuilderChange({ [field]: e.target.checked } as Partial<BuilderNodeFields>);

  const handleGenericInput = (field: keyof BuilderNodeFields) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    handleBuilderChange({ [field]: e.target.value } as Partial<BuilderNodeFields>);

  return (
    <div className={styles.wrapper} aria-hidden={!open}>
      <div className={styles.header}>
        <div>
          <div className={styles.roleTag}>{roleLabel}</div>
          <div className={styles.title}>{nodeLabel}</div>
        </div>
        <button
          type="button"
          className={styles.closeButton}
          aria-label="Close inspector"
          onClick={onClose}
        >
          ×
        </button>
      </div>

      {!hasNode ? (
        <div className={styles.emptyState}>
          Select a node in Builder mode to edit its details.
        </div>
      ) : (
        <div className={styles.body}>
          <section className={styles.section}>
            <label className={styles.fieldLabel} htmlFor="builder-label">
              Label
            </label>
            <input
              id="builder-label"
              type="text"
              value={nodeData?.label ?? ""}
              onChange={handleLabelChange}
              className={styles.input}
              placeholder="Name this node"
            />
          </section>

          <section className={styles.section}>
            <label className={styles.fieldLabel} htmlFor="builder-description">
              Description
            </label>
            <textarea
              id="builder-description"
              className={styles.textarea}
              value={builderFields?.description ?? ""}
              onChange={handleDescriptionChange}
              placeholder="Add a short narrative for this control"
              rows={3}
            />
          </section>

          <section className={styles.section}>
            <label className={styles.fieldLabel} htmlFor="builder-owner">
              Owner / Steward
            </label>
            <input
              id="builder-owner"
              type="text"
              className={styles.input}
              value={builderFields?.owner ?? ""}
              onChange={handleOwnerChange}
              placeholder="e.g., Fleet Ops, Safety Lead"
            />
          </section>

          <section className={styles.section}>
            <label className={styles.fieldLabel} htmlFor="builder-tags">
              Tags
            </label>
            <input
              id="builder-tags"
              type="text"
              className={styles.input}
              value={tagsValue}
              onChange={handleTagsChange}
              placeholder="Comma separated (policy, human, hardware)"
            />
          </section>

          {(node?.type === "preventionBarrier" ||
            node?.type === "mitigationBarrier" ||
            node?.type === "escalationBarrier") && (
            <section className={styles.section}>
              <label className={styles.fieldLabel} htmlFor="builder-status">
                Barrier health
              </label>
              <select
                id="builder-status"
                className={styles.select}
                value={builderFields?.status ?? "ok"}
                onChange={handleStatusChange}
              >
                {Object.entries(STATUS_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
              <div className={styles.inlineGrid}>
                <div>
                  <label className={styles.fieldLabel} htmlFor="builder-test-interval">
                    Test interval (days)
                  </label>
                  <input
                    id="builder-test-interval"
                    type="number"
                    min="0"
                    className={styles.input}
                    value={builderFields?.testIntervalDays ?? ""}
                    onChange={handleTestIntervalChange}
                  />
                </div>
                <label className={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    checked={!!builderFields?.critical}
                    onChange={handleCheckboxChange("critical")}
                  />
                  Critical control
                </label>
              </div>
              <label className={styles.fieldLabel} htmlFor="builder-sop-link">
                SOP / Runbook link
              </label>
              <input
                id="builder-sop-link"
                type="url"
                className={styles.input}
                value={builderFields?.sopLink ?? ""}
                onChange={handleGenericInput("sopLink")}
                placeholder="https://..."
              />
              {node?.type === "mitigationBarrier" && (
                <>
                  <label className={styles.fieldLabel} htmlFor="builder-coverage">
                    Coverage note
                  </label>
                  <textarea
                    id="builder-coverage"
                    className={styles.textarea}
                    value={builderFields?.coverageNote ?? ""}
                    onChange={handleGenericInput("coverageNote")}
                    rows={2}
                    placeholder="What injuries / impacts does this soften?"
                  />
                </>
              )}
            </section>
          )}

          {node?.type === "threat" && (
            <section className={styles.section}>
              <label className={styles.fieldLabel} htmlFor="builder-likelihood">
                Likelihood band
              </label>
              <select
                id="builder-likelihood"
                className={styles.select}
                value={builderFields?.likelihood ?? "possible"}
                onChange={handleLikelihoodChange}
              >
                {LIKELIHOOD_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>

              <label className={styles.fieldLabel} htmlFor="builder-initiating-event">
                Initiating event code
              </label>
              <input
                id="builder-initiating-event"
                type="text"
                className={styles.input}
                value={builderFields?.initiatingEventCode ?? ""}
                onChange={handleGenericInput("initiatingEventCode")}
                placeholder="e.g., TE-04"
              />
            </section>
          )}

          {node?.type === "consequence" && (
            <section className={styles.section}>
              <label className={styles.fieldLabel} htmlFor="builder-severity">
                Severity
              </label>
              <select
                id="builder-severity"
                className={styles.select}
                value={builderFields?.severity ?? "serious"}
                onChange={handleSeverityChange}
              >
                {SEVERITY_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              <label className={styles.fieldLabel} htmlFor="builder-impact">
                Impact note
              </label>
              <textarea
                id="builder-impact"
                className={styles.textarea}
                value={builderFields?.coverageNote ?? ""}
                onChange={handleGenericInput("coverageNote")}
                rows={2}
                placeholder="Describe the harm / damage window"
              />
            </section>
          )}

          {(node?.type === "escalationFactor" || node?.type === "escalationBarrier") && (
            <section className={styles.section}>
              <label className={styles.fieldLabel} htmlFor="builder-driver">
                Factor driver
              </label>
              <input
                id="builder-driver"
                type="text"
                className={styles.input}
                value={builderFields?.driver ?? ""}
                onChange={handleGenericInput("driver")}
              />
              <label className={styles.fieldLabel} htmlFor="builder-control-plan">
                Control plan
              </label>
              <textarea
                id="builder-control-plan"
                className={styles.textarea}
                value={builderFields?.controlPlan ?? ""}
                onChange={handleGenericInput("controlPlan")}
                rows={2}
                placeholder="How do we keep this barrier healthy?"
              />
            </section>
          )}
        </div>
      )}
    </div>
  );
}

export type { BuilderInspectorChange };
