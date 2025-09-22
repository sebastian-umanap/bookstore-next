import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

const API = "http://127.0.0.1:8080";

type Editorial = { id: number; name: string };
type Book = { id: number; name: string; isbn: string; image: string; publishingDate: string; description: string; editorial: Editorial };
type Org = { id: number; name: string; tipo: string };
type Prize = { id: number; premiationDate: string; name: string; description: string; organization: Org };
type Author = { id: number; birthDate: string; name: string; description: string; image: string; books: Book[]; prizes: Prize[] };

async function getAuthors(): Promise<Author[]> {
  const r = await fetch(`${API}/api/authors`, { cache: "no-store" });
  return r.json();
}

async function deleteBook(authorId: number, bookId: number) {
  let r = await fetch(`${API}/api/books/${bookId}`, { method: "DELETE", cache: "no-store" });
  if (!r.ok) {
    await fetch(`${API}/api/authors/${authorId}/books/${bookId}`, { method: "DELETE", cache: "no-store" });
  }
}

// Prizes bastante problemáticos para borrar el author, hay mucho acoplamiento y dificulta el borrar un autor que tenga premios
async function detachAndDeletePrize(prizeId: number): Promise<boolean> {
  const patchBodies = [
    { author: null },
    { authorId: null },
    { remove: true },
  ];
  for (const body of patchBodies) {
    const patch = await fetch(`${API}/api/prizes/${prizeId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
      body: JSON.stringify(body),
    });
    if (patch.ok) {
      const del = await fetch(`${API}/api/prizes/${prizeId}`, { method: "DELETE", cache: "no-store" });
      if (del.ok) return true;
    }
  }

  const getRes = await fetch(`${API}/api/prizes/${prizeId}`, { cache: "no-store" });
  if (getRes.ok) {
    const p = await getRes.json();
    const putBodies = [
      { ...p, author: null },
      { id: p?.id, author: null },
      { ...p, authorId: null },
    ];
    for (const body of putBodies) {
      const put = await fetch(`${API}/api/prizes/${prizeId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        cache: "no-store",
        body: JSON.stringify(body),
      });
      if (put.ok) {
        const del = await fetch(`${API}/api/prizes/${prizeId}`, { method: "DELETE", cache: "no-store" });
        if (del.ok) return true;
      }
    }
  }

  const finalDel = await fetch(`${API}/api/prizes/${prizeId}`, { method: "DELETE", cache: "no-store" });
  return finalDel.ok;
}

async function deleteAuthor(formData: FormData) {
  "use server";
  const id = Number(formData.get("id"));
  if (!id) return;

  // intento directo
  let del = await fetch(`${API}/api/authors/${id}`, { method: "DELETE", cache: "no-store" });
  if (del.ok) {
    revalidatePath("/authors");
    redirect("/authors?deleted=1");
  }

  // traigo autor y relaciones
  const aRes = await fetch(`${API}/api/authors/${id}`, { cache: "no-store" });
  const a: Author = await aRes.json();

  // borro libros
  for (const b of a.books || []) {
    await deleteBook(id, Number(b.id));
  }

  // desasocio/borro premios
  const pfails: number[] = [];
  for (const p of a.prizes || []) {
    const pid = Number((p as any).id ?? 0);
    if (!pid) continue;
    const ok = await detachAndDeletePrize(pid);
    if (!ok) pfails.push(pid);
  }

  // reintento borrar autor
  del = await fetch(`${API}/api/authors/${id}`, { method: "DELETE", cache: "no-store" });

  revalidatePath("/authors");
  if (del.ok) {
    redirect("/authors?deleted=1");
  } else {
    redirect(`/authors?error=1&code=${del.status || 0}&pfails=${pfails.join(",")}`);
  }
}

export default async function AuthorsPage({
  searchParams,
}: {
  searchParams: Promise<{ deleted?: string; error?: string; code?: string; pfails?: string }>;
}) {
  const sp = await searchParams;
  const authors = await getAuthors();

  return (
    <section className="space-y-4">
      {sp?.deleted && (
        <div className="rounded-md border p-2 text-sm bg-green-50 text-green-800 dark:bg-green-900/30 dark:text-green-300">
          Autor eliminado.
        </div>
      )}
      {sp?.error && (
        <div className="rounded-md border p-2 text-sm bg-red-50 text-red-800 dark:bg-red-900/30 dark:text-red-300">
          No se pudo eliminar. status: {sp.code || "?"} {sp.pfails ? `(prizes que no se borraron: ${sp.pfails})` : ""}
        </div>
      )}

      {authors.map((a) => (
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
                <a href={`/authors/${a.id}/edit`} className="rounded border px-3 py-1 text-sm border-gray-300 hover:bg-gray-100 dark:border-zinc-700 dark:hover:bg-zinc-800">
                  Editar
                </a>
                <form method="post">
                  <input type="hidden" name="id" value={a.id} />
                  <button formAction={deleteAuthor} type="submit" className="rounded border px-3 py-1 text-sm border-red-300 text-red-700 hover:bg-red-50">
                    Eliminar
                  </button>
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
      ))}
    </section>
  );
}
