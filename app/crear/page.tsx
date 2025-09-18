"use client";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

type Errors = Partial<Record<"name" | "description" | "birthDate" | "image" | "general", string>>;

export default function CrearAutorPage() {
  const router = useRouter();
  const [errors, setErrors] = useState<Errors>({});
  const [sending, setSending] = useState(false);
  const todayISO = useMemo(() => new Date().toISOString().slice(0, 10), []);

  function validate(values: { name: string; description: string; birthDate: string; image: string }): Errors {
    const e: Errors = {};
    const name = values.name.trim();
    const description = values.description.trim();
    const birthDate = values.birthDate;
    const image = values.image.trim();

    if (!name) e.name = "El nombre es requerido.";
    else if (name.length < 2) e.name = "Mínimo 2 caracteres.";
    else if (name.length > 80) e.name = "Máximo 80 caracteres.";

    if (!description) e.description = "La descripción es requerida.";
    else if (description.length < 10) e.description = "Mínimo 10 caracteres.";
    else if (description.length > 600) e.description = "Máximo 600 caracteres.";

    if (!birthDate) e.birthDate = "La fecha es requerida.";
    else {
      const d = new Date(birthDate);
      if (Number.isNaN(d.getTime())) e.birthDate = "Fecha inválida.";
      else {
        if (birthDate < "1800-01-01") e.birthDate = "La fecha es demasiado antigua.";
        if (birthDate > todayISO) e.birthDate = "No puede ser futura.";
      }
    }

    const urlOk = /^https?:\/\/.+/i.test(image);
    const extOk = /\.(png|jpe?g|webp|gif|bmp|svg)(\?.*)?$/i.test(image);
    if (!image) e.image = "La URL de imagen es requerida.";
    else if (!urlOk) e.image = "Debe iniciar con http:// o https://";
    else if (!extOk) e.image = "Debe ser una imagen (.jpg, .png, .webp, etc.).";

    return e;
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrors({});
    const form = e.currentTarget;
    const data = new FormData(form);
    const values = {
      name: String(data.get("name") || "").trim(),
      description: String(data.get("description") || "").trim(),
      birthDate: String(data.get("birthDate") || ""),
      image: String(data.get("image") || "").trim(),
    };

    const eObj = validate(values);
    if (Object.keys(eObj).length > 0) {
      setErrors(eObj);
      return;
    }

    try {
      setSending(true);
      await fetch("http://127.0.0.1:8080/api/authors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...values, books: [], prizes: [] }),
      });
      router.push("/authors");
      router.refresh();
    } catch {
      setErrors({ general: "No se pudo crear el autor. Revisa la API." });
    } finally {
      setSending(false);
    }
  }

  return (
    <section className="rounded-2xl border bg-white p-4">
      <h2 className="mb-2 text-xl font-semibold">Crear autor</h2>

      <form onSubmit={onSubmit} noValidate className="grid max-w-xl gap-3">
        <div>
          <label className="block text-sm font-medium text-gray-700">Nombre</label>
          <input
            name="name"
            placeholder="Ej: J. K. Rowling"
            required
            minLength={2}
            maxLength={80}
            className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-gray-500"
          />
          {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Descripción</label>
          <textarea
            name="description"
            placeholder="Breve biografía o descripción..."
            required
            minLength={10}
            maxLength={600}
            className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-gray-500 min-h-24"
          />
          {errors.description && <p className="mt-1 text-xs text-red-600">{errors.description}</p>}
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-gray-700">Fecha de nacimiento</label>
            <input
              type="date"
              name="birthDate"
              required
              min="1800-01-01"
              max={todayISO}
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-gray-500"
            />
            {errors.birthDate && <p className="mt-1 text-xs text-red-600">{errors.birthDate}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">URL de imagen</label>
            <input
              name="image"
              placeholder="https://.../foto.jpg"
              required
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-gray-500"
            />
            {errors.image && <p className="mt-1 text-xs text-red-600">{errors.image}</p>}
          </div>
        </div>

        {errors.general && <p className="text-sm text-red-600">{errors.general}</p>}

        <div className="mt-2 flex gap-2">
          <button
            type="submit"
            disabled={sending}
            className="rounded-lg border border-gray-900 bg-gray-900 px-4 py-2 text-white disabled:opacity-60"
          >
            {sending ? "Guardando..." : "Guardar"}
          </button>
          <a
            href="/authors"
            className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 hover:bg-gray-50"
          >
            Cancelar
          </a>
        </div>
      </form>
    </section>
  );
}
