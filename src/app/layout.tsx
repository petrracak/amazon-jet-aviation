// O layout com <html> e <body> vive em [locale]/layout.tsx, porque o idioma
// precisa chegar ao atributo lang. Este aqui só repassa.
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
