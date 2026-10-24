import { api } from "@/lib/api";

export interface DashboardResumen {
  totalAlumnos: number;
  totalProfesores: number;
  totalMaterias: number;
  totalGrupos: number;
}

export const dashboardService = {
  async obtenerResumen(): Promise<DashboardResumen> {
    const { data } = await api.get<
      Record<keyof DashboardResumen, number | string>
    >("/reportes/resumen");
    return {
      totalAlumnos: Number(data.totalAlumnos),
      totalProfesores: Number(data.totalProfesores),
      totalMaterias: Number(data.totalMaterias),
      totalGrupos: Number(data.totalGrupos),
    };
  },
};
