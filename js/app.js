/**
 * Alicante Eats - Aplicacion principal
 * Orquesta todos los modulos de la aplicacion
 */

(function() {
    'use strict';

    // Estado de la aplicacion
    let appState = {
        items: [],
        filteredItems: [],
        isLoading: true
    };

    /**
     * Inicializa la aplicacion
     */
    async function init() {
        try {
            showLoading(true);

            // Cargar datos
            const data = await window.dataLoader.loadAll();
            appState.items = data.items;
            appState.filteredItems = data.items;

            // Inicializar componentes
            initStats(data.stats);
            initTable(data.items);
            initSearch(data.items);
            initFilters(data.storesIndex);
            initCharts(data.stats);
            initTopLists(data.stats);

            // Configurar listeners
            setupEventListeners();

            showLoading(false);
            console.log('Alicante Eats cargado correctamente');

        } catch (error) {
            console.error('Error inicializando la aplicacion:', error);
            showError('Error al cargar los datos. Por favor, recarga la pagina.');
        }
    }

    /**
     * Inicializa las tarjetas de estadisticas
     */
    function initStats(stats) {
        document.getElementById('total-items').textContent = stats.total_items.toLocaleString('es-ES');
        document.getElementById('total-stores').textContent = stats.total_stores.toLocaleString('es-ES');
        document.getElementById('stat-total').textContent = stats.total_items.toLocaleString('es-ES');
        document.getElementById('stat-avg').textContent = stats.price_avg.toFixed(2) + ' EUR';
        document.getElementById('stat-range').textContent = `${stats.price_min.toFixed(2)} - ${stats.price_max.toFixed(2)} EUR`;
        document.getElementById('stat-stores').textContent = stats.total_stores.toLocaleString('es-ES');
    }

    /**
     * Inicializa la tabla
     */
    function initTable(items) {
        window.tableManager = new TableManager('table-body', { pageSize: 100 });
        window.tableManager.setData(items);
    }

    /**
     * Inicializa el motor de busqueda
     */
    function initSearch(items) {
        window.searchEngine.init(items);
    }

    /**
     * Inicializa los filtros
     */
    function initFilters(storesIndex) {
        const storesList = window.dataLoader.getStoresList();
        window.filterManager.init(storesList);

        // Callback cuando cambian los filtros
        window.filterManager.onChange(() => {
            updateResults();
        });
    }

    /**
     * Inicializa los graficos
     */
    function initCharts(stats) {
        window.chartManager.initAll(stats);
    }

    /**
     * Inicializa las listas de top items
     */
    function initTopLists(stats) {
        renderTopList('list-expensive', stats.top_expensive);
        renderTopList('list-cheapest', stats.top_cheapest);
    }

    /**
     * Renderiza una lista de top items
     */
    function renderTopList(elementId, items) {
        const list = document.getElementById(elementId);
        if (!list) return;

        list.innerHTML = items.map(item => `
            <li>
                <span class="item-name">${escapeHtml(item.name)}</span>
                <span class="item-price">${item.price.toFixed(2)} EUR</span>
                <br>
                <span class="item-store">${escapeHtml(item.store)}</span>
            </li>
        `).join('');
    }

    /**
     * Configura event listeners
     */
    function setupEventListeners() {
        const searchInput = document.getElementById('search-input');

        searchInput.addEventListener('input', (e) => {
            const query = e.target.value.trim();
            window.searchEngine.searchDebounced(query, (results) => {
                updateResults(results);
            }, 300);
        });

        // Enter en busqueda
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                const query = e.target.value.trim();
                const results = window.searchEngine.search(query);
                updateResults(results);
            }
        });
    }

    /**
     * Actualiza los resultados combinando busqueda y filtros
     */
    function updateResults(searchResults = null) {
        let results;

        // Si hay resultados de busqueda, usarlos como base
        if (searchResults !== null) {
            results = searchResults;
        } else if (window.searchEngine.hasActiveSearch()) {
            // Hay busqueda activa pero no se pasaron resultados
            results = window.searchEngine.search(window.searchEngine.getLastQuery());
        } else {
            // No hay busqueda, usar todos los items
            results = appState.items;
        }

        // Aplicar filtros
        results = window.filterManager.applyFilters(results);

        // Actualizar estado
        appState.filteredItems = results;

        // Actualizar tabla
        window.tableManager.updateFilteredData(results);
    }

    /**
     * Muestra/oculta el overlay de carga
     */
    function showLoading(show) {
        const overlay = document.getElementById('loading');
        if (show) {
            overlay.classList.remove('hidden');
        } else {
            overlay.classList.add('hidden');
        }
        appState.isLoading = show;
    }

    /**
     * Muestra un error
     */
    function showError(message) {
        const overlay = document.getElementById('loading');
        overlay.innerHTML = `
            <div style="text-align: center; color: var(--primary-color);">
                <p style="font-size: 3rem;">&#9888;</p>
                <p style="font-size: 1.2rem; margin-bottom: 1rem;">${escapeHtml(message)}</p>
                <button onclick="location.reload()" style="
                    padding: 0.8rem 1.5rem;
                    font-size: 1rem;
                    background: var(--secondary-color);
                    color: white;
                    border: none;
                    border-radius: 4px;
                    cursor: pointer;
                ">Recargar pagina</button>
            </div>
        `;
    }

    /**
     * Escapa HTML
     */
    function escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // Iniciar cuando el DOM este listo
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
