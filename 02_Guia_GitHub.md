# Guía: Publicación del proyecto en GitHub

**Objetivo:** versionar y entregar la aplicación de Gestión Escolar.

## 1. Comprobar Git y carpeta

``` bash
cd /ruta/a/gestion-escolar
git --version
git status
```

Si Git indica que no existe repositorio:

``` bash
git init
git branch -M main
```

## 2. Proteger información

Verificar que `.gitignore` contenga:

``` gitignore
node_modules/
.next/
dist/
build/
.env
.env.*
!.env.example
.DS_Store
```

No publicar contraseñas, tokens, datos personales ni `.env.local`.
Comprobar con `git status --short`.

## 3. Documentar README

Incluir nombre, objetivo, stack, módulos, estructura MVVM, comandos de
instalación, capturas y limitaciones: Login sin autenticación y CRUD aún
no implementados.

## 4. Primer commit

``` bash
git add .
git diff --cached --stat
git commit -m "feat: estructura inicial MVVM"
```

Si es necesario:

``` bash
git config --global user.name "Nombre Apellido"
git config --global user.email "correo-de-github"
```

## 5. Crear repositorio remoto

En https://github.com: **New repository** → `gestion-escolar-mvvm` →
visibilidad según docente → crear **sin README ni .gitignore remoto** si
ya existen localmente.

## 6. Conectar y publicar

Sustituir `USUARIO`:

``` bash
git remote add origin https://github.com/USUARIO/gestion-escolar-mvvm.git
git push -u origin main
```

Si `origin` ya existe, revisar con `git remote -v`. GitHub utiliza
autenticación mediante navegador, token o CLI, no la contraseña de la
cuenta en HTTPS.

## 7. Publicar cambios

``` bash
git status
git add .
git commit -m "feat: implementa CRUD de alumnos"
git push
```

## 8. Trabajo con ramas (opcional)

``` bash
git switch -c feature/crud-alumnos
# realizar cambios
git add .
git commit -m "feat: CRUD local de alumnos"
git push -u origin feature/crud-alumnos
```

Crear Pull Request hacia `main` y revisar antes de fusionar.

## 9. Lista de comprobación

-   [ ] Repositorio visible para docente.
-   [ ] README completo.
-   [ ] Código en `src/app` y `src/modules`.
-   [ ] Sin secretos ni archivos generados.
-   [ ] Commits y enlace correctos.
-   [ ] `npm run build` ejecuta sin errores.

**Entregable:** URL del repositorio, último commit
(`git rev-parse --short HEAD`) y capturas. **GitHub no equivale a
desplegar el sitio web.**
