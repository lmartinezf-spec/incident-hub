# Análisis de dependencias

## Cómo se analiza

| Dónde | Herramienta | Cuándo | Qué bloquea |
|---|---|---|---|
| GitLab CI (job `dependencias`) | `devops/scripts/auditoria.js` sobre `npm audit` | Cada push: ramas, `main` y tags | Vulnerabilidad **alta o crítica** en dependencias de **producción** |
| GitHub Actions (`validacion-pr.yml`) | Mismo script + `actions/dependency-review-action` | Cada PR | Lo mismo + dependencias nuevas del PR con severidad alta |
| Local | `node devops/scripts/auditoria.js --dir backend` | Antes de agregar paquetes | — |

El reporte completo (producción + desarrollo) queda como artefacto `reports/` del job `dependencias` en cada pipeline de GitLab y como resumen en GitHub Actions.

**Política de decisión**

| Severidad | Dependencia de producción | Solo desarrollo |
|---|---|---|
| Crítica / Alta | Bloquea el pipeline. Actualizar o reemplazar antes de integrar | Corregir en la semana; si no hay corrección, documentar mitigación |
| Moderada | Corregir si existe parche compatible; si no, documentar | Documentar y revisar en cada release |
| Baja | Revisar en el siguiente release | Aceptar y documentar |

Nunca se usa `npm audit fix --force` sin revisar: puede instalar versiones mayores incompatibles (o incluso más antiguas).

## Inventario

### Backend — producción

| Paquete | Versión | Uso |
|---|---|---|
| express | ^5.3.0 | Servidor HTTP y rutas |
| pg | ^8.23.1 | Cliente PostgreSQL |
| jsonwebtoken | ^9.0.3 | Firma y verificación de JWT |
| bcryptjs | ^3.0.3 | Hash de contraseñas |
| helmet | ^8.3.0 | Cabeceras de seguridad |
| cors | ^2.8.6 | Política CORS |
| express-rate-limit | ^8.7.1 | Límite de intentos de login (TD-02) |
| dotenv | ^18.0.8 | Variables de entorno locales |
| morgan | ^1.12.1 | Log de peticiones |

### Backend — desarrollo
jest, supertest, jest-junit, eslint, @eslint/js, globals.

### Frontend
Producción: react, react-dom, react-router. Desarrollo: vite, @vitejs/plugin-react, vitest, oxlint. El frontend se compila a archivos estáticos: sus dependencias no se instalan en los servidores.

## Resultados del análisis (v0.4.0, 22 de octubre de 2026)

> Actualiza esta sección con el reporte del job `dependencias` del pipeline que genera el release; los avisos de seguridad cambian con el tiempo.

| Alcance | Crítica | Alta | Moderada | Baja |
|---|---|---|---|---|
| Backend — producción | 0 | 0 | 0 | 0 |
| Backend — desarrollo | 0 | 0 | 19 | 0 |
| Frontend — todas | 0 | 0 | 0 | 0 |

### Hallazgo DEP-01 · `sprintf-js` (moderada, solo desarrollo)

| Campo | Valor |
|---|---|
| Aviso | [GHSA-hp3w-g68c-fv3c](https://github.com/advisories/GHSA-hp3w-g68c-fv3c) — denegación de servicio por especificadores de precisión sin límite |
| Paquete vulnerable | `sprintf-js` ≤ 1.1.3 (no existe versión corregida publicada) |
| Ruta | `jest` → `@jest/core` → `@jest/transform` → `babel-plugin-istanbul` → `@istanbuljs/load-nyc-config` → `js-yaml@3` → `argparse@1` → `sprintf-js@1.0.3` |
| Paquetes reportados | 19 (todos son la misma cadena de Jest) |
| Corrección sugerida por npm | `jest@25.0.0` — es un **cambio mayor hacia atrás** (Jest 25 es de 2020) |
| Exposición | Ninguna en producción: solo se usa al calcular cobertura durante las pruebas, con archivos de configuración del propio repositorio; no llega al artefacto (`npm ci --omit=dev`) |

**Decisión: riesgo aceptado y monitoreado.** Degradar Jest a la versión 25 introduciría más vulnerabilidades y rompería la configuración actual; un `overrides` a `sprintf-js` no es posible porque no existe versión corregida. Se revisa en cada release y se actualizará Jest cuando el aviso tenga corrección.

## Cómo agregar una dependencia

1. Verificar mantenimiento (último release, descargas, issues abiertos) y licencia.
2. Instalar con versión exacta de rango compatible: `npm install paquete@^x.y.z`.
3. Ejecutar `node devops/scripts/auditoria.js --dir backend` y revisar el resultado.
4. Registrar en esta página el paquete y su uso, dentro del mismo PR.
