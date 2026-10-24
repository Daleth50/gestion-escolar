"use client";
export type Profesor = {id:string;nombre:string;correo:string;especialidad:string;activo:boolean};
export type Materia = {id:string;clave:string;nombre:string;creditos:number;profesorId:string};
export type Grupo = {id:string;clave:string;semestre:number;ciclo:string;materiaIds:string[];alumnoIds:string[]};
export type Escolar = {profesores:Profesor[];materias:Materia[];grupos:Grupo[]};
const KEY="gestion-escolar-v3";
const seed:Escolar={
 profesores:[{id:"p1",nombre:"María García",correo:"maria@ejemplo.edu",especialidad:"Matemáticas",activo:true},{id:"p2",nombre:"Juan Ruiz",correo:"juan@ejemplo.edu",especialidad:"Informática",activo:true}],
 materias:[{id:"m1",clave:"MAT101",nombre:"Álgebra",creditos:5,profesorId:"p1"},{id:"m2",clave:"INF201",nombre:"Programación",creditos:6,profesorId:"p2"}],
 grupos:[{id:"g1",clave:"1A",semestre:1,ciclo:"2026-2027",materiaIds:["m1"],alumnoIds:[]}]
};
const copy=<T,>(x:T):T=>JSON.parse(JSON.stringify(x)) as T;
export const schoolStore={
 leer():Escolar {if(typeof window==="undefined")return copy(seed);
  try {const raw=localStorage.getItem(KEY);return raw?JSON.parse(raw) as Escolar:copy(seed);}catch{return copy(seed);}},
 guardar(data:Escolar){localStorage.setItem(KEY,JSON.stringify(data));window.dispatchEvent(new Event("escuela:actualizada"));},
 actualizar<T extends keyof Escolar>(tipo:T, items:Escolar[T]){const data=this.leer();data[tipo]=items;this.guardar(data);},
 suscribir(fn:()=>void){window.addEventListener("escuela:actualizada",fn);window.addEventListener("storage",fn);return()=>{window.removeEventListener("escuela:actualizada",fn);window.removeEventListener("storage",fn);};}
};
