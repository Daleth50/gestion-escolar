"use client";
import { useCallback, useEffect, useState } from "react";
import { mensajeError } from "@/lib/errores";
import { gruposService } from "@/modules/grupos/services/gruposService";
import type { Grupo } from "@/modules/grupos/models/Grupo";
import type { Alumno, AlumnoInput } from "../models/Alumno";
import { alumnosService } from "../services/alumnosService";

const vacio: AlumnoInput = { matricula: "", nombre: "", correo: "", grupoId: null };

export function useAlumnosViewModel() {
  const [alumnos, setAlumnos] = useState<Alumno[]>([]);
  const [grupos, setGrupos] = useState<Grupo[]>([]);
  const [form, setForm] = useState<AlumnoInput>({ ...vacio });
  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const cargar = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [a, g] = await Promise.all([alumnosService.listar(), gruposService.listar()]);
      setAlumnos(a);
      setGrupos(g);
    } catch (e) {
      setError(mensajeError(e, "No se pudieron cargar los alumnos"));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void cargar(); }, [cargar]);

  const actualizarCampo = (campo: keyof AlumnoInput, valor: string | null) =>
    setForm(actual => ({ ...actual, [campo]: valor }));

  const editar = (alumno: Alumno) => {
    setEditandoId(alumno.id);
    setForm({ matricula: alumno.matricula, nombre: alumno.nombre,
      correo: alumno.correo, grupoId: alumno.grupoId });
    setError("");
  };

  const cancelar = () => {
    setForm({ ...vacio });
    setEditandoId(null);
    setError("");
  };

  const guardar = async () => {
    if (!form.matricula.trim() || !form.nombre.trim() || !form.correo.trim()) {
      setError("Matrícula, nombre y correo son obligatorios");
      return;
    }
    setLoading(true);
    setError("");
    try {
      if (editandoId) await alumnosService.actualizar(editandoId, form);
      else await alumnosService.crear(form);
      await cargar();
      cancelar();
    } catch (e) {
      setError(mensajeError(e, "No se pudo guardar el alumno"));
    } finally {
      setLoading(false);
    }
  };

  const eliminar = async (id: string) => {
    setLoading(true);
    setError("");
    try {
      await alumnosService.eliminar(id);
      await cargar();
    } catch (e) {
      setError(mensajeError(e, "No se pudo eliminar el alumno"));
    } finally {
      setLoading(false);
    }
  };

  return { alumnos, grupos, form, editandoId, loading, error, cargar,
    actualizarCampo, editar, guardar, eliminar, cancelar };
}
