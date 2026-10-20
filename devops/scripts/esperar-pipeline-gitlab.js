#!/usr/bin/env node
/**
 * Espera el pipeline de GitLab del commit que se acaba de enviar al espejo
 * y termina con el mismo resultado. Así el estado del pipeline principal
 * (GitLab CI, runner autohospedado) aparece como check en el PR de GitHub.
 *
 * Variables de entorno:
 *   GITLAB_TOKEN       token con alcance read_api (secreto de GitHub)
 *   GITLAB_PROYECTO    ruta del proyecto, p. ej. incident-hub-umg/incident-hub
 *   GITLAB_HOST        por defecto gitlab.com
 *   COMMIT_SHA, RAMA   por defecto GITHUB_SHA y GITHUB_REF_NAME
 *   TIEMPO_MAXIMO_MIN  por defecto 30
 *   INTERVALO_SEG      por defecto 15
 */
const fs = require('fs');

const host = process.env.GITLAB_HOST || 'gitlab.com';
const api = (process.env.GITLAB_API_URL || `https://${host}/api/v4`).replace(/\/$/, '');
const proyecto = process.env.GITLAB_PROYECTO;
const token = process.env.GITLAB_TOKEN;
const sha = process.env.COMMIT_SHA || process.env.GITHUB_SHA;
const rama = process.env.RAMA || process.env.GITHUB_REF_NAME;
const tiempoMaximo = Number(process.env.TIEMPO_MAXIMO_MIN || 30) * 60 * 1000;
const intervalo = Number(process.env.INTERVALO_SEG || 15) * 1000;

const FINALES = ['success', 'failed', 'canceled', 'skipped', 'manual'];
const EXITOSOS = ['success', 'manual'];

const esperar = (ms) => new Promise((resolver) => setTimeout(resolver, ms));

function resumen(markdown) {
  if (process.env.GITHUB_STEP_SUMMARY) fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY, `${markdown}\n`);
}

function error(mensaje) {
  console.log(process.env.GITHUB_ACTIONS ? `::error::${mensaje}` : `ERROR: ${mensaje}`);
}

async function buscarPipeline() {
  const url =
    `${api}/projects/${encodeURIComponent(proyecto)}/pipelines` +
    `?sha=${encodeURIComponent(sha)}&ref=${encodeURIComponent(rama)}&order_by=id&sort=desc&per_page=1`;
  const respuesta = await fetch(url, { headers: { 'PRIVATE-TOKEN': token } });
  if (respuesta.status === 401 || respuesta.status === 403) {
    throw new Error('GitLab rechazó el token (GITLAB_TOKEN). Verifica que no haya expirado y que tenga read_api.');
  }
  if (respuesta.status === 404) {
    throw new Error(`No existe el proyecto ${proyecto} en ${host} o el token no tiene acceso.`);
  }
  if (!respuesta.ok) throw new Error(`GitLab respondió ${respuesta.status} al consultar pipelines.`);
  const lista = await respuesta.json();
  return lista[0] || null;
}

async function main() {
  for (const [nombre, valor] of Object.entries({ GITLAB_TOKEN: token, GITLAB_PROYECTO: proyecto, COMMIT_SHA: sha, RAMA: rama })) {
    if (!valor) {
      error(`Falta la variable ${nombre}.`);
      process.exit(1);
    }
  }

  console.log(`Esperando el pipeline de GitLab para ${rama} @ ${sha.slice(0, 8)}...`);
  const limite = Date.now() + tiempoMaximo;
  let ultimoEstado = null;
  let pipeline = null;

  while (Date.now() < limite) {
    pipeline = await buscarPipeline();
    if (pipeline && pipeline.status !== ultimoEstado) {
      console.log(`[${new Date().toISOString()}] pipeline #${pipeline.id}: ${pipeline.status} ${pipeline.web_url}`);
      ultimoEstado = pipeline.status;
    } else if (!pipeline && ultimoEstado === null) {
      console.log('Todavía no hay pipeline para este commit en GitLab...');
      ultimoEstado = 'sin-pipeline';
    }
    if (pipeline && FINALES.includes(pipeline.status)) break;
    await esperar(intervalo);
  }

  if (!pipeline || !FINALES.includes(pipeline.status)) {
    const estado = pipeline ? pipeline.status : 'sin pipeline';
    error(
      `El pipeline no terminó en ${Math.round(tiempoMaximo / 60000)} min (estado: ${estado}). ` +
        '¿Está encendido el runner (gitlab-runner run) en el equipo autohospedado?'
    );
    if (pipeline) resumen(`### Pipeline de GitLab\n\nSin terminar (${estado}): ${pipeline.web_url}`);
    process.exit(1);
  }

  const ok = EXITOSOS.includes(pipeline.status);
  resumen(
    `### Pipeline de GitLab\n\n| Pipeline | Rama | Estado |\n|---|---|---|\n` +
      `| [#${pipeline.id}](${pipeline.web_url}) | \`${rama}\` | ${ok ? '✅' : '❌'} ${pipeline.status} |`
  );
  if (!ok) {
    error(`El pipeline de GitLab terminó en estado ${pipeline.status}: ${pipeline.web_url}`);
    process.exit(1);
  }
  console.log(`Pipeline de GitLab en estado ${pipeline.status}: ${pipeline.web_url}`);
}

main().catch((err) => {
  error(err.message);
  process.exit(1);
});
