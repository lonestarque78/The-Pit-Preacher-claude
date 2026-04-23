export default function Button({ children, onClick, style = {} }) {
  return (
    <button
      onClick={onClick}
      style={{
        background: "var(--color-accent)",
        color: "black",
        padding: "12px 20px",
        borderRadius: "var(--radius-lg)",
        border: "none",
        fontSize: "16px",
        cursor: "pointer",
        boxShadow: "0 0 12px rgba(255,106,0,0.4)",
        ...style,
      }}
    >
      {children}
    </button>
  );
}
