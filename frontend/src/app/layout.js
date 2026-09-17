import "./globals.css";
import Script from "next/script";
import { AuthProvider } from "../context/AuthContext";

export const metadata = {
  title: "EmployeeHub - Modern Employee & Task Management Platform",
  description: "Enterprise-grade employee management, tasks, and attendance tracking system",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="h-full antialiased">
      <head>
        <Script
          src="https://accounts.google.com/gsi/client"
          strategy="afterInteractive"
        />
      </head>
      <body className="min-h-full flex flex-col bg-slate-50 text-slate-900">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
