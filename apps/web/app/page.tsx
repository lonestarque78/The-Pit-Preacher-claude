import Link from "next/link";
import Button from "@/components/Button";

export default function Home() {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "var(--space-5)",
        background: "var(--color-bg)",
      }}
    >
      <main
        style={{
          maxWidth: "600px",
          textAlign: "center",
        }}
      >
        <h1
          style={{
            fontFamily: "var(--font-heading)",
            fontSize: "clamp(2.5rem, 5vw, 4rem)",
            fontWeight: 400,
            color: "var(--color-text)",
            marginBottom: "var(--space-4)",
            lineHeight: 1.2,
          }}
        >
          Pit Preacher
        </h1>

        <p
          style={{
            fontFamily: "var(--font-heading)",
            fontSize: "clamp(1.25rem, 3vw, 1.75rem)",
            fontWeight: 400,
            color: "var(--color-accent)",
            marginBottom: "var(--space-4)",
            fontStyle: "italic",
          }}
        >
          25 years of backyard wisdom. One app to carry it all.
        </p>

        <p
          style={{
            fontFamily: "var(--font-body)",
            fontSize: "1.125rem",
            color: "var(--color-text-muted)",
            marginBottom: "var(--space-5)",
            lineHeight: 1.6,
          }}
        >
          Pit Preacher is your personal BBQ coaching companion. Track your cooks, 
          manage your pits, and follow proven templates from decades of smoking 
          experience. No AI fluff — just real barbecue wisdom.
        </p>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "var(--space-3)",
            alignItems: "center",
          }}
        >
          <Link href="/prep">
            <Button>Start Your Cook</Button>
          </Link>

          <Link
            href="/auth/login"
            style={{
              fontFamily: "var(--font-ui)",
              fontSize: "0.875rem",
              color: "var(--color-text-muted)",
              textDecoration: "underline",
              textUnderlineOffset: "4px",
            }}
          >
            Log In
          </Link>
        </div>
      </main>
    </div>
  );
}
            height={16}
          />
          Examples
        </a>
        <a
          href="https://turborepo.dev?utm_source=create-turbo"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            aria-hidden
            src="/globe.svg"
            alt="Globe icon"
            width={16}
            height={16}
          />
          Go to turborepo.dev →
        </a>
      </footer>
    </div>
  );
}
