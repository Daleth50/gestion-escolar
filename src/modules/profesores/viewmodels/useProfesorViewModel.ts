"use client";
import { useCallback, useEffect, useState } from "react";
import { mensajeError } from "@/lib/errores";
import { profesoresService, type Profesor, type ProfesorInput } from "../services/profesoresService";

const vacio: ProfesorInput = { nombre: "", correo: "", especialidad: "", estatus: "Activo" };

export function useProfesoresViewModel() {
  const [profesores, setProfesores] = useState<Profesor[]>([]);
  const [form, setForm] = useState<ProfesorInput>({ ...vacio });
  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const cargar = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      setProfesores(await profesoresService.listar());
    } catch (e) {
      setError(mensajeError(e, "No se pudieron cargar los profesores"));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void cargar(); }, [cargar]);

  const actualizarCampo = (campo: keyof ProfesorInput, valor: string) =>
    setForm(actual => ({ ...actual, [campo]: valor }));

  const editar = (profesor: Profesor) => {
    setEditandoId(profesor.id);
    setForm({ nombre: profesor.nombre, correo: profesor.correo,
      especialidad: profesor.especialidad ?? "", estatus: profesor.estatus });
    setError("");
  };

  const cancelar = () => {
    setForm({ ...vacio });
    setEditandoId(null);
    setError("");
  };

  const guardar = async () => {
    if (!form.nombre.trim() || !form.correo.trim()) {
      setError("Nombre y correo son obligatorios");
      return;
    }
    setLoading(true);
    setError("");
    try {
      if (editandoId) await profesoresService.actualizar(editandoId, form);
      else await profesoresService.crear(form);
      await cargar();
      cancelar();
    } catch (e) {
      setError(mensajeError(e, "No se pudo guardar el profesor"));
    } finally {
      setLoading(false);
    }
  };

  const eliminar = async (id: string) => {
    setLoading(true);
    setError("");
    try {
      await profesoresService.eliminar(id);
      await cargar();
    } catch (e) {
      setError(mensajeError(e, "No se pudo eliminar el profesor"));
    } finally {
      setLoading(false);
    }
  };

  return { profesores, form, editandoId, loading, error, cargar,
    actualizarCampo, editar, guardar, eliminar, cancelar };
}
