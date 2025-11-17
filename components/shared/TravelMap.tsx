"use client";

import turfCentroid from "@turf/centroid";
import maplibregl from "maplibre-gl";
import { useCallback, useEffect, useRef } from "react";
import { createRoot } from "react-dom/client";
import { AnimatedTestimonials } from "@/components/ui/shadcn-io/animated-testimonials";

interface TravelMapProps {
  sggGeojson?: GeoJSON.FeatureCollection;
  sidoGeojson: GeoJSON.FeatureCollection;
}
export default function TravelMap({ sggGeojson, sidoGeojson }: TravelMapProps) {
  const mapRef = useRef<maplibregl.Map>(null);

  const addInteractions = (sourceName: string) => {
    if (!mapRef.current) return;

    const layerId = `${sourceName}-layer`;

    // let hoveredFeatureId: string | number | undefined;

    mapRef.current.on("mousemove", layerId, (e) => {
      if (e.features && e.features.length > 0) {
        // const feature = e.features[0];
        // 호버 애니메이션 - feature state 변경
        // if (!isNil(hoveredFeatureId) && hoveredFeatureId !== feature.id) {
        //   mapRef.current?.setFeatureState(
        //     { source: sourceName, id: hoveredFeatureId },
        //     { hover: false },
        //   );
        // }
        // hoveredFeatureId = feature.id;
        // mapRef.current?.setFeatureState(
        //   { source: sourceName, id: hoveredFeatureId },
        //   { hover: true },
        // );
      }
    });

    mapRef.current.on("mouseleave", layerId, () => {
      // 애니메이션 상태 리셋
      // if (!isNil(hoveredFeatureId)) {
      //   mapRef.current?.setFeatureState(
      //     { source: sourceName, id: hoveredFeatureId },
      //     { hover: false },
      //   );
      //   hoveredFeatureId = undefined;
      // }
    });

    // mapRef.current.on("click", layerId, (e) => {
    //   // Ensure that e.features is defined and non-empty
    //   if (e.features && e.features.length > 0) {
    //     // Compute bbox for the clicked features
    //     const bbox = turfBbox({
    //       type: "FeatureCollection",
    //       features: e.features as GeoJSON.Feature[],
    //     });
    //     // Maplibre expects a 4-element array: [minLng, minLat, maxLng, maxLat], so slice if needed
    //     const bounds = bbox.slice(0, 4) as [number, number, number, number];
    //     mapRef.current?.fitBounds(bounds, {
    //       animate: true,
    //       padding: 50, // 패딩 줄임
    //       maxZoom: 18, // 최대 줌 제한
    //       elevation: 15,
    //     });
    //   }
    // });
  };

  const onLoadMap = useCallback(async () => {
    if (!mapRef.current) return;

    mapRef.current.addSource("sido", {
      type: "geojson",
      data: sidoGeojson,
      generateId: true,
    });

    mapRef.current.addLayer({
      id: "sido-layer",
      type: "fill",
      source: "sido",
      paint: {
        "fill-color": "#000000",
        "fill-opacity": [
          "case",
          ["boolean", ["feature-state", "hover"], false],
          0.5, // 호버 시
          0, // 기본
        ],
      },
    });

    mapRef.current.addLayer({
      id: "sido-border",
      type: "line",
      source: "sido",
      paint: {
        "line-color": "black",
      },
    });

    mapRef.current.on("mouseenter", "sido-layer", () => {
      if (mapRef.current) {
        mapRef.current.getCanvas().style.cursor = "pointer";
      }
    });
    mapRef.current.on("mouseleave", "sido-layer", () => {
      if (mapRef.current) mapRef.current.getCanvas().style.cursor = "default";
    });

    addInteractions("sido");

    const res = await fetch(`/api/histories`, { method: "POST" });
    const data = await res.json();

    if (data.rows.length > 0) {
      const grouped = data.rows.reduce(
        (
          acc: Record<string, { [key: string]: unknown }[]>,
          { sgg_cd, ...row }: { sgg_cd: string; [key: string]: unknown },
        ) => {
          const sido_cd = sgg_cd.slice(0, 2);
          if (!acc[sido_cd]) acc[sido_cd] = [];

          acc[sido_cd].push(row);

          return acc;
        },
        {} as Record<string, { [key: string]: unknown }[]>,
      );

      Object.entries(grouped).forEach(([sido_cd, rows]) => {
        const feature = sidoGeojson.features.find(
          (feature) => feature.properties?.sido_cd === sido_cd,
        );
        if (!feature) return;
        const center = turfCentroid(feature)?.geometry?.coordinates as [number, number];

        const container = document.createElement("div");
        container.className = "w-full h-full";

        const testimonials = (rows as { images: string[] }[]).reduce(
          (acc, row) => {
            acc.push(
              ...(row?.images ?? []).map((image: string) => ({ src: `/api/files/${image}` })),
            );
            return acc;
          },
          [] as { src: string }[],
        );
        console.info(rows, testimonials);

        if (!container.hasChildNodes()) {
          const root = createRoot(container);
          root.render(
            <AnimatedTestimonials
              className="h-full w-full bg-background/50 p-0 dark:bg-background-foreground/50"
              testimonials={testimonials}
            />,
          );
        }

        const popup = new maplibregl.Popup({
          className: "w-40 h-40 p-0",
          closeButton: false,
        }).setDOMContent(container);
        popup.setLngLat(center).addTo(mapRef.current!);
      });
    }
  }, [sidoGeojson]);

  useEffect(() => {
    if (mapRef.current) return;

    const map = new maplibregl.Map({
      container: "map",
      style: "https://tiles.openfreemap.org/styles/liberty", // "https://demotiles.maplibre.org/style.json",
      center: [127.99391901208548, 36.47878625483224],
      zoom: 6.1,
      attributionControl: false,
    });

    map.on("load", onLoadMap);
    map.resize();
    // marker 생성
    // map.on("click", "sido-layer", (e) => {

    // const marker = new maplibregl.Marker({ draggable: true })
    //   .setLngLat([e.lngLat.lng, e.lngLat.lat])
    //   .addTo(map);

    // const onDragEnd = (e: maplibregl.MapMouseEvent) => {
    //   console.info(e);
    // };

    // marker.on("dragend", onDragEnd);
    // });

    // popup 생성
    // const container = document.createElement("div");
    // container.className = "w-full h-full";

    // if (!container.hasChildNodes()) {
    //   const root = createRoot(container);
    //   // root.render(<ThreeDCard className="w-full h-full p-0" />);
    //   root.render(<AnimatedTestimonials className="w-full h-full p-0 bg-background/50 dark:bg-background-foreground/50" testimonials={testimonials} />)
    // }

    // const popup = new maplibregl.Popup({
    //   className: "w-40 h-40 p-0",
    //   closeButton: false,
    // }).setDOMContent(container);
    // popup.setLngLat([127.99391901208548, 36.47878625483224]).addTo(map);

    mapRef.current = map;
  }, [onLoadMap]);

  return <div id="map" className="h-full w-full" />;
}
