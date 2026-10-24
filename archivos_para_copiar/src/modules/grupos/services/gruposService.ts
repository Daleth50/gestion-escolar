import {schoolStore} from "@/lib/schoolStore";
import type {Grupo} from "../models/Grupo";
export const gruposService={
 listar:():Grupo[]=>schoolStore.leer().grupos,
 guardar(item:Grupo){const rows=schoolStore.leer().grupos;
  if(rows.some(x=>x.id!==item.id&&x.clave.toLowerCase()===item.clave.toLowerCase()))throw Error("Registro duplicado");
  schoolStore.actualizar("grupos",rows.some(x=>x.id===item.id)?rows.map(x=>x.id===item.id?item:x):[...rows,item]);},
 eliminar(id:string){const data=schoolStore.leer();
  
  schoolStore.actualizar("grupos",data.grupos.filter(x=>x.id!==id));}
};
