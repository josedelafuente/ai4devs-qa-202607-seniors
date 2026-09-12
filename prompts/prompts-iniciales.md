# Módulo 11 — Pruebas E2E con Cypress: prompts y método

**Autor:** José De La Fuente · **Ejecución asistida por:** Claude Opus 5 en Claude Code
**Fecha:** 11 de septiembre de 2026

---

## 0. Cómo leer este documento

El enunciado pide incluir «la descripción del ejercicio y las instrucciones necesarias para la
ejecución de las pruebas E2E». Este documento trae eso y, además, **los prompts que realmente se
usaron**, sin reconstruirlos a posteriori.

Una aclaración que hace falta para que se entienda lo que sigue: **el trabajo no se dirigió con
prompts de generación del tipo «genera un test que…»**. Se dirigió como una conversación de trabajo en
la que el humano fija el criterio y decide, y el agente ejecuta, mide y reporta. Los prompts literales
de este ejercicio son, entonces, de dos clases:

- **Las instrucciones y decisiones del humano**, transcritas en la sección 3 con la ortografía y la
  puntuación normalizadas, sin cambiar lo que dicen.
- **Los briefs a los agentes de lectura**, que sí son prompts largos y estructurados. En la sección 4
  se reproduce completo el que decidió la estrategia de las pruebas.

Reconstruir una secuencia prolija de prompts que nunca ocurrió habría sido más cómodo de leer y falso.
La lección de BDD de este mismo módulo llama «escenarios fantasma» a esa tentación.

---

## 1. El ejercicio

Escribir pruebas end-to-end con Cypress sobre la vista «position» del repositorio base: verificar la
carga de la página —título, columnas por fase, candidatos en su columna— y el cambio de fase de un
candidato mediante arrastre, comprobando que la fase se actualiza en el backend.

## 2. El método de análisis y ejecución

Seis pasos, en el orden en que se aplicaron sobre el repositorio. Cada uno existe porque el anterior
dejó algo sin resolver.

1. **Relevar el repositorio antes de clonarlo.** Saber qué mecanismo de arrastre usa la vista, qué
   atributos expone el DOM y qué rutas registra el backend decide la estrategia de las pruebas. Se hizo
   con un agente de lectura acotado, obligado a traer también lo que contradijera el encargo.
2. **Verificar los contratos contra el servidor corriendo, no contra la documentación.** Los tres
   endpoints se consultaron de verdad y las respuestas se guardaron. Ahí aparecieron la doble anidación
   del flujo, la fase que viaja por nombre mientras la actualización espera un id, y el `orderIndex`
   repetido entre dos fases.
3. **Desbloquear el riesgo técnico antes de construir nada.** Un solo punto podía invalidar el
   ejercicio entero: si el arrastre de `react-beautiful-dnd` no se puede disparar desde Cypress, el
   segundo escenario del enunciado no existe. Se resolvió con una sonda mínima —una prueba que solo
   mueve una tarjeta— antes de escribir una línea de la suite.
4. **Establecer las precondiciones en vez de asumirlas.** Cada prueba impone por API la fase en que
   arranca cada candidato. La base es persistente y cualquier uso de la aplicación la cambia, así que
   una prueba que confía en el estado que encuentra pasa hoy y falla mañana sin que nadie toque el
   código.
5. **Escribir las pruebas y después romperlas a propósito.** La lección «Testing Asistido por AI» de
   este módulo advierte sobre el *test theater*: cobertura alta y baja capacidad de detectar
   regresiones reales. Sin mutar lo que la suite dice vigilar, «esta prueba cuida X» es una intención y
   no un hecho. Aquí falló dos veces, con pruebas que sobre el papel parecían correctas.
6. **Revisión adversarial antes de publicar.** Hecha sobre el código y sobre este documento, buscando
   afirmaciones que el código no sostuviera y aserciones que pasaran con el sistema roto. De ahí
   salieron tres correcciones a la suite.

## 3. Prompts literales — las instrucciones del humano

Son las que fijaron el método y las que decidieron cada bifurcación, en el orden en que se dieron.

**Sobre el método de trabajo, al empezar:**

> «Te paso el enunciado y el entregable para leerlos y entender qué se pide y de qué trata. Antes de
> tocar nada vamos a aprender la lección, tomando en cuenta nuestra primera lectura: qué cosas mejora y
> qué información nos salta como relevante para realizar el entregable correctamente.»

**Sobre el alcance, al descubrir que el repositorio base ya trae la vista implementada:**

> «Pero sí, hay que trabajar sobre este repo.»
> «No migrar nada.»

**Sobre la elección de herramientas, tras leer que la lección recomienda Playwright y el enunciado
exige Cypress:**

> «La decisión es optimizar tiempos sin dejar de cumplir. Además, la experiencia en Cypress nos viene
> bien. Pero terminemos las lecciones primero y luego decidimos con la información completa.»

Resuelto después como: Playwright para explorar la aplicación y descubrir selectores, Cypress para el
entregable.

**Sobre el nivel de formalización de la especificación en Gherkin:**

> «Lleguemos primero hasta el nivel 2 y veamos cómo va. Si hay tiempo, lo que podemos hacer es tratar
> de implementar el nivel 3; y si se complica, ya tenemos un entregable funcional.»

**Sobre el defecto de carga encontrado por las propias pruebas —la decisión más importante del
ejercicio:**

> «Sí, corrijámoslo en el front, tocando únicamente lo necesario. Entiendo que, si no tocáramos esto,
> tampoco se corregiría el defecto: tendríamos un test que dice que falla y documentaríamos que sabemos
> que falla. Mejor arreglarlo y tener un test que realmente detecte y haga el trabajo.»

**Sobre un segundo defecto encontrado probando la aplicación a mano —el orden de las tarjetas dentro de
una columna—, después de evaluar las dos formas de resolverlo:**

> «No lo arreglemos: no hace falta, ahora que entiendo qué implican las dos opciones. Dejémoslo como
> F13.»

**Sobre el encuadre del entregable:**

> «Los cambios que se realizaron están justificados para la demostrabilidad de los tests creados y
> probados. No es alcance extra: es el ejercicio completo, en esencia.»

## 4. Prompts literales — los briefs a los agentes de lectura

Estos sí son prompts estructurados. Se reproduce completo el más relevante: el relevamiento del
repositorio base, hecho **antes** de clonarlo, para saber contra qué se iba a escribir.

> Eres un agente de lectura. Vas a relevar un repositorio base de un ejercicio de curso para que José
> sepa contra qué va a escribir pruebas E2E. NO escribas código ni propongas una solución: describe lo
> que hay.
>
> **Contexto (con su procedencia).** Verificado con `gh api`: el repo es
> `LIDR-academy/ai4devs-qa-202607-seniors`, rama por defecto `main`. En `frontend/src/components` hay
> `AddCandidateForm.js`, `CandidateCard.js`, `CandidateDetails.js`, `FileUploader.js`,
> `PositionDetails.js`, `Positions.tsx`, `RecruiterDashboard.js`, `StageColumn.js`. Verificado en el
> enunciado: el ejercicio pide instalar Cypress, crear `position.spec.js` en `/cypress/integration`, y
> probar la carga de la página y el cambio de fase por `PUT /candidate/:id`. **Hipótesis, sin
> verificar:** que la ruta `/cypress/integration` y ese endpoint no coincidan con lo que el repo y las
> versiones actuales usan realmente. Compruébalo, no lo des por cierto en ninguno de los dos sentidos.
>
> **Tu encargo.** (1) La vista position que ya trae el repo: qué mecanismo de arrastre usa —librería
> concreta con su versión, o nativo—, qué atributos exponen los elementos que un test tendría que
> seleccionar, cómo se estructuran columnas y tarjetas en el DOM, y qué llamada hace al backend al
> mover una tarjeta, con método, ruta y cuerpo exactos. (2) Cypress: si está declarado y con qué
> versión, si existe carpeta y configuración. (3) Las rutas reales del backend, con el método y la
> ruta literal tal como están registradas, para poder compararlos con el enunciado. (4) Cómo se levanta
> el proyecto y qué datos deja sembrados el seed: un test E2E necesita saber qué existe. (5) Cada punto
> donde lo que pide el enunciado no coincide con lo que hay en el repo.
>
> **CONTRAEJEMPLO, obligatorio.** Trae también lo que contradiga el contexto que te di, incluida la
> hipótesis. Si el enunciado sí coincide con el repo donde yo sospecho que no, dilo.
>
> **LO QUE NO PUEDAS CONCLUIR:** una línea por ítem con el artefacto concreto que abriste para
> intentarlo. Nunca la categoría, siempre el archivo.
>
> **NO DIAGNOSTIQUES.** Describe lo que hay. Si te tienta una conclusión sobre cómo debería testearse,
> va en una sección aparte rotulada «hipótesis, sin verificar».
>
> **ALCANCE.** Solo `gh` contra ese repo. No clones nada, no escribas archivos.
>
> **CREDENCIALES.** El repo tiene un `.env` commiteado: no imprimas su contenido. Si necesitas saber
> qué variables define, di solo los nombres de las claves, nunca sus valores.

Tres cosas de este brief explican la calidad de lo que volvió: **se declara la procedencia de cada dato
del contexto** para que el agente no construya sobre lo no verificado; **se pide el contraejemplo**,
incluida evidencia contra la propia hipótesis de quien escribe; y **se exige nombrar el archivo
concreto** de lo que no se pudo cerrar, en vez de una categoría vaga.

Ese brief devolvió, entre otras cosas, que la vista usa `react-beautiful-dnd` y no arrastre nativo —lo
que cambió por completo la estrategia de la prueba— y que la ruta real es `PUT /candidates/:id` en
plural, no la del enunciado.

## 5. Lo que se verificó antes de escribir una sola prueba

Los tres endpoints, consultados contra el servidor real. Las respuestas completas están en el
repositorio, en `prompts/evidencia/`: `contrato-interviewflow.json`, `contrato-candidates.json` y
`contrato-put-candidate.json`.

```
GET /positions/1/interviewflow
{"interviewFlow":{"positionName":"Senior Full-Stack Engineer","interviewFlow":{"id":1,
 "interviewSteps":[{"id":1,"name":"Initial Screening","orderIndex":1},
                   {"id":2,"name":"Technical Interview","orderIndex":2},
                   {"id":3,"name":"Manager Interview","orderIndex":2}]}}}

GET /positions/1/candidates
[{"fullName":"John Doe","currentInterviewStep":"Technical Interview","candidateId":1,
  "applicationId":1,"averageScore":5}, …]

PUT /candidates/3   body {"applicationId":4,"currentInterviewStep":2}
{"message":"Candidate stage updated successfully", …}   → 200
```

Tres cosas que solo se ven mirando el servidor y que decidieron el diseño de las pruebas:

- La respuesta del flujo viene **doblemente anidada**: `interviewFlow.interviewFlow.interviewSteps`.
- La lista de candidatos trae la fase **por nombre**, mientras que la actualización espera **el id**.
- **Dos fases comparten `orderIndex`**, así que el orden de las columnas no está garantizado.

## 6. Cómo ejecutar las pruebas

Requisitos: PostgreSQL disponible, y el backend y el frontend levantados.

```bash
# 1. Dependencias
cd backend  && npm install
cd ../frontend && npm install

# 2. Base de datos, migraciones y datos de prueba
cd ..
docker-compose up -d
cd backend
npx prisma generate
npx prisma migrate deploy
npx ts-node --transpile-only prisma/seed.ts

# 3. Backend en el puerto 3010  (dejar corriendo)
npm run dev

# 4. Frontend en el puerto 3000  (en otra terminal, desde la raíz del proyecto)
cd frontend && npm start

# 5. Las pruebas  (en una tercera terminal)
cd frontend
npx cypress open     # interfaz interactiva
npx cypress run      # sin ventana, para integración continua
```

Dos notas de instalación que cuestan un rato si no se saben:

- El seed **no corre** con `npx ts-node prisma/seed.ts`: falla con `Debug Failure. False expression:
  Non-string value passed to ts.resolveTypeReferenceDirective`, por un choque entre las versiones de
  `ts-node` y TypeScript del repositorio. Se resuelve con `--transpile-only`, la misma bandera que usa
  el script `dev` del propio backend.
- `prisma/schema.prisma` trae **la URL de la base escrita a mano** en vez de `env("DATABASE_URL")`, así
  que cambiar el `.env` no cambia a qué base apunta Prisma. Conviene comprobar el destino con
  `npx prisma migrate status`, que imprime la base real, antes de migrar.

**Las pruebas no dependen de la fase en que quede cada candidato**: cada una impone ese punto de
partida por API antes de correr. Sí dependen de los datos del seed —los identificadores, los nombres y
las posiciones—, así que la base tiene que estar sembrada.

## 7. Qué cubre cada prueba

Archivo: `frontend/cypress/e2e/position.cy.js`. Especificación en Gherkin acordada antes de escribirlo:
`frontend/cypress/features/position.feature`, con la trazabilidad anotada en la cabecera del spec.

| # | Prueba | Qué verifica |
|---|---|---|
| 1 | Muestra el título de la posición | El nombre correcto encabeza el tablero |
| 2 | Muestra una columna por cada fase | Tres columnas, cada una con su nombre |
| 3 | Cada candidato en la columna de su fase | Ubicación, nombre completo y puntuación |
| 4 | Deja vacía la columna sin candidatos | Una fase sin gente se muestra igual |
| 5 | Pinta los candidatos aunque las fases lleguen después | Regresión del defecto de carga |
| 6 | Mueve la tarjeta a la nueva columna | El arrastre funciona en la interfaz |
| 7 | Actualiza la fase con `PUT /candidates/:id` | Método, ruta, cuerpo y código de respuesta |
| 8 | Conserva la fase después de recargar | Persistencia real, no solo estado en memoria |
| 9 | Permite mover a un candidato hacia atrás | El camino inverso |
| 10 | Una posición sin fases no muestra columnas | Caso borde |

**Tres corridas seguidas en verde**, de 7, 7 y 6 segundos.

## 8. Cuatro decisiones de diseño, cada una con su motivo medido

1. **El estado de partida se impone por API, no se asume.** Una prueba falló porque un candidato estaba
   en otra fase, después de probar el arrastre a mano en el navegador. La base es persistente y
   mutable: sobrevive entre corridas y cualquier uso de la aplicación la cambia. Sin imponer el punto
   de partida, un fallo significa dos cosas a la vez —el código se rompió, o los datos son otros— y
   deja de servir para diagnosticar. Vigilar la consistencia de los datos vivos es un trabajo real,
   pero es otro: validaciones de integridad sobre la base o monitoreo sintético del ambiente, no la
   prueba que verifica una funcionalidad.
2. **Las columnas se localizan por su título, nunca por índice.** Dos fases comparten `orderIndex` y su
   orden no está garantizado.
3. **Ninguna aserción mira el lugar de una tarjeta dentro de su columna.** Ese orden no se persiste y la
   consulta del backend no lleva `order by`.
4. **El arrastre se dispara con la interfaz de teclado de `react-beautiful-dnd`.** Los eventos de mouse
   sintéticos no funcionan con esa librería. El ayudante lee del DOM el índice de la columna de origen y
   el de la de destino y calcula cuántas flechas pulsar, de modo que no depende del orden en que lleguen
   las fases.

## 9. Controles positivos: cómo se comprobó que las pruebas detectan

Una suite en verde solo demuestra que hoy no se rompió nada. Para saber si vigila algo hay que romper a
propósito lo que dice vigilar. Se hizo con un guion que aplica cada mutación, corre la suite, registra
qué cayó y restaura siempre —incluso si se interrumpe—.

**Es reproducible**: `bash prompts/evidencia/controles-positivos.sh`, con el backend y el frontend
levantados. La salida de la última corrida está en `prompts/evidencia/controles-positivos.txt`.

| Mutación | Pruebas que caen |
|---|---|
| Sin mutar | 0 de 10 |
| El título deja de mostrarse | 2 |
| Las columnas pierden el atributo que las identifica | 8 |
| El reparto de candidatos por fase se rompe | 7 |
| El cambio de fase no avisa al backend | 3 |
| La puntuación deja de exponerse | 1 |
| Se revierte el arreglo del defecto de carga | 1 |

**El resultado más informativo es el cuarto.** Al desconectar el aviso al backend caen la prueba del
`PUT`, la de persistencia y la del movimiento hacia atrás, **pero «mueve la tarjeta» sigue pasando** —
porque la interfaz la mueve igual, es optimista. La suite distingue lo que se ve de lo que se guarda.

**Y dos controles fallaron al primer intento**, que es para lo que sirve el ejercicio.

El primero: revertir el arreglo del defecto de carga daba 10 en verde, porque ese defecto es
intermitente y esa vez ganó la petición correcta. Una prueba que solo falla a veces no es una red. Se
corrigió agregando la prueba 5, que **fuerza el orden** en vez de esperarlo: retrasa la respuesta de
las fases para que la de los candidatos gane siempre. Verificada en los dos sentidos: con el arreglo
pasa, sin el arreglo falla esa prueba y solo esa.

El segundo lo detectó la revisión adversarial del cierre, contrastando la tabla contra la salida real:
**la prueba 4 sobrevivía a la mutación del reparto**. La causa era un anclaje que faltaba — las
columnas se pintan antes que las tarjetas, así que un «no hay nadie en esta fase» se cumple también en
la ventana en la que todavía no hay nadie en ninguna. Se corrigió esperando a que el tablero esté
completo antes de afirmar el vacío; ahora esa mutación tumba 7 pruebas en vez de 6.

## 10. Los cambios en la aplicación, y por qué son parte del ejercicio

Se tocaron tres componentes del frontend. **Ninguno agrega funcionalidad al producto**: los tres son
condiciones para que las pruebas que el enunciado pide sean verificables.

- **`data-testid` en la vista, las columnas y las tarjetas.** Sin ellos, las pruebas solo podrían
  agarrarse de clases de Bootstrap, que es exactamente lo que la lección del módulo desaconseja: *«un
  cambio de clase no debe romper tus tests»*.
- **Arreglo del defecto de carga en `PositionDetails.js`.** Con el defecto presente, la suite falla de
  forma intermitente y no prueba nada. El arreglo son cinco líneas dentro del `useEffect`.

El defecto lo encontraron estas mismas pruebas y está descrito en la sección 11 como F10.

## 11. Fricciones encontradas

Cada una con dónde vive y qué se hizo. Las siete primeras salieron de leer el repositorio; el resto solo
aparecieron al ejecutarlo.

| # | Fricción | Qué se hizo |
|---|---|---|
| F1 | El enunciado dice `PUT /candidate/:id`; la ruta real es `PUT /candidates/:id`, plural | Se usa la real, y se declara |
| F2 | El enunciado pide el spec en `/cypress/integration` con extensión `.spec.js`, estructura de Cypress 9 | Se usa `cypress/e2e/position.cy.js`, que es lo que documenta la propia lección del módulo desde Cypress 10 |
| F3 | La vista reparte las tarjetas comparando la fase **por nombre**, mientras el `PUT` manda el **id** | Documentado; las pruebas no dependen de esa doble representación |
| F4 | Dos fases del flujo comparten `orderIndex`: el orden de las columnas no es determinista | Las columnas se localizan por título |
| F5 | Ningún elemento tenía atributo estable para las pruebas | Se agregaron `data-testid` |
| F6 | No existía la carpeta `prompts/` | Creada con este documento |
| F7 | La posición «Data Scientist» no tiene fases y renderiza sin columnas | Cubierto como caso borde (prueba 10) |
| F8 | `schema.prisma` trae la URL de la base escrita a mano; el `.env` no decide el destino | Documentado en la sección 6 |
| F9 | El seed no corre sin `--transpile-only` | Documentado en la sección 6 |
| F10 | **Condición de carrera en la carga**: las fases y los candidatos se pedían en paralelo y, si los candidatos llegaban primero, no se pintaba ninguna tarjeta | **Arreglado**, con prueba de regresión (prueba 5) |
| F11 | El `PUT` no revierte la interfaz si falla: la tarjeta ya se movió y solo se registra el error en consola | Documentado; queda como mejora sugerida |
| F12 | `onDragEnd` muta el estado directamente antes de `setStages` | Documentado |
| F13 | **El orden de las tarjetas dentro de una columna no se conserva al recargar**: no hay campo donde guardarlo y la consulta no lleva `order by` | Documentado; ninguna prueba depende de ese orden. Resolverlo exige tocar el modelo de datos |
| F14 | El checklist de pull request del `README` es de otro ejercicio: pide desplegar en AWS y un pipeline de GitHub Actions | Se cumplen los puntos que aplican; se declara en el PR |

## 12. Límites y riesgos

- **La prueba del arrastre depende de la interfaz de teclado de `react-beautiful-dnd`.** Si esa
  librería se reemplaza, hay que reescribir el ayudante. Es un compromiso consciente: los eventos de
  mouse sintéticos no funcionan con ella.
- **No hay integración continua.** El enunciado no la pide y montarla habría sido alcance ajeno.
- **Las pruebas necesitan el backend y la base reales**, que es lo que las hace end-to-end y también lo
  que las hace más lentas y frágiles que una prueba con dobles.
- **El montaje usa el mismo endpoint que verifica una de las pruebas.** El estado de partida se impone
  con `PUT /candidates/:id`, que es lo que comprueba la prueba 7: hay una dependencia circular parcial.
  Está acotada por dos lados —si ese endpoint responde con error, `cy.request` corta la prueba; y si
  respondiera bien pero guardara mal, la prueba 3 lo detectaría porque el tablero no coincidiría con lo
  esperado—, pero no eliminada. Lo limpio sería sembrar la base desde fuera de la aplicación antes de
  cada suite, de modo que el montaje no dependa de nada que se esté probando. Se dejó así porque exigía
  una tarea de base de datos desde Cypress, más maquinaria de la que este ejercicio justifica.
- **F11 y F13 quedan sin resolver a propósito**, porque las dos exigen tocar el backend y el enunciado
  circunscribe los cambios a `/frontend`.
- **Todo el código generado con asistencia de IA fue revisado y ejecutado antes de entrar**, y cada
  afirmación de este documento está respaldada por una medición contra el sistema corriendo. La lección
  del módulo lo dice sin rodeos: *«la revisión humana del código generado sigue siendo no negociable»*.

## 13. Autoría

| Pieza | Quién la produjo | Quién decidió y aprobó |
|---|---|---|
| Método de trabajo y orden de las fases | Propuesta de la IA sobre el método planteado por José | José |
| Relevamiento del repositorio y contratos | IA | — |
| Estrategia del arrastre por teclado | IA | José |
| Arreglar el defecto de carga | Hallazgo de la IA | **José**, con el criterio de que una prueba que documenta un fallo conocido no hace el trabajo |
| Dejar F13 sin resolver | Análisis de la IA | **José**, tras evaluar las dos opciones y su costo |
| Suite de pruebas y controles positivos | IA | José |
| Encuadre del entregable | **José** | José |
| Este documento | IA | José |
