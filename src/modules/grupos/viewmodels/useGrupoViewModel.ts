"use client";
import { useCallback, useEffect, useState } from "react";
import { mensajeError } from "@/lib/errores";
import { materiasService } from "../../materias/services/materiasService";
import type { Materia } from "../../materias/models/Materia";
import type { Grupo, GrupoInput } from "../models/Grupo";
import { gruposService } from "../services/gruposService";

const vacio: GrupoInput = { clave: "", semestre: 1, cicloEscolar: "2026-2027", materiaIds: [] };

export function useGrupoViewModel() {
  const [grupos, setGrupos] = useState<Grupo[]>([]);
  const [materias, setMaterias] = useState<Materia[]>([]);
  const [form, setForm] = useState<GrupoInput>({ ...vacio });
  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const cargar = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [g, m] = await Promise.all([gruposService.listar(), materiasService.listar()]);
      setGrupos(g);
      setMaterias(m);
    } catch (e) {
      setError(mensajeError(e, "No se pudieron cargar los grupos"));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void cargar(); }, [cargar]);

  const actualizarCampo = <K extends keyof GrupoInput>(campo: K, valor: GrupoInput[K]) =>
    setForm(actual => ({ ...actual, [campo]: valor }));

  const alternarMateria = (materiaId: string, marcada: boolean) =>
    setForm(actual => ({ ...actual, materiaIds: marcada
      ? [...actual.materiaIds, materiaId]
      : actual.materiaIds.filter(id => id !== materiaId) }));

  const editar = (grupo: Grupo) => {
    setEditandoId(grupo.id);
    setForm({ clave: grupo.clave, semestre: grupo.semestre,
      cicloEscolar: grupo.cicloEscolar, materiaIds: grupo.materiaIds });
    setError("");
  };

  const cancelar = () => {
    setForm({ ...vacio });
    setEditandoId(null);
    setError("");
  };

  const guardar = async () => {
    if (!form.clave.trim() || !form.cicloEscolar.trim() || form.semestre < 1) {
      setError("Clave, semestre y ciclo escolar son obligatorios");
      return;
    }
    setLoading(true);
    setError("");
    try {
      if (editandoId) await gruposService.actualizar(editandoId, form);
      else await gruposService.crear(form);
      await cargar();
      cancelar();
    } catch (e) {
      setError(mensajeError(e, "No se pudo guardar el grupo"));
    } finally {
      setLoading(false);
    }
  };

  const eliminar = async (id: string) => {
    setLoading(true);
    setError("");
    try {
      await gruposService.eliminar(id);
      await cargar();
    } catch (e) {
      setError(mensajeError(e, "No se pudo eliminar el grupo"));
    } finally {
      setLoading(false);
    }
  };

  return { grupos, materias, form, editandoId, loading, error, cargar,
    actualizarCampo, alternarMateria, editar, guardar, eliminar, cancelar };
}
