/**
 * FilterManager - Gestiona los filtros de la aplicacion
 */
class FilterManager {
    constructor() {
        this.activeFilters = {
            store: null,
            minPrice: null,
            maxPrice: null
        };
        this.onChangeCallback = null;
    }

    /**
     * Inicializa los controles de filtro
     */
    init(storesList) {
        this.populateStoreSelect(storesList);
        this.initEventListeners();
    }

    /**
     * Rellena el selector de restaurantes
     */
    populateStoreSelect(stores) {
        const select = document.getElementById('filter-store');
        const options = stores.map(store =>
            `<option value="${this.escapeHtml(store.name)}">${this.escapeHtml(store.name)} (${store.count})</option>`
        ).join('');

        select.innerHTML = '<option value="">Todos los restaurantes</option>' + options;
    }

    /**
     * Escapa HTML
     */
    escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    /**
     * Inicializa event listeners
     */
    initEventListeners() {
        const storeSelect = document.getElementById('filter-store');
        const minPriceInput = document.getElementById('filter-min-price');
        const maxPriceInput = document.getElementById('filter-max-price');
        const clearBtn = document.getElementById('btn-clear-filters');

        storeSelect.addEventListener('change', (e) => {
            this.setFilter('store', e.target.value || null);
        });

        minPriceInput.addEventListener('input', this.debounce((e) => {
            const value = e.target.value ? parseFloat(e.target.value) : null;
            this.setFilter('minPrice', value);
        }, 500));

        maxPriceInput.addEventListener('input', this.debounce((e) => {
            const value = e.target.value ? parseFloat(e.target.value) : null;
            this.setFilter('maxPrice', value);
        }, 500));

        clearBtn.addEventListener('click', () => this.clearAll());
    }

    /**
     * Establece un filtro
     */
    setFilter(key, value) {
        this.activeFilters[key] = value;
        this.notifyChange();
    }

    /**
     * Limpia todos los filtros
     */
    clearAll() {
        this.activeFilters = {
            store: null,
            minPrice: null,
            maxPrice: null
        };

        // Resetear inputs
        document.getElementById('filter-store').value = '';
        document.getElementById('filter-min-price').value = '';
        document.getElementById('filter-max-price').value = '';

        // Limpiar busqueda tambien
        document.getElementById('search-input').value = '';
        window.searchEngine.clear();

        this.notifyChange();
    }

    /**
     * Obtiene los filtros activos
     */
    getFilters() {
        return { ...this.activeFilters };
    }

    /**
     * Comprueba si hay filtros activos
     */
    hasActiveFilters() {
        return this.activeFilters.store !== null ||
               this.activeFilters.minPrice !== null ||
               this.activeFilters.maxPrice !== null;
    }

    /**
     * Aplica filtros a los datos
     */
    applyFilters(data) {
        let filtered = data;

        if (this.activeFilters.store) {
            filtered = filtered.filter(item => item.store === this.activeFilters.store);
        }

        if (this.activeFilters.minPrice !== null) {
            filtered = filtered.filter(item => item.price >= this.activeFilters.minPrice);
        }

        if (this.activeFilters.maxPrice !== null) {
            filtered = filtered.filter(item => item.price <= this.activeFilters.maxPrice);
        }

        return filtered;
    }

    /**
     * Registra callback para cambios
     */
    onChange(callback) {
        this.onChangeCallback = callback;
    }

    /**
     * Notifica cambios
     */
    notifyChange() {
        if (this.onChangeCallback) {
            this.onChangeCallback(this.activeFilters);
        }
    }

    /**
     * Utility: debounce
     */
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
}

// Exportar instancia global
window.filterManager = new FilterManager();
