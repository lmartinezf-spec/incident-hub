# Runner autohospedado (GitLab Runner)

Todos los jobs del pipeline principal corren en un **GitLab Runner propio** registrado solo para este proyecto, con el tag `incident-hub`. El mismo equipo hospeda los ambientes de staging y producción (PM2 + PostgreSQL), lo que permite demostrar el ciclo completo sin costo y sin los runners compartidos de GitLab.com.

## Requisitos del equipo (Windows 10/11)

| Software | Versión | Verificación |
|---|---|---|
| Node.js | 22 LTS | `node -v` |
| Git | 2.4x | `git --version` |
| PostgreSQL | 16 | `psql --version` |
| PM2 | última | `npm install -g pm2` y luego `pm2 -v` |
| PowerShell 7 | 7.4+ | `winget install --id Microsoft.PowerShell` y luego `pwsh -v` |

PowerShell 7 es obligatorio: el runner en Windows ejecuta los jobs con `pwsh`.

Bases de datos de los ambientes (en pgAdmin o `psql` como `postgres`):

```sql
CREATE DATABASE incident_hub_staging;
CREATE DATABASE incident_hub_production;
```

Usuario propio para los ambientes (mínimo privilegio: no es superusuario y solo es dueño de esas dos bases). La contraseña se genera con `node -e "console.log(require('crypto').randomBytes(24).toString('hex'))"` y se guarda **solo** en la variable `DB_PASSWORD` de GitLab:

```sql
CREATE ROLE incident_app LOGIN PASSWORD 'pega-aqui-la-contraseña-generada';
ALTER DATABASE incident_hub_staging OWNER TO incident_app;
ALTER DATABASE incident_hub_production OWNER TO incident_app;
```

Las tablas las crea el despliegue (`npm run db:migrate`) con ese usuario.

## Registro

1. **Crear el runner en GitLab**: proyecto → *Settings → CI/CD → Runners → New project runner*.
   - *Tags*: `incident-hub`
   - *Run untagged jobs*: sin marcar
   - *Runner description*: `incident-hub-<equipo>`
   - **Create runner**. GitLab muestra un token que empieza con `glrt-`. Cópialo; no se vuelve a mostrar.
2. **Descargar el binario**: crea `C:\GitLab-Runner` y descarga ahí [gitlab-runner-windows-amd64.exe](https://gitlab-runner-downloads.s3.amazonaws.com/latest/binaries/gitlab-runner-windows-amd64.exe). Renómbralo a `gitlab-runner.exe`.
3. **Registrar** (PowerShell en `C:\GitLab-Runner`):

   ```powershell
   .\gitlab-runner.exe register --non-interactive `
     --url https://gitlab.com `
     --token glrt-XXXXXXXXXXXXXXXX `
     --executor shell `
     --shell pwsh
   ```

   Se crea `C:\GitLab-Runner\config.toml`. El token queda solo en ese archivo, fuera del repositorio.
4. **Rutas largas** (una vez, PowerShell como administrador): `git config --system core.longpaths true`
5. **Desactivar los runners de GitLab.com**: *Settings → CI/CD → Runners → Instance runners* → desactivar *Enable instance runners for this project*. Así todos los jobs usan tu runner.

## Ejecución

Antes de cada sesión de trabajo (y después de reiniciar el equipo), abre **dos** ventanas de PowerShell:

```powershell
# Ventana 1: daemon de PM2 compartido por staging y producción
$env:PM2_HOME = 'C:\incident-hub\.pm2'
pm2 ping
pm2 resurrect   # vuelve a levantar los ambientes desplegados
```

```powershell
# Ventana 2: el runner (déjala abierta; muestra cada job)
cd C:\GitLab-Runner
.\gitlab-runner.exe run
```

El daemon de PM2 se inicia fuera del runner a propósito: las aplicaciones quedan como hijas del daemon y siguen vivas cuando termina el job de despliegue.

En GitLab, el runner debe aparecer con el círculo verde (*online*) en *Settings → CI/CD → Runners*.

## Qué ocurre en el equipo al desplegar

```
C:\GitLab-Runner\
├── gitlab-runner.exe
├── config.toml           configuración y token del runner
└── builds\               copia de trabajo de cada job
C:\incident-hub\
├── .pm2\                 PM2_HOME (procesos incident-hub-staging / -production)
├── scripts\              copia de deploy/smoke-test/rollback (los usa el rollback automático)
├── staging\
│   ├── current\          versión activa (backend + frontend compilado + .env)
│   └── previous\         versión anterior
└── production\
    ├── current\
    └── previous\
```

Para revisar los procesos:

```powershell
$env:PM2_HOME = 'C:\incident-hub\.pm2'
pm2 ls
pm2 logs incident-hub-staging --lines 50
```

- Staging: http://localhost:4001
- Producción: http://localhost:4000

## Problemas frecuentes

| Síntoma | Causa | Solución |
|---|---|---|
| Jobs en *pending* con "no runners that match all of the job's tags" | Runner apagado o sin el tag | Ejecuta `.\gitlab-runner.exe run`; revisa que el runner tenga el tag `incident-hub` |
| `pwsh` no se reconoce | Falta PowerShell 7 | `winget install --id Microsoft.PowerShell` y reinicia la ventana del runner |
| `No se encontró 'pm2' en el equipo del runner` | PM2 instalado para otro usuario | Ejecuta el runner con tu usuario (no como servicio de sistema) |
| La app se detiene al terminar el job | El daemon de PM2 nació dentro del job | Inicia el daemon antes con `pm2 ping` (ventana 1) |
| `Filename too long` al clonar | Rutas largas de Windows | `git config --system core.longpaths true` |
| Smoke test con `baseDatos: error` | Base del ambiente inexistente o contraseña incorrecta | Crea la base; revisa `DB_*` en las variables de GitLab |
| El check *Pipeline de GitLab* falla por tiempo | El runner estaba apagado cuando llegó el push | Enciende el runner; el pipeline corre y puedes volver a ejecutar el check (*Re-run jobs*) |
