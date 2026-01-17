/**
 * FavoritesManager - Gestiona favoritos en localStorage
 */
class FavoritesManager {
    constructor() {
        this.STORAGE_KEY = 'alicante_eats_favorites';
        this.favorites = this.load();
        this.onChangeCallback = null;
    }

    /**
     * Carga favoritos desde localStorage
     */
    load() {
        try {
            const data = localStorage.getItem(this.STORAGE_KEY);
            return data ? new Set(JSON.parse(data)) : new Set();
        } catch (e) {
            console.error('Error cargando favoritos:', e);
            return new Set();
        }
    }

    /**
     * Guarda favoritos en localStorage
     */
    save() {
        try {
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify([...this.favorites]));
        } catch (e) {
            console.error('Error guardando favoritos:', e);
        }
    }

    /**
     * Comprueba si un item es favorito
     */
    isFavorite(itemId) {
        return this.favorites.has(itemId);
    }

    /**
     * Alterna el estado de favorito
     */
    toggle(itemId) {
        if (this.favorites.has(itemId)) {
            this.favorites.delete(itemId);
        } else {
            this.favorites.add(itemId);
        }
        this.save();
        if (this.onChangeCallback) {
            this.onChangeCallback();
        }
        return this.isFavorite(itemId);
    }

    /**
     * Añade un item a favoritos
     */
    add(itemId) {
        this.favorites.add(itemId);
        this.save();
        if (this.onChangeCallback) {
            this.onChangeCallback();
        }
    }

    /**
     * Elimina un item de favoritos
     */
    remove(itemId) {
        this.favorites.delete(itemId);
        this.save();
        if (this.onChangeCallback) {
            this.onChangeCallback();
        }
    }

    /**
     * Obtiene todos los IDs de favoritos
     */
    getAll() {
        return [...this.favorites];
    }

    /**
     * Obtiene el número de favoritos
     */
    count() {
        return this.favorites.size;
    }

    /**
     * Limpia todos los favoritos
     */
    clear() {
        this.favorites.clear();
        this.save();
        if (this.onChangeCallback) {
            this.onChangeCallback();
        }
    }

    /**
     * Registra callback cuando cambian los favoritos
     */
    onChange(callback) {
        this.onChangeCallback = callback;
    }

    /**
     * Filtra un array de items para devolver solo favoritos
     */
    filterFavorites(items) {
        return items.filter(item => this.favorites.has(item.id));
    }
}

// Exportar instancia global
window.favoritesManager = new FavoritesManager();
