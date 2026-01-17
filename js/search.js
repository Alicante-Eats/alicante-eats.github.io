/**
 * SearchEngine - Motor de busqueda con Fuse.js
 */
class SearchEngine {
    constructor() {
        this.fuse = null;
        this.debounceTimer = null;
        this.lastQuery = '';
    }

    /**
     * Inicializa Fuse.js con los datos
     */
    init(items) {
        const options = {
            keys: [
                { name: 'name', weight: 0.5 },
                { name: 'store', weight: 0.3 },
                { name: 'description', weight: 0.2 }
            ],
            threshold: 0.3,
            ignoreLocation: true,
            minMatchCharLength: 2,
            includeScore: true
        };

        this.fuse = new Fuse(items, options);
    }

    /**
     * Realiza busqueda
     */
    search(query, limit = 1000) {
        if (!query || query.length < 2) {
            return null; // null indica que no hay busqueda activa
        }

        this.lastQuery = query;
        const results = this.fuse.search(query, { limit });
        return results.map(r => r.item);
    }

    /**
     * Busqueda con debounce
     */
    searchDebounced(query, callback, delay = 300) {
        clearTimeout(this.debounceTimer);
        this.debounceTimer = setTimeout(() => {
            const results = this.search(query);
            callback(results);
        }, delay);
    }

    /**
     * Limpia la busqueda
     */
    clear() {
        this.lastQuery = '';
        clearTimeout(this.debounceTimer);
    }

    /**
     * Comprueba si hay busqueda activa
     */
    hasActiveSearch() {
        return this.lastQuery.length >= 2;
    }

    /**
     * Obtiene la ultima query
     */
    getLastQuery() {
        return this.lastQuery;
    }
}

// Exportar instancia global
window.searchEngine = new SearchEngine();
