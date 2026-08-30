# CONTEXTO DEL PROYECTO INTEGRADOR --- ESENCIALES

## 1. Identificación del proyecto

**Emprendimiento:** Esenciales\
**Proyecto / sistema:** Sistema Web de Gestión de Catálogo para
Esenciales\
**Nombre técnico sugerido para carpeta y repositorio:**
`esenciales-catalogo-web`

Esenciales es un emprendimiento real creado por uno de los integrantes
del grupo. Comercializa lociones, splash, cremas, humidificadores y
otros productos.

El proyecto integrador se desarrollará inicialmente para Esenciales como
caso real. La prioridad es construir durante el curso un MVP Full Stack
completo, funcional, desplegado y sustentable.

## 2. Decisión de alcance

El grupo evaluó dos alternativas:

1.  Desarrollar una solución enfocada inicialmente en Esenciales.
2.  Desarrollar desde el inicio una plataforma general donde cualquier
    emprendedor pueda registrarse y crear su catálogo.

Se decidió trabajar con la **opción 1** durante el curso y conservar la
**opción 2 como evolución futura**.

La razón es controlar el alcance de un proyecto desarrollado por tres
integrantes en aproximadamente ocho semanas y priorizar una solución
terminada antes que una plataforma más ambiciosa incompleta.

La evolución multiemprendimiento es una posibilidad futura y **no
constituye un requisito del MVP actual**.

## 3. Situación que origina el proyecto

Antes de contar con una herramienta para organizar este proceso,
Esenciales manejaba información de sus productos mediante Excel. Para
presentar el catálogo a un cliente era necesario enviar numerosas
fotografías por WhatsApp ---aproximadamente 50 en algunos casos--- y los
precios no se encontraban centralizados de una forma clara y fija para
su consulta.

El proyecto toma esta situación como caso de estudio para centralizar la
administración y publicación del catálogo mediante una aplicación web.

El uso actual o previo de plataformas comerciales externas no es el eje
del proyecto. Si académicamente se pregunta por la situación actual del
emprendimiento, debe responderse con información real y no inventar
condiciones.

## 4. Problema preliminar

Esenciales necesita una forma organizada de administrar y presentar sus
productos a los clientes. El manejo de información mediante Excel y el
envío individual de numerosas fotografías por WhatsApp dificultan la
consulta organizada de productos, precios y disponibilidad. Se propone
centralizar esta información en una aplicación web que facilite tanto la
administración del catálogo como su consulta por parte de los clientes.

Esta formulación es preliminar y deberá ajustarse cuando corresponda
según las indicaciones metodológicas del profesor y el desarrollo del
informe técnico.

## 5. Solución propuesta

Desarrollar una aplicación web para la gestión y publicación del
catálogo de productos de Esenciales.

El propietario podrá administrar la información del catálogo,
categorías, productos, precios e inventario. Los clientes podrán
consultar el catálogo sin necesidad de registrarse inicialmente,
seleccionar productos mediante un carrito y generar una solicitud de
cotización.

La solicitud deberá quedar registrada en la aplicación. Adicionalmente,
se preparará un mensaje con los productos seleccionados para dirigir al
cliente al WhatsApp de Esenciales. El usuario será quien continúe y
envíe el mensaje desde WhatsApp; no se contempla inicialmente una
integración compleja con la API de WhatsApp.

## 6. Alcance preliminar del MVP

El alcance debe mantenerse realizable por tres integrantes durante las
ocho semanas del curso.

Funcionalidades candidatas:

1.  Autenticación para los usuarios que administran el sistema.
2.  Administración de la información del catálogo de Esenciales.
3.  Administración de categorías.
4.  Administración de productos, precios e imágenes.
5.  Manejo básico de inventario o disponibilidad.
6.  Catálogo público para los clientes.
7.  Carrito de productos.
8.  Generación y registro de solicitudes de cotización con
    enlace/mensaje hacia WhatsApp.

Estas funcionalidades son preliminares y deben validarse con las
indicaciones del profesor antes de considerarse requisitos definitivos.

### Fuera del MVP inicial

No se consideran requisitos actuales:

-   Pasarela de pagos.
-   Facturación electrónica.
-   Contabilidad.
-   Manejo avanzado de deudas o abonos.
-   Suscripciones o planes comerciales.
-   Múltiples emprendimientos o múltiples catálogos independientes.
-   Funcionalidades avanzadas equivalentes a plataformas comerciales
    existentes.

No deben incorporarse sin una decisión explícita del grupo o una
indicación del profesor.

## 7. Actores y roles preliminares

### Administrador

Gestiona los aspectos administrativos generales que finalmente se
definan para el sistema.

### Propietario / administrador de Esenciales

Administra el catálogo, categorías, productos, precios, inventario y
solicitudes de cotización.

### Cliente / visitante

Consulta el catálogo, selecciona productos y genera una solicitud de
cotización. Inicialmente no necesita registrarse.

Los permisos definitivos deberán concretarse durante el análisis de
requisitos.

## 8. Reglas de negocio preliminares

Reglas candidatas identificadas:

1.  **Disponibilidad:** no permitir solicitar una cantidad de producto
    superior a las unidades disponibles.
2.  **Cotización válida:** una solicitud de cotización solo puede
    generarse cuando el carrito contiene al menos un producto disponible
    con una cantidad válida.
3.  **Producto agotado:** un producto sin disponibilidad puede mostrarse
    como agotado, pero no debe poder agregarse al carrito de cotización.

Son reglas preliminares. Deben validarse con el caso real y con las
indicaciones del profesor antes de tratarlas como definitivas.

## 9. Flujo principal esperado

Propietario inicia sesión → administra categorías, productos, precios e
inventario → catálogo queda disponible para consulta → cliente consulta
productos → agrega productos al carrito → sistema valida la solicitud →
registra la cotización → prepara el mensaje con los productos → cliente
continúa la conversación por WhatsApp con Esenciales.

El flujo debe mantenerse sencillo y poder demostrarse de principio a fin
durante la sustentación.

## 10. Evolución futura

Después de validar el MVP para Esenciales, la solución podría
evolucionar hacia una:

**Plataforma web para la creación y administración de catálogos de
productos para múltiples emprendimientos.**

En esa versión, diferentes emprendedores podrían registrarse, crear y
personalizar su catálogo y administrar únicamente sus propios productos,
inventario y solicitudes.

Esta capacidad no forma parte del alcance actual. Las decisiones
técnicas pueden evitar bloqueos innecesarios para una evolución futura,
pero no se debe añadir complejidad al MVP solamente para anticiparla.

## 11. Criterios académicos considerados

Según las indicaciones compartidas por el profesor, el proyecto debe
mantenerse alineado con criterios como:

-   Empresa o emprendimiento real y accesible.
-   Problema o proceso real susceptible de mejora.
-   Modelo de datos con varias entidades y relaciones.
-   Al menos dos roles con permisos diferentes.
-   Al menos tres reglas de negocio no triviales.
-   MVP alcanzable en ocho semanas por tres personas y con alcance
    funcional controlado.
-   Flujo completo demostrable de principio a fin.

## 12. Principios para futuras decisiones

1.  Las indicaciones explícitas del profesor tienen prioridad.
2.  No inventar problemas, necesidades ni requisitos para justificar
    funcionalidades.
3.  Diferenciar entre requisitos confirmados, propuestas preliminares y
    evolución futura.
4.  Priorizar un MVP completo, funcional y sustentable.
5.  No intentar replicar plataformas comerciales existentes.
6.  Evaluar toda nueva funcionalidad según valor, complejidad y tiempo
    disponible.
7.  Mantener coherencia entre problema, objetivos, requisitos, interfaz,
    implementación, resultados e informe técnico.
8.  Actualizar este documento cuando el grupo o el profesor confirmen
    decisiones que cambien el contexto del proyecto.
