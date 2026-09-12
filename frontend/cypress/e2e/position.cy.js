/// <reference types="cypress" />

/**
 * Pruebas E2E de la vista "position" — módulo 11, AI4Devs.
 *
 * Cubre los dos escenarios del enunciado:
 *   1. Carga de la página: título, columnas por fase, y cada candidato en la
 *      columna que le corresponde.
 *   2. Cambio de fase: arrastrar una tarjeta a otra columna, comprobar que se
 *      mueve y que la fase se actualiza en el backend.
 *
 * Tres decisiones que explican la forma de este archivo, cada una con su
 * motivo medido (el detalle está en la documentación de la entrega):
 *
 *   · El estado de partida se IMPONE por API en beforeEach, no se asume. La
 *     base es compartida y cualquier uso manual de la aplicación la deja en
 *     otro punto; un test que asume el seed pasa hoy y falla mañana sin que
 *     nadie toque el código.
 *   · Las columnas se localizan por su título, nunca por índice: dos fases del
 *     flujo comparten orderIndex y el orden en que llegan no está garantizado.
 *   · Ninguna aserción mira el lugar de una tarjeta DENTRO de su columna. Ese
 *     orden no se persiste y la consulta del backend no lleva `order by`, así
 *     que solo se afirma en qué columna está cada candidato.
 *
 * El arrastre se dispara con la interfaz de teclado de react-beautiful-dnd,
 * disponible porque la tarjeta lleva el dragHandle de la librería. Los eventos
 * de mouse sintéticos no sirven con esta librería.
 *
 * TRAZABILIDAD con cypress/features/position.feature, que es la especificación
 * en Gherkin acordada antes de escribir estas pruebas:
 *
 *   Escenario del .feature                                    → prueba
 *   ─────────────────────────────────────────────────────────────────────────
 *   El tablero identifica la posición                         → 1
 *   El tablero refleja el proceso completo                    → 2
 *   Cada candidato aparece en la fase en la que se encuentra  → 3
 *   Una fase sin candidatos se muestra igual, pero vacía      → 4
 *   El tablero se arma completo aunque la información
 *     llegue desordenada                                      → 5
 *   El manager avanza a un candidato a la fase siguiente      → 6
 *   El cambio de fase queda registrado en el sistema          → 7
 *   El cambio sobrevive a volver a abrir el tablero           → 8
 *   El manager devuelve a un candidato a una fase anterior    → 9
 *   Una posición sin proceso definido no ofrece tablero       → 10
 */

const API = 'http://localhost:3010';

const POSICION_CON_FASES = 1;
const POSICION_SIN_FASES = 2;

const CANDIDATOS = {
  johnDoe: { id: 1, applicationId: 1, nombre: 'John Doe', puntuacion: '5' },
  janeSmith: { id: 2, applicationId: 3, nombre: 'Jane Smith', puntuacion: '4' },
  carlosGarcia: { id: 3, applicationId: 4, nombre: 'Carlos García', puntuacion: '0' },
};

const FASES = {
  screening: { id: 1, titulo: 'Initial Screening' },
  tecnica: { id: 2, titulo: 'Technical Interview' },
  manager: { id: 3, titulo: 'Manager Interview' },
};

// Estado de partida: quién está en qué fase antes de cada prueba.
const ESTADO_INICIAL = [
  [CANDIDATOS.johnDoe, FASES.tecnica],
  [CANDIDATOS.janeSmith, FASES.tecnica],
  [CANDIDATOS.carlosGarcia, FASES.screening],
];

const columna = (titulo) => `[data-testid="stage-column"][data-stage-title="${titulo}"]`;
const tarjeta = (candidato) => `[data-testid="candidate-card"][data-candidate-id="${candidato.id}"]`;

function imponerEstadoInicial() {
  ESTADO_INICIAL.forEach(([candidato, fase]) => {
    cy.request('PUT', `${API}/candidates/${candidato.id}`, {
      applicationId: candidato.applicationId,
      currentInterviewStep: fase.id,
    });
  });
}

/**
 * Mueve una tarjeta a otra columna con el teclado, sin asumir en qué posición
 * está cada columna: lee el índice de origen y destino del DOM y pulsa la
 * flecha que corresponda tantas veces como haga falta.
 */
function moverCandidatoA(candidato, faseDestino) {
  cy.get(tarjeta(candidato))
    .closest('[data-rbd-droppable-id]')
    .invoke('attr', 'data-rbd-droppable-id')
    .then((indiceOrigen) => {
      cy.get(columna(faseDestino.titulo))
        .invoke('attr', 'data-rbd-droppable-id')
        .then((indiceDestino) => {
          const pasos = Number(indiceDestino) - Number(indiceOrigen);
          const tecla = pasos > 0 ? 39 : 37; // flecha derecha o izquierda

          cy.get(tarjeta(candidato)).focus();
          cy.focused().trigger('keydown', { keyCode: 32, which: 32, force: true }); // levantar
          cy.wait(150);

          Cypress._.times(Math.abs(pasos), () => {
            cy.focused().trigger('keydown', { keyCode: tecla, which: tecla, force: true });
            cy.wait(150);
          });

          cy.focused().trigger('keydown', { keyCode: 32, which: 32, force: true }); // soltar
        });
    });
}

describe('Vista "position" — tablero de candidatos por fase', () => {
  beforeEach(() => {
    imponerEstadoInicial();
  });

  context('Escenario 1 — carga de la página', () => {
    beforeEach(() => {
      cy.visit(`/positions/${POSICION_CON_FASES}`);
    });

    it('muestra el título de la posición', () => {
      cy.get('[data-testid="position-title"]').should(
        'have.text',
        'Senior Full-Stack Engineer'
      );
    });

    it('muestra una columna por cada fase del proceso de contratación', () => {
      cy.get('[data-testid="stage-column"]').should('have.length', 3);

      Object.values(FASES).forEach((fase) => {
        cy.get(columna(fase.titulo))
          .find('[data-testid="stage-title"]')
          .should('have.text', fase.titulo);
      });
    });

    it('muestra cada candidato en la columna de su fase actual, con su nombre y su puntuación', () => {
      ESTADO_INICIAL.forEach(([candidato, fase]) => {
        cy.get(columna(fase.titulo))
          .find(tarjeta(candidato))
          .should('exist')
          .within(() => {
            cy.get('[data-testid="candidate-name"]').should('have.text', candidato.nombre);
            cy.get('[data-testid="candidate-score"]')
              .should('have.attr', 'data-score', candidato.puntuacion)
              // También lo que ve la persona, no solo el atributo que existe
              // para estas pruebas: si el render de los círculos se rompe, el
              // atributo seguiría estando y la prueba pasaría igual.
              .find('[role="img"]')
              .should('have.length', Number(candidato.puntuacion));
          });
      });
    });

    it('deja vacía la columna de una fase sin candidatos', () => {
      // Anclaje: las columnas se pintan antes que las tarjetas, así que sin
      // esperar a que el tablero esté completo, el "no existe" de abajo se
      // cumpliría en la ventana intermedia y la prueba pasaría aunque el
      // reparto hubiera puesto a alguien en esta fase.
      cy.get('[data-testid="candidate-card"]').should('have.length', 3);

      cy.get(columna(FASES.manager.titulo))
        .find('[data-testid="candidate-card"]')
        .should('not.exist');
    });
  });

  context('Escenario 1b — carga con las respuestas invertidas', () => {
    /**
     * Regresión del defecto que encontró esta misma suite: la vista pedía las
     * fases y los candidatos en paralelo, y repartía los candidatos con
     * setStages(prev => prev.map(...)). Si la respuesta de los candidatos
     * llegaba primero, prev era [] y las tarjetas no se pintaban nunca.
     *
     * El defecto era intermitente, así que aquí se fuerza el orden: se retrasa
     * la respuesta de las fases para que la de los candidatos gane siempre. Sin
     * el arreglo, este test falla todas las veces; con el arreglo, pasa todas.
     */
    it('pinta los candidatos aunque las fases lleguen después que ellos', () => {
      cy.intercept('GET', '**/positions/*/interviewFlow', (req) => {
        req.on('response', (res) => res.setDelay(1500));
      }).as('fases');

      cy.visit(`/positions/${POSICION_CON_FASES}`);
      cy.wait('@fases');

      cy.get('[data-testid="stage-column"]').should('have.length', 3);
      ESTADO_INICIAL.forEach(([candidato, fase]) => {
        cy.get(columna(fase.titulo)).find(tarjeta(candidato)).should('exist');
      });
    });
  });

  context('Escenario 2 — cambio de fase de un candidato', () => {
    beforeEach(() => {
      cy.intercept('PUT', '**/candidates/*').as('actualizarFase');
      cy.visit(`/positions/${POSICION_CON_FASES}`);
    });

    it('mueve la tarjeta del candidato a la nueva columna', () => {
      cy.get(columna(FASES.screening.titulo))
        .find(tarjeta(CANDIDATOS.carlosGarcia))
        .should('exist');

      moverCandidatoA(CANDIDATOS.carlosGarcia, FASES.tecnica);

      cy.get(columna(FASES.tecnica.titulo))
        .find(tarjeta(CANDIDATOS.carlosGarcia))
        .should('exist');
      cy.get(columna(FASES.screening.titulo))
        .find(tarjeta(CANDIDATOS.carlosGarcia))
        .should('not.exist');

      // A propósito, esta prueba NO espera el PUT: verifica solo lo que ve la
      // persona. Que el backend se entere es asunto de la prueba siguiente, y
      // mantenerlas separadas es lo que permite distinguir un fallo de interfaz
      // de uno de persistencia. El riesgo de que un PUT en vuelo ensucie la
      // prueba siguiente lo cubre la precondición que cada una afirma.
    });

    it('actualiza la fase en el backend con PUT /candidates/:id', () => {
      // La precondición se afirma en cada prueba, no solo en la primera: si el
      // candidato ya estuviera en la fase de destino, el movimiento sería de
      // cero columnas y el PUT saldría igual, con la fase correcta y sin que
      // nada se haya movido. La prueba pasaría sin probar nada.
      cy.get(columna(FASES.screening.titulo))
        .find(tarjeta(CANDIDATOS.carlosGarcia))
        .should('exist');

      moverCandidatoA(CANDIDATOS.carlosGarcia, FASES.tecnica);

      cy.wait('@actualizarFase').then(({ request, response }) => {
        expect(request.method).to.equal('PUT');
        expect(request.url).to.match(
          new RegExp(`/candidates/${CANDIDATOS.carlosGarcia.id}$`)
        );
        expect(request.body).to.deep.equal({
          applicationId: CANDIDATOS.carlosGarcia.applicationId,
          currentInterviewStep: FASES.tecnica.id,
        });
        expect(response.statusCode).to.equal(200);
      });
    });

    it('conserva la nueva fase después de recargar la página', () => {
      cy.get(columna(FASES.screening.titulo))
        .find(tarjeta(CANDIDATOS.carlosGarcia))
        .should('exist');

      moverCandidatoA(CANDIDATOS.carlosGarcia, FASES.tecnica);
      cy.wait('@actualizarFase');

      cy.reload();

      cy.get(columna(FASES.tecnica.titulo))
        .find(tarjeta(CANDIDATOS.carlosGarcia))
        .should('exist');
    });

    it('permite mover un candidato hacia atrás en el proceso', () => {
      cy.get(columna(FASES.tecnica.titulo))
        .find(tarjeta(CANDIDATOS.johnDoe))
        .should('exist');

      moverCandidatoA(CANDIDATOS.johnDoe, FASES.screening);

      cy.wait('@actualizarFase').then(({ request }) => {
        expect(request.body.currentInterviewStep).to.equal(FASES.screening.id);
      });

      cy.get(columna(FASES.screening.titulo))
        .find(tarjeta(CANDIDATOS.johnDoe))
        .should('exist');
    });
  });

  context('Casos borde', () => {
    it('una posición cuyo flujo no tiene fases no muestra ninguna columna', () => {
      cy.visit(`/positions/${POSICION_SIN_FASES}`);

      cy.get('[data-testid="position-title"]').should('have.text', 'Data Scientist');
      cy.get('[data-testid="stage-column"]').should('not.exist');
    });
  });
});
