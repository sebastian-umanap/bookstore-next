const API = "http://127.0.0.1:8080";

type Editorial = { id: number; name: string };
type Book = { id: number; name: string; isbn: string; image: string; publishingDate: string; description: string; editorial: Editorial };
type Org = { id: number; name: string; tipo: string };
type Prize = { id: number; premiationDate: string; name: string; description: string; organization: Org };
type Author = { id: number; birthDate: string; name: string; description: string; image: string; books: Book[]; prizes: Prize[] };

async function getAuthor(id: number): Promise<Author> {
  const r = await fetch(`${API}/api/authors/${id}`, { cache: "no-store" });
  if (!r.ok) throw new Error("No pude cargar el autor");
  return r.json();
}

export default async function AuthorDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const a = await getAuthor(Number(id));

  return (
    <section className="mx-auto max-w-3xl space-y-3">
      <a href="/authors" className="inline-block text-sm opacity-70 hover:opacity-100">
        ← Volver
      </a>

        <article key={a.id} className="rounded-xl border p-4 bg-white text-gray-900 dark:bg-zinc-900 dark:text-zinc-100">
          <div className="flex items-start gap-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={a.image} alt={a.name} className="h-28 w-24 rounded object-cover bg-gray-100 dark:bg-zinc-800" />
            <div className="flex-1">
              <h2 className="text-xl font-semibold">{a.name}</h2>
              <p className="text-sm opacity-70">Nacimiento: {a.birthDate}</p>
              <p className="mt-2 leading-relaxed">{a.description}</p>
              <div className="mt-3 text-sm opacity-70">Libros: {a.books?.length ?? 0} - Premios: {a.prizes?.length ?? 0}</div>

              <div className="mt-4 flex gap-2">
                <form method="post">
                  <input type="hidden" name="id" value={a.id} />
     
                </form>
              </div>

              {a.books?.length > 0 && (
                <div className="mt-6">
                  <p className="text-base font-medium">Libros</p>
                  <ul className="mt-2 list-disc pl-5 space-y-1 text-sm opacity-80">
                    {a.books.map((b) => (
                      <li key={b.id}>
                        <span className="font-medium">{b.name}</span>{" "}
                        <span>- ISBN: {b.isbn} - {b.publishingDate} - {b.editorial?.name}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </article>
    </section>
  );
}
