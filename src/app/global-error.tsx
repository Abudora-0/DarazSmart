"use client";

/**
 * Replaces the whole document, so it cannot rely on the root layout, its
 * fonts, or any of the theme tokens. Everything here is inline on purpose.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(160deg, #ff9650 0%, #f96a27 45%, #cb522f 100%)",
          fontFamily: "ui-sans-serif, system-ui, sans-serif",
          padding: "1.5rem",
        }}
      >
        <div
          style={{
            background: "rgba(255,255,255,0.92)",
            borderRadius: 28,
            padding: "2.5rem",
            maxWidth: 420,
            textAlign: "center",
            boxShadow: "0 40px 90px -30px rgba(120,45,10,0.45)",
          }}
        >
          <h1
            style={{
              margin: "0 0 0.5rem",
              fontSize: "1.25rem",
              color: "#1c1917",
            }}
          >
            DarazSmart hit an unexpected error
          </h1>
          <p
            style={{
              margin: "0 0 1.5rem",
              fontSize: "0.875rem",
              color: "#6d635a",
              lineHeight: 1.6,
            }}
          >
            Reloading usually clears it.
            {error.digest ? ` Reference: ${error.digest}` : ""}
          </p>
          <button
            onClick={reset}
            style={{
              background: "#f85e16",
              color: "#fff",
              border: "none",
              borderRadius: 16,
              padding: "0.75rem 1.5rem",
              fontSize: "0.875rem",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
