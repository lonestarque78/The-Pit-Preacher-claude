import React from "react";

type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  style?: React.CSSProperties;
};

export default function Input({ value, onChange, placeholder, style, type = "text", ...rest }: InputProps) {
  return (
    <input
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      style={{
        padding: "12px",
        background: "var(--color-bg-alt)",
        border: "1px solid var(--color-border)",
        borderRadius: "var(--radius-md)",
        color: "var(--color-text)",
        fontFamily: "var(--font-body)",
        fontSize: "1rem",
        width: "100%",
        marginBottom: "var(--space-3)",
        boxSizing: "border-box",
        ...style,
      }}
      {...rest}
    />
  );
}
