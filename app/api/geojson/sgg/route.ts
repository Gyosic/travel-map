import { NextResponse } from "next/server";
import wkx from "wkx";
import { geoPool } from "@/lib/pg";

export async function GET() {
  try {
    const { rows } = await geoPool.query(
      `SELECT id, wkb_geometry AS geom, sgg_cd, sgg_name FROM sgg`,
    );
    const geojson = {
      type: "FeatureCollection",
      features: rows.map(({ geom, ...row }) => ({
        type: "Feature",
        geometry: wkx.Geometry.parse(Buffer.from(geom, "hex")).toGeoJSON(),
        properties: row,
      })),
    };

    return NextResponse.json(geojson);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to load GeoJSON" }, { status: 500 });
  }
}
