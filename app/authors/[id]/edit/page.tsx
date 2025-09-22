"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";

/* ---------------- Tipos simples ---------------- */
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
type Errors = Partial<Record<"name" | "description" | "birthDate" | "image" | "general", string>>;

/* ---------------- Página de edición (client) ---------------- */
export default function EditAuthorPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState<Errors>({});
  const [saving, setSaving] = useState(false);

  // campos del formulario
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [image, setImage] = useState("");
  const [books, setBooks] = useState<Book[]>([]);
  const [prizes, setPrizes] = useState<Prize[]>([]);

  const todayISO = useMemo(() => new Date().toISOString().slice(0, 10), []);

  // Cargar autor
  useEffect(() => {
    let active = true;
    async function load() {
      try {
        const res = await fetch(`http://127.0.0.1:8080/api/authors/${id}`, { cache: "no-store" });
        const a: Author = await res.json();
        if (!active) return;
        setName(a.name ?? "");
        setDescription(a.description ?? "");
        setBirthDate(a.birthDate ?? "");
        setImage(a.image ?? "");
        setBooks(a.books ?? []);
        setPrizes(a.prizes ?? []);
      } finally {
        if (active) setLoading(false);
      }
    }
    load();
    return () => { active = false; };
  }, [id]);

  function validate(values: { name: string; description: string; birthDate: string; image: string }): Errors {
    const e: Errors = {};
    const vName = values.name.trim();
    const vDesc = values.description.trim();
    const vDate = values.birthDate;
    const vImg = values.image.trim();

    if (!vName) e.name = "El nombre es requerido.";
    else if (vName.length < 2) e.name = "Mínimo 2 caracteres.";
    else if (vName.length > 80) e.name = "Máximo 80 caracteres.";

    if (!vDesc) e.description = "La descripción es requerida.";
    else if (vDesc.length < 10) e.description = "Mínimo 10 caracteres.";
    else if (vDesc.length > 600) e.description = "Máximo 600 caracteres.";

    if (!vDate) e.birthDate = "La fecha es requerida.";
    else {
      const d = new Date(vDate);
      if (Number.isNaN(d.getTime())) e.birthDate = "Fecha inválida.";
      else {
        if (vDate < "1800-01-01") e.birthDate = "La fecha es demasiado antigua.";
        if (vDate > todayISO) e.birthDate = "No puede ser futura.";
      }
    }

    const urlOk = /^https?:\/\/.+/i.test(vImg); //expresiones regulares para validar que inicie con http o https, sirven los dos casos.
    const extOk = /\.(png|jpe?g|webp|gif|bmp|svg)(\?.*)?$/i.test(vImg); //experesiones regulares para validar el tipo de archivo en la url
    if (!vImg) e.image = "La URL de imagen es requerida.";
    else if (!urlOk) e.image = "Debe iniciar con http:// o https://";
    else if (!extOk) e.image = "Debe ser una imagen (.jpg, .png, .webp, etc.).";

    return e;
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrors({});

    const values = { name, description, birthDate, image };
    const eObj = validate(values);
    if (Object.keys(eObj).length > 0) {
      setErrors(eObj);
      return;
    }

    try // se hace try catch por si la api no responde o da error, evitando posibles errores. 
    {
      setSaving(true);
      await fetch(`http://127.0.0.1:8080/api/authors/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: Number(id),
          ...values, //con esto se copian los valores del objeto values, operación spread
          books: books ?? [], //si books es null o undefined, se envía un array vacío
          prizes: prizes ?? [], //si prizes es null o undefined, se envía un array vacío
          //estos dos casos pueden suceder quizás a la hora de crear el autor y no tener libros, o que simplemente no tenga premios como tal.
        }),
      });
      router.push("/authors");
      router.refresh();
    } catch 
    {
      setErrors({ general: "No se pudo actualizar. Revisa la API." });
    } finally 
    {
      setSaving(false);
    }
  }

  if (loading) 
  {
    return (
      <section className="rounded-2xl border bg-white p-4">
        <p className="text-gray-600">Cargando autor...</p>
      </section>
    );
  }

  return (
<section className="rounded-2xl border bg-white p-4 dark:bg-zinc-900 dark:border-zinc-800">
  <h2 className="mb-3 text-xl font-semibold text-gray-900 dark:text-zinc-100">Editar autor</h2>

  <form onSubmit={onSubmit} noValidate className="grid max-w-xl gap-4">
    <div>
      <label className="grid gap-3 sm:grid-cols-2">Nombre</label>
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        required minLength={2} maxLength={80}
        className="mt-1 w-full min-h-24 rounded-lg border px-3 py-2 border-gray-300 bg-white text-gray-900 placeholder:text-gray-500 focus:border-gray-600"/>
      {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name}</p>}
    </div>

    <div>
      <label className="grid gap-3 sm:grid-cols-2">Descripción</label>
      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        required minLength={10} maxLength={600}
        className="mt-1 w-full min-h-24 rounded-lg border px-3 py-2 border-gray-300 bg-white text-gray-900 placeholder:text-gray-500 focus:border-gray-600"/>
      {errors.description && <p className="mt-1 text-xs text-red-500">{errors.description}</p>}
    </div>

    <div className="grid gap-4 sm:grid-cols-2">
      <div>
        <label className="grid gap-3 sm:grid-cols-2">Fecha de nacimiento</label>
        <input
          type="date"
          value={birthDate}
          onChange={(e) => setBirthDate(e.target.value)}
          required min="1800-01-01" max={todayISO}
          className="mt-1 w-full rounded-lg border px-3 py-2 border-gray-300 bg-white text-gray-900 focus:border-gray-600"/>
        {errors.birthDate && <p className="mt-1 text-xs text-red-500">{errors.birthDate}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-900 dark:text-zinc-100">URL de imagen</label>
        <input
          value={image}
          onChange={(e) => setImage(e.target.value)}
          required placeholder="https://.../foto.jpg"
          className="mt-1 w-full rounded-lg border px-3 py-2 border-gray-300 bg-white text-gray-900 focus:border-gray-600"/>
        {errors.image && <p className="mt-1 text-xs text-red-500">{errors.image}</p>}
      </div>
    </div>

    {errors.general && <p className="text-sm text-red-500">{errors.general}</p>}

    <div className="mt-1 flex gap-2">
      <button
        type="submit" disabled={saving}
        className="rounded-lg border border-gray-900 bg-gray-900 px-4 py-2 text-white">
        {saving ? "Guardando..." : "Guardar cambios"}
      </button>
      <a
        href="/authors"
        className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 hover:bg-gray-50 dark:border-zinc-700">
        Cancelar
      </a>
    </div>
  </form>
</section>

  );
}
