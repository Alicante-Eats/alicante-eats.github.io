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
        isLoading: true,
        showingFavorites: false
    };

    /**
     * Inicializa la aplicacion
     */
    async function init() {
        try {
            showLoading(true);

            // Inicializar tema lo antes posible para evitar flash
            initTheme();

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

            // Inicializar favoritos
            initFavorites();

            // Inicializar URL state y aplicar estado desde URL
            initURLState();

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
     * Inicializa el sistema de favoritos
     */
    function initFavorites() {
        updateFavoritesCount();

        // Callback cuando cambian los favoritos
        window.favoritesManager.onChange(() => {
            updateFavoritesCount();
            // Si estamos mostrando favoritos, refrescar
            if (appState.showingFavorites) {
                showFavorites();
            }
        });

        // Boton ver favoritos
        const btnFavorites = document.getElementById('btn-show-favorites');
        btnFavorites.addEventListener('click', () => {
            appState.showingFavorites = !appState.showingFavorites;
            btnFavorites.classList.toggle('active', appState.showingFavorites);

            if (appState.showingFavorites) {
                showFavorites();
            } else {
                // Volver a mostrar todos
                updateResults();
            }
        });
    }

    /**
     * Inicializa el gestor de tema
     */
    function initTheme() {
        if (window.themeManager) {
            window.themeManager.init();
        }
    }

    /**
     * Actualiza el contador de favoritos
     */
    function updateFavoritesCount() {
        const countEl = document.getElementById('favorites-count');
        countEl.textContent = window.favoritesManager.count();
    }

    /**
     * Muestra solo los favoritos
     */
    function showFavorites() {
        const favoriteItems = window.favoritesManager.filterFavorites(appState.items);
        window.tableManager.updateFilteredData(favoriteItems);
    }

    /**
     * Inicializa el gestor de URL y aplica estado inicial
     */
    function initURLState() {
        window.urlStateManager.init();

        // Callback cuando cambia el estado desde URL (boton atras/adelante)
        window.urlStateManager.onStateChange = (state) => {
            applyStateToUI(state);
        };

        // Aplicar estado inicial desde URL
        const initialState = window.urlStateManager.getStateFromURL();
        if (initialState.search || initialState.store || initialState.minPrice !== null || initialState.maxPrice !== null) {
            applyStateToUI(initialState);
        }
    }

    /**
     * Aplica un estado a la UI (desde URL)
     */
    function applyStateToUI(state) {
        // Aplicar busqueda
        const searchInput = document.getElementById('search-input');
        searchInput.value = state.search || '';
        if (state.search) {
            window.searchEngine.search(state.search);
        } else {
            window.searchEngine.clear();
        }

        // Aplicar filtros
        document.getElementById('filter-store').value = state.store || '';
        document.getElementById('filter-min-price').value = state.minPrice !== null ? state.minPrice : '';
        document.getElementById('filter-max-price').value = state.maxPrice !== null ? state.maxPrice : '';

        // Actualizar estado interno de filtros
        window.filterManager.activeFilters = {
            store: state.store || null,
            minPrice: state.minPrice,
            maxPrice: state.maxPrice
        };

        // Actualizar resultados (sin re-sincronizar URL)
        updateResults(null, true);
    }

    /**
     * Sincroniza el estado actual con la URL
     */
    function syncURLState() {
        const state = {
            search: window.searchEngine.getLastQuery(),
            store: window.filterManager.activeFilters.store,
            minPrice: window.filterManager.activeFilters.minPrice,
            maxPrice: window.filterManager.activeFilters.maxPrice
        };
        window.urlStateManager.updateURL(state);
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
    function updateResults(searchResults = null, skipURLSync = false) {
        // Si estamos en modo favoritos, desactivarlo al buscar/filtrar
        if (appState.showingFavorites && searchResults !== null) {
            appState.showingFavorites = false;
            document.getElementById('btn-show-favorites').classList.remove('active');
        }

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

        // Sincronizar URL (excepto cuando venimos de la URL)
        if (!skipURLSync) {
            syncURLState();
        }
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
