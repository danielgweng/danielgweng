import "./globals.css";

export const metadata = {
  title: "Regulars — Same crew. Same night. Every week.",
  description:
    "Regulars places you in a fixed crew of six that meets weekly — board games, bouldering, run + pint, coffee. Sign up from anywhere; crews launch where six line up. Claim an open spot.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
