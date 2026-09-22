# CURSO DE OPCIÓN DE GRADO DESARROLLO WEB FULL STACK CON IA
## Guía de entrevista y briefing con el cliente
*El cliente es experto en su problema. No es experto en la solución.*

* **EQUIPO:** 
* **ORGANIZACIÓN:** 
* **ENTREVISTADO Y CARGO:** 
* **FECHA Y DURACIÓN:** 

---

## PARA QUÉ SIRVE ESTE DOCUMENTO
Es el guion de la primera reunión formal con la persona que tiene el problema que su aplicativo va a resolver.

De esta conversación salen: los requisitos funcionales, las reglas de negocio, los perfiles de usuario, el modelo de datos y el alcance del proyecto.

Todo lo que no pregunten hoy lo van a suponer, y cada suposición es un error que aparece en la semana seis.

No se usan las 43 preguntas: se escogen. Marque las que va a hacer según su proyecto.

---

## ANTES: Preparación de la reunión

### A quién hay que entrevistar

| PERFIL | QUÉ APORTA | RIESGO SI ES EL ÚNICO |
| :--- | :--- | :--- |
| **Quien hace el trabajo hoy** | El objetivo principal. El proceso real, las excepciones, los atajos, lo que de verdad duele. | Puede no conocer la estrategia ni tener poder de decisión sobre el alcance. |
| **Quien decide y paga** | Las prioridades, el alcance, qué es éxito para la organización. | Describe el proceso como debería ser, no como es. Es el error más frecuente. |
| **Quien sufre el resultado / el usuario final** | Los puntos de dolor reales y lo que hoy hace por fuera del sistema. | Puede pedir funcionalidades sueltas sin ver el proceso completo. |

### LA REGLA
> Si solo pueden entrevistar a una persona, entrevisten a quien hace el trabajo todos los días, no a quien lo dirige. El jefe describe el procedimiento escrito; quien opera describe lo que pasa de verdad, que es donde viven las reglas de negocio que después hay que programar.

### Checklist previo
- [ ] Cita confirmada, con hora de inicio y fin. Pidan entre 45 y 60 minutos. No alcanza en 20.
- [ ] Dos personas del equipo asisten: una pregunta, la otra toma nota. Nunca una sola.
- [ ] Permiso para grabar, pedido al inicio. Si dicen que no, no se graba.
- [ ] Lleven este documento impreso y algo para escribir. Un portátil abierto entre los dos genera distancia.
- [ ] Investiguen la organización antes: a qué se dedica, cuántas personas, desde cuándo existe.
- [ ] NO lleven una solución ya diseñada. Si llegan con pantallas, la conversación se vuelve sobre sus pantallas.
- [ ] Preparen cómo van a explicar quiénes son en dos frases, sin tecnicismos.

### PROTECCIÓN DE DATOS: LO QUE NO SE HACE
Si el entrevistado les muestra un archivo con datos de personas reales (nombres, cédulas, teléfonos, correos, historiales), no lo copien, no lo fotografíen y no lo suban al repositorio. Pidan la estructura (qué columnas tiene) y no el contenido. Los datos de prueba del proyecto se inventan.

Tampoco peguen datos reales de terceros en una herramienta de IA.

---

## GUION: Las preguntas, por bloques

Cada bloque indica el tiempo sugerido y para qué sirve lo que se recoge ahí. Las preguntas están redactadas para leerse tal cual. Las marcadas con **[CLAVE]** no se deben omitir.

### BLOQUE 0: Apertura (3 minutos)
*No es una pregunta: es lo que ustedes dicen. Prepararlo evita el arranque torpe que cuesta cinco minutos.*

> «Buenos días. Somos [nombres], estudiantes de [programa] de la Fundación Tecnológica Autónoma del Pacífico.
> 
> Estamos desarrollando un proyecto de grado y queremos construir una aplicación que le resuelva un problema real a una organización.
> 
> No venimos a venderle nada ni a proponerle una solución todavía. Lo que necesitamos hoy es entender cómo trabajan ustedes y qué es lo que más les está costando.
> 
> Vamos a tomar nota, y si no tiene inconveniente nos gustaría grabar el audio para no perder detalles. La grabación es solo para nuestro trabajo académico. Si prefiere que no grabemos, no hay problema.
> 
> ¿Tiene alguna pregunta antes de empezar?»

### BLOQUE 1: La organización y el contexto (5 minutos)
*Sirve para: la introducción del informe y para entender el entorno del sistema.*

1. Cuénteme a qué se dedica la organización y cuál es su papel aquí.
   *(Abre la conversación y deja que hable sin presión. Escuchen el vocabulario que usa: ese vocabulario va a ser el de la interfaz).*
2. ¿Cuántas personas trabajan en el área que tiene este problema?
   *(Da la escala real del sistema. Suele ser mucho menor de lo que el equipo supone).*
3. **¿Cómo es un día normal suyo? [CLAVE]**
   *(La pregunta que más información da por minuto. Deje que responda largo y no la interrumpan).*
4. ¿Qué herramientas usan hoy? ¿Excel, WhatsApp, un cuaderno, algún sistema?
   *(Define contra qué compite su aplicativo. Si hoy usan WhatsApp, su sistema tiene que ser más fácil que escribir un mensaje).*

**Respuestas y notas:**
> 

### BLOQUE 2: El problema (10 minutos)
*Sirve para: la descripción del problema, la justificación y los objetivos. Es el corazón de la entrevista.*

1. **¿Qué es lo que más trabajo les da hoy en ese proceso? [CLAVE]**
2. **Cuénteme la última vez que eso les causó un problema concreto. ¿Qué pasó exactamente? [CLAVE]**
   *(Pedir el último caso real, no la descripción general. Las historias concretas traen las excepciones; las descripciones generales traen el procedimiento ideal).*
3. ¿Con qué frecuencia pasa eso? ¿Una vez al día, a la semana, al mes?
   *(Convierte una queja en un dato que se puede citar en el informe).*
4. Cuando pasa, ¿cuánto tiempo se les va en resolverlo? ¿Y quién lo resuelve?
   *(Es la línea base. Sin este número, un objetivo del tipo reducir el tiempo en un 30% no se puede sustentar).*
5. ¿Han intentado resolverlo antes de alguna manera? ¿Qué pasó?
   *(Evita repetir un intento fallido, y a veces revela una restricción que nadie iba a mencionar).*
6. Si esto no se arregla, ¿qué pasa el año entrante?
   *(Da la relevancia del proyecto, que la plantilla del informe pide explícitamente).*

**Respuestas y notas:**
> 

### BLOQUE 3: El proceso actual, paso a paso (10 minutos)
*Sirve para: los requisitos funcionales, el flujo de usuario y el diagrama de proceso.*

1. **Lléveme por el proceso completo. ¿Qué es lo primero que pasa? [CLAVE]**
   *(Y después, en cada paso: «¿y después?». Hasta llegar al final. No adelanten pasos ustedes).*
2. ¿Quién participa en cada paso? ¿Hay alguien que tenga que autorizar algo?
   *(Aquí aparecen los roles del sistema. Un paso de autorización cambia todo el modelo de estados).*
3. **Muéstreme dónde lo anotan hoy. ¿Qué columnas o campos tiene? [CLAVE]**
   *(El Excel que usan hoy es el mejor borrador del modelo de datos que van a encontrar. Pidan la estructura, no los datos).*
4. ¿Qué parte de ese proceso les gustaría no tener que hacer nunca más?
   *(Señala directamente el núcleo del MVP).*
5. ¿Hay algo que hagan hoy «por fuera del sistema», en un papel o un chat aparte?
   *(Los atajos informales son donde vive la funcionalidad que ningún procedimiento documenta).*

**Respuestas y notas:**
> 

### BLOQUE 4: Las personas que lo van a usar (8 minutos)
*Sirve para: los perfiles de usuario, las decisiones de interfaz y el diseño del wireframe.*

1. **¿Quiénes van a usar esta aplicación? Descríbame a cada tipo de persona. [CLAVE]**
2. ¿Qué tan cómodos son con la tecnología? ¿Usan computador, celular, o los dos?
   *(Decide si el diseño es primero móvil o primero escritorio, y cuánta explicación necesita la interfaz).*
3. ¿Desde dónde lo van a usar? ¿En una oficina, caminando, en la calle?
   *(Alguien que consulta de pie, con una mano, necesita botones grandes y poca lectura).*
4. **¿Cuál es la acción que más veces al día va a hacer cada uno? [CLAVE]**
   *(Esa acción tiene que estar a un clic de la pantalla inicial. Es la decisión de diseño más importante de todo el proyecto).*
5. ¿Qué pasa si alguien se equivoca? ¿Puede corregirlo solo o tiene que pedir ayuda?
   *(Define si el sistema necesita edición, anulación, papelera o historial).*

**Respuestas y notas:**
> 

### BLOQUE 5: Reglas, excepciones y casos raros (10 minutos)
*Sirve para: las reglas de negocio y los casos de prueba. Es el bloque que distingue un proyecto serio de un formulario.*

1. **¿Qué cosas NO se pueden hacer? ¿Hay algo prohibido por política o por norma? [CLAVE]**
2. ¿Hay límites? ¿Máximos, mínimos, plazos, cupos?
   *(Y por cada número que mencione: «¿de dónde sale ese número? ¿está escrito en alguna parte?»).*
3. **¿Hay excepciones? ¿Casos en los que la regla no aplica? [CLAVE]**
   *(Casi siempre hay una, casi nunca la mencionan solos, y casi siempre es la parte más difícil de programar).*
4. ¿Qué pasa cuando dos personas piden lo mismo al mismo tiempo?
   *(Es el caso de concurrencia. Si el dominio lo tiene, aparece en la semana 6 y hay que saberlo hoy).*
5. Cuénteme el caso más raro que les haya tocado manejar.
   *(Pregunta de alto rendimiento: suele destapar una regla completa que nadie iba a contar).*
6. ¿Hay algo que dependa de la fecha o de la hora?
   *(Las reglas temporales son las que más se olvidan y las que más errores producen).*

**Respuestas y notas:**
> 

### BLOQUE 6: Información y reportes (5 minutos)
*Sirve para: el modelo de datos y las consultas del backend.*

1. ¿Qué información necesitan consultar, y cada cuánto?
2. ¿Alguien les pide reportes o cifras? ¿Quién, y de qué?
   *(Define las consultas agregadas del sistema, que son las que después necesitan índices).*
3. ¿Cuánta información tienen acumulada hoy? ¿De cuántos meses o años?
   *(Da la carga real para el requisito no funcional de rendimiento).*
4. ¿Necesitan conservar historial o basta con lo vigente?
   *(Decide entre borrado físico y borrado lógico, que es una decisión de modelo de datos).*

**Respuestas y notas:**
> 

### BLOQUE 7: Expectativas y alcance (6 minutos)
*Sirve para: la tabla de alcance: MVP, deseable y fuera de alcance.*

1. **Si tuviera la herramienta mañana, ¿qué es lo primero que dejaría de hacer? [CLAVE]**
   *(La mejor pregunta del guion. La respuesta ordena el MVP mejor que cualquier discusión interna del equipo).*
2. ¿Cómo sabríamos, dentro de tres meses, que esto funcionó?
   *(Es el criterio de éxito, y se convierte en el «para qué» del objetivo general).*
3. ¿Hay algo que le parezca imprescindible y algo que sea solo deseable?
4. ¿Qué NO debería hacer este sistema?
   *(Pregunta poco usual y muy útil. Ayuda a declarar el fuera de alcance con respaldo del cliente).*
5. ¿Hay alguien más con quien deberíamos hablar?
   *(Casi siempre la respuesta es sí, y esa segunda persona suele contradecir algo importante).*

**Respuestas y notas:**
> 

### BLOQUE 8: Restricciones reales (4 minutos)
*Sirve para: las limitaciones del informe y para no prometer lo imposible.*

1. ¿Tienen restricciones de la organización sobre dónde pueden estar los datos?
2. ¿Con qué equipos y qué conexión cuentan? ¿Hay internet estable?
3. ¿Hay algún otro sistema con el que esto tendría que hablar?
   *(Una integración cambia por completo el alcance de ocho semanas. Hay que saberlo hoy, no en la semana cinco).*
4. ¿Quién quedaría a cargo de esto cuando nosotros terminemos el semestre?
   *(Pregunta honesta que el cliente agradece, y que define cuánta documentación hay que dejar).*

**Respuestas y notas:**
> 

### BLOQUE 9: Cierre (3 minutos)

1. **¿Hay algo importante que no le hayamos preguntado? [CLAVE]**
   *(Nunca falla. Dejen el silencio después de preguntarla: lo que sale ahí suele ser lo más valioso de la reunión).*
2. Vamos a escribirle un resumen de lo que entendimos. ¿Podría revisarlo y decirnos si algo quedó mal?
   *(Así se acuerda el briefing, que es el documento que cierra este proceso).*
3. ¿Podemos volver a contactarlo si nos surgen dudas? ¿Por qué medio prefiere?

**Respuestas y notas:**
> 

---

## CÓMO: Reglas de la entrevista

### Lo que hay que hacer
*   Pregunta abierta siempre. «Cuénteme cómo...», no «¿hacen X?»
*   Pedir el último caso real, no la descripción general.
*   Aguantar el silencio. Cuenten hasta cinco antes de hablar: la gente llena el silencio con lo que de verdad piensa.
*   Repetir con sus palabras: «Entonces, si entendí bien...». Es como se detectan los malentendidos ahí mismo.
*   Preguntar por cada número: «¿de dónde sale esa cifra?»
*   Anotar el vocabulario exacto que usa. Ese es el vocabulario de la interfaz.

### Lo que no hay que hacer
*   Proponer la solución. «¿No sería mejor si...?» cierra la conversación.
*   Preguntas de sí o no. Se responden con un sí y no aportan nada.
*   Preguntas que inducen la respuesta que ustedes quieren oír.
*   Tecnicismos. «Base de datos», «API», «CRUD» no significan nada para el entrevistado.
*   Corregir al entrevistado. Aunque su proceso parezca ineficiente, hoy no venimos a eso.
*   Interrumpir. La información útil suele venir después de la pausa.

### Las preguntas que parecen buenas y no lo son

| NO PREGUNTAR | PREGUNTAR EN SU LUGAR |
| :--- | :--- |
| **«¿Qué funcionalidades quiere que tenga el sistema?»**<br>*(El cliente no es diseñador de software. Si le piden funcionalidades, le va a describir un sistema que vio en otra parte).* | **«¿Qué es lo que más trabajo le da hoy?»** |
| **«¿Quiere que tenga login?»**<br>*(La primera induce; la segunda descubre si de verdad hacen falta roles).* | **«¿Hay información que no todos deberían ver?»** |
| **«¿Le gustaría que fuera rápido y fácil de usar?»**<br>*(Nadie responde que no a la primera. La segunda da un dato real).* | **«¿Cuánto tiempo puede dedicarle a esto en un día ocupado?»** |
| **«¿Necesita reportes?»**<br>*(A la primera todo el mundo dice que sí, y después nadie usa los reportes).* | **«¿Alguien le pide cifras? ¿Quién y de qué?»** |
| **«¿Está bien si lo hacemos en la web?»**<br>*(La decisión técnica es de ustedes; el dato de contexto es de él).* | **«¿Desde dónde y con qué aparato lo van a usar?»** |

---

## DESPUÉS: El acta y el briefing

### LA REGLA DE LAS 24 HORAS
El acta se escribe el mismo día, o al día siguiente como máximo. A las 48 horas ya no se acuerdan de la mitad, y lo que escriban va a ser lo que ustedes creen que dijo, no lo que dijo. Si grabaron, escuchen la grabación una vez completa antes de escribir.

### Acta de la entrevista

| CAMPO | CONTENIDO |
| :--- | :--- |
| **Fecha, hora y duración** | |
| **Entrevistado, cargo y antigüedad** | |
| **Quién preguntó y quién tomó nota** | |
| **¿Se grabó? ¿Con autorización?** | |
| **Los tres problemas más mencionados** | |
| **Reglas de negocio identificadas** | |
| **Excepciones y casos raros** | |
| **Vocabulario propio de la organización**<br>*(las palabras exactas que usa para nombrar las cosas)* | |
| **Lo que nos sorprendió** | |
| **Lo que quedó pendiente de confirmar** | |

### El briefing: la hoja que el cliente aprueba
Es una sola página que se le envía al entrevistado para que confirme que entendieron bien. Es el documento que cierra el levantamiento y el que evita la discusión de la semana ocho.

| SECCIÓN | QUÉ SE ESCRIBE |
| :--- | :--- |
| **1. La organización** | Dos líneas: a qué se dedica y qué área tiene el problema |
| **2. El problema** | Un párrafo, con las palabras del cliente, no con las de ustedes. Con la frecuencia y el costo en tiempo si los tienen |
| **3. Quiénes lo van a usar** | Los perfiles, con la acción principal de cada uno |
| **4. Lo que vamos a construir** | Entre cinco y ocho frases cortas. Sin tecnicismos: el cliente tiene que poder leerlo |
| **5. Lo que NO vamos a construir** | La parte más importante de la hoja. Cada exclusión con su razón |
| **6. Las reglas que nos dijeron** | Listadas y numeradas, para que las confirme o las corrija |
| **7. Cómo sabremos que funcionó** | El criterio de éxito, en una frase |
| **8. Qué necesitamos de ustedes** | Tiempo para revisar, una segunda reunión para ver el diseño, datos de ejemplo |

### LA SECCIÓN 5 ES LA QUE MÁS PROBLEMAS EVITA
> Escribir lo que NO se va a hacer, y que el cliente lo lea y lo acepte por escrito, es lo que separa un proyecto que termina bien de uno que termina con el cliente esperando algo que nadie prometió. Es incómodo de escribir y por eso casi nadie lo hace.

### Qué pasa después del briefing
1. **Clasificar todo lo recogido**
   Cada línea del acta va a una de cuatro cajas: requisito funcional, requisito no funcional, regla de negocio o fuera de alcance. Lo que no encaje en ninguna, probablemente era una opinión.
2. **Marcar lo que sigue siendo suposición**
   Lo que el entrevistado no dijo y ustedes completaron se marca como **[SUPUESTO]**. Se confirma en la segunda reunión, junto con el wireframe.
3. **Enviar el briefing y esperar la respuesta**
   Por correo, pidiendo confirmación explícita. Si no responden en tres días, se llama. Un briefing sin confirmar no sirve como respaldo.

---

**EL CLIENTE ES EXPERTO EN SU PROBLEMA. USTEDES SON LOS EXPERTOS EN LA SOLUCIÓN.**
