export const metadata = { title: "Autores", description: "CRUD Autores de Libros" };
import "./globals.css";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className="min-h-dvh bg-gray-50 text-gray-900 dark:bg-zinc-950 dark:text-zinc-100">
        <header className="border-b bg-white dark:bg-zinc-900 dark:border-zinc-800">
          <div className="mx-auto flex max-w-4xl items-center gap-3 px-4 py-3">
            <a href="/authors" className="font-bold">Autores</a>
            <a href="/crear"className="ml-auto rounded-lg border border-gray-300 px-3 py-1.5 text-sm hover:bg-gray-50 dark:border-zinc-700 dark:hover:bg-zinc-800">
              Crear autor
            </a>
          </div>
        </header>
        <main className="mx-auto max-w-4xl px-4 py-6">{children}</main>
      </body>
    </html>
  );
}
