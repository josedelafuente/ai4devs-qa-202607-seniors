# Especificación en Gherkin de la vista "position", acordada antes de escribir
# las pruebas. Cada escenario está implementado en cypress/e2e/position.cy.js,
# con la tabla de trazabilidad escenario → prueba en la cabecera de ese archivo.
#
# Se redactó en lenguaje de dominio —manager, candidato, fase, proceso de
# contratación— y no en pasos de interfaz, siguiendo los anti-patrones que
# enumera la lección de BDD del módulo: nada de "hago clic", un solo When por
# escenario, y ninguna referencia a identificadores técnicos ni a rutas de API.

# language: es

Característica: Gestión de candidatos por fase del proceso de contratación
  Como manager responsable de una posición
  quiero ver a los candidatos repartidos por la fase en la que están
  y poder avanzarlos o retrocederlos
  para llevar el proceso sin salir de una sola pantalla.

  Antecedentes:
    Dado que el manager abre la posición "Senior Full-Stack Engineer"

  Escenario: El tablero identifica la posición que se está gestionando
    Entonces ve el nombre de la posición encabezando el tablero

  Escenario: El tablero refleja el proceso de contratación completo
    Entonces ve una columna por cada fase del proceso

  Escenario: Cada candidato aparece en la fase en la que se encuentra
    Entonces ve a cada candidato en la columna de su fase actual
    Y ve el nombre completo y la puntuación media de cada uno

  Escenario: Una fase sin candidatos se muestra igual, pero vacía
    Entonces ve la columna de la fase "Manager Interview" sin ningún candidato

  Escenario: El tablero se arma completo aunque la información llegue desordenada
    Dado que la información de las fases tarda más que la de los candidatos
    Entonces ve a cada candidato en la columna de su fase actual

  Escenario: El manager avanza a un candidato a la fase siguiente
    Dado que "Carlos García" está en la fase "Initial Screening"
    Cuando el manager lo mueve a la fase "Technical Interview"
    Entonces ve a "Carlos García" en la fase "Technical Interview"
    Y ya no lo ve en la fase "Initial Screening"

  Escenario: El cambio de fase queda registrado en el sistema
    Dado que "Carlos García" está en la fase "Initial Screening"
    Cuando el manager lo mueve a la fase "Technical Interview"
    Entonces el sistema registra que "Carlos García" pasó a "Technical Interview"

  Escenario: El cambio de fase sobrevive a volver a abrir el tablero
    Dado que "Carlos García" está en la fase "Initial Screening"
    Cuando el manager lo mueve a la fase "Technical Interview"
    Y vuelve a abrir el tablero
    Entonces ve a "Carlos García" en la fase "Technical Interview"

  Escenario: El manager devuelve a un candidato a una fase anterior
    Dado que "John Doe" está en la fase "Technical Interview"
    Cuando el manager lo mueve a la fase "Initial Screening"
    Entonces ve a "John Doe" en la fase "Initial Screening"

  Escenario: Una posición sin proceso definido no ofrece tablero
    Dado que el manager abre la posición "Data Scientist"
    Entonces ve el nombre de la posición encabezando el tablero
    Y no ve ninguna columna de fases
