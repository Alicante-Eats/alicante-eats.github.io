/**
 * ThemeManager - Gestiona el tema claro/oscuro
 */
class ThemeManager {
    constructor() {
        this.theme = this.getStoredTheme() || 'light';
        this.themeToggle = null;
    }

    /**
     * Inicializa el gestor de tema
     */
    init() {
        this.themeToggle = document.getElementById('theme-toggle');
        if (!this.themeToggle) {
            console.warn('No se encontró el botón de tema');
            return;
        }

        // Aplicar tema guardado
        this.applyTheme(this.theme);

        // Event listener
        this.themeToggle.addEventListener('click', () => {
            this.toggleTheme();
        });
    }

    /**
     * Obtiene el tema guardado en localStorage
     */
    getStoredTheme() {
        try {
            return localStorage.getItem('theme');
        } catch (e) {
            console.warn('No se pudo acceder a localStorage', e);
            return null;
        }
    }

    /**
     * Guarda el tema en localStorage
     */
    saveTheme(theme) {
        try {
            localStorage.setItem('theme', theme);
        } catch (e) {
            console.warn('No se pudo guardar el tema', e);
        }
    }

    /**
     * Aplica el tema al documento
     */
    applyTheme(theme) {
        this.theme = theme;
        document.documentElement.setAttribute('data-theme', theme);
        this.updateToggleButton();
        this.saveTheme(theme);
    }

    /**
     * Alterna entre tema claro y oscuro
     */
    toggleTheme() {
        const newTheme = this.theme === 'light' ? 'dark' : 'light';
        this.applyTheme(newTheme);
    }

    /**
     * Actualiza el ícono del botón de tema
     */
    updateToggleButton() {
        if (!this.themeToggle) return;

        const isDark = this.theme === 'dark';
        this.themeToggle.setAttribute('aria-label', isDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro');
        this.themeToggle.setAttribute('title', isDark ? 'Modo claro' : 'Modo oscuro');
        
        // Actualizar SVG
        const svg = isDark 
            ? `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="5"></circle>
                <line x1="12" y1="1" x2="12" y2="3"></line>
                <line x1="12" y1="21" x2="12" y2="23"></line>
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
                <line x1="1" y1="12" x2="3" y2="12"></line>
                <line x1="21" y1="12" x2="23" y2="12"></line>
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
            </svg>`
            : `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
            </svg>`;
        
        this.themeToggle.innerHTML = svg;
    }
}

// Exportar instancia global
window.themeManager = new ThemeManager();
