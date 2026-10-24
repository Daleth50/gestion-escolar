"use client";
import {useCatalogo} from "@/lib/useCatalogo";
import type {Materia} from "../models/Materia";
import {materiasService} from "../services/materiasService";
const initial:Omit<Materia,"id">={clave:"",nombre:"",creditos:5,profesorId:""};
export function useMateriaViewModel(){return useCatalogo<Materia>(materiasService,initial);}
