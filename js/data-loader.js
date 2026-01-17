/**
 * DataLoader - Carga y gestiona los datos de la aplicacion
 */
class DataLoader {
    constructor() {
        this.items = [];
        this.storesIndex = {};
        this.stats = {};
        this.loaded = false;
    }

    /**
     * Carga todos los archivos JSON en paralelo
     */
    async loadAll() {
        try {
            const [items, storesIndex, stats] = await Promise.all([
                this.fetchJSON('data/items.json'),
                this.fetchJSON('data/stores-index.json'),
                this.fetchJSON('data/stats.json')
            ]);

            this.items = items;
            this.storesIndex = storesIndex;
            this.stats = stats;
            this.loaded = true;

            return {
                items: this.items,
                storesIndex: this.storesIndex,
                stats: this.stats
            };
        } catch (error) {
            console.error('Error cargando datos:', error);
            throw error;
        }
    }

    /**
     * Fetch con manejo de errores
     */
    async fetchJSON(url) {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Error cargando ${url}: ${response.status}`);
        }
        return response.json();
    }

    /**
     * Obtiene la lista de restaurantes ordenada alfabeticamente
     */
    getStoresList() {
        return Object.entries(this.storesIndex)
            .map(([name, data]) => ({
                name,
                count: data.count,
                avgPrice: data.avg_price
            }))
            .sort((a, b) => a.name.localeCompare(b.name, 'es'));
    }

    /**
     * Filtra items segun criterios
     */
    filterItems(criteria = {}) {
        let filtered = this.items;

        if (criteria.store) {
            filtered = filtered.filter(item => item.store === criteria.store);
        }

        if (criteria.minPrice !== null && criteria.minPrice !== undefined) {
            filtered = filtered.filter(item => item.price >= criteria.minPrice);
        }

        if (criteria.maxPrice !== null && criteria.maxPrice !== undefined) {
            filtered = filtered.filter(item => item.price <= criteria.maxPrice);
        }

        return filtered;
    }

    /**
     * Calcula estadisticas para un conjunto de items
     */
    calculateStats(items) {
        if (!items || items.length === 0) {
            return {
                count: 0,
                avg: 0,
                min: 0,
                max: 0,
                median: 0
            };
        }

        const prices = items.map(i => i.price).sort((a, b) => a - b);
        const sum = prices.reduce((a, b) => a + b, 0);
        const mid = Math.floor(prices.length / 2);
        const median = prices.length % 2
            ? prices[mid]
            : (prices[mid - 1] + prices[mid]) / 2;

        return {
            count: items.length,
            avg: (sum / prices.length).toFixed(2),
            min: prices[0].toFixed(2),
            max: prices[prices.length - 1].toFixed(2),
            median: median.toFixed(2)
        };
    }
}

// Exportar instancia global
window.dataLoader = new DataLoader();
