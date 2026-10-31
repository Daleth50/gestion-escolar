"use client";
import { useCallback, useEffect, useState } from "react";
import { mensajeError } from "@/lib/errores";
import { profesoresService } from "../../profesores/services/profesoresService";
import type { Profesor } from "../../profesores/models/Profesor";
import type { Materia, MateriaInput } from "../models/Materia";
import { materiasService } from "../services/materiasService";

const vacio: MateriaInput = { clave: "", nombre: "", creditos: 5, profesorId: null };

export function useMateriaViewModel() {
  const [materias, setMaterias] = useState<Materia[]>([]);
  const [profesores, setProfesores] = useState<Profesor[]>([]);
  const [form, setForm] = useState<MateriaInput>({ ...vacio });
  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const cargar = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [m, p] = await Promise.all([materiasService.listar(), profesoresService.listar()]);
      setMaterias(m);
      setProfesores(p);
    } catch (e) {
      setError(mensajeError(e, "No se pudieron cargar las materias"));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void cargar(); }, [cargar]);

  const actualizarCampo = <K extends keyof MateriaInput>(campo: K, valor: MateriaInput[K]) =>
    setForm(actual => ({ ...actual, [campo]: valor }));

  const editar = (materia: Materia) => {
    setEditandoId(materia.id);
    setForm({ clave: materia.clave, nombre: materia.nombre,
      creditos: materia.creditos, profesorId: materia.profesorId });
    setError("");
  };

  const cancelar = () => {
    setForm({ ...vacio });
    setEditandoId(null);
    setError("");
  };

  const guardar = async () => {
    if (!form.clave.trim() || !form.nombre.trim() || form.creditos < 1) {
      setError("Clave, nombre y créditos son obligatorios");
      return;
    }
    setLoading(true);
    setError("");
    try {
      if (editandoId) await materiasService.actualizar(editandoId, form);
      else await materiasService.crear(form);
      await cargar();
      cancelar();
    } catch (e) {
      setError(mensajeError(e, "No se pudo guardar la materia"));
    } finally {
      setLoading(false);
    }
  };

  const eliminar = async (id: string) => {
    setLoading(true);
    setError("");
    try {
      await materiasService.eliminar(id);
      await cargar();
    } catch (e) {
      setError(mensajeError(e, "No se pudo eliminar la materia"));
    } finally {
      setLoading(false);
    }
  };

  return { materias, profesores, form, editandoId, loading, error, cargar,
    actualizarCampo, editar, guardar, eliminar, cancelar };
}
