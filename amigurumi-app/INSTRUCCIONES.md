# 🧸 AmigoPatrón IA — Instrucciones de instalación

## Lo que necesitas (ya lo tienes)
- ✅ Node.js instalado
- ✅ Cuenta en GitHub
- ✅ Cuenta en Vercel

---

## PASO 1 — Obtener tu API Key de Anthropic

1. Ve a https://console.anthropic.com
2. Crea una cuenta (es gratis para empezar)
3. Ve a "API Keys" → "Create Key"
4. Copia esa clave (empieza con `sk-ant-...`)
5. Guárdala, la necesitas en el Paso 3

---

## PASO 2 — Subir el proyecto a GitHub

1. Ve a https://github.com y haz login
2. Clic en el botón verde "New" (arriba a la izquierda)
3. Nombre del repositorio: `amigurumi-patron`
4. Déjalo en "Public"
5. Clic en "Create repository"
6. En la página que aparece, copia el link del repositorio (algo como https://github.com/tuusuario/amigurumi-patron.git)

Ahora abre una ventana de comandos (CMD en Windows / Terminal en Mac):

```
cd Desktop
mkdir amigurumi-patron
cd amigurumi-patron
```

Copia todos los archivos de esta carpeta ahí dentro, luego ejecuta:

```
npm install
git init
git add .
git commit -m "primer commit"
git branch -M main
git remote add origin https://github.com/TUUSUARIO/amigurumi-patron.git
git push -u origin main
```

(Reemplaza TUUSUARIO con tu usuario de GitHub)

---

## PASO 3 — Publicar en Vercel

1. Ve a https://vercel.com y haz login con GitHub
2. Clic en "Add New Project"
3. Selecciona el repositorio `amigurumi-patron`
4. Antes de hacer Deploy, busca la sección **"Environment Variables"**
5. Agrega esta variable:
   - Nombre: `VITE_ANTHROPIC_API_KEY`
   - Valor: pega tu API key de Anthropic (sk-ant-...)
6. Clic en "Deploy"

¡Vercel construye la app automáticamente y te da un link!

---

## PASO 4 — Instalar en el celular

1. Abre el link que te dio Vercel en Chrome (Android) o Safari (iPhone)
2. Android: toca los 3 puntos ⋮ → "Añadir a pantalla de inicio"
3. iPhone: toca el botón compartir → "Añadir a pantalla de inicio"

¡Listo! La app queda instalada con ícono propio 🎉

---

## Si tienes problemas

- Asegúrate de que la API key esté bien copiada en Vercel
- El proyecto usa React + Vite, Vercel lo detecta automáticamente
- Si ves errores en consola, revisa que VITE_ANTHROPIC_API_KEY esté configurada

