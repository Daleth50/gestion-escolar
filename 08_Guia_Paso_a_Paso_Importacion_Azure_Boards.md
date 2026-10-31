# Lección 5 — Creación masiva del tablero Azure Boards desde Excel y CSV

**Proyecto de referencia:** Sistema de Gestión Escolar  
**Proceso:** Agile (Azure DevOps Services)  
**Modalidad:** Trabajo individual, posgrado — Lenguajes Web  
**Objetivo:** transformar los requisitos del SRS en elementos de trabajo trazables, evitando capturarlos uno por uno.

## 1. Archivos incluidos

| Archivo | Uso |
|---|---|
| `Plantilla_Backlog_Azure_Boards_Gestion_Escolar.xlsx` | Editar y revisar el backlog en Excel. Contiene hoja jerárquica y hoja de historias simples. |
| `Azure_Boards_Importacion_Basica.csv` | Importar únicamente las 20 historias de usuario como prueba inicial. |
| `Azure_Boards_Importacion_Jerarquica.csv` | Importar 1 Epic, 9 Features y 20 User Stories con estructura de títulos anidados. |
| `SRS_Sistema_Gestion_Escolar_Azure_Boards.docx` | Documento maestro para cotejar el alcance y los criterios de aceptación. |

**Importante:** la importación masiva de CSV no crea por sí sola un proyecto de Azure DevOps, un equipo, iteraciones ni la configuración visual del tablero. Sí crea *work items* y puede establecer vínculos jerárquicos padre-hijo. La operación se completa al pulsar **Save items**.

## 2. Antes de empezar: verificar proyecto y permisos

1. Abrir `https://dev.azure.com/ORGANIZACION` y entrar al proyecto individual.
2. Confirmar que el proyecto está configurado con el proceso **Agile**, no Basic, Scrum ni CMMI. En Agile se utilizan `Epic`, `Feature`, `User Story` y `Task`.
3. Confirmar permisos para importar elementos de trabajo. Si **Import work items** no aparece o devuelve acceso denegado, solicitar al administrador los permisos correspondientes; no intentar solucionar cambiando arbitrariamente el CSV.
4. Verificar que no se importaron previamente los mismos elementos. **Reimportar un archivo de elementos nuevos crea duplicados**.
5. Crear un elemento de prueba en el proyecto y exportar una consulta pequeña para verificar los nombres de los campos. La plantilla presupone los nombres en inglés (`Work Item Type`, `Title`, `Description`, `Acceptance Criteria`, `Priority`, `Tags`). En procesos personalizados pueden variar.

## 3. Comprender la estructura Agile

```text
Epic: Sistema de Gestión Escolar
 ├─ Feature: FE-01 - Acceso y navegación
 │   ├─ User Story: US-01 - Acceso demostrativo
 │   └─ User Story: US-02 - Estructura y navegación
 ├─ Feature: FE-02 - Gestión de alumnos
 │   └─ User Stories del módulo
 └─ ... otras Features
```

- **Epic:** objetivo de negocio amplio.
- **Feature:** capacidad o módulo del sistema.
- **User Story:** comportamiento verificable que aporta valor.
- **Task:** trabajo técnico que se asignará posteriormente (componentes, API, pruebas, Docker, etc.).

La plantilla jerárquica contiene 30 elementos: **1 Epic + 9 Features + 20 User Stories**. Las tareas no se inventaron automáticamente: cada estudiante debe desglosarlas conforme a su avance real.

## 4. Opción A — Importación básica (primera prueba recomendada)

1. Abrir `Azure_Boards_Importacion_Basica.csv` en Visual Studio Code o Excel.
2. Confirmar que la primera fila tiene los campos `Work Item Type,Title,Description,Acceptance Criteria,Priority,Tags`.
3. Verificar que cada fila contiene `User Story` y un título distinto.
4. Entrar al proyecto de Azure DevOps.
5. Seleccionar **Boards → Queries → Import work items** (en español: **Paneles → Consultas → Importar elementos de trabajo**).
6. Seleccionar **Choose file / Elegir archivo** y escoger el CSV básico.
7. Pulsar **Import**. Azure muestra los elementos todavía **sin guardar**.
8. Revisar errores de formato, tipos y campos. Corregir antes de continuar.
9. Pulsar **Save items / Guardar elementos**.
10. Abrir **Boards → Work Items** o **Boards → Backlogs** y confirmar que aparecen las 20 historias.

> **No importar luego el CSV jerárquico completo sobre el mismo proyecto sin limpiar o reconciliar los elementos básicos:** duplicaría las 20 historias. Lo recomendable es probar en un proyecto de práctica independiente y usar el jerárquico en el proyecto definitivo.

## 5. Opción B — Importación jerárquica (proyecto definitivo)

1. Abrir `Azure_Boards_Importacion_Jerarquica.csv`.
2. Observar las columnas `Title 1`, `Title 2` y `Title 3`:
   - La fila Epic contiene texto en `Title 1`.
   - Las filas Feature contienen texto en `Title 2`.
   - Las filas User Story contienen texto en `Title 3`.
3. **No ordenar las filas**: el orden y la profundidad de título expresan la jerarquía.
4. Verificar que el proyecto usa Agile y reconoce los campos incluidos.
5. Entrar a **Boards → Queries → Import work items**.
6. Seleccionar el archivo jerárquico y pulsar **Import**.
7. Revisar la previsualización. Si la jerarquía no se reconoce, cancelar, exportar una consulta de tipo árbol del propio proyecto y ajustar el formato antes de reintentar.
8. Pulsar **Save items** una sola vez cuando no haya errores.
9. Abrir **Boards → Backlogs**, cambiar el nivel a **Epics** y expandir el árbol; comprobar las Features y User Stories.
10. Abrir dos historias y confirmar que sus criterios de aceptación y etiquetas se guardaron correctamente.

**Limitación:** la importación CSV permite jerarquía padre-hijo, pero no crea automáticamente relaciones arbitrarias entre elementos, dependencias ni vínculos a commits o Pull Requests.

## 6. Editar el Excel y exportar a CSV

1. Abrir `Plantilla_Backlog_Azure_Boards_Gestion_Escolar.xlsx` en Excel.
2. Trabajar en la hoja **Backlog editable**. Conservar exactamente las columnas y la jerarquía.
3. Modificar descripciones, prioridades y criterios según el SRS y el código realmente implementado.
4. Elegir **Archivo → Guardar como → CSV UTF-8 (delimitado por comas)** y guardar únicamente la hoja jerárquica activa.
5. Confirmar en VS Code que el CSV resultante conserva encabezados, tildes, comillas y saltos de línea. No usar `;` como separador de columnas (sí se usa dentro de `Tags`).
6. Importar el CSV mediante los pasos de la sección 5.

**Importante:** Excel no se importa directamente por la opción nativa de Azure Boards; se utiliza para editar y generar el archivo CSV.

## 7. Errores frecuentes y soluciones

| Problema | Causa probable | Acción |
|---|---|---|
| No aparece Import work items | Permisos insuficientes | Consultar al administrador del proyecto/organización. |
| `Work Item Type` no válido | El proyecto no usa Agile | Confirmar el proceso y ajustar los tipos válidos. |
| Campo no reconocido | Nombre de campo distinto o personalizado | Exportar un work item existente y comparar encabezados. |
| Criterios de aceptación rechazados | Campo no disponible para el tipo de elemento | Probar con columnas mínimas; completar campos luego. |
| Caracteres extraños | Codificación distinta de UTF-8 | Guardar CSV UTF-8. |
| Relaciones padre-hijo incorrectas | Filas reordenadas o títulos mal anidados | Restaurar orden y columnas `Title 1/2/3`. |
| Historias duplicadas | Archivo nuevo importado más de una vez | Evitar reimportar; para actualizar usar exportación con IDs existentes. |
| Estado no coincide | Importación de nuevos elementos usa estado predeterminado | Cambiar estado después de guardar; o exportar, actualizar e importar con IDs. |
| No aparece en el tablero del equipo | `Area Path`, `Iteration Path` o filtros del equipo | Revisar configuración del equipo, área e iteración. |

## 8. Configurar el tablero visual después de importar

1. Entrar en **Boards → Boards**.
2. Seleccionar el tablero de **Stories** del equipo.
3. Verificar las columnas disponibles y los estados de las historias.
4. En **Board settings → Columns**, ajustar las columnas del flujo de trabajo según la práctica (por ejemplo, Nueva, Activa, Resuelta, Cerrada, si son compatibles con el proceso).
5. En **Boards → Backlogs**, revisar Epic/Feature/User Story; el tablero de historias no necesariamente muestra las Epics y Features como tarjetas.
6. En **Project settings → Project configuration / Team configuration**, crear iteraciones o sprints y asignar la iteración apropiada a las historias.
7. Agregar Tasks a las User Stories para reflejar el trabajo técnico individual; registrar horas o estimaciones cuando corresponda.

## 9. Actualización posterior sin duplicados

Para cambiar prioridades, descripciones o estados después de la primera importación:

1. Crear una consulta que incluya los elementos importados.
2. Exportarla a CSV desde Azure Boards.
3. Editar el CSV **conservando la columna `ID` y los valores existentes**.
4. Reimportar el archivo desde Queries.
5. Revisar y guardar los cambios.

Para **elementos nuevos**, el CSV inicial no debe contener IDs asignados. Para **actualizar elementos existentes**, deben conservarse los IDs reales de Azure DevOps.

## 10. Validación de la actividad individual

- [ ] Existe el proyecto Azure DevOps con proceso Agile.
- [ ] Se importó el backlog una sola vez y se guardó sin errores.
- [ ] Hay 1 Epic, 9 Features y 20 User Stories, o se documentan los cambios de alcance.
- [ ] Las historias tienen criterios de aceptación verificables.
- [ ] Se comprobó la jerarquía en Backlogs.
- [ ] Se agregaron tareas técnicas correspondientes a las funcionalidades que el alumno desarrolla.
- [ ] Se asignaron estados y prioridades acordes con el avance real.
- [ ] Se puede explicar una historia y localizar su implementación en el código.
- [ ] Se muestra la aplicación ejecutándose y se demuestra al menos una funcionalidad.
- [ ] Se documentan pendientes y evidencias (commits, PR, capturas o demostración).

## 11. Automatización completa: alternativa avanzada

La importación CSV **automatiza la captura masiva**, pero requiere pasos en la interfaz. Para automatizar sin interacción manual también es posible desarrollar un script con **Azure DevOps REST API**, que cree primero Epics, después Features, después User Stories y finalmente relaciones padre-hijo mediante IDs devueltos por el servidor. Esa alternativa requiere organización, proyecto, autenticación y permisos de escritura; **no está incluida en estos CSV** y no debe ejecutarse sin revisar duplicados y alcance.

## 12. Fuentes oficiales

- Microsoft Learn — Importar y exportar elementos de trabajo con CSV: https://learn.microsoft.com/es-es/azure/devops/boards/queries/import-work-items-from-csv?view=azure-devops
- Microsoft Learn — Trabajar con Azure Boards: https://learn.microsoft.com/en-us/azure/devops/boards/get-started/plan-track-work?view=azure-devops
- Microsoft Learn — Configurar columnas del tablero: https://learn.microsoft.com/en-us/azure/devops/boards/boards/add-columns?view=azure-devops

**Resultado esperado:** backlog individual creado en Azure Boards, jerarquizado, trazable al SRS y preparado para la planeación y seguimiento del desarrollo.
