"use client";
import {useCatalogo} from "@/lib/useCatalogo";
import type {Profesor} from "../models/Profesor";
import {profesoresService} from "../services/profesoresService";
const initial:Omit<Profesor,"id">={nombre:"",correo:"",especialidad:"",activo:true};
export function useProfesorViewModel(){return useCatalogo<Profesor>(profesoresService,initial);}
