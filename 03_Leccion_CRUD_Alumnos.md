# Lección 2: CRUD de Alumnos con MVVM

**Posgrado · 6 horas · Prerrequisito:** Lección 1 completada.

**Objetivo:** implementar Create, Read, Update y Delete de Alumnos,
utilizando un servicio simulado **en memoria**. Los cambios se perderán
al recargar la aplicación; no hay API ni base de datos.

## 1. Organización

``` text
src/modules/alumnos/
├── models/Alumno.ts
├── services/alumnosService.ts
├── viewmodels/useAlumnosViewModel.ts
└── views/AlumnosView.tsx
```

**Flujo:** `app/(sistema)/alumnos/page.tsx` → View → ViewModel → Service
→ Model.

## 2. Model

**`src/modules/alumnos/models/Alumno.ts`**

``` ts
export interface Alumno {
  id:string;
  matricula:string;
  nombre:string;
  correo:string;
  grupo:string;
}
export type AlumnoInput=Omit<Alumno,"id">;
```

## 3. Service: datos y operaciones

**`src/modules/alumnos/services/alumnosService.ts`**

``` ts
import type {Alumno,AlumnoInput} from "../models/Alumno";
let datos:Alumno[]=[
  {id:"1",matricula:"A001",nombre:"Ana López",correo:"ana@ejemplo.edu",grupo:"1A"},
  {id:"2",matricula:"A002",nombre:"Luis Pérez",correo:"luis@ejemplo.edu",grupo:"1B"}
];
export const alumnosService={
  listar:()=>datos.map(a=>({...a})),
  crear:(a:AlumnoInput)=>{
    if(datos.some(x=>x.matricula===a.matricula))throw Error("Matrícula duplicada");
    const nuevo={id:crypto.randomUUID(),...a};
    datos=[...datos,nuevo];return nuevo;
  },
  actualizar:(id:string,a:AlumnoInput)=>{
    if(!datos.some(x=>x.id===id))throw Error("Alumno inexistente");
    if(datos.some(x=>x.id!==id&&x.matricula===a.matricula))
      throw Error("Matrícula duplicada");
    datos=datos.map(x=>x.id===id?{id,...a}:x);
  },
  eliminar:(id:string)=>{datos=datos.filter(x=>x.id!==id);}
};
```

## 4. ViewModel

**`src/modules/alumnos/viewmodels/useAlumnosViewModel.ts`**

``` tsx
"use client";
import {useState} from "react";
import type {Alumno,AlumnoInput} from "../models/Alumno";
import {alumnosService} from "../services/alumnosService";
const vacio:AlumnoInput={matricula:"",nombre:"",correo:"",grupo:""};
export function useAlumnosViewModel(){
  const [alumnos,setAlumnos]=useState<Alumno[]>(()=>alumnosService.listar());
  const [form,setForm]=useState<AlumnoInput>({...vacio});
  const [editId,setEditId]=useState<string|null>(null);
  const [error,setError]=useState("");
  const actualizarCampo=(k:keyof AlumnoInput,v:string)=>
    setForm(f=>({...f,[k]:v}));
  const refrescar=()=>setAlumnos(alumnosService.listar());
  const cancelar=()=>{setForm({...vacio});setEditId(null);setError("");};
  const editar=(a:Alumno)=>{
    setEditId(a.id);
    setForm({matricula:a.matricula,nombre:a.nombre,correo:a.correo,grupo:a.grupo});
    setError("");
  };
  const guardar=()=>{
    if(Object.values(form).some(v=>!v.trim())){setError("Campos obligatorios");return;}
    if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.correo)){
      setError("Correo inválido");return;
    }
    try{
      if(editId)alumnosService.actualizar(editId,form);
      else alumnosService.crear(form);
      refrescar();cancelar();
    }catch(e){setError(e instanceof Error?e.message:"Error al guardar");}
  };
  const eliminar=(id:string)=>{alumnosService.eliminar(id);refrescar();};
  return {alumnos,form,editId,error,actualizarCampo,editar,guardar,eliminar,cancelar};
}
```

## 5. View

**`src/modules/alumnos/views/AlumnosView.tsx`**

``` tsx
"use client";
import {Box,Paper,Typography,TextField,Button,Stack,
  Table,TableHead,TableBody,TableRow,TableCell,Alert} from "@mui/material";
import {useAlumnosViewModel} from "../viewmodels/useAlumnosViewModel";
export default function AlumnosView(){
  const vm=useAlumnosViewModel();
  return <Box>
    <Typography variant="h4" gutterBottom>Alumnos</Typography>
    <Paper sx={{p:3,mb:3}}>
      <Typography variant="h6">{vm.editId?"Editar alumno":"Nuevo alumno"}</Typography>
      {vm.error&&<Alert severity="error">{vm.error}</Alert>}
      <Stack spacing={2} sx={{mt:2}}>
        {(["matricula","nombre","correo","grupo"] as const).map(k=>
          <TextField key={k} label={k} value={vm.form[k]}
            onChange={e=>vm.actualizarCampo(k,e.target.value)}/>
        )}
        <Stack direction="row" spacing={2}>
          <Button variant="contained" onClick={vm.guardar}>
            {vm.editId?"Guardar cambios":"Agregar"}
          </Button>
          <Button onClick={vm.cancelar}>Cancelar</Button>
        </Stack>
      </Stack>
    </Paper>
    <Paper sx={{overflowX:"auto"}}>
      <Table><TableHead><TableRow>
        <TableCell>Matrícula</TableCell><TableCell>Nombre</TableCell>
        <TableCell>Correo</TableCell><TableCell>Grupo</TableCell>
        <TableCell>Acciones</TableCell>
      </TableRow></TableHead><TableBody>
        {vm.alumnos.map(a=><TableRow key={a.id}>
          <TableCell>{a.matricula}</TableCell><TableCell>{a.nombre}</TableCell>
          <TableCell>{a.correo}</TableCell><TableCell>{a.grupo}</TableCell>
          <TableCell>
            <Button onClick={()=>vm.editar(a)}>Editar</Button>
            <Button color="error" onClick={()=>{
              if(window.confirm("¿Eliminar alumno?"))vm.eliminar(a.id);
            }}>Eliminar</Button>
          </TableCell>
        </TableRow>)}
        {vm.alumnos.length===0&&<TableRow>
          <TableCell colSpan={5}>Sin alumnos</TableCell>
        </TableRow>}
      </TableBody></Table>
    </Paper>
  </Box>;
}
```

## 6. Integración con Next.js

**`src/app/(sistema)/alumnos/page.tsx`**

``` tsx
import AlumnosView from "@/modules/alumnos/views/AlumnosView";
export default function AlumnosPage(){return <AlumnosView/>;}
```

## 7. Comprobación

``` bash
npm run dev
npx tsc --noEmit
npm run build
```

Abrir `/alumnos`: - \[ \] Read: mostrar registros iniciales. - \[ \]
Create: agregar matrícula A003. - \[ \] Update: modificar nombre o
grupo. - \[ \] Delete: eliminar y confirmar. - \[ \] Validación: campos
vacíos, correo inválido y matrícula duplicada. - \[ \] Recargar:
verificar pérdida de cambios por falta de persistencia.

## 8. Análisis y extensión

Responder: ¿por qué la Vista no manipula el arreglo directamente? ¿Cómo
reemplazar el Service por Axios? ¿Qué pruebas unitarias convienen?

Extensión opcional: búsqueda, formulario modal, indicador de total de
alumnos y diseño de endpoints `GET/POST/PUT/DELETE /alumnos`.

**Entrega:** repositorio actualizado, capturas CRUD, diagrama MVVM y
reflexión técnica.

**Evaluación:** Model 15%, Service 20%, ViewModel 25%, View 25%, pruebas
y explicación 15%.
