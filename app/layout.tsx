export const metadata = { title: "Autores", description: "CRUD" };
import "./globals.css";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className="min-h-dvh bg-gray-50 font-sans">
        <header className="border-b bg-white">
          <div className="mx-auto flex max-w-4xl items-center gap-3 px-4 py-3">
            <a href="/authors" className="font-semibold text-gray-900 hover:opacity-80">Autores</a>
            <a
              href="/crear"
              className="ml-auto rounded-lg border border-gray-300 px-3 py-1.5 text-sm hover:bg-gray-50"
            >
              Crear autor
            </a>
          </div>
        </header>
        <main className="mx-auto max-w-4xl px-4 py-6">{children}</main>
      </body>
    </html>
  );
}
