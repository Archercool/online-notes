*, *::before, *::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

@font-face {
  font-family: 'Pixel';
  src: local('Courier New'), local('Consolas'), local('monospace');
}

:root {
  --sidebar-width: 260px;
  --radius: 0px;
  --radius-sm: 0px;
  --transition: 0.15s ease;
  --pixel-border: 2px;
}

[data-theme="dark"] {
  --bg: #0a0a0f;
  --bg-surface: #0f0f18;
  --bg-elevated: #14141f;
  --bg-hover: #1a1a28;
  --bg-active: #222235;
  --text: #e0e0d0;
  --text-secondary: #a0a090;
  --text-muted: #606058;
  --accent: #00ff88;
  --accent-hover: #00cc6a;
  --accent-subtle: rgba(0, 255, 136, 0.1);
  --border: #2a2a3a;
  --border-subtle: #1e1e2c;
  --danger: #ff4466;
  --danger-subtle: rgba(255, 68, 102, 0.1);
  --success: #00ff88;
  --success-subtle: rgba(0, 255, 136, 0.1);
  --warning: #ffcc00;
  --shadow-sm: 2px 2px 0px rgba(0, 0, 0, 0.5);
  --shadow-md: 4px 4px 0px rgba(0, 0, 0, 0.5);
  --shadow-lg: 6px 6px 0px rgba(0, 0, 0, 0.5);
  --glow: 0 0 10px rgba(0, 255, 136, 0.3);
}

[data-theme="light"] {
  --bg: #f0f0e8;
  --bg-surface: #e8e8e0;
  --bg-elevated: #e0e0d8;
  --bg-hover: #d8d8d0;
  --bg-active: #d0d0c8;
  --text: #1a1a2e;
  --text-secondary: #4a4a5e;
  --text-muted: #8a8a9e;
  --accent: #006644;
  --accent-hover: #005533;
  --accent-subtle: rgba(0, 102, 68, 0.1);
  --border: #c0c0b0;
  --border-subtle: #d0d0c0;
  --danger: #cc2244;
  --danger-subtle: rgba(204, 34, 68, 0.1);
  --success: #006644;
  --success-subtle: rgba(0, 102, 68, 0.1);
  --warning: #cc8800;
  --shadow-sm: 2px 2px 0px rgba(0, 0, 0, 0.1);
  --shadow-md: 4px 4px 0px rgba(0, 0, 0, 0.1);
  --shadow-lg: 6px 6px 0px rgba(0, 0, 0, 0.1);
  --glow: 0 0 10px rgba(0, 102, 68, 0.2);
}

html, body, #root {
  height: 100%;
  width: 100%;
  overflow: hidden;
}

body {
  font-family: 'Courier New', 'Consolas', 'SF Mono', monospace;
  background: var(--bg);
  color: var(--text);
  line-height: 1.6;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  letter-spacing: 0.02em;
}

::-webkit-scrollbar {
  width: 8px;
}

::-webkit-scrollbar-track {
  background: var(--bg);
  border-left: 1px solid var(--border-subtle);
}

::-webkit-scrollbar-thumb {
  background: var(--border);
  border: 2px solid var(--bg);
}

::-webkit-scrollbar-thumb:hover {
  background: var(--text-muted);
}

button {
  cursor: pointer;
  border: none;
  background: none;
  font-family: inherit;
  color: inherit;
}

input, textarea {
  font-family: inherit;
  color: inherit;
}

a {
  color: var(--accent);
  text-decoration: none;
}

::selection {
  background: var(--accent);
  color: var(--bg);
}

.pixel-text {
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 0.1em;
}

.bracket {
  color: var(--accent);
  font-weight: bold;
}
