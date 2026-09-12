#!/usr/bin/env bash
#
# Controles positivos de la suite E2E de la vista "position".
#
# Una suite en verde solo demuestra que hoy no se rompió nada. Para saber si de
# verdad vigila algo hay que romper a propósito lo que dice vigilar y comprobar
# que se pone en rojo. La lección "Testing Asistido por AI" de este módulo llama
# "test theater" a la suite con cobertura alta que no detecta regresiones.
#
# Cada mutación se aplica sobre el código, se corre la suite, se registra qué
# prueba cayó, y se revierte SIEMPRE, incluso si el guion se interrumpe.
#
# Uso:
#   bash prompts/evidencia/controles-positivos.sh
#
# Requisitos: backend en el puerto 3010 y frontend en el 3000, ya levantados,
# y la base sembrada con `npx ts-node --transpile-only prisma/seed.ts`.

set -uo pipefail

# Todo se resuelve desde la ubicación de este guion, así que funciona en
# cualquier máquina sin editar rutas.
AQUI="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO="$(cd "$AQUI/../.." && pwd)"
FRONT="$REPO/frontend"
COMPONENTES="$FRONT/src/components"
SALIDA="$AQUI/controles-positivos.txt"

ARCHIVOS=(
  "$COMPONENTES/PositionDetails.js"
  "$COMPONENTES/StageColumn.js"
  "$COMPONENTES/CandidateCard.js"
)

respaldar() { for f in "${ARCHIVOS[@]}"; do cp "$f" "$f.control-bak"; done; }
restaurar() { for f in "${ARCHIVOS[@]}"; do [ -f "$f.control-bak" ] && mv "$f.control-bak" "$f"; done; }
trap restaurar EXIT INT TERM

correr_suite() {
  sleep 6  # margen para que el frontend recompile tras la mutación
  (cd "$FRONT" && npx cypress run --spec "cypress/e2e/position.cy.js" --browser electron 2>&1) \
    | grep -E "^\s+[0-9]+\) |✓|passing|failing" \
    | sed -E 's/^\s+//'
}

# control <descripción> <archivo> <expresión sed>
control() {
  local descripcion="$1" archivo="$2" patron="$3"
  {
    echo ""
    echo "════════════════════════════════════════════════════════════"
    echo "MUTACIÓN: $descripcion"
    echo "  archivo: $(basename "$archivo")"
  } | tee -a "$SALIDA"

  local antes despues
  antes=$(md5sum "$archivo" | cut -d' ' -f1)
  sed -i -E "$patron" "$archivo"
  despues=$(md5sum "$archivo" | cut -d' ' -f1)

  if [ "$antes" = "$despues" ]; then
    echo "  ⚠ LA MUTACIÓN NO SE APLICÓ: el patrón no coincidió. Control inválido." | tee -a "$SALIDA"
    return
  fi

  echo "  resultado:" | tee -a "$SALIDA"
  correr_suite | sed 's/^/    /' | tee -a "$SALIDA"

  cp "$archivo.control-bak" "$archivo"
}

{
  echo "CONTROLES POSITIVOS — suite E2E de la vista position"
  echo "Fecha: $(date '+%Y-%m-%d %H:%M')"
  echo ""
  echo "Cada bloque rompe a propósito una cosa que la suite dice vigilar."
  echo "Un control es VÁLIDO si caen las pruebas que cubren esa cosa, y solo esas."
} > "$SALIDA"

respaldar

echo "=== Línea base: la suite sin mutar debe pasar entera ===" | tee -a "$SALIDA"
correr_suite | sed 's/^/    /' | tee -a "$SALIDA"

control \
  "El título de la posición deja de mostrarse" \
  "$COMPONENTES/PositionDetails.js" \
  's/\{positionName\}<\/h2>/{"TITULO ROTO"}<\/h2>/'

control \
  "Las columnas pierden el atributo que las identifica" \
  "$COMPONENTES/StageColumn.js" \
  's/data-stage-title=\{stage\.title\}/data-stage-title="ROTO"/'

control \
  "El reparto de candidatos por fase se rompe (compara contra la fase equivocada)" \
  "$COMPONENTES/PositionDetails.js" \
  's/candidate\.currentInterviewStep === stage\.title/candidate.currentInterviewStep === "ROTO"/'

control \
  "El cambio de fase deja de avisar al backend" \
  "$COMPONENTES/PositionDetails.js" \
  's/^(\s*)updateCandidateStep\(movedCandidate/\1\/\/ updateCandidateStep(movedCandidate/'

control \
  "La puntuación de la tarjeta deja de exponerse" \
  "$COMPONENTES/CandidateCard.js" \
  's/data-score=\{candidate\.rating\}/data-score="ROTO"/'

control \
  "Se revierte el arreglo de la condición de carrera (las cargas vuelven a ir en paralelo)" \
  "$COMPONENTES/PositionDetails.js" \
  's/^(\s*)await fetchInterviewFlow\(\);/\1fetchInterviewFlow();/'

restaurar
{
  echo ""
  echo "Archivos restaurados. Resultado completo en: ${SALIDA#$REPO/}"
} | tee -a "$SALIDA"
