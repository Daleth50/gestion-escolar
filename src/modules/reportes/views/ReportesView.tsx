"use client";
import {useReportesViewModel,TipoReporte} from "../viewmodels/useReportesViewModel";
import {Alert,Button,MenuItem,Paper,Stack,TextField,Typography,Table,TableHead,TableBody,TableRow,TableCell} from "@mui/material";
export default function ReportesView(){const vm=useReportesViewModel();return <Stack spacing={3}><Typography variant="h4">Reportes</Typography><Paper sx={{p:3}}><Stack spacing={2}>
{vm.error&&<Alert severity="error">{vm.error}</Alert>}
<TextField select label="Tipo" value={vm.tipo} onChange={e=>vm.setTipo(e.target.value as TipoReporte)}>{["todos","profesores","alumnos","materias","grupos"].map(t=><MenuItem key={t} value={t}>{t}</MenuItem>)}</TextField>
<TextField label="Buscar" value={vm.filtro} onChange={e=>vm.setFiltro(e.target.value)}/><Button variant="contained" onClick={vm.exportar}>Exportar CSV</Button></Stack></Paper>
<Paper sx={{overflowX:"auto"}}><Table><TableHead><TableRow><TableCell>Tipo</TableCell><TableCell>Código</TableCell><TableCell>Nombre</TableCell><TableCell>Detalle</TableCell></TableRow></TableHead><TableBody>{vm.filas.map((r,i)=><TableRow key={`${r.tipo}-${r.codigo}-${i}`}><TableCell>{r.tipo}</TableCell><TableCell>{r.codigo}</TableCell><TableCell>{r.nombre}</TableCell><TableCell>{r.detalle}</TableCell></TableRow>)}</TableBody></Table></Paper></Stack>}
