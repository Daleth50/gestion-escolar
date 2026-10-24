# Lección 3: CRUD de Profesores, Materias, Grupos y Reportes

**Curso:** Posgrado · **Entorno:** macOS, Warp, Next.js 15, React 19, TypeScript, Material UI 7.

## Objetivo
Extender el proyecto `gestion-escolar` creado en las lecciones anteriores, **sin reiniciar el proyecto**, con CRUD de Profesores, Materias y Grupos, consulta y exportación CSV de Reportes, e indicadores en Dashboard.

## 1. Antes de modificar
```bash
cd /ruta/a/gestion-escolar
git status
npm install
git switch -c feature/catalogos-reportes
```
Se recomienda guardar o confirmar previamente cualquier cambio pendiente. No ejecutar `create-next-app` otra vez.

## 2. Copiar archivos
Descomprimir el ZIP y copiar el contenido de `archivos_para_copiar/src/` dentro de la carpeta `src/` del proyecto existente, conservando la estructura de directorios. **Se reemplazan únicamente las páginas `page.tsx` de Profesores, Materias, Grupos, Reportes y Dashboard.** No se reemplazan Login, Alumnos ni los layouts.

Desde Warp, situándose en la raíz del proyecto:
```bash
cp -R /ruta/al/material/archivos_para_copiar/src/. ./src/
```
Ajustar `/ruta/al/material/` a la carpeta donde se descomprimió el paquete. Revisar con `git diff` antes de continuar.

## 3. Estructura y responsabilidades
```text
src/lib/schoolStore.ts                 almacenamiento compartido localStorage
src/lib/useCatalogo.ts                 hook genérico para CRUD
src/modules/profesores/               Model, Service, ViewModel, View
src/modules/materias/                 Model, Service, ViewModel, View
src/modules/grupos/                   Model, Service, ViewModel, View
src/modules/reportes/                 Service, ViewModel, View
src/modules/dashboard/views/          indicadores
src/app/(sistema)/.../page.tsx        páginas de Next.js
```
**Flujo:** Page → View → ViewModel → Service → Store. `schoolStore` conserva el estado compartido de catálogos en `localStorage` y avisa de cambios mediante un evento. El hook `useCatalogo` reutiliza la lógica de edición y borrado, sin colocar reglas de negocio en las Views.

## 4. Práctica: Profesores
Abrir `/profesores` y comprobar: alta de profesor, listado, edición de especialidad, cambio de estado y eliminación. No se permite borrar un profesor asignado a alguna materia. No se permite correo duplicado. Los botones de guardar requieren nombre y correo con formato básico válido.

**Discusión:** ¿qué validaciones adicionales se aplicarían en un backend? ¿Qué sucede si dos usuarios modifican un mismo profesor?

## 5. Práctica: Materias
Abrir `/materias`. Crear materia con clave, nombre, créditos y profesor opcional; editar y eliminar. El desplegable muestra profesores registrados. No se permite borrar una materia asociada a un grupo. No se permiten claves duplicadas.

**Discusión:** ¿por qué `profesorId` referencia a Profesor en vez de duplicar sus datos?

## 6. Práctica: Grupos
Abrir `/grupos`. Crear grupo con clave, semestre, ciclo y selección de materias mediante casillas. Editar la selección y eliminar grupos. El modelo incluye `alumnoIds`, reservado para una integración posterior con el módulo Alumnos.

**Discusión:** ¿cuándo convendría sustituir `materiaIds` por una entidad `Asignación` que contenga profesor, grupo, materia y periodo?

## 7. Práctica: Reportes
Abrir `/reportes`. Filtrar por tipo de entidad, buscar registros y descargar CSV. El reporte se genera a partir de los catálogos compartidos; **no modifica datos**. Abrir el archivo exportado en Excel o Numbers.

## 8. Dashboard
Abrir `/dashboard` y observar totales de profesores, materias y grupos. Registrar un nuevo profesor y comprobar el cambio al volver al Dashboard. El indicador de Alumnos no está incluido porque la lección anterior mantiene sus registros en memoria independiente.

## 9. Pruebas
```bash
npx tsc --noEmit
npm run lint
npm run build
npm run dev
```
Si la versión de Next.js no proporciona el script `lint`, ejecutar `npx eslint .`.

- [ ] CRUD de Profesores funciona.
- [ ] CRUD de Materias funciona.
- [ ] CRUD de Grupos funciona.
- [ ] Las relaciones profesor–materia y grupo–materia son coherentes.
- [ ] Reportes filtra y exporta CSV.
- [ ] Dashboard muestra indicadores.
- [ ] Recargar conserva los datos en el mismo navegador.
- [ ] Login y CRUD de Alumnos siguen disponibles.

## 10. Publicar en GitHub
```bash
git status
git add src
git commit -m "feat: agrega catalogos escolares y reportes MVVM"
git push -u origin feature/catalogos-reportes
```
Crear un Pull Request hacia `main`, revisar el código y fusionar después de validar. No subir datos reales ni secretos.

## 11. Evaluación
- Arquitectura MVVM y reutilización: **25%**
- CRUD Profesores: **15%**
- CRUD Materias: **15%**
- CRUD Grupos y relaciones: **20%**
- Reportes y Dashboard: **15%**
- Pruebas y control de versiones: **10%**

## 12. Limitaciones y siguiente lección
La persistencia es **local al navegador**, no hay API, base de datos centralizada, autenticación ni concurrencia real. La validación en interfaz es didáctica, no sustituye validación de servidor. Para el siguiente módulo, integrar Alumnos al mismo repositorio y modelar formalmente inscripciones y asignaciones; después sustituir los Services locales por endpoints REST.
