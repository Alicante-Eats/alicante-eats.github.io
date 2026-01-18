/**
 * TableManager - Gestiona la tabla de items con paginacion y ordenamiento
 */
class TableManager {
    constructor(tableBodyId, paginationConfig = {}) {
        this.tableBody = document.getElementById(tableBodyId);
        this.pageSize = paginationConfig.pageSize || 100;
        this.currentPage = 0;
        this.data = [];
        this.filteredData = [];
        this.sortColumn = null;
        this.sortDirection = 'asc';

        this.initSorting();
        this.initPagination();
    }

    /**
     * Establece los datos y renderiza
     */
    setData(data) {
        this.data = data;
        this.filteredData = data;
        this.currentPage = 0;
        this.render();
    }

    /**
     * Actualiza datos filtrados
     */
    updateFilteredData(data) {
        this.filteredData = data;
        this.currentPage = 0;
        this.render();
    }

    /**
     * Renderiza la pagina actual
     */
    render() {
        const start = this.currentPage * this.pageSize;
        const end = start + this.pageSize;
        const pageData = this.filteredData.slice(start, end);

        if (pageData.length === 0) {
            this.tableBody.innerHTML = `
                <tr>
                    <td colspan="5" style="text-align: center; padding: 2rem; color: var(--text-muted);">
                        No se encontraron resultados
                    </td>
                </tr>
            `;
        } else {
            this.tableBody.innerHTML = pageData.map(item => {
                const isFav = window.favoritesManager && window.favoritesManager.isFavorite(item.id);
                const hasDescription = item.description && item.description.trim() !== '';
                const descriptionDisplay = hasDescription ? this.truncateText(item.description, 50) : '-';
                
                return `
                <tr data-id="${item.id}">
                    <td class="col-fav">
                        <button class="btn-fav ${isFav ? 'is-favorite' : ''}" data-id="${item.id}" title="${isFav ? 'Quitar de favoritos' : 'Añadir a favoritos'}">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="${isFav ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2">
                                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                            </svg>
                        </button>
                    </td>
                    <td>${this.escapeHtml(item.name)}</td>
                    <td class="hide-mobile">
                        ${hasDescription ? 
                            `<span class="tooltip-wrapper">
                                <span class="description-text">${this.escapeHtml(descriptionDisplay)}</span>
                                <div class="tooltip">${this.escapeHtml(item.description)}</div>
                            </span>` 
                            : '-'}
                    </td>
                    <td>${item.price.toFixed(2)} EUR</td>
                    <td>${this.escapeHtml(item.store)}</td>
                </tr>
            `}).join('');

            // Añadir event listeners a los botones de favoritos
            this.tableBody.querySelectorAll('.btn-fav').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    e.preventDefault();
                    const itemId = parseInt(btn.dataset.id, 10);
                    this.toggleFavorite(btn, itemId);
                });
            });

            // Añadir event listeners para tooltips en móvil
            this.initTooltipListeners();
            
            // Añadir event listeners para posicionar tooltips en hover
            this.initTooltipPositioning();
        }

        this.updatePagination();
        this.updateResultsCount();
    }

    /**
     * Toggle favorito y actualiza boton
     */
    toggleFavorite(btn, itemId) {
        const isFav = window.favoritesManager.toggle(itemId);
        btn.classList.toggle('is-favorite', isFav);
        btn.title = isFav ? 'Quitar de favoritos' : 'Añadir a favoritos';
        btn.querySelector('svg').setAttribute('fill', isFav ? 'currentColor' : 'none');
    }

    /**
     * Escapa HTML para prevenir XSS
     */
    escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    /**
     * Inicializa event listeners para ordenamiento
     */
    initSorting() {
        const headers = document.querySelectorAll('#items-table th[data-sort]');
        headers.forEach(th => {
            th.addEventListener('click', () => {
                const column = th.dataset.sort;
                this.sort(column);

                // Actualizar clases visuales
                headers.forEach(h => h.classList.remove('sorted-asc', 'sorted-desc'));
                th.classList.add(this.sortDirection === 'asc' ? 'sorted-asc' : 'sorted-desc');
            });
        });
    }

    /**
     * Ordena los datos por columna
     */
    sort(column) {
        if (this.sortColumn === column) {
            this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
        } else {
            this.sortColumn = column;
            this.sortDirection = 'asc';
        }

        this.filteredData.sort((a, b) => {
            let valA = a[column];
            let valB = b[column];

            // Manejar strings
            if (typeof valA === 'string') {
                valA = valA.toLowerCase();
                valB = (valB || '').toLowerCase();
                const compare = valA.localeCompare(valB, 'es');
                return this.sortDirection === 'asc' ? compare : -compare;
            }

            // Manejar numeros
            const compare = valA - valB;
            return this.sortDirection === 'asc' ? compare : -compare;
        });

        this.currentPage = 0;
        this.render();
    }

    /**
     * Inicializa controles de paginacion
     */
    initPagination() {
        const btnPrev = document.getElementById('btn-prev');
        const btnNext = document.getElementById('btn-next');

        btnPrev.addEventListener('click', () => this.prevPage());
        btnNext.addEventListener('click', () => this.nextPage());
    }

    /**
     * Actualiza estado de botones de paginacion
     */
    updatePagination() {
        const totalPages = Math.ceil(this.filteredData.length / this.pageSize);
        const btnPrev = document.getElementById('btn-prev');
        const btnNext = document.getElementById('btn-next');
        const pageInfo = document.getElementById('page-info');

        btnPrev.disabled = this.currentPage === 0;
        btnNext.disabled = this.currentPage >= totalPages - 1 || totalPages === 0;

        pageInfo.textContent = totalPages > 0
            ? `Pagina ${this.currentPage + 1} de ${totalPages}`
            : 'Sin resultados';
    }

    /**
     * Actualiza contador de resultados
     */
    updateResultsCount() {
        const countEl = document.getElementById('results-count');
        countEl.textContent = this.filteredData.length.toLocaleString('es-ES');
    }

    /**
     * Pagina anterior
     */
    prevPage() {
        if (this.currentPage > 0) {
            this.currentPage--;
            this.render();
            this.scrollToTable();
        }
    }

    /**
     * Pagina siguiente
     */
    nextPage() {
        const totalPages = Math.ceil(this.filteredData.length / this.pageSize);
        if (this.currentPage < totalPages - 1) {
            this.currentPage++;
            this.render();
            this.scrollToTable();
        }
    }

    /**
     * Scroll suave a la tabla
     */
    scrollToTable() {
        const table = document.querySelector('.table-section');
        if (table) {
            table.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }

    /**
     * Obtiene el total de items filtrados
     */
    getFilteredCount() {
        return this.filteredData.length;
    }

    /**
     * Trunca texto a un número máximo de caracteres
     */
    truncateText(text, maxLength) {
        if (!text || text.length <= maxLength) return text;
        return text.substring(0, maxLength).trim() + '...';
    }

    /**
     * Inicializa listeners para tooltips en móvil
     */
    initTooltipListeners() {
        const tooltipWrappers = this.tableBody.querySelectorAll('.tooltip-wrapper');
        
        tooltipWrappers.forEach(wrapper => {
            let touchTimer;
            
            // Para dispositivos táctiles (móvil)
            wrapper.addEventListener('touchstart', (e) => {
                e.preventDefault();
                
                // Cerrar otros tooltips abiertos
                document.querySelectorAll('.tooltip-wrapper.active').forEach(w => {
                    if (w !== wrapper) w.classList.remove('active');
                });
                
                // Long press: activar tooltip después de 500ms
                touchTimer = setTimeout(() => {
                    wrapper.classList.add('active');
                }, 500);
            });
            
            wrapper.addEventListener('touchend', () => {
                clearTimeout(touchTimer);
            });
            
            wrapper.addEventListener('touchmove', () => {
                clearTimeout(touchTimer);
            });
        });
        
        // Cerrar tooltip al tocar fuera (móvil)
        document.addEventListener('touchstart', (e) => {
            if (!e.target.closest('.tooltip-wrapper')) {
                document.querySelectorAll('.tooltip-wrapper.active').forEach(w => {
                    w.classList.remove('active');
                });
            }
        }, { once: false });
    }

    /**
     * Inicializa posicionamiento dinámico de tooltips
     */
    initTooltipPositioning() {
        const tooltipWrappers = this.tableBody.querySelectorAll('.tooltip-wrapper');
        
        tooltipWrappers.forEach(wrapper => {
            const tooltip = wrapper.querySelector('.tooltip');
            const descText = wrapper.querySelector('.description-text');
            
            if (!tooltip || !descText) return;
            
            wrapper.addEventListener('mouseenter', () => {
                const rect = descText.getBoundingClientRect();
                tooltip.style.left = rect.left + (rect.width / 2) + 'px';
                tooltip.style.top = (rect.bottom + 10) + 'px';
                tooltip.style.transform = 'translateX(-50%)';
            });
        });
    }
}

// Exportar instancia global
window.tableManager = null;
