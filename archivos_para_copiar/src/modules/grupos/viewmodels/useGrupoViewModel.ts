"use client";
import {useCatalogo} from "@/lib/useCatalogo";
import type {Grupo} from "../models/Grupo";
import {gruposService} from "../services/gruposService";
const initial:Omit<Grupo,"id">={clave:"",semestre:1,ciclo:"2026-2027",materiaIds:[],alumnoIds:[]};
export function useGrupoViewModel(){return useCatalogo<Grupo>(gruposService,initial);}
