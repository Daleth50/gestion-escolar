import {schoolStore} from "@/lib/schoolStore";
import type {Materia} from "../models/Materia";
export const materiasService={
 listar:():Materia[]=>schoolStore.leer().materias,
 guardar(item:Materia){const rows=schoolStore.leer().materias;
  if(rows.some(x=>x.id!==item.id&&x.clave.toLowerCase()===item.clave.toLowerCase()))throw Error("Registro duplicado");
  schoolStore.actualizar("materias",rows.some(x=>x.id===item.id)?rows.map(x=>x.id===item.id?item:x):[...rows,item]);},
 eliminar(id:string){const data=schoolStore.leer();
  if(data.grupos.some(g=>g.materiaIds.includes(id)))throw Error("Materia asignada a un grupo");
  schoolStore.actualizar("materias",data.materias.filter(x=>x.id!==id));}
};
