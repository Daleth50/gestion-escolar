"use client";
import { useState } from "react";
import type { Alumno, AlumnoInput } from "../models/Alumno";
import { alumnosService } from "../services/alumnosService";
const vacio: AlumnoInput = { matricula: "", nombre: "", correo: "", grupo: "" };
export function useAlumnosViewModel() {
  const [alumnos, setAlumnos] = useState<Alumno[]>(() =>
    alumnosService.listar(),
  );
  const [form, setForm] = useState<AlumnoInput>({ ...vacio });
  const [editId, setEditId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const actualizarCampo = (k: keyof AlumnoInput, v: string) =>
    setForm((f) => ({ ...f, [k]: v }));
  const refrescar = () => setAlumnos(alumnosService.listar());
  const cancelar = () => {
    setForm({ ...vacio });
    setEditId(null);
    setError("");
  };
  const editar = (a: Alumno) => {
    setEditId(a.id);
    setForm({
      matricula: a.matricula,
      nombre: a.nombre,
      correo: a.correo,
      grupo: a.grupo,
    });
    setError("");
  };
  const guardar = () => {
    if (Object.values(form).some((v) => !v.trim())) {
      setError("Campos obligatorios");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.correo)) {
      setError("Correo inválido");
      return;
    }
    try {
      if (editId) alumnosService.actualizar(editId, form);
      else alumnosService.crear(form);
      refrescar();
      cancelar();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error al guardar");
    }
  };
  const eliminar = (id: string) => {
    alumnosService.eliminar(id);
    refrescar();
  };
  return {
    alumnos,
    form,
    editId,
    error,
    actualizarCampo,
    editar,
    guardar,
    eliminar,
    cancelar,
  };
}
