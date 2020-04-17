import React, { useRef } from "react";
import styles from "./Checkbox.module.scss";

export interface CheckboxProps {
  checked?: boolean;
  onChange: (checked: boolean) => void;
}

export function Checkbox({ checked, onChange }: CheckboxProps) {
  const ref = useRef<HTMLInputElement>(null);
  return (
    <div
      className={styles.Checkbox}
      onClick={() => onChange(ref.current!.checked)}
    >
      <input ref={ref} type="checkbox" checked={checked} onChange={() => {}} />
      <span className={styles.Checkmark}></span>
    </div>
  );
}
