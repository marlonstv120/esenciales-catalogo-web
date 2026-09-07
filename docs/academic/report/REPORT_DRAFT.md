# Borrador del informe académico

Este es un borrador de trabajo basado en la estructura actual de la plantilla. No es el documento oficial ni contiene contenido no validado.

## Portada

**SISTEMA WEB PARA LA GESTIÓN Y PUBLICACIÓN DEL CATÁLOGO DE PRODUCTOS DE ESENCIALES**

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

Pendiente de completar cuando existan objetivo validado, método, resultados y conclusiones suficientes. La plantilla indica entre 150 y 250 palabras.

## Palabras clave

Pendiente. Máximo cinco palabras según la plantilla.

## Abstract

Pending completion when validated evidence is available. The template specifies 150 to 250 words.

## Keywords

Pending. Maximum five words according to the template.

## Introducción

El proyecto se sitúa en el campo del desarrollo web full stack, en el cual se integran interfaces de usuario, servicios de backend, bases de datos, control de versiones y despliegue para construir soluciones completas. Esta orientación corresponde al carácter aplicado del curso de Opción de Grado en Desarrollo Web Full Stack, que propone atender necesidades reales del entorno mediante un producto integrador desarrollado bajo la estrategia de Aprendizaje Basado en Proyectos (Tecnológica Autónoma del Pacífico, 2026).

Esenciales es un emprendimiento dedicado a la comercialización de lociones, splash, cremas, humidificadores y otros productos. La información de su catálogo se gestiona en Excel y los productos se presentan a los clientes principalmente por WhatsApp. Cuando un cliente solicita información, puede ser necesario enviarle numerosas fotografías de forma individual, llegando en algunos casos a cerca de cincuenta imágenes. Además, la información de los productos y sus precios no se encuentra reunida en un solo lugar que permita consultarla de manera clara y organizada.

Esta forma de trabajo hace más difícil mantener organizado el catálogo y presentar claramente la información de los productos. También dificulta que los clientes consulten los productos, sus precios y su disponibilidad, ya que dependen de la información que se les envía por WhatsApp. Por esta razón, Esenciales no cuenta con un medio centralizado que facilite la administración del catálogo y permita a los clientes consultar su información de manera organizada.

¿Cómo desarrollar una aplicación web full stack que permita centralizar la gestión, publicación y consulta del catálogo de productos, precios y disponibilidad del emprendimiento Esenciales?

Para responder a esta pregunta, el proyecto tiene como objetivo desarrollar una aplicación web full stack para centralizar la gestión, publicación y consulta del catálogo de productos, precios y disponibilidad del emprendimiento Esenciales. Su relevancia aplicada radica en atender una necesidad real del emprendimiento mediante un medio que reúna la información del catálogo, apoye su administración y permita a los clientes consultar los productos sin depender del envío individual de numerosas fotografías por WhatsApp. La solución también permitirá registrar solicitudes de compra y continuar voluntariamente la conversación comercial mediante ese canal.

La relevancia académica del proyecto consiste en aplicar de forma integrada los conocimientos y competencias del curso a un caso real. El proceso comprende el diagnóstico de la situación, el desarrollo del frontend y el backend, la persistencia de datos, el control de versiones, las pruebas funcionales y el despliegue. De esta manera, el proyecto permite relacionar los fundamentos técnicos estudiados con la construcción y validación de un producto de software dentro de la estrategia de Aprendizaje Basado en Proyectos establecida por el curso.

El proyecto se limita al desarrollo de un producto mínimo viable (MVP) para el emprendimiento Esenciales. Incluye autenticación administrativa; gestión de categorías, productos, presentaciones, imágenes, precios, inventario y disponibilidad; publicación y consulta del catálogo; búsqueda y filtros; carrito; registro de solicitudes de compra; continuación voluntaria por WhatsApp; y gestión administrativa de las solicitudes. Los clientes podrán consultar el catálogo y registrar solicitudes sin crear una cuenta. El sistema no procesará pagos ni considerará una solicitud como una venta concluida. Tampoco incluirá autenticación de clientes, facturación, contabilidad, una integración avanzada con la API de WhatsApp Business ni soporte para múltiples emprendimientos. Estas delimitaciones permiten mantener un alcance realizable y concentrado en el problema identificado para Esenciales.

Después de esta introducción, el informe presenta el objetivo general y los tres objetivos específicos que orientan el proyecto. El marco conceptual desarrolla los conceptos técnicos que sustentan el trabajo y la metodología describe el enfoque y las fases seguidas. Posteriormente, la sección de resultados y análisis presenta los hallazgos y productos obtenidos durante el proceso. Finalmente, las conclusiones evalúan el cumplimiento de los objetivos, los alcances y las limitaciones del proyecto, seguidas de las referencias utilizadas.

## Objetivos

Los siguientes objetivos corresponden al alcance funcional aprobado por el equipo el 3 de septiembre de 2026 y fueron ajustados el 5 de septiembre de 2026 de acuerdo con las indicaciones metodológicas del profesor.

### Objetivo general

Desarrollar una aplicación web full stack para centralizar la gestión, publicación y consulta del catálogo de productos, precios y disponibilidad del emprendimiento Esenciales.

### Objetivos específicos

1. Diagnosticar el proceso actual de gestión y presentación del catálogo del emprendimiento Esenciales, identificando las dificultades relacionadas con la organización y consulta de sus productos, precios y disponibilidad.
2. Desarrollar una solución web con funcionalidades de acceso administrativo, gestión del catálogo, publicación pública, búsqueda, filtrado y registro de solicitudes de compra, que responda a las dificultades identificadas en el diagnóstico.
3. Validar la aplicación web mediante pruebas funcionales y su despliegue en un entorno de producción para comprobar el cumplimiento de los requisitos definidos.

## Marco conceptual

El presente marco conceptual reúne cinco fundamentos técnicos necesarios para sustentar el desarrollo de una solución web para el emprendimiento Esenciales. Los conceptos seleccionados se relacionan directamente con el problema identificado: la dispersión de la información del catálogo, la presentación manual de imágenes y la dificultad para consultar precios y disponibilidad. Estos conceptos explican los principios que orientarán el diseño, desarrollo y validación del producto mínimo viable.

### Gestión de Información de Producto y Catálogo Digital

La gestión de información de producto comprende la organización, actualización y conservación de los datos necesarios para identificar y presentar comercialmente un producto. Estos datos pueden incluir nombre, descripción, categoría, marca, presentación, precio, imagen y condiciones de disponibilidad. GS1 (s. f.) plantea que la armonización de la información de producto favorece su exactitud, integridad e intercambio entre diferentes canales.

Un catálogo digital es la representación organizada y publicable de esa información mediante un sistema informático. No consiste solamente en mostrar fotografías, sino en relacionar cada producto con los datos que permiten distinguirlo y consultarlo correctamente. En Esenciales, este concepto orienta la separación entre categoría, producto y presentación. El producto conservará la información general, mientras que cada presentación administrará su propia etiqueta, precio, inventario y disponibilidad. Esta organización busca reemplazar la dispersión actual entre Excel, fotografías y conversaciones de WhatsApp por una fuente centralizada de información.

La búsqueda y el filtrado forman parte de la consulta del catálogo digital. En Esenciales, la búsqueda por nombre permitirá localizar un producto específico y los filtros facilitarán la exploración por categoría y disponibilidad. El filtro de disponibilidad operará sobre las presentaciones: un producto coincidirá cuando al menos una de sus presentaciones públicas tenga el estado seleccionado. Estas funciones responden a la dificultad actual de consultar numerosos productos mediante fotografías enviadas individualmente por WhatsApp.

### Aplicación Web Full Stack y Modelo Cliente-Servidor

Una aplicación web dinámica funciona mediante la interacción entre un cliente, normalmente el navegador, y un servidor. El navegador envía solicitudes HTTP y presenta la interfaz, mientras que el servidor procesa las solicitudes, ejecuta las reglas del sistema, consulta o modifica la base de datos y devuelve una respuesta. A diferencia de un sitio estático, una aplicación dinámica puede generar su contenido a partir de información almacenada y actualizada en una base de datos (MDN Web Docs, 2025).

El desarrollo full stack integra las capas necesarias para construir este funcionamiento de principio a fin: frontend, backend y persistencia de datos. La orientación del curso contempla HTML5, CSS3 y JavaScript para la interfaz, Node.js y Express para los servicios del servidor, y una base de datos para almacenar información (Tecnológica Autónoma del Pacífico, 2026). En el proyecto, el frontend permitirá administrar y consultar el catálogo; el backend aplicará validaciones, reglas de disponibilidad y operaciones sobre solicitudes; y PostgreSQL conservará productos, presentaciones, precios, existencias y solicitudes de compra.

La comunicación entre el frontend y el backend se realizará mediante solicitudes HTTP y el intercambio de datos estructurados en formato JSON. Esto permitirá que la interfaz consulte el catálogo, envíe operaciones administrativas y registre solicitudes de compra, mientras el servidor centraliza las validaciones y reglas de negocio.

### Base de Datos Relacional e Integridad de los Datos

El modelo relacional organiza los datos mediante relaciones y permite operar sobre ellos sin depender de su representación física. Codd (1970) propuso este modelo para reducir problemas de redundancia y consistencia presentes en estructuras de datos anteriores. En una base de datos relacional, las relaciones se implementan mediante tablas vinculadas por identificadores y restricciones que permiten representar asociaciones entre entidades y proteger la integridad de los datos.

PostgreSQL es el sistema gestor de bases de datos seleccionado para el proyecto. Para Esenciales, el modelo relacional permitirá representar categorías, productos, presentaciones, imágenes y solicitudes como entidades diferenciadas pero relacionadas. Esta estructura es importante porque el precio, el stock y la disponibilidad pertenecen a la presentación y no únicamente al producto. La integridad referencial también ayudará a conservar el historial de las solicitudes mediante la desactivación de registros, en lugar de eliminar físicamente información relacionada.

Las bases de datos relacionales soportan transacciones, mediante las cuales varias modificaciones se ejecutan como una sola operación completa: todas se confirman o ninguna se conserva. Esta propiedad resulta relevante cuando una solicitud es confirmada y deben actualizarse simultáneamente su estado y el inventario correspondiente. PostgreSQL documenta que una transacción agrupa varios pasos como una operación de todo o nada y que los cambios pueden revertirse si ocurre un error (PostgreSQL Global Development Group, s. f.). En Esenciales, este principio deberá aplicarse para evitar descuentos parciales, doble descuento, stock negativo o confirmaciones incompletas.

### Publicación de Contenido Multimedia

El contenido multimedia reúne recursos digitales utilizados para comunicar información por medios visuales, sonoros o audiovisuales. Dentro del alcance confirmado del MVP de Esenciales, este concepto se delimita a la publicación de imágenes de productos; no se han aprobado videos o audios como parte obligatoria del sistema. Las imágenes tendrán una función informativa, pues ayudarán al visitante a reconocer y diferenciar los productos disponibles.

La publicación de una imagen en la web implica más que asociar un archivo. Comprende relacionarlo con el producto correcto, presentarlo en el catálogo y proporcionar información textual equivalente cuando sea necesaria. La Iniciativa de Accesibilidad Web del W3C establece que las imágenes informativas deben contar con alternativas textuales que comuniquen su información esencial a quienes no pueden percibirlas visualmente (World Wide Web Consortium, 2026). En consecuencia, el proyecto deberá considerar descripciones alternativas, formatos adecuados y una presentación adaptable a celulares, tabletas y computadores. Todo producto publicado requerirá al menos una imagen. El mecanismo específico de almacenamiento se definirá durante el diseño técnico.

### Gestión de Inventario y Disponibilidad Comercial

La confiabilidad de la disponibilidad comercial depende de que las cantidades registradas en el sistema correspondan con las existencias reales. DeHoratius y Raman (2008) identifican la inexactitud de los registros de inventario como un problema operativo relevante y destacan la necesidad de establecer procesos que reduzcan su ocurrencia. Por ello, la gestión del inventario requiere controlar y actualizar las existencias para determinar qué cantidades pueden ofrecerse y apoyar el cumplimiento de las solicitudes.

En este proyecto, el inventario se administrará por presentación, debido a que un mismo producto puede comercializarse en diferentes tamaños, cantidades o formatos. El stock representará las unidades locales vendibles de cada presentación. La disponibilidad comercial distinguirá entre los modos definidos por el administrador y los estados visibles para el cliente. Los modos serán `Venta inmediata`, `Bajo pedido` y `No disponible`. Una presentación de venta inmediata se mostrará como `Disponible` cuando tenga stock mayor que cero y como `Agotado` cuando tenga stock igual a cero. Una presentación bajo pedido mantendrá stock vendible local igual a cero y podrá solicitarse bajo confirmación comercial.

Esta distinción permite que un producto tenga simultáneamente presentaciones disponibles, agotadas o bajo pedido. En las tarjetas del catálogo se mostrará un resumen general, pero en el detalle se informará el estado específico de cada presentación. La disponibilidad en este marco significa posibilidad comercial de solicitar una presentación, no disponibilidad técnica de la aplicación. La información mostrada será la registrada al momento de la consulta; por ello, antes de registrar y confirmar una solicitud el backend deberá volver a validar los datos. El descuento de inventario ocurrirá únicamente al confirmar y dentro de una transacción.

En conjunto, los cinco conceptos desarrollados explican la relación entre la organización interna de los datos y su presentación pública. La gestión de información de producto determina qué datos conforman el catálogo; la aplicación full stack permite administrarlos y publicarlos; la base de datos relacional mantiene sus relaciones; las imágenes apoyan la identificación visual; y el inventario determina la disponibilidad comercial. Estos fundamentos orientarán posteriormente el diseño, desarrollo y validación de la solución propuesta.

## Metodología

Pendiente de desarrollar con el enfoque y plan de trabajo respaldados.

## Resultados y análisis

Pendiente. No redactar resultados como hechos antes de obtener evidencia.

## Conclusiones

Pendiente. No anticipar conclusiones.

## Referencias

Codd, E. F. (1970). A relational model of data for large shared data banks. *Communications of the ACM, 13*(6), 377–387. https://doi.org/10.1145/362384.362685

DeHoratius, N., & Raman, A. (2008). Inventory record inaccuracy: An empirical analysis. *Management Science, 54*(4), 627–641. https://doi.org/10.1287/mnsc.1070.0789

GS1. (s. f.). *GS1 Global Data Model*. Recuperado el 5 de septiembre de 2026, de https://www.gs1.org/standards/gs1-global-data-model

MDN Web Docs. (2025, 23 de junio). *Client-server overview*. https://developer.mozilla.org/en-US/docs/Learn_web_development/Extensions/Server-side/First_steps/Client-Server_overview

PostgreSQL Global Development Group. (s. f.). *Transactions*. Recuperado el 5 de septiembre de 2026, de https://www.postgresql.org/docs/current/tutorial-transactions.html

Tecnológica Autónoma del Pacífico. (2026). *Brochure curso opción de grado (64 horas): Desarrollo web full stack* [Brochure].

World Wide Web Consortium. (2026, 8 de abril). *Images tutorial*. Web Accessibility Initiative. https://www.w3.org/WAI/tutorials/images/
