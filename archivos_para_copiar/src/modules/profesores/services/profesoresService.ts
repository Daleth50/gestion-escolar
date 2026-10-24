import {schoolStore} from "@/lib/schoolStore";
import type {Profesor} from "../models/Profesor";
export const profesoresService={
 listar:():Profesor[]=>schoolStore.leer().profesores,
 guardar(item:Profesor){const rows=schoolStore.leer().profesores;
  if(rows.some(x=>x.id!==item.id&&x.correo.toLowerCase()===item.correo.toLowerCase()))throw Error("Registro duplicado");
  schoolStore.actualizar("profesores",rows.some(x=>x.id===item.id)?rows.map(x=>x.id===item.id?item:x):[...rows,item]);},
 eliminar(id:string){const data=schoolStore.leer();
  if(data.materias.some(m=>m.profesorId===id))throw Error("Profesor asignado a una materia");
  schoolStore.actualizar("profesores",data.profesores.filter(x=>x.id!==id));}
};
