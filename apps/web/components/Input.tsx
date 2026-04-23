export default function Input({ value, onChange, placeholder }) {
  return (
    <input
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      style={{
        padding: "12px",
        background: "var(--color-bg-alt)",
        border: "1px solid var(--color-text-muted)",
        borderRadius: "var(--radius-md)",
        color: "var(--color-text)",
        fontFamily: "var(--font-body)",
        width: "100%",
        marginBottom: "var(--space-3)",
      }}
    />
  );
}
