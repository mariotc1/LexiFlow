Actúa como un arquitecto senior Frontend especializado en Next.js, React, TypeScript y UX avanzada.

Vas a generar un proyecto COMPLETO y FUNCIONAL llamado "LexiFlow".

OBJETIVO DE LA APP
LexiFlow es una aplicación web para practicar vocabulario inglés-español mediante escritura activa, con corrección inteligente, gamificación, estadísticas y gestión completa de vocabulario por parte del usuario.

NO HAY BACKEND.
NO HAY BASE DE DATOS.
NO HAY AUTH.

Toda la persistencia se realiza en el navegador usando IndexedDB (preferido) o localStorage como fallback.

STACK OBLIGATORIO
- Next.js 16 con App Router
- React + TypeScript
- TailwindCSS
- Zustand para estado global
- IndexedDB mediante idb
- Tesseract.js para OCR
- pdf-parse para leer PDFs
- Framer Motion para animaciones
- Chart.js para estadísticas

ESTRUCTURA DE LA APP

Pantallas:
1. Dashboard
2. Mis Temas
3. Crear/Editar Tema
4. Importar Vocabulario
5. Nueva Partida
6. Resultados Partida
7. Estadísticas
8. Palabras difíciles

MODELO DE DATOS (en IndexedDB)

Tema:
- id
- nombre
- fechaCreacion

Palabra:
- id
- idTema
- ingles
- espanol
- respuestasAlternativas (array opcional)

Partida:
- id
- fecha
- idTema
- modo (es-en | en-es | mixto)
- puntuacion
- tiempoTotal

RespuestaPartida:
- idPartida
- idPalabra
- respuestaUsuario
- correcta (boolean)

FUNCIONALIDADES

GESTIÓN DE TEMAS
CRUD completo.

IMPORTACIÓN DE VOCABULARIO
4 formas:
1. Campo manual tipo tabla editable
2. Pegar texto con formato: ingles = español
3. Subir archivo TXT
4. Subir PDF y extraer texto
5. Subir imagen y usar OCR para detectar palabras y autocompletar

MODO PARTIDA

Modos:
- Español → Inglés
- Inglés → Español
- Mixto aleatorio

En cada pregunta:
- Mostrar palabra
- Input usuario
- Corrección en tiempo real

CORRECCIÓN INTELIGENTE
- Ignorar mayúsculas/minúsculas
- Ignorar espacios extra
- Calcular distancia Levenshtein
- Mostrar:
  - Correcto
  - Casi correcto
  - Incorrecto
- Mostrar solución correcta

GAMIFICACIÓN
- Mensajes dinámicos tras cada respuesta
- Sonidos acierto/fallo
- Barra de progreso
- Temporizador por palabra
- Puntuación final

ESTADÍSTICAS
- % acierto por tema
- Gráfica de evolución
- Palabras más falladas

PALABRAS DIFÍCILES
Generadas automáticamente según fallos históricos.
Botón: practicar solo estas.

UX
- Menú lateral fijo
- Diseño moderno tipo Kahoot/Duolingo
- Animaciones con Framer Motion
- Modo oscuro/claro
- Componentes reutilizables y limpios

REQUISITOS DE CÓDIGO
- Clean code extremo
- Nombres de variables en español
- Componentes reutilizables
- Separación clara por carpetas
- Tipado estricto TypeScript

GENERA:
1. Comando para crear el proyecto
2. Instalación de dependencias
3. Estructura de carpetas
4. Todo el código completo archivo por archivo
5. Stores de Zustand
6. Capa IndexedDB
7. Componentes UI
8. Lógica de juego
9. Lógica de estadísticas
10. Lógica de importación OCR/PDF/TXT

No expliques nada. Genera directamente el proyecto completo listo para ejecutar.