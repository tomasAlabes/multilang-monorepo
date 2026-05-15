import type { ReactNode } from "react";

export const metadata = {
  title: "Greenhouse Monitoring",
  description: "Live climate telemetry and anomaly detection",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body style={{ fontFamily: "system-ui, sans-serif", margin: 0, background: "#f8f9fa" }}>
        {children}
      </body>
    </html>
  );
}
