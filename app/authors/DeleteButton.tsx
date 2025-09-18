"use client";
import { useRouter } from "next/navigation";

export default function DeleteButton({ id }: { id: number }) {
  const router = useRouter();
  const onDelete = async () => {
    if (!confirm("¿Eliminar este autor?")) return;
    await fetch(`http://127.0.0.1:8080/api/authors/${id}`, { method: "DELETE" });
    router.refresh();
  };
  return (
    <button onClick={onDelete} style={{ padding: "6px 10px", border: "1px solid #f3c2c2", color: "#b00020", borderRadius: 8, background: "#fff" }}>
      Eliminar
    </button>
  );
}
