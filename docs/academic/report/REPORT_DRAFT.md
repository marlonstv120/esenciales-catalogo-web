# Borrador del informe académico

Este es un borrador de trabajo basado en la estructura actual de la plantilla. No es el documento oficial ni contiene contenido no validado.

## Portada

**SISTEMA WEB PARA LA GESTIÓN Y PUBLICACIÓN DEL CATÁLOGO DE PRODUCTOS PARA LA EMPRESA ESENCIALES**

**Titulillo para el encabezado:** GESTIÓN DEL CATÁLOGO WEB DE ESENCIALES

**Integrantes:**

Janderson Santos Vega  
Daniel Steven Contreras Lopez  
Marlon Steev Velasco Paz

**Programa:** Ingeniería de Sistemas  
**Institución:** Fundación Tecnológica Autónoma del Pacífico  
**Docente / Asesor:** William Samuel Henao Gutierrez  
**Curso:** I.A. Aplicada al Desarrollo Full Stack  
**Lugar y fecha:** Santiago de Cali, fecha de entrega pendiente de confirmar

**Correspondencia:** Marlon Steev Velasco Paz  
**Dirección electrónica:** marlon.velasco.0ds@utap.edu.co

## Resumen

Este proyecto de investigación aplicada tiene como objetivo desarrollar una aplicación web full stack que permita la gestión, publicación y consulta del catálogo de productos, precios y disponibilidad de la empresa ESENCIALES. El trabajo adopta el Aprendizaje Basado en Proyectos y un proceso iterativo e incremental organizado en tres fases: diagnóstico mediante una entrevista de levantamiento de requerimientos con el propietario de ESENCIALES, desarrollo e integración de la solución, y validación mediante pruebas funcionales y despliegue. La solución articula una interfaz web con servicios de datos, autenticación administrativa, almacenamiento de imágenes y control de inventario. Como resultados verificables, se identifica el proceso actual de gestión y presentación del catálogo y sus dificultades, se consolida el alcance del producto mínimo viable y se definen requisitos, reglas de negocio, actores, flujos y un modelo de datos para gestionar categorías, productos, presentaciones, precios, disponibilidad y solicitudes de compra. Estos resultados establecen las bases funcionales y técnicas de un medio único orientado a sustituir la dispersión de información entre hojas de cálculo, publicaciones, fotografías y conversaciones por WhatsApp. Se concluye que la definición alcanzada responde de manera coherente a las necesidades de ESENCIALES y proporciona una base verificable para centralizar la información comercial, presentar ordenadamente los productos y mejorar la experiencia de consulta de los clientes.

## Palabras clave

Aplicación web, catálogo, inventario, productos.

## Abstract

This applied research project aims to develop a full-stack web application that supports the management, publication, and consultation of the ESENCIALES company's product catalog, prices, and availability. The study adopts Project-Based Learning and an iterative and incremental process organized into three phases: diagnosis through a requirements-gathering interview with the owner of ESENCIALES, development and integration of the solution, and validation through functional testing and deployment. The solution combines a web interface with data services, administrative authentication, image storage, and inventory control. As verifiable results, the study identifies the current catalog management and presentation process and its difficulties, defines the Minimum Viable Product's scope, and establishes requirements, business rules, actors, workflows, and a data model for managing categories, products, variants, prices, availability, and purchase requests. These results establish the functional and technical foundations of a single medium designed to replace information scattered across spreadsheets, posts, photographs, and WhatsApp conversations. The study concludes that the resulting definition responds coherently to the needs of ESENCIALES and provides a verifiable basis for centralizing commercial information, presenting products in an organized manner, and improving the customers' browsing experience.

## Keywords

Web application, catalog, inventory, products.

## Introducción

Una aplicación web full stack integra la interfaz que utilizan los usuarios con servicios de backend y una base de datos. El navegador envía solicitudes, los servicios aplican la lógica del sistema y la base de datos conserva la información; esta interacción permite consultar y actualizar contenidos desde distintos dispositivos. El desarrollo también comprende control de versiones, pruebas y despliegue para mantener una solución completa y verificable.

La relevancia académica del proyecto consiste en aplicar de forma integrada los conocimientos y competencias del curso de Opción de Grado en Desarrollo Web Full Stack a un caso real. El proceso relaciona los fundamentos técnicos estudiados con el diagnóstico de una necesidad, la construcción de un producto de software y su validación mediante la estrategia de Aprendizaje Basado en Proyectos.

El proyecto se limita al desarrollo de un producto mínimo viable (MVP) para la empresa ESENCIALES. Incluye autenticación administrativa; gestión de categorías, productos, presentaciones, imágenes, precios, inventario y disponibilidad; publicación y consulta del catálogo; búsqueda y filtros; carrito; registro de solicitudes de compra; continuación voluntaria por WhatsApp; y gestión administrativa de las solicitudes. Los clientes consultan el catálogo y registran solicitudes sin crear una cuenta. El sistema no procesa pagos ni considera una solicitud como una venta concluida. Tampoco incluye autenticación de clientes, facturación, contabilidad, una integración avanzada con la API de WhatsApp Business ni soporte para múltiples empresas. Estas delimitaciones mantienen un alcance realizable y concentrado en el problema identificado para ESENCIALES.

En cuanto a su estructura, el informe presenta el estudio de caso y la pregunta problema; luego expone el objetivo general y los tres objetivos específicos que orientan el proyecto. El marco conceptual desarrolla los conceptos técnicos que sustentan el trabajo y la metodología describe el enfoque y las fases del proceso. Posteriormente, la sección de resultados y análisis presenta los hallazgos y productos obtenidos. Finalmente, las conclusiones evalúan el cumplimiento de los objetivos, los alcances y las limitaciones del proyecto, seguidas de las referencias utilizadas.

### Estudio de caso

ESENCIALES es una empresa dedicada principalmente a la comercialización de perfumes inspirados 1.1, originales o importados y otros productos de perfumería. La información de su catálogo se gestiona en Excel y registros manuales, mientras los productos se presentan mediante Instagram, Facebook Marketplace, WhatsApp y ventas directas. Cuando un cliente solicita información, puede ser necesario enviarle numerosas fotografías de forma individual, llegando en algunos casos a cerca de cincuenta imágenes. Además, la información de los productos, precios y existencias no se encuentra reunida en un solo lugar que permita consultarla de manera clara y organizada.

Esta forma de trabajo hace más difícil mantener actualizados el catálogo y el inventario y presentar claramente la información de los productos. También dificulta que los clientes consulten los productos, sus precios y su disponibilidad, porque la información queda distribuida entre hojas de cálculo, registros, publicaciones y conversaciones. Por esta razón, ESENCIALES no cuenta con un medio centralizado que facilite la administración del catálogo y permita a los clientes consultar su información de manera organizada.

En las mipymes, la aptitud digital y la gestión estratégica de las tecnologías de información y comunicación se relacionan con la adopción del comercio electrónico y el desempeño organizacional (Alderete et al., 2016). Esta relación respalda la pertinencia de organizar la información comercial mediante una solución digital, sin asumir que el catálogo de ESENCIALES equivale a una plataforma completa de comercio electrónico.

Para responder a esta situación, el proyecto tiene como objetivo desarrollar una aplicación web full stack que permita la gestión, publicación y consulta del catálogo de productos, precios y disponibilidad de la empresa ESENCIALES. El trabajo se desarrolla en tres etapas: diagnóstico de la gestión actual del catálogo, desarrollo e integración de la solución, y validación mediante pruebas funcionales y despliegue. Su relevancia aplicada radica en reunir la información comercial, apoyar su administración y permitir que los clientes consulten los productos sin depender del envío individual de numerosas fotografías. La solución también registra solicitudes de compra y permite continuar voluntariamente la conversación comercial por WhatsApp.

### Pregunta problema

¿Cómo desarrollar una aplicación web full stack que permita centralizar la gestión, publicación y consulta del catálogo de productos, precios y disponibilidad de la empresa ESENCIALES?

## Objetivos

Los siguientes objetivos orientan el desarrollo y la validación de la solución propuesta.

### Objetivo general

Desarrollar una aplicación web full stack que permita la gestión, publicación y consulta del catálogo de productos, precios y disponibilidad de la empresa ESENCIALES.

### Objetivos específicos

1. Identificar el proceso actual de gestión y presentación del catálogo de la empresa ESENCIALES y las dificultades relacionadas con la organización y consulta de sus productos, precios y disponibilidad.
2. Desarrollar una solución web con funcionalidades de acceso administrativo, gestión del catálogo, publicación pública, búsqueda, filtrado y registro de solicitudes de compra, que responda a las dificultades identificadas en el diagnóstico.
3. Validar la aplicación web mediante pruebas funcionales y su despliegue en un entorno de producción para comprobar el cumplimiento de los requisitos definidos.

## Marco conceptual

El marco conceptual desarrolla cinco conceptos técnicos relacionados con el problema de la empresa ESENCIALES: funcionamiento de una aplicación web, persistencia e integridad de datos, organización del catálogo, publicación de imágenes y control de inventario. Cada concepto sustenta una decisión necesaria para diseñar y validar el producto mínimo viable.

### Aplicación Web Full Stack y Modelo Cliente-Servidor

Una aplicación web dinámica integra un cliente, normalmente el navegador, con servicios que procesan solicitudes y consultan o modifican datos; así puede mostrar contenido actualizado a partir de una base de datos (MDN Web Docs, 2025). El enfoque full stack reúne interfaz, servicios de backend y persistencia. En este proyecto, el frontend en HTML, CSS y JavaScript consume Supabase, plataforma que integra PostgreSQL, autenticación, almacenamiento de archivos y acceso a datos (Supabase, s. f.). Las funciones de PostgreSQL concentran las operaciones críticas sobre solicitudes e inventario, mientras que las políticas de seguridad restringen las operaciones administrativas.

### Base de Datos Relacional e Integridad de los Datos

El modelo relacional organiza los datos en tablas relacionadas mediante identificadores y restricciones, con el propósito de reducir redundancia y preservar consistencia (Codd, 1970). PostgreSQL representa categorías, productos, presentaciones, imágenes y solicitudes como entidades relacionadas. Esta estructura es necesaria porque el precio, el stock y la disponibilidad corresponden a cada presentación. Además, las transacciones agrupan cambios como una operación de todo o nada (PostgreSQL Global Development Group, s. f.); así, la confirmación o cancelación de una solicitud actualiza su estado y el inventario de forma atómica.

### Gestión de Información de Producto y Catálogo Digital

La gestión de información de producto organiza y mantiene los datos que identifican y presentan comercialmente un artículo, como nombre, categoría, presentación, precio, imagen y disponibilidad. La armonización de estos datos favorece su exactitud, integridad e intercambio entre canales (GS1, s. f.). En ESENCIALES, el catálogo digital centraliza la información hoy dispersa entre Excel, fotografías y WhatsApp. La separación entre categoría, producto y presentación permite administrar precio, inventario y disponibilidad por presentación, además de facilitar la búsqueda y los filtros públicos.

### Publicación de Contenido Multimedia

En el MVP, la publicación de contenido multimedia se limita a las imágenes de productos. Estas permiten al visitante reconocer y diferenciar los artículos del catálogo. Las imágenes informativas deben contar con alternativas textuales que comuniquen su información esencial (World Wide Web Consortium, 2026). Para cumplir este criterio, cada producto publicado tiene al menos una imagen asociada, texto alternativo cuando corresponde y una presentación adaptable a distintos dispositivos. Supabase Storage almacena los archivos y PostgreSQL conserva su relación con cada producto.

### Gestión de Inventario y Disponibilidad Comercial

La gestión de inventario controla las existencias para determinar qué productos pueden ofrecerse. La inexactitud de los registros es un problema operativo que puede afectar el cumplimiento de las solicitudes (DeHoratius & Raman, 2008), mientras que la definición de políticas de inventario debe considerar las características de los productos y la estrategia de la organización (González, 2020). En ESENCIALES, el stock se administra por presentación. Las presentaciones de venta inmediata están disponibles con stock positivo y agotadas con stock cero; las de bajo pedido no tienen stock local vendible y requieren confirmación comercial. Antes de registrar o confirmar una solicitud, una función de PostgreSQL valida la información vigente. El inventario solo se descuenta al confirmar y dentro de una transacción.

En conjunto, estos conceptos relacionan la organización del catálogo con su publicación, integridad y disponibilidad. Orientan el diseño, desarrollo y validación de la solución propuesta.

## Metodología

Para responder a la pregunta problema y orientar el cumplimiento de los objetivos, la metodología organiza el diagnóstico, el desarrollo y la validación de la solución. Las actividades ejecutadas se diferencian de las que todavía no cuentan con evidencia y los resultados se presentan en la sección correspondiente.

### 1. Tipo de Investigación

El proyecto adopta una investigación aplicada, porque atiende una necesidad concreta de la empresa ESENCIALES mediante el desarrollo de un producto mínimo viable. Su alcance es descriptivo y propositivo: identifica el proceso actual de gestión y presentación del catálogo y sus dificultades, y desarrolla una solución web coherente con los requisitos obtenidos.

### 2. Metodología de Desarrollo

La estrategia académica corresponde al Aprendizaje Basado en Proyectos. El desarrollo de software sigue un proceso iterativo e incremental que organiza el trabajo en entregas pequeñas, revisa su funcionamiento y permite realizar ajustes a partir de los requisitos, las reglas de negocio y la retroalimentación del actor.

### 3. Fases del Proyecto

**Fase 1. Diagnóstico.** Se identifica el proceso actual mediante una entrevista de levantamiento de requerimientos al propietario de ESENCIALES, quien también integra el equipo del proyecto. El cuestionario registra la situación inicial, las necesidades, las dificultades y las solicitudes del actor. A partir de las respuestas se elabora un briefing que sintetiza el problema, las prioridades y los resultados esperados, y el propietario valida su contenido y delimitaciones. Esta información se contrasta con el alcance del proyecto y se organiza en requisitos, reglas de negocio, actores, flujos, criterios de aceptación y modelo de datos.

**Fase 2. Desarrollo e integración.** Se construye la interfaz con HTML5, CSS3 y JavaScript y se integra con los servicios de Supabase para la persistencia en PostgreSQL, la autenticación administrativa, el almacenamiento de imágenes y las operaciones del catálogo, inventario y solicitudes de compra. Cada incremento se revisa contra los requisitos y criterios de aceptación definidos durante el diagnóstico.

**Fase 3. Validación y despliegue.** Se ejecutan pruebas funcionales, se registran y corrigen las incidencias identificadas, y se valida la solución con el propietario de ESENCIALES y usuarios seleccionados. La validación compara las necesidades obtenidas en la entrevista y sintetizadas en el briefing con las funcionalidades implementadas. También contrasta el proceso inicial con la solución obtenida y el diseño preliminar con la interfaz final. El despliegue proporciona una dirección pública estable para acceder al catálogo.

### 4. Participantes y Unidad de Análisis

El actor principal es el propietario de ESENCIALES, quien administra actualmente la información del catálogo y también integra el equipo del proyecto. Esta doble condición se declara para mantener claridad sobre el origen de la información y la validación. Los otros dos integrantes del equipo realizan la entrevista de diagnóstico. También participan usuarios seleccionados para revisar la consulta pública. La unidad de análisis es el proceso de gestión, publicación y consulta del catálogo, incluido el manejo de productos, precios, disponibilidad, inventario y solicitudes de compra.

### 5. Técnicas e Instrumentos

El diagnóstico utiliza una entrevista de levantamiento de requerimientos como técnica y un cuestionario de 37 preguntas como instrumento. Las respuestas constituyen el registro primario y el briefing sintetiza la información necesaria para validar el problema y priorizar el alcance. El análisis se complementa con la revisión de los archivos y materiales que utiliza la empresa para gestionar y presentar su catálogo. La información obtenida se organiza mediante una matriz de requisitos, reglas de negocio, flujos y criterios de aceptación. La validación utiliza casos de prueba funcional, listas de comprobación, registro de incidencias y evidencias visuales. Los hallazgos de la entrevista y la comparación con la solución implementada corresponden a la sección de resultados y análisis.

### 6. Herramientas Tecnológicas

El cliente utiliza Vite, HTML5, CSS3 y JavaScript. Supabase proporciona PostgreSQL, autenticación, almacenamiento de imágenes, políticas de seguridad y funciones para las operaciones críticas. Git y GitHub apoyan el control de versiones. Las pruebas funcionales y el despliegue se documentan mediante casos de prueba, capturas, registros de ejecución y la dirección pública de la aplicación.

## Resultados y análisis

Pendiente. No redactar resultados como hechos antes de obtener evidencia.

## Conclusiones

Pendiente. No anticipar conclusiones.

## Referencias

Alderete, M. V., Jones, C., & Motta, J. (2016). Gestión estratégica de tecnologías de información y comunicación y adopción del comercio electrónico en mipymes de Córdoba, Argentina. *Estudios Gerenciales, 32*(138), 4–13. https://doi.org/10.1016/j.estger.2015.12.003

Codd, E. F. (1970). A relational model of data for large shared data banks. *Communications of the ACM, 13*(6), 377–387. https://doi.org/10.1145/362384.362685

DeHoratius, N., & Raman, A. (2008). Inventory record inaccuracy: An empirical analysis. *Management Science, 54*(4), 627–641. https://doi.org/10.1287/mnsc.1070.0789

González, A. (2020). Un modelo de gestión de inventarios basado en estrategia competitiva. *Ingeniare. Revista Chilena de Ingeniería, 28*(1), 133–142. https://doi.org/10.4067/S0718-33052020000100133

GS1. (s. f.). *GS1 Global Data Model*. Recuperado el 5 de septiembre de 2026, de https://www.gs1.org/standards/gs1-global-data-model

MDN Web Docs. (2025, 23 de junio). *Client-server overview*. https://developer.mozilla.org/en-US/docs/Learn_web_development/Extensions/Server-side/First_steps/Client-Server_overview

PostgreSQL Global Development Group. (s. f.). *Transactions*. Recuperado el 5 de septiembre de 2026, de https://www.postgresql.org/docs/current/tutorial-transactions.html

Supabase. (s. f.). *Architecture*. Recuperado el 7 de septiembre de 2026, de https://supabase.com/docs/guides/getting-started/architecture

World Wide Web Consortium. (2026, 8 de abril). *Images tutorial*. Web Accessibility Initiative. https://www.w3.org/WAI/tutorials/images/
