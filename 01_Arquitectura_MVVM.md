# Lección 1: Arquitectura MVVM para Gestión Escolar

**Posgrado · 6 horas · macOS/Warp · Next.js 15, React 19, TypeScript y
Material UI**

## Objetivo

Crear una aplicación escolar con navegación, layout compartido y
formulario Login demostrativo (sin autenticación). Preparar los módulos
Alumnos, Profesores, Materias, Grupos, Reportes y Dashboard.

## 1. Instalación

``` bash
node -v
npm -v
npx create-next-app@15 gestion-escolar --typescript --eslint --app --src-dir --no-tailwind --use-npm
cd gestion-escolar
npm install @mui/material@7 @mui/icons-material@7 @emotion/react @emotion/styled axios @mui/x-data-grid@8 @mui/x-charts@8
```

Utilizar una versión de Node.js compatible con Next.js 15 (20.9 o
superior).

## 2. MVVM y estructura

-   **Model:** entidades y contratos de datos.
-   **ViewModel:** estado, acciones y lógica de presentación,
    implementado mediante hooks.
-   **View:** componentes visuales React.
-   **Service:** abstracción para fuentes de datos, inicialmente sin
    API.

``` text
src/
├── app/
│   ├── layout.tsx
│   ├── page.tsx
│   ├── login/page.tsx
│   └── (sistema)/
│       ├── layout.tsx
│       └── {dashboard,alumnos,profesores,materias,grupos,reportes}/page.tsx
├── modules/
│   └── {auth,alumnos,profesores,materias,grupos,reportes,dashboard}/
│       ├── models/
│       ├── viewmodels/
│       ├── views/
│       └── services/
├── components/layout/
│   ├── Header.tsx
│   ├── Footer.tsx
│   └── MainLayout.tsx
└── config/navigation.ts
```

`(sistema)` es un grupo de rutas que no aparece en la URL.

## 3. Script de carpetas

Ejecutar en la raíz:

``` bash
mkdir -p src/app/login "src/app/(sistema)"
mkdir -p src/components/layout src/config
for m in dashboard alumnos profesores materias grupos reportes; do
  mkdir -p "src/app/(sistema)/$m"
done
for m in auth alumnos profesores materias grupos reportes dashboard; do
  mkdir -p "src/modules/$m"/{models,viewmodels,views,services}
done
```

## 4. Navegación

**`src/config/navigation.ts`**

``` ts
export const navigation = [
  {label:"Dashboard",path:"/dashboard"},
  {label:"Alumnos",path:"/alumnos"},
  {label:"Profesores",path:"/profesores"},
  {label:"Materias",path:"/materias"},
  {label:"Grupos",path:"/grupos"},
  {label:"Reportes",path:"/reportes"},
];
```

## 5. Header, Content y Footer

**`src/components/layout/Header.tsx`**

``` tsx
"use client";
import { AppBar, Toolbar, Button, Typography, Box } from "@mui/material";
import Link from "next/link";
import { navigation } from "@/config/navigation";
export default function Header() {
  return <AppBar position="static"><Toolbar>
    <Typography variant="h6" sx={{mr:3}}>Gestión Escolar</Typography>
    <Box sx={{flexGrow:1}}>{navigation.map(n=>
      <Button key={n.path} color="inherit" component={Link} href={n.path}>{n.label}</Button>
    )}</Box>
  </Toolbar></AppBar>;
}
```

**`src/components/layout/Footer.tsx`**

``` tsx
import { Box, Typography } from "@mui/material";
export default function Footer() {
  return <Box component="footer" sx={{p:2,textAlign:"center",bgcolor:"grey.100"}}>
    <Typography variant="body2">© 2026 Gestión Escolar</Typography>
  </Box>;
}
```

**`src/components/layout/MainLayout.tsx`**

``` tsx
import {Box,Container} from "@mui/material";
import Header from "./Header";
import Footer from "./Footer";
export default function MainLayout({children}:{children:React.ReactNode}) {
  return <Box sx={{minHeight:"100vh",display:"flex",flexDirection:"column"}}>
    <Header/><Container component="main" maxWidth="xl" sx={{flex:1,py:4}}>
      {children}
    </Container><Footer/>
  </Box>;
}
```

**`src/app/(sistema)/layout.tsx`**

``` tsx
import MainLayout from "@/components/layout/MainLayout";
export default function Layout({children}:{children:React.ReactNode}) {
  return <MainLayout>{children}</MainLayout>;
}
```

**`src/app/layout.tsx`**

``` tsx
import {CssBaseline} from "@mui/material";
export default function RootLayout({children}:{children:React.ReactNode}) {
  return <html lang="es"><body><CssBaseline/>{children}</body></html>;
}
```

## 6. Rutas

**`src/app/page.tsx`**

``` tsx
import {redirect} from "next/navigation";
export default function Home(){redirect("/login");}
```

Crear las seis páginas:

``` bash
for m in dashboard alumnos profesores materias grupos reportes; do
cat > "src/app/(sistema)/$m/page.tsx" <<EOF
import {Typography,Paper} from "@mui/material";
export default function Page(){return <Paper sx={{p:3}}>
  <Typography variant="h4">$m</Typography>Próximamente
</Paper>;}
EOF
done
```

## 7. Login demostrativo MVVM

**`src/modules/auth/models/LoginModel.ts`**

``` ts
export interface LoginModel { email:string; password:string; }
```

**`src/modules/auth/viewmodels/useLoginViewModel.ts`**

``` tsx
"use client";
import {useState} from "react";
import {useRouter} from "next/navigation";
import type {LoginModel} from "../models/LoginModel";
export function useLoginViewModel(){
  const router=useRouter();
  const [form,setForm]=useState<LoginModel>({email:"",password:""});
  const update=(key:keyof LoginModel,value:string)=>
    setForm(old=>({...old,[key]:value}));
  const login=()=>router.push("/dashboard");
  return {form,update,login};
}
```

**`src/modules/auth/views/LoginView.tsx`**

``` tsx
"use client";
import {Box,Paper,TextField,Button,Typography,Stack} from "@mui/material";
import {useLoginViewModel} from "../viewmodels/useLoginViewModel";
export default function LoginView(){
  const vm=useLoginViewModel();
  return <Box sx={{minHeight:"100vh",display:"grid",placeItems:"center",bgcolor:"grey.100"}}>
    <Paper sx={{p:4,width:"min(90%,400px)"}}>
      <Typography variant="h5" gutterBottom>Acceso escolar</Typography>
      <Box component="form" noValidate onSubmit={e=>{e.preventDefault();vm.login();}}>
        <Stack spacing={2}>
          <TextField label="Correo" type="email" value={vm.form.email}
            onChange={e=>vm.update("email",e.target.value)}/>
          <TextField label="Contraseña" type="password" value={vm.form.password}
            onChange={e=>vm.update("password",e.target.value)}/>
          <Button type="submit" variant="contained">Iniciar sesión</Button>
        </Stack>
      </Box>
    </Paper>
  </Box>;
}
```

**`src/app/login/page.tsx`**

``` tsx
import LoginView from "@/modules/auth/views/LoginView";
export default function LoginPage(){return <LoginView/>;}
```

**Aviso:** la navegación al Dashboard no implica autenticación ni
protección de rutas.

## 8. Verificación

``` bash
npm run dev
npx tsc --noEmit
npm run build
```

-   [ ] `/` redirige a `/login`.
-   [ ] Login presenta formulario y navega sin validar.
-   [ ] `/dashboard` muestra Header, Content y Footer.
-   [ ] Navegación entre seis módulos.
-   [ ] Login no presenta el layout interno.

**Preguntas:** ¿qué responsabilidad tiene cada capa? ¿Por qué las rutas
están separadas de los módulos? ¿Cómo se integraría una API?

**Entrega:** repositorio, capturas, diagrama de componentes MVVM y
explicación técnica.
