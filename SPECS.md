# Snake Cyberpunk - Especificaciones del Proyecto

## 1. Información General

- **Nombre del proyecto**: Snake Cyberpunk
- **Tipo**: Juego web clásico de la serpiente (Snake)
- **Stack tecnológico**: HTML5, CSS3, JavaScript (Vanilla)
- **Descripción**: Juego de la serpiente con estética hacker/cyberpunk, modos de juego configurables, almacenamiento de high score en localStorage, teclado virtual para móvil y modo claro/oscuro
- **Target**: Navegadores modernos (Chrome, Firefox, Safari, Edge)

---

## 2. Especificación UI/UX

### 2.1 Estructura de Layout

```
┌─────────────────────────────────────────┐
│              HEADER                     │
│  [Logo] [Score] [High Score] [☀️/🌙]     │
├─────────────────────────────────────────┤
│           AREA DE JUEGO                 │
│         (Canvas HTML5)                 │
│                                         │
├─────────────────────────────────────────┤
│           MODOS DE JUEGO               │
│   [Clásico] [Reto] [Infinito]           │
├─────────────────────────────────────────┤
│         TECLADO VIRTUAL                │
│      [⬆️] [⬅️] [⬇️] [➡️]             │
│      (Solo móvil)                       │
├─────────────────────────────────────────┤
│              FOOTER                     │
│       [Controles PC: WASD/Flechas]       │
└─────────────────────────────────────────┘
```

### 2.2 Paleta de Colores

#### Modo Oscuro (Default)

| Elemento          | Color       | Hex       |
|------------------|-------------|----------|
| Background base | Negro profundo | `#0a0a0f` |
| Fondo grid       | Gris oscuro | `#12121a` |
| Neon principal   | Verde lima  | `#39ff14` |
| Neon secundario  | Azul eléctrico | `#00ffff` |
| Acento           | Magenta neón | `#ff00ff` |
| Acento 2         | Violeta     | `#bf00ff` |
| Texto principal  | Blanco     | `#e0e0e0` |
| Texto secundario | Gris       | `#808080` |

#### Modo Claro

| Elemento          | Color       | Hex       |
|------------------|-------------|----------|
| Background base | Blanco      | `#f0f0f5` |
| Fondo grid       | Gris claro  | `#e0e0e5` |
| Neon principal   | Verde oscuro | `#1a8f00` |
| Neon secundario  | Azul oscuro | `#0088aa` |
| Acento           | Magenta     | `#aa0088` |
| Acento 2         | Violeta     | `#8800aa` |
| Texto principal  | Negro      | `#1a1a1a` |
| Texto secundario | Gris       | `#606060` |

### 2.3 Tipografía

- **Font principal**: `'Orbitron', sans-serif` ( Google Fonts - estilo tech/futurista)
- **Font secundaria**: `'JetBrains Mono', monospace` (para scores y datos)
- **Tamaños**:
  - Logo: 28px (bold)
  - Score: 24px
  - Body: 16px
  - Footer: 14px

### 2.4 Espaciado

- Contenedor principal: max-width 600px, margin 0 auto
- Padding general: 20px
- Gap entre elementos: 16px
- Border-radius: 8px (tarjetas), 4px (botones)

### 2.5 Componentes UI

#### Header
- Logo "SNAKE" con efecto glow neón
- display: flex, justify-content: space-between
- Indicador de modo actual
- Botón toggle claro/oscuro (icono sol/luna)

#### Panel de Score
- Score actual (actualiza en tiempo real)
- High Score (cargado desde localStorage)
- Fuente monospace para números

#### Canvas de Juego
- Tamaño: 400x400px (escalar según viewport)
- Grid: celdas de 20x20px (20x20 celdas)
- Borde con glow neón
- Fondo con grid sutil

#### Selector de Modos (Móvil)
- 3 botones: Clásico | Reto | Infinito
- Estilo pills con glow cuando activo
- Botones táctiles (min 48px height)

#### Teclado Virtual (Solovisible en móvil)
- 4 botones direccionales en cruz
- Icons Bootstrap Icons o SVG inline
- Posición: debajo del canvas
- Visible: `display: none` en Desktop (CSS media query)
- Feedback visual al presionar

#### Footer
- Instrucciones de control (PC: WASD/Flechas)
- Créditos mínimos

### 2.6 Efectos Visuales (Cyberpunk)

- **Glow neón**: box-shadow con color neon (0 0 10px, 0 0 20px)
- **Scanlines**: pseudo-elemento con líneas horizontales sutiles (opacity 0.03)
- **Efecto CRT**: slight curvature + vignette (opcional CSS)
- **Glitch**: animation CSS en el logo ( skew + clip-path )
- **Pulsos**: animación sutil en elementos activos

---

## 3. Especificación de Funcionalidad

### 3.1 Modos de Juego

| Modo      | Descripción                                    | Comida     | Velocidad | Lives |
|-----------|------------------------------------------------|------------|-----------|-------|
| **Clásico** | Juego tradicional sin muerte inmediata | Normal (+1) | 150ms/tick | 1 |
| **Reto**    | Supervivencia con vidas | Normal (+1), Dorada (+2), Roja (-1 vida) | 120ms/tick | 3 |
| **Infinito** | Sin fin, velocidad aumenta | Normal (+1), Dorada (+2) | 100ms/ +5pts | ∞ |

### 3.2 Mecánicas de Juego

#### Serpiente
- Cuerpo: array de objetos {x, y}
- Cabeza: primer elemento del array
- Crecimiento: +1 segmento por comida normal, +2 por dorada
- Movimiento continuo en dirección actual
- No puede повернуться 180° (muerte inmediata)

#### Comida (Tipos)

| Tipo   | Color   | Efecto         | Probabilidad |
|--------|---------|----------------|---------------|
| Normal | Neon verde (#39ff14) | +1 punto, +1 largo | 70% |
| Dorada | Oro (#ffd700) | +2 puntos, +2 largo | 20% |
| Roja   | Rojo neón (#ff0040) | -1 vida solo en modo Reto | 10% (solo Reto) |

#### Colisiones
- Muerte:	chocar con paredes o con sí misma
- Food:	aparecer nueva comida en posición aleatoria libre

#### Velocidad (Tick Rate)
- Clásico: 150ms por tick (6.6 fps)
- Reto: 120ms por tick (8.3 fps)
- Infinito: comienza 100ms, -5ms por cada 10 puntos (mín 60ms)

### 3.3 Controles

#### Teclado Físico (PC)

| Tecla      | Acción        |
|------------|---------------|
| ↑ / W      | Moverse arriba |
| ↓ / S      | Moverse abajo   |
| ← / A      | Moverse izquierda |
| → / D      | Moverse derecha |
| ESPACIO    | Pausa/Reanudar |
| ENTER     | Iniciar juego |
| 1         | Modo Clásico   |
| 2         | Modo Reto      |
| 3         | Modo Infinito  |
| N         | Nuevo juego    |

#### Teclado Virtual (Móvil)
- 4 botones táctiles
- Gestos: touchstart/touchend con feedback visual
- Posición: debajo del canvas
- Visible: `display: none` en Desktop (CSS media query)
- Feedback visual al presionar

### 3.4 Sistema de Score

- **Score actual**: entero, muestra en tiempo real
- **High Score**: máximo score histórica
- **Guardado**: localStorage key `snake_highscore`
- **Actualización**: solo si score actual > high score

### 3.5 Estado del Juego

| Estado     | Descripción                              |
|------------|------------------------------------------|
| MENU       | Pantalla inicial, esperando inicio      |
| JUGANDO    | Juego activo                            |
| PAUSA      | Juego en pause (espacio)                |
| GAME_OVER | Fin de juego, mostrar score y opción   |

### 3.6 Modo Claro/Oscuro

- Toggle button en header
- Guardar preferencia: localStorage key `snake_theme`
- Valores: `dark` (default) | `light`
- Transición: 0.3s ease-in-out

---

## 4. Requisitos Técnicos

### 4.1 Archivos

```
snake/
├── index.html      (estructura completa)
├── styles.css      (todos los estilos)
├── game.js        (lógica del juego)
├── SPECS.md       (este archivo)
└── README.md      (documentación)
```

### 4.2 Dependencias Externas

- Google Fonts: Orbitron, JetBrains Mono
- Bootstrap Icons (CDN) - para iconos del teclado

### 4.3 Responsive Breakpoints

```
Desktop: > 768px    (sin teclado virtual)
Mobile:  <= 768px     (con teclado virtual)
```

### 4.4 LocalStorage Keys

| Key              | Tipo    | Descripción            |
|------------------|---------|-------------------------|
| snake_highscore  | integer | High score máximo       |
| snake_theme      | string  | 'dark' o 'light'       |

---

## 5. Criterios de Éxito

- [ ] Juego fully funcional en PC con teclado
- [ ] Teclado virtual funcional en móvil
- [ ] 3 modos de juego diferenciados
- [ ] Sistema de score con localStorage
- [ ] Modo claro/oscuro funcional y persistido
- [ ] Estética cyberpunk con glow neón
- [ ] Efectos visuales (glitch, scanlines)
- [ ] Responsive design (móvil y desktop)
- [ ] Sin errores en consola
- [ ] Rendimiento fluido (sin lags)