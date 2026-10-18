## Work Items (GitLab)

<!-- Una línea "Closes <URL>" por cada tarea o historia de GitLab que este PR completa.
     Copia la URL desde la barra del navegador. Al fusionar, el mensaje del merge
     commit incluye esta descripción, llega a GitLab y GitLab cierra esos work items. -->

Closes https://gitlab.com/<grupo>/incident-hub/-/work_items/<n>

## Descripción

<!-- Qué cambia y por qué. -->

## Tipo de cambio

- [ ] `feature/*` — nueva funcionalidad
- [ ] `fix/*` — corrección de error o deuda técnica
- [ ] `refactor/*` — mejora interna sin cambiar el comportamiento
- [ ] `release/*` — preparación de versión

## Validación

- [ ] `npm run lint` en backend y frontend
- [ ] `npm test` en backend y frontend
- [ ] Prueba manual (describe los pasos):
- [ ] Check **Pipeline de GitLab** en verde (pipeline principal en el runner autohospedado)
- [ ] Checks de GitHub Actions en verde (Backend, Frontend, Dependencias)

## Evidencia

<!-- Enlace al pipeline de GitLab, capturas sin secretos, resultados de pruebas. -->

## Checklist

- [ ] Cada commit termina con la referencia `GL-<n>` de su tarea
- [ ] Sin secretos, contraseñas ni tokens en el código, capturas o documentación
- [ ] Documentación en `docs/` actualizada si aplica
- [ ] `CHANGELOG.md` actualizado si el cambio es visible para el usuario
