import type {Escolar} from "@/lib/schoolStore";
export type FilaReporte={tipo:string;codigo:string;nombre:string;detalle:string};
export function generarReporte(data:Escolar,tipo:"todos"|"profesores"|"materias"|"grupos",filtro:string):FilaReporte[]{
 const rows:FilaReporte[]=[
 ...data.profesores.map(p=>({tipo:"Profesor",codigo:p.id,nombre:p.nombre,detalle:p.especialidad})),
 ...data.materias.map(m=>({tipo:"Materia",codigo:m.clave,nombre:m.nombre,detalle:data.profesores.find(p=>p.id===m.profesorId)?.nombre??"Sin profesor"})),
 ...data.grupos.map(g=>({tipo:"Grupo",codigo:g.clave,nombre:g.ciclo,detalle:`${g.materiaIds.length} materias`}))];
 return rows.filter(r=>(tipo==="todos"||r.tipo.toLowerCase()===tipo.slice(0,-1))&&Object.values(r).some(v=>v.toLowerCase().includes(filtro.toLowerCase())));
}
export function exportarCSV(rows:FilaReporte[]){const cell=(v:string)=>`"${v.replaceAll('"','""')}"`;
 const csv=["Tipo,Código,Nombre,Detalle",...rows.map(r=>[r.tipo,r.codigo,r.nombre,r.detalle].map(cell).join(","))].join("\r\n");
 const url=URL.createObjectURL(new Blob(["\uFEFF",csv],{type:"text/csv;charset=utf-8"}));
 const a=document.createElement("a");a.href=url;a.download="reporte-escolar.csv";a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
}
