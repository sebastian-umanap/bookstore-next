type Editorial = { id: number; name: string };
type Book = { id: number; name: string; isbn: string; image: string; publishingDate: string; description: string; editorial: Editorial };
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

async function getAuthor(id: string): Promise<Author> {
  const res = await fetch(`http://127.0.0.1:8080/api/authors/${id}`, { cache: "no-store" });
  return res.json();
}


export default async function EditAuthorPage({ params }: { params: { id: string } }) {
  const a = await getAuthor(params.id);

  return (
    <section className="rounded-2xl border bg-white p-4">
      <h2 className="mb-2 text-xl font-semibold">Editar autor</h2>
      
    </section>
  );
}
