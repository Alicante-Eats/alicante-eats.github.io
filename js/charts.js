/**
 * ChartManager - Gestiona las visualizaciones con Chart.js
 */
class ChartManager {
    constructor() {
        this.charts = {};
        this.colors = {
            primary: 'rgba(212, 165, 116, 0.7)',
            primaryBorder: 'rgba(212, 165, 116, 1)',
            secondary: 'rgba(69, 123, 157, 0.7)',
            secondaryBorder: 'rgba(69, 123, 157, 1)',
            accent: 'rgba(168, 218, 220, 0.7)',
            accentBorder: 'rgba(168, 218, 220, 1)'
        };
    }

    /**
     * Inicializa todos los graficos con los datos precalculados
     */
    initAll(stats) {
        this.createHistogram(stats.price_histogram);
        this.createTopStoresChart(stats.top_stores_by_count);
        this.createAvgPriceChart(stats.top_stores_by_avg_price);
    }

    /**
     * Crea el histograma de precios
     */
    createHistogram(histogramData) {
        const ctx = document.getElementById('chart-histogram');
        if (!ctx) return;

        if (this.charts.histogram) {
            this.charts.histogram.destroy();
        }

        this.charts.histogram = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: histogramData.labels,
                datasets: [{
                    label: 'Numero de items',
                    data: histogramData.counts,
                    backgroundColor: this.colors.secondary,
                    borderColor: this.colors.secondaryBorder,
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    title: {
                        display: true,
                        text: 'Distribucion de Precios',
                        font: { size: 16, weight: 'bold' }
                    },
                    legend: {
                        display: false
                    }
                },
                scales: {
                    x: {
                        title: {
                            display: true,
                            text: 'Rango de precio (EUR)'
                        }
                    },
                    y: {
                        title: {
                            display: true,
                            text: 'Cantidad de items'
                        },
                        beginAtZero: true
                    }
                }
            }
        });
    }

    /**
     * Crea grafico de restaurantes con mas items
     */
    createTopStoresChart(topStores) {
        const ctx = document.getElementById('chart-top-stores');
        if (!ctx) return;

        if (this.charts.topStores) {
            this.charts.topStores.destroy();
        }

        // Truncar nombres largos
        const labels = topStores.map(s => this.truncateLabel(s.name, 25));
        const data = topStores.map(s => s.count);

        this.charts.topStores = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Items en menu',
                    data: data,
                    backgroundColor: this.colors.primary,
                    borderColor: this.colors.primaryBorder,
                    borderWidth: 1
                }]
            },
            options: {
                indexAxis: 'y',
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    title: {
                        display: true,
                        text: 'Restaurantes con mas items',
                        font: { size: 16, weight: 'bold' }
                    },
                    legend: {
                        display: false
                    },
                    tooltip: {
                        callbacks: {
                            title: (tooltipItems) => {
                                const index = tooltipItems[0].dataIndex;
                                return topStores[index].name;
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        title: {
                            display: true,
                            text: 'Cantidad de items'
                        },
                        beginAtZero: true
                    }
                }
            }
        });
    }

    /**
     * Crea grafico de precio promedio por restaurante
     */
    createAvgPriceChart(topStores) {
        const ctx = document.getElementById('chart-avg-price');
        if (!ctx) return;

        if (this.charts.avgPrice) {
            this.charts.avgPrice.destroy();
        }

        const labels = topStores.map(s => this.truncateLabel(s.name, 25));
        const data = topStores.map(s => s.avg_price);

        this.charts.avgPrice = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Precio promedio (EUR)',
                    data: data,
                    backgroundColor: this.colors.accent,
                    borderColor: this.colors.accentBorder,
                    borderWidth: 1
                }]
            },
            options: {
                indexAxis: 'y',
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    title: {
                        display: true,
                        text: 'Restaurantes mas caros (min. 10 items)',
                        font: { size: 16, weight: 'bold' }
                    },
                    legend: {
                        display: false
                    },
                    tooltip: {
                        callbacks: {
                            title: (tooltipItems) => {
                                const index = tooltipItems[0].dataIndex;
                                return topStores[index].name;
                            },
                            label: (context) => {
                                return `Precio promedio: ${context.raw.toFixed(2)} EUR`;
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        title: {
                            display: true,
                            text: 'Precio promedio (EUR)'
                        },
                        beginAtZero: true
                    }
                }
            }
        });
    }

    /**
     * Trunca etiquetas largas
     */
    truncateLabel(label, maxLength) {
        if (label.length <= maxLength) return label;
        return label.substring(0, maxLength - 3) + '...';
    }

    /**
     * Destruye todos los graficos
     */
    destroyAll() {
        Object.values(this.charts).forEach(chart => {
            if (chart) chart.destroy();
        });
        this.charts = {};
    }
}

// Exportar instancia global
window.chartManager = new ChartManager();
