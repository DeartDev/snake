# Snake Cyberpunk

Juego clásico de la serpiente (Snake) con estética hacker/cyberpunk, construido con HTML5, CSS3 y JavaScript vanilla.

![Preview](https://img.shields.io/badge/HTML5-CSS3--JS-blue?style=flat&logo=html5)
![License](https://img.shields.io/badge/license-MIT-green)

## Características

- **3 Modos de Juego**: Clásico, Reto, Infinito
- **Sistema de Score**: Score actual y High Score (guardado en localStorage)
- **Modo Claro/Oscuro**: Toggle con persistencia de preferencia
- **Controles**: Teclado (WASD/Flechas) + Botón Jugar/Pausa + Teclado virtual para móvil
- **Estética Cyberpunk**: Colores neon sutiles, efectos glow, scanlines, glitch
- **Responsive**: Adaptable a PC y dispositivos móviles

## Modos de Juego

| Modo | Descripción | Velocidad | Vidas |
|------|-------------|-----------|-------|
| **Clásico** | Juego tradicional | 150ms/tick | 1 |
| **Reto** | Supervivencia con vidas | 120ms/tick | 3 |
| **Infinito** | Comida cambia de color, velocidad aumenta | 100ms → +rápido | ∞ |

### Tipos de Comida

**Modo Clásico:**
- **Verde**: +1 punto, +1 segmento

**Modo Reto:**
- **Verde**: +1 punto, +1 segmento
- **Dorada**: +2 puntos, +2 segmentos
- **Roja**: -1 vida (desaparece en 2-5 segundos con efecto de parpadeo)

**Modo Infinito:**
- La comida cambia constantemente de color (verde/dorada/roja)
- **Verde**: +1 punto, +1 segmento
- **Dorada**: +3 puntos, +3 segmentos
- **Roja**: Score ÷ 3, pierde 3 segmentos (si quedan ≤3 = game over)

## Controles

### PC

| Tecla | Acción |
|-------|--------|
| ↑ / W | Moverse arriba |
| ↓ / S | Moverse abajo |
| ← / A | Moverse izquierda |
| → / D | Moverse derecha |
| ESPACIO | Pausa/Reanudar |
| ENTER | Iniciar juego |
| 1 / 2 / 3 | Cambiar modo |
| N | Nuevo juego |

### Móvil

- **Botón JUGAR/PAUSA**: Iniciar, pausar o reanudar el juego
- **Teclado virtual**: Botones direccionales en pantalla

## Instalación

1. Clona el repositorio o descarga los archivos
2. Abre `index.html` en tu navegador

```bash
# O si prefieres usar un servidor local
npx serve .
```

## Estructura de Archivos

```
snake/
├── index.html      # Estructura del juego
├── styles.css      # Estilos CSS
├── game.js        # Lógica del juego
├── SPECS.md       # Especificaciones técnicas
└── README.md      # Este archivo
```

## Tecnologías

- HTML5 Canvas
- CSS3 (Flexbox, Grid, Animations, Variables CSS)
- JavaScript ES6+
- Google Fonts (Orbitron, JetBrains Mono)
- Bootstrap Icons

## Estilos Visuales

- **Colores neon sutiles**: Verde (#2db810), Azul (#00a8b0), Magenta (#cc00cc)
- **Efectos**: Glow suave, scanlines, glitch en logo, vignette
- **Modo claro/oscuro**: Toggle con transición suave

## Personalización

### Cambiar colores neon

En `styles.css`, modifica las variables CSS:

```css
:root {
    --neon-primary: #2db810;
    --neon-secondary: #00a8b0;
    --neon-accent: #cc00cc;
}
```

### Ajustar velocidad

En `game.js`, modifica los valores de `tickRate`:

```javascript
const MODES = {
    classic: { tickRate: 150 },
    challenge: { tickRate: 120 },
    endless: { tickRate: 100 }
};
```

## Navegadores Soportados

- Chrome 80+
- Firefox 75+
- Safari 13+
- Edge 80+

## Licencia

MIT License - Libre para usar y modificar.

---

**Presiona ENTER (PC) o toca JUGAR (móvil) para comenzar a jugar**