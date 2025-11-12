import { NextResponse } from "next/server";
import { geoPool } from "@/lib/pg";

const CACHE_TTL_MS = 1000 * 60 * 5;

let cachedGeojson: {
  data: GeoJSON.FeatureCollection;
  expiresAt: number;
} | null = null;

const GEOJSON_FALLBACK: GeoJSON.FeatureCollection = {
  type: "FeatureCollection",
  features: [],
};

export async function GET() {
  if (cachedGeojson && cachedGeojson.expiresAt > Date.now()) {
    return NextResponse.json(cachedGeojson.data, {
      headers: { "Cache-Control": `public, max-age=${CACHE_TTL_MS / 1000}` },
    });
  }

  try {
    const result = await geoPool.query(`
      SELECT jsonb_build_object(
        'type', 'FeatureCollection',
        'features', jsonb_agg(
          jsonb_build_object(
            'type', 'Feature',
            'geometry', ST_AsGeoJSON(row.geom_4326, 6)::jsonb,
            'properties', to_jsonb(row) - 'wkb_geometry' - 'geom_4326'
          )
        )
      ) AS geojson
      FROM sido AS row;
    `);

    const geojson = (result.rows[0]?.geojson ?? GEOJSON_FALLBACK) as GeoJSON.FeatureCollection;

    cachedGeojson = {
      data: geojson,
      expiresAt: Date.now() + CACHE_TTL_MS,
    };

    return NextResponse.json(geojson, {
      headers: { "Cache-Control": `public, max-age=${CACHE_TTL_MS / 1000}` },
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to load GeoJSON" }, { status: 500 });
  }
}
