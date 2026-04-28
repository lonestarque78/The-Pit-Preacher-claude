import React from "react";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  style?: React.CSSProperties;
};

export default function Button({ children, onClick, disabled, type = "button", style = {}, ...rest }: ButtonProps) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      style={{
        background: disabled ? "var(--color-bg-alt)" : "var(--color-accent)",
        color: disabled ? "var(--color-text-muted)" : "var(--color-bg)",
        padding: "12px 20px",
        borderRadius: "var(--radius-lg)",
        border: "none",
        fontSize: "16px",
        fontFamily: "var(--font-ui)",
        cursor: disabled ? "not-allowed" : "pointer",
        boxShadow: disabled ? "none" : "0 0 12px rgba(255,106,0,0.4)",
        transition: "background 0.15s, color 0.15s",
        ...style,
      }}
      {...rest}
    >
      {children}
    </button>
  );
}
