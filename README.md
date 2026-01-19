# Paper Repository

Un repositorio personal para gestionar papers académicos de arXiv y DBLP con capacidad de búsqueda y organización.

## 🚀 Inicio Rápido

### Instalación

```bash
# Instalar dependencias del backend
cd backend
npm install

# Iniciar el servidor
npm start
```

El servidor se inicia en `http://localhost:3000`

### Uso

1. **Buscar papers**: Busca en tu repositorio personal
2. **Añadir papers**: 
   - Busca por términos en arXiv/DBLP y selecciona los que deseas añadir
   - Añade por ID (arXiv ID o DOI)
   - Entrada manual
3. **Navegar**: Explora y filtra tu colección

## 📚 Características

- ✅ **Búsqueda por términos**: Busca papers en arXiv y DBLP y selecciona cuáles añadir
- ✅ **Importación desde arXiv**: Añade papers usando arXiv ID
- ✅ **Importación desde DBLP**: Añade papers usando DOI o término de búsqueda
- ✅ **Entrada manual**: Añade papers personalizados
- ✅ **Búsqueda local**: Busca en tu repositorio personal con puntuación de relevancia
- ✅ **Navegación**: Filtra por fuente, año; ordena por fecha, citas o título
- ✅ **Detección de duplicados**: Evita añadir el mismo paper dos veces
- ✅ **Almacenamiento JSON**: Sin base de datos, solo archivos JSON
- ✅ **Backups automáticos**: Respaldo automático antes de cada modificación

## 🛠️ Stack Técnico

### Backend
- **Node.js 18+** con JavaScript ES2022
- **Express.js** - Framework web minimalista
- **xml2js** - Parser XML para arXiv API
- **uuid** - Generación de IDs únicos
- **cors** - CORS middleware

### Frontend
- **Vanilla JavaScript** - Sin frameworks
- **Bootstrap 5** - Componentes UI
- **Tailwind CSS 3** - Utilidades de estilo
- **Fetch API** - Comunicación con backend

## 📖 Documentación

- [Quickstart Guide](specs/001-paper-repository/quickstart.md) - Guía completa de inicio
- [Feature Spec](specs/001-paper-repository/spec.md) - Especificación de la funcionalidad
- [API Documentation](specs/001-paper-repository/contracts/openapi.yaml) - Contratos API
- [Data Model](specs/001-paper-repository/data-model.md) - Esquema de datos
- [Tasks](specs/001-paper-repository/tasks.md) - Lista de tareas implementadas

## 🧪 Testing

### Prueba manual

1. Inicia el servidor: `cd backend && npm start`
2. Abre http://localhost:3000
3. Busca "machine learning"
4. Añade un paper desde arXiv (ID: `1706.03762`)
5. Navega a "Browse All Papers"

### Prueba con API

```bash
# Health check
curl http://localhost:3000/api/health

# Buscar en fuentes externas
curl "http://localhost:3000/api/external-search?q=transformers&source=arxiv&limit=5"

# Añadir paper desde arXiv
curl -X POST http://localhost:3000/api/fetch \
  -H "Content-Type: application/json" \
  -d '{"identifier":"1706.03762","source":"arxiv","autoAdd":true}'

# Buscar en repositorio local
curl "http://localhost:3000/api/search?q=attention"

# Listar todos los papers
curl http://localhost:3000/api/papers
```

## 📁 Estructura del Proyecto

```
paper-repository/
├── backend/
│   ├── src/
│   │   ├── models/         # Modelos de datos (Paper, Author)
│   │   ├── services/       # Servicios (storage, arxiv, dblp)
│   │   ├── api/           # Rutas y error handlers
│   │   ├── config.js      # Configuración
│   │   └── server.js      # Punto de entrada
│   ├── data/
│   │   ├── papers.json    # Almacenamiento de papers
│   │   └── backups/       # Backups automáticos
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── pages/         # Páginas HTML (index, add, browse)
│   │   ├── components/    # Componentes reutilizables
│   │   ├── services/      # Cliente API
│   │   └── styles/        # Estilos personalizados
│   └── index.html
└── specs/
    └── 001-paper-repository/  # Documentación y especificaciones
```

## 🔧 Configuración

### Variables de Entorno

Crea `backend/.env`:

```env
PORT=3000
NODE_ENV=development
ARXIV_API_URL=http://export.arxiv.org/api/query
DBLP_API_URL=https://dblp.org/search/publ/api
```

### Personalización

Edita `backend/src/config.js` para ajustar:
- Puerto del servidor
- Rutas de datos y backups
- Límites de tasa de arXiv
- Configuración de caché
- Resultados por página

## 🤝 Contribuir

1. Revisa [spec.md](specs/001-paper-repository/spec.md) para características planificadas
2. Consulta [tasks.md](specs/001-paper-repository/tasks.md) para tareas pendientes
3. Implementa siguiendo el patrón MVC actual
4. Mantén las dependencias mínimas

## 📝 Licencia

MIT

## 👤 Autor

Desarrollado usando SpecKit workflow

---

**Estado**: ✅ MVP Completo (Fases 1-5 + Enhancement de búsqueda por términos)

**Última actualización**: 2026-01-19
