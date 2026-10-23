#!/usr/bin/env node
/**
 * Extrae de CHANGELOG.md la sección de una versión para usarla como notas del release.
 *
 * Uso: node devops/scripts/notas-release.js <versión> [CHANGELOG.md] [salida.md]
 * Sin archivo de salida imprime las notas en la consola.
 */
const fs = require('fs');
const path = require('path');

const [version, archivo = path.join(__dirname, '..', '..', 'CHANGELOG.md'), salida] = process.argv.slice(2);

if (!version) {
  console.error('Uso: node notas-release.js <versión> [CHANGELOG.md] [salida.md]');
  process.exit(2);
}

function extraerNotas(texto, buscada) {
  const lineas = texto.split(/\r?\n/);
  const encabezado = new RegExp(`^##\\s+\\[${buscada.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\]`);
  const inicio = lineas.findIndex((linea) => encabezado.test(linea));
  if (inicio === -1) return null;

  const fin = lineas.findIndex((linea, i) => i > inicio && (/^##\s+\[/.test(linea) || /^\[[^\]]+\]:\s/.test(linea)));
  return lineas
    .slice(inicio + 1, fin === -1 ? undefined : fin)
    .join('\n')
    .trim();
}

const notas = extraerNotas(fs.readFileSync(archivo, 'utf8'), version) || `Versión ${version}.`;

if (salida) {
  fs.mkdirSync(path.dirname(path.resolve(salida)), { recursive: true });
  fs.writeFileSync(salida, `${notas}\n`, 'utf8');
} else {
  process.stdout.write(`${notas}\n`);
}
