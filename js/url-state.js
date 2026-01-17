/**
 * URLStateManager - Sincroniza estado de filtros con la URL y maneja compartir
 */
class URLStateManager {
    constructor() {
        this.baseTitle = 'Alicante Eats';
        this.baseDescription = 'Analiza 54,000+ platos de restaurantes de Alicante';
    }

    /**
     * Lee el estado desde la URL actual
     */
    getStateFromURL() {
        const params = new URLSearchParams(window.location.search);
        return {
            search: params.get('q') || '',
            store: params.get('store') || '',
            minPrice: params.get('min') ? parseFloat(params.get('min')) : null,
            maxPrice: params.get('max') ? parseFloat(params.get('max')) : null
        };
    }

    /**
     * Actualiza la URL con el estado actual (sin recargar)
     */
    updateURL(state) {
        const params = new URLSearchParams();

        if (state.search) params.set('q', state.search);
        if (state.store) params.set('store', state.store);
        if (state.minPrice !== null) params.set('min', state.minPrice);
        if (state.maxPrice !== null) params.set('max', state.maxPrice);

        const newURL = params.toString()
            ? `${window.location.pathname}?${params.toString()}`
            : window.location.pathname;

        window.history.replaceState({}, '', newURL);
        this.updateShareLinks();
    }

    /**
     * Genera descripcion para compartir
     */
    getShareDescription(state) {
        const parts = [];

        if (state.search) {
            parts.push(`"${state.search}"`);
        }
        if (state.store) {
            parts.push(`en ${state.store}`);
        }
        if (state.minPrice !== null || state.maxPrice !== null) {
            const min = state.minPrice !== null ? `${state.minPrice}` : '0';
            const max = state.maxPrice !== null ? `${state.maxPrice}` : '+';
            parts.push(`(${min}-${max} EUR)`);
        }

        if (parts.length === 0) {
            return this.baseDescription;
        }

        return `Me apetece comer ${parts.join(' ')} - Alicante Eats`;
    }

    /**
     * Actualiza los enlaces de compartir
     */
    updateShareLinks() {
        const url = window.location.href;
        const state = this.getStateFromURL();
        const text = this.getShareDescription(state);
        const encodedURL = encodeURIComponent(url);
        const encodedText = encodeURIComponent(text);

        // WhatsApp
        const whatsapp = document.getElementById('btn-whatsapp');
        if (whatsapp) {
            whatsapp.href = `https://wa.me/?text=${encodedText}%20${encodedURL}`;
        }

        // Telegram
        const telegram = document.getElementById('btn-telegram');
        if (telegram) {
            telegram.href = `https://t.me/share/url?url=${encodedURL}&text=${encodedText}`;
        }

        // Twitter/X
        const twitter = document.getElementById('btn-twitter');
        if (twitter) {
            twitter.href = `https://twitter.com/intent/tweet?url=${encodedURL}&text=${encodedText}`;
        }

        // Email
        const email = document.getElementById('btn-email');
        if (email) {
            const subject = encodeURIComponent('Mira esto en Alicante Eats');
            const body = encodeURIComponent(`${text}\n\n${url}`);
            email.href = `mailto:?subject=${subject}&body=${body}`;
        }
    }

    /**
     * Copia la URL actual al portapapeles
     */
    async copyURL() {
        const url = window.location.href;
        const btn = document.getElementById('btn-copy-url');
        const originalHTML = btn.innerHTML;

        try {
            await navigator.clipboard.writeText(url);

            // Feedback visual
            btn.innerHTML = `
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
                <span>Copiado!</span>
            `;
            btn.classList.add('copied');

            setTimeout(() => {
                btn.innerHTML = originalHTML;
                btn.classList.remove('copied');
            }, 2000);

            return true;
        } catch (err) {
            // Fallback para navegadores antiguos
            const textarea = document.createElement('textarea');
            textarea.value = url;
            textarea.style.position = 'fixed';
            textarea.style.opacity = '0';
            document.body.appendChild(textarea);
            textarea.select();

            try {
                document.execCommand('copy');
                btn.innerHTML = `
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                    <span>Copiado!</span>
                `;
                btn.classList.add('copied');

                setTimeout(() => {
                    btn.innerHTML = originalHTML;
                    btn.classList.remove('copied');
                }, 2000);
            } catch (e) {
                console.error('Error copiando URL:', e);
            }

            document.body.removeChild(textarea);
        }
    }

    /**
     * Inicializa event listeners
     */
    init() {
        // Boton copiar URL
        const copyBtn = document.getElementById('btn-copy-url');
        if (copyBtn) {
            copyBtn.addEventListener('click', () => this.copyURL());
        }

        // Actualizar links iniciales
        this.updateShareLinks();

        // Escuchar cambios en el historial (boton atras/adelante)
        window.addEventListener('popstate', () => {
            const state = this.getStateFromURL();
            this.onStateChange(state);
        });
    }

    /**
     * Callback cuando cambia el estado (para que app.js lo sobreescriba)
     */
    onStateChange(state) {
        // Se sobreescribe desde app.js
    }
}

// Exportar instancia global
window.urlStateManager = new URLStateManager();
