import "./globals.css";

export const metadata = {
  title: "Organization Management System",
  description: "Field reporting, HR, attendance, and letter management platform",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
