import "./globals.css";

export const metadata = {
  title: "Nook | Small things, beautifully chosen",
  description: "A considered collection for slower, better everyday rituals."
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
