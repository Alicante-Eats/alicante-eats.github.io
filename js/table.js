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
                    <td colspan="4" style="text-align: center; padding: 2rem; color: var(--text-muted);">
                        No se encontraron resultados
                    </td>
                </tr>
            `;
        } else {
            this.tableBody.innerHTML = pageData.map(item => `
                <tr>
                    <td>${this.escapeHtml(item.name)}</td>
                    <td class="hide-mobile">${this.escapeHtml(item.description || '-')}</td>
                    <td>${item.price.toFixed(2)} EUR</td>
                    <td>${this.escapeHtml(item.store)}</td>
                </tr>
            `).join('');
        }

        this.updatePagination();
        this.updateResultsCount();
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
}

// Exportar instancia global
window.tableManager = null;
