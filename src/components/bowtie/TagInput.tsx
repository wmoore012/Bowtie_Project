import { useState, useRef, type KeyboardEvent } from "react";
import styles from "./TagInput.module.css";

interface TagInputProps {
  tags: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
  id?: string;
}

export function TagInput({ tags, onChange, placeholder = "Add tags...", id }: TagInputProps) {
  const [inputValue, setInputValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const handleAddTag = (value: string) => {
    const trimmed = value.trim();
    if (trimmed && !tags.includes(trimmed)) {
      onChange([...tags, trimmed]);
    }
    setInputValue("");
  };

  const handleRemoveTag = (index: number) => {
    onChange(tags.filter((_, i) => i !== index));
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      handleAddTag(inputValue);
    } else if (e.key === "Backspace" && inputValue === "" && tags.length > 0) {
      e.preventDefault();
      handleRemoveTag(tags.length - 1);
    }
  };

  const handleInputBlur = () => {
    if (inputValue.trim()) {
      handleAddTag(inputValue);
    }
  };

  return (
    <div className={styles.container} onClick={() => inputRef.current?.focus()}>
      <div className={styles.chipList}>
        {tags.map((tag, index) => (
          <div key={index} className={styles.chip} role="button" tabIndex={0}>
            <span className={styles.chipLabel}>{tag}</span>
            <button
              type="button"
              className={styles.chipRemove}
              onClick={(e) => {
                e.stopPropagation();
                handleRemoveTag(index);
              }}
              aria-label={`Remove tag ${tag}`}
            >
              ×
            </button>
          </div>
        ))}
        <input
          ref={inputRef}
          id={id}
          type="text"
          className={styles.input}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={handleInputBlur}
          placeholder={tags.length === 0 ? placeholder : ""}
          aria-label="Add tag"
        />
      </div>
    </div>
  );
}

