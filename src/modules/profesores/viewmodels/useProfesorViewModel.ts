"use client";
import { useCallback, useEffect, useState } from "react";
import { getApiErrorMessage } from "@/lib/api";
import type { Profesor, ProfesorInput } from "../models/Profesor";
import { profesoresService } from "../services/profesoresService";

const vacio: ProfesorInput = {
  nombre: "",
  correo: "",
  especialidad: "",
  activo: true,
};

export function useProfesorViewModel() {
  const [profesores, setProfesores] = useState<Profesor[]>([]);
  const [form, setForm] = useState<ProfesorInput>({ ...vacio });
  const [id, setId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const cargar = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      setProfesores(await profesoresService.listar());
    } catch (loadError) {
      setError(
        getApiErrorMessage(
          loadError,
          "No se pudieron cargar los profesores",
        ),
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void cargar();
  }, [cargar]);

  const campo = <K extends keyof ProfesorInput>(
    key: K,
    value: ProfesorInput[K],
  ) => setForm((current) => ({ ...current, [key]: value }));

  const editar = (profesor: Profesor) => {
    setId(profesor.id);
    setForm({
      nombre: profesor.nombre,
      correo: profesor.correo,
      especialidad: profesor.especialidad ?? "",
      activo: profesor.activo,
    });
    setError("");
  };

  const cancelar = () => {
    setId(null);
    setForm({ ...vacio });
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
      if (id) await profesoresService.actualizar(id, form);
      else await profesoresService.crear(form);
      setForm({ ...vacio });
      setId(null);
    } catch (saveError) {
      setError(
        getApiErrorMessage(saveError, "No se pudo guardar el profesor"),
      );
      setLoading(false);
      return;
    }
    try {
      setProfesores(await profesoresService.listar());
    } catch (loadError) {
      setError(
        `El cambio se guardó, pero no se pudo actualizar la lista: ${getApiErrorMessage(
          loadError,
          "Error al cargar profesores",
        )}`,
      );
    } finally {
      setLoading(false);
    }
  };

  const eliminar = async (profesorId: string) => {
    setLoading(true);
    setError("");
    try {
      await profesoresService.eliminar(profesorId);
      setProfesores((current) =>
        current.filter((profesor) => profesor.id !== profesorId),
      );
      if (id === profesorId) cancelar();
    } catch (deleteError) {
      setError(
        getApiErrorMessage(deleteError, "No se pudo eliminar el profesor"),
      );
      setLoading(false);
      return;
    }
    try {
      setProfesores(await profesoresService.listar());
    } catch (loadError) {
      setError(
        `El profesor se eliminó, pero no se pudo actualizar la lista: ${getApiErrorMessage(
          loadError,
          "Error al cargar profesores",
        )}`,
      );
    } finally {
      setLoading(false);
    }
  };

  return {
    profesores,
    form,
    id,
    loading,
    error,
    campo,
    editar,
    guardar,
    eliminar,
    cancelar,
  };
}
