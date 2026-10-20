#!/usr/bin/env node
/**
 * Ejecuta `npm audit`, genera un reporte Markdown y decide si el pipeline debe fallar.
 *
 * Uso:
 *   node devops/scripts/auditoria.js --dir backend --out reports/auditoria-backend.md --falla-en high
 *
 * Política (ver docs/dependencias.md):
 *   - El reporte incluye TODAS las dependencias (producción y desarrollo).
 *   - El pipeline falla solo si una dependencia de PRODUCCIÓN tiene severidad >= --falla-en.
 */
const { spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const NIVELES = ['info', 'low', 'moderate', 'high', 'critical'];
const ETIQUETA = { info: 'Info', low: 'Baja', moderate: 'Moderada', high: 'Alta', critical: 'Crítica' };

// Anotaciones según dónde se ejecute: GitHub Actions las muestra en la ejecución;
// en GitLab CI y en local se imprimen como texto.
function anotar(tipo, mensaje) {
  if (process.env.GITHUB_ACTIONS) console.log(`::${tipo}::${mensaje}`);
  else console.log(`${tipo === 'error' ? 'ERROR' : 'AVISO'}: ${mensaje}`);
}

function argumento(nombre, porDefecto) {
  const indice = process.argv.indexOf(`--${nombre}`);
  return indice > -1 ? process.argv[indice + 1] : porDefecto;
}

function auditar(directorio, soloProduccion) {
  const args = ['audit', '--json'];
  if (soloProduccion) args.push('--omit=dev');
  const resultado = spawnSync('npm', args, {
    cwd: directorio,
    encoding: 'utf8',
    shell: process.platform === 'win32',
    maxBuffer: 20 * 1024 * 1024
  });
  try {
    return JSON.parse(resultado.stdout);
  } catch {
    console.error(resultado.stderr || 'npm audit no devolvió JSON');
    process.exit(2);
  }
}

function filas(reporte) {
  return Object.values(reporte.vulnerabilities || {})
    .map((vuln) => {
      const avisos = vuln.via.filter((via) => typeof via === 'object');
      const correccion =
        vuln.fixAvailable === true
          ? 'npm audit fix'
          : vuln.fixAvailable
            ? `${vuln.fixAvailable.name}@${vuln.fixAvailable.version}${vuln.fixAvailable.isSemVerMajor ? ' (cambio mayor)' : ''}`
            : 'Sin corrección publicada';
      return {
        paquete: vuln.name,
        severidad: vuln.severity,
        directa: vuln.isDirect ? 'Sí' : 'No',
        aviso: avisos.length ? avisos.map((a) => `[${a.title}](${a.url})`).join('<br>') : `Vía ${vuln.via.join(', ')}`,
        rango: vuln.range,
        correccion
      };
    })
    .sort((a, b) => NIVELES.indexOf(b.severidad) - NIVELES.indexOf(a.severidad) || a.paquete.localeCompare(b.paquete));
}

function main() {
  const directorio = path.resolve(argumento('dir', '.'));
  const salida = argumento('out');
  const fallaEn = argumento('falla-en', 'high');

  const completo = auditar(directorio, false);
  const produccion = auditar(directorio, true);
  const resumen = completo.metadata.vulnerabilities;
  const resumenProd = produccion.metadata.vulnerabilities;

  const lineas = [
    `# Auditoría de dependencias — ${path.basename(directorio)}`,
    '',
    `Fecha: ${new Date().toISOString()}`,
    '',
    '| Alcance | Crítica | Alta | Moderada | Baja | Total |',
    '|---|---|---|---|---|---|',
    `| Producción | ${resumenProd.critical} | ${resumenProd.high} | ${resumenProd.moderate} | ${resumenProd.low} | ${resumenProd.total} |`,
    `| Todas (incluye desarrollo) | ${resumen.critical} | ${resumen.high} | ${resumen.moderate} | ${resumen.low} | ${resumen.total} |`,
    '',
    `Umbral de bloqueo: dependencias de producción con severidad **${ETIQUETA[fallaEn]}** o superior.`,
    ''
  ];

  const detalle = filas(completo);
  if (detalle.length) {
    lineas.push('| Paquete | Severidad | Directa | Aviso | Rango vulnerable | Corrección |', '|---|---|---|---|---|---|');
    for (const fila of detalle) {
      lineas.push(
        `| ${fila.paquete} | ${ETIQUETA[fila.severidad]} | ${fila.directa} | ${fila.aviso} | ${fila.rango} | ${fila.correccion} |`
      );
    }
  } else {
    lineas.push('No se encontraron vulnerabilidades conocidas.');
  }

  const markdown = lineas.join('\n') + '\n';
  if (salida) {
    fs.mkdirSync(path.dirname(path.resolve(salida)), { recursive: true });
    fs.writeFileSync(salida, markdown);
    console.log(`Reporte escrito en ${salida}`);
  }
  console.log(markdown);

  const umbral = NIVELES.indexOf(fallaEn);
  const bloqueantes = NIVELES.slice(umbral).reduce((suma, nivel) => suma + (resumenProd[nivel] || 0), 0);
  if (bloqueantes > 0) {
    anotar('error', `${bloqueantes} vulnerabilidad(es) de producción con severidad >= ${fallaEn}`);
    process.exit(1);
  }
  if (resumen.total > 0) {
    anotar('warning', `${resumen.total} vulnerabilidad(es) por debajo del umbral; ver reporte`);
  }
}

main();
