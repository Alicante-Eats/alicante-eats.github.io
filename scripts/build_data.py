#!/usr/bin/env python3
"""
Script para procesar combined_items.csv y generar los archivos JSON
necesarios para la web de Alicante Eats.

Genera:
- data/items.json: todos los items con id
- data/stores-index.json: indice de restaurantes con estadisticas
- data/stats.json: estadisticas globales precalculadas
"""

import csv
import json
from pathlib import Path
from collections import defaultdict
import statistics

# Rutas
SCRIPT_DIR = Path(__file__).parent
PROJECT_ROOT = SCRIPT_DIR.parent.parent
CSV_PATH = PROJECT_ROOT / "data" / "combined_items.csv"
OUTPUT_DIR = SCRIPT_DIR.parent / "data"


def create_price_histogram(prices, num_bins=20):
    """Crea un histograma de precios."""
    if not prices:
        return {"labels": [], "counts": []}

    min_price = min(prices)
    max_price = max(prices)
    bin_width = (max_price - min_price) / num_bins

    counts = [0] * num_bins
    labels = []

    for i in range(num_bins):
        bin_start = min_price + i * bin_width
        bin_end = bin_start + bin_width
        labels.append(f"{bin_start:.0f}-{bin_end:.0f}")

    for price in prices:
        bin_index = min(int((price - min_price) / bin_width), num_bins - 1)
        counts[bin_index] += 1

    return {"labels": labels, "counts": counts}


def main():
    print(f"Leyendo CSV desde: {CSV_PATH}")

    # Leer CSV
    items = []
    with open(CSV_PATH, "r", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for idx, row in enumerate(reader):
            try:
                price = float(row["price"])
            except (ValueError, KeyError):
                continue

            # Filtrar outliers (precios > 300€)
            if price > 300:
                continue

            items.append({
                "id": idx,
                "name": row.get("name", "").strip(),
                "description": row.get("description", "").strip(),
                "price": price,
                "store": row.get("store", "").strip()
            })

    print(f"Total items procesados: {len(items)} (filtrados > 300€)")

    # Crear indice de tiendas
    stores_index = {}
    for item in items:
        store = item["store"]
        if store not in stores_index:
            stores_index[store] = {
                "name": store,
                "count": 0,
                "min_price": float("inf"),
                "max_price": 0,
                "total_price": 0,
                "prices": []
            }

        stores_index[store]["count"] += 1
        stores_index[store]["min_price"] = min(stores_index[store]["min_price"], item["price"])
        stores_index[store]["max_price"] = max(stores_index[store]["max_price"], item["price"])
        stores_index[store]["total_price"] += item["price"]
        stores_index[store]["prices"].append(item["price"])

    # Calcular promedios y limpiar datos temporales
    for store_data in stores_index.values():
        store_data["avg_price"] = round(store_data["total_price"] / store_data["count"], 2)
        store_data["min_price"] = round(store_data["min_price"], 2)
        store_data["max_price"] = round(store_data["max_price"], 2)
        del store_data["total_price"]
        del store_data["prices"]

    print(f"Total restaurantes: {len(stores_index)}")

    # Estadisticas globales
    all_prices = [item["price"] for item in items]

    # Top items
    sorted_by_price = sorted(items, key=lambda x: x["price"], reverse=True)
    top_expensive = sorted_by_price[:20]
    top_cheapest = sorted_by_price[-20:][::-1]

    # Top restaurantes por cantidad de items
    top_stores_by_count = sorted(
        stores_index.items(),
        key=lambda x: x[1]["count"],
        reverse=True
    )[:15]

    # Top restaurantes por precio promedio (min 10 items)
    top_stores_by_avg = sorted(
        [(k, v) for k, v in stores_index.items() if v["count"] >= 10],
        key=lambda x: x[1]["avg_price"],
        reverse=True
    )[:15]

    stats = {
        "total_items": len(items),
        "total_stores": len(stores_index),
        "price_min": round(min(all_prices), 2),
        "price_max": round(max(all_prices), 2),
        "price_avg": round(statistics.mean(all_prices), 2),
        "price_median": round(statistics.median(all_prices), 2),
        "price_histogram": create_price_histogram(all_prices),
        "top_expensive": top_expensive,
        "top_cheapest": top_cheapest,
        "top_stores_by_count": [
            {"name": name, **data} for name, data in top_stores_by_count
        ],
        "top_stores_by_avg_price": [
            {"name": name, **data} for name, data in top_stores_by_avg
        ]
    }

    # Crear directorio de salida
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

    # Guardar items.json (minificado)
    items_path = OUTPUT_DIR / "items.json"
    with open(items_path, "w", encoding="utf-8") as f:
        json.dump(items, f, ensure_ascii=False, separators=(",", ":"))
    print(f"Guardado: {items_path} ({items_path.stat().st_size / 1024 / 1024:.2f} MB)")

    # Guardar stores-index.json
    stores_path = OUTPUT_DIR / "stores-index.json"
    with open(stores_path, "w", encoding="utf-8") as f:
        json.dump(stores_index, f, ensure_ascii=False, separators=(",", ":"))
    print(f"Guardado: {stores_path} ({stores_path.stat().st_size / 1024:.2f} KB)")

    # Guardar stats.json
    stats_path = OUTPUT_DIR / "stats.json"
    with open(stats_path, "w", encoding="utf-8") as f:
        json.dump(stats, f, ensure_ascii=False, separators=(",", ":"))
    print(f"Guardado: {stats_path} ({stats_path.stat().st_size / 1024:.2f} KB)")

    print("\nProcesamiento completado!")


if __name__ == "__main__":
    main()
