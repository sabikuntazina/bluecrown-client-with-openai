import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import LayoutWrapper from "@/components/LayoutWrapper";

export const viewport = {
  width: "device-width",
  initialScale: 1,
};

export const metadata = {
  title: "BlueCrown | Modern Crowdfunding Platform",
  description: "Crowdfund your dreams, campaigns, causes, and innovative projects. Connect with supporters and raise credits today.",
  keywords: "crowdfunding, kickstarter, indiegogo, credits, raise money, support, creators, developers",
  authors: [{ name: "Sabikun Tazin" }],
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="h-full">
      <head>
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body className="min-h-screen bg-slate-50 text-slate-900 antialiased selection:bg-blue-500 selection:text-white">
        <AuthProvider>
          <LayoutWrapper>
            {children}
          </LayoutWrapper>
        </AuthProvider>
      </body>
    </html>
  );
}
