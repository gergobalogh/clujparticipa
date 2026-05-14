import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "ClujParticipa",
  description: "Civic participation prototype for Cluj-Napoca",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
