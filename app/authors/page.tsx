import { revalidatePath } from "next/cache";

type Editorial = { id: number; name: string };
type Book = {
  id: number; name: string; isbn: string; image: string;
  publishingDate: string; description: string; editorial: Editorial;
};
type Organization = { id: number; name: string; tipo: string };
type Prize = { id: number; premiationDate: string; name: string; description: string; organization: Organization };
type Author = {
  id: number;
  birthDate: string;
  name: string;
  description: string;
  image: string;
  books: Book[];
  prizes: Prize[];
};

async function getAuthors(): Promise<Author[]> {
  const res = await fetch("http://127.0.0.1:8080/api/authors", { cache: "no-store" });
  return res.json();
}

// --- Server Action simple para borrar ---
async function deleteAuthor(formData: FormData) {
  "use server";
  const id = Number(formData.get("id"));
  await fetch(`http://127.0.0.1:8080/api/authors/${id}`, { method: "DELETE" });
  revalidatePath("/authors");
}

export default async function AuthorsPage() {
  const authors = await getAuthors();

  return (
    <section className="grid gap-4">
      {authors.map((a) => (
        <article key={a.id} className="rounded-2xl border bg-white p-4">
          <div className="flex items-start gap-4">
            <img
              src={a.image}
              alt={a.name}
              className="h-28 w-24 rounded-md object-cover bg-gray-100"
            />

            <div className="flex-1">
              <h2 className="text-lg font-semibold text-gray-900">{a.name}</h2>
              <p className="text-sm text-gray-600">Nacimiento: {a.birthDate}</p>
              <p className="mt-1 text-gray-800">{a.description}</p>

              <div className="mt-2 text-sm text-gray-600">
                Libros: {a.books?.length ?? 0} — Premios: {a.prizes?.length ?? 0}
              </div>

              <div className="mt-3 flex gap-2">
                <a
                  href={`/authors/${a.id}/edit`}
                  className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm hover:bg-gray-50"
                >
                  Editar
                </a>

                {/* Borrado inline con Server Action */}
                <form action={deleteAuthor}>
                  <input type="hidden" name="id" value={a.id} />
                  <button
                    type="submit"
                    className="rounded-lg border border-red-300 bg-white px-3 py-1.5 text-sm text-red-700 hover:bg-red-50"
                  >
                    Eliminar
                  </button>
                </form>
              </div>

              {a.books?.length > 0 && (
                <div className="mt-4">
                  <p className="font-medium">Libros</p>
                  <ul className="mt-2 list-disc space-y-2 pl-5 text-sm text-gray-700">
                    {a.books.map((b) => (
                      <li key={b.id}>
                        <span className="font-semibold">{b.name}</span>{" "}
                        <span className="text-gray-600">
                          — ISBN: {b.isbn} — {b.publishingDate} — {b.editorial?.name}
                        </span>
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
