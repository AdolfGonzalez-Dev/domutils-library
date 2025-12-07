# DOMUtils Examples

Ejemplos prácticos y funcionales de DOMUtils Library. Todos los ejemplos pueden ejecutarse directamente en el navegador.

---

## 📂 Estructura

```
examples/
├── 01-counter-app.html           # Aplicación de contador
├── 02-todo-list.html             # Lista de tareas
├── 03-modal-component.html       # Modal accesible
├── 04-form-validation.html       # Validación de formulario
└── README.md                     # Este archivo
```

---

## 🚀 Cómo Ejecutar

### Opción 1: Servidor Local (Recomendado)

```bash
# Con Python 3
python -m http.server 8000

# Con Node.js (npx)
npx http-server

# Con Ruby
ruby -run -ehttpd . -p8000
```

Luego abre http://localhost:8000/examples/

### Opción 2: Con VS Code Live Server

1. Instala extensión "Live Server"
2. Click derecho en archivo `.html`
3. Selecciona "Open with Live Server"

### Opción 3: Abrir Directamente

En desarrollo local sin módulos:
1. Haz click derecho en el archivo
2. "Open with Default Browser"

**Nota**: Algunos ejemplos usan módulos ES, por lo que necesitan servidor HTTP.

---

## 📋 Ejemplos Disponibles

### 1️⃣ Counter App (`01-counter-app.html`)

**Qué aprenderás:**
- Crear señales reactivas
- Auto-actualizar el DOM
- Event listeners básicos
- Operaciones de estado

**Características:**
- ➕ Incrementar/decrementar (+1, -1, +10, -10)
- 🔄 Reset
- 📊 Display del valor actual
- 🎨 UI moderna y responsive

**Código Relevante:**
```javascript
const [count, setCount] = createSignal(0);

createEffect(() => {
  q('#count').textContent = count();
});

q('#increment').addEventListener('click', () => {
  setCount(count() + 1);
});
```

**Conceptos Cubiertos:**
- Signals (getter, setter, subscribe)
- Effects (auto-run)
- Reactividad automática
- Event listeners

---

### 2️⃣ Todo List (`02-todo-list.html`)

**Qué aprenderás:**
- Manejo de listas dinámicas
- CRUD operations (Create, Read, Update, Delete)
- Estado mutable
- Renderizado dinámico

**Características:**
- ✅ Agregar tareas
- ☑️ Marcar como completadas
- ❌ Eliminar tareas
- 📊 Contador de tareas y completadas
- ⌨️ Agregar con Enter

**Código Relevante:**
```javascript
function addTodo() {
  const text = input.value.trim();
  if (!text) return;

  todos.push({
    id: nextId++,
    text,
    completed: false
  });

  input.value = '';
  render();
}
```

**Conceptos Cubiertos:**
- Array manipulation
- Event delegation
- Dynamic DOM updates
- State management
- Input handling

---

### 3️⃣ Modal Component (`03-modal-component.html`)

**Qué aprenderás:**
- Componentes accesibles
- Focus management
- Keyboard interactions
- Overlay patterns

**Características:**
- 🔔 Abrir/cerrar modal
- ⌨️ Cerrar con Escape
- 🖱️ Cerrar con click afuera
- ♿ Accesibilidad WCAG
- 🎨 Smooth animations

**Código Relevante:**
```javascript
function openModal() {
  modal.classList.add('open');
  modal.setAttribute('aria-hidden', 'false');
}

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeModal();
});
```

**Conceptos Cubiertos:**
- Accessibility (ARIA)
- Keyboard events
- CSS animations
- Event handling
- Focus management

---

### 4️⃣ Form Validation (`04-form-validation.html`)

**Qué aprenderás:**
- Validación en tiempo real
- Feedback visual
- State management
- Form submission

**Características:**
- 📝 Validación de nombre (mín. 3 caracteres)
- 📧 Validación de email
- 🔐 Validación de contraseña (mín. 8 caracteres)
- ✓ Indicadores de validación
- 🔘 Submit disabled hasta que sea válido
- 📊 Resumen al enviar

**Código Relevante:**
```javascript
function validateField(input) {
  const isValid = validators[input.name](input.value);
  
  if (isValid && input.value) {
    input.classList.remove('error');
    successMsg.classList.add('show');
  } else {
    input.classList.add('error');
    errorMsg.classList.add('show');
  }
}

input.addEventListener('input', () => validateField(input));
```

**Conceptos Cubiertos:**
- Input validation
- Regex patterns
- Visual feedback
- Form handling
- Error messages
- State management

---

## 🎓 Progresión Recomendada

1. **Principiante**: Comienza con `01-counter-app.html`
   - Entiende signals y effects
   - Aprende event listeners

2. **Intermedio**: Continúa con `02-todo-list.html`
   - Manejo de estado complejo
   - Operaciones con arrays
   - Rendering dinámico

3. **Avanzado**: Explora `03-modal-component.html`
   - Componentes accesibles
   - Keyboard handling
   - Animations

4. **Experto**: Estudia `04-form-validation.html`
   - Validación compleja
   - User experience
   - State feedback

---

## 📚 Temas por Ejemplo

| Tema | 01 | 02 | 03 | 04 |
|------|----|----|----|----|
| Signals | ✅ | | | |
| Effects | ✅ | | | |
| DOM Queries | ✅ | ✅ | ✅ | ✅ |
| Event Listeners | ✅ | ✅ | ✅ | ✅ |
| State Management | ✅ | ✅ | ✅ | ✅ |
| Array Operations | | ✅ | | |
| Components | | | ✅ | |
| Validation | | | | ✅ |
| Accessibility | | | ✅ | ✅ |
| Keyboard Handling | | ✅ | ✅ | ✅ |
| Form Handling | | ✅ | | ✅ |

---

## 💡 Tips

### Debugging
Abre DevTools (F12 en Chrome/Firefox):
- Ver console para logs
- Inspectar elementos
- Ver estilos en tiempo real

### Modificar Ejemplos
Siéntete libre de:
- Cambiar estilos CSS
- Agregar más features
- Usar tus propios datos
- Combinar ejemplos

### Usar en Producción
Para usar en producción:

```bash
npm install domutils-library
```

```javascript
import { createSignal, createEffect } from 'domutils-library';
import { q } from 'domutils-library';
```

---

## 🔗 Recursos Adicionales

- **[README Principal](../README.md)** - Documentación completa
- **[API Reference](../README.md#-api-reference)** - Todos los métodos
- **[GitHub Issues](https://github.com/yourusername/domutils-library/issues)** - Reportar bugs
- **[Discussions](https://github.com/yourusername/domutils-library/discussions)** - Preguntas

---

## ❓ Preguntas Frecuentes

### ¿Por qué los ejemplos usan vanilla JS y no módulos importados?

Los ejemplos están diseñados para correr sin build process. En producción, importarías desde npm.

### ¿Puedo usar estos ejemplos como base?

¡Absolutamente! Los ejemplos están bajo MIT license. Úsalos libremente.

### ¿Cómo agrego mis propios ejemplos?

1. Crea un archivo `XX-nombre.html`
2. Sigue el formato de los otros ejemplos
3. Actualiza este README
4. Haz PR al repositorio

### ¿Dónde reporto errores en los ejemplos?

En [GitHub Issues](https://github.com/yourusername/domutils-library/issues)

---

## 📝 Licencia

Todos los ejemplos están bajo [MIT License](../LICENSE)

---

**Made with ❤️ using DOMUtils Library**