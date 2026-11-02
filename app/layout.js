import "./globals.css";

export const metadata = {
  title: "Labonno Maya | Premium lifestyle essentials",
  description: "Luxury everyday essentials, curated fashion, tech, and premium accessories."
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
