import "./globals.css";

export const metadata = {
  title: "Regulars — Same crew. Same night. Every week. | Toronto Pilot",
  description:
    "Regulars places you in a fixed crew of six that meets weekly — bouldering, 5-a-side, run + pint. Toronto pilot now forming. Claim an open spot.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
