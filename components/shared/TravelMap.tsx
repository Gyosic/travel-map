"use client";

import { each, isNil } from "es-toolkit/compat";
import maplibregl from "maplibre-gl";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import { useSido } from "@/hooks/use-sido";
import { cn } from "@/lib/utils";

interface TravelMapProps {
  className?: string;
}
export default function TravelMap({ className }: TravelMapProps) {
  const session = useSession();
  const router = useRouter();
  const mapRef = useRef<maplibregl.Map>(null);
  const { setSidoList } = useSido();
  const [popups, setPopups] = useState<maplibregl.Popup[]>([]);

  const addInteractions = (sourceName: string) => {
    if (!mapRef.current) return;

    const layerId = `${sourceName}-layer`;

    let hoveredFeatureId: string | number | undefined;

    mapRef.current.on("mousemove", layerId, (e) => {
      if (e.features && e.features.length > 0) {
        const feature = e.features[0];
        //호버 애니메이션 - feature state 변경
        if (!isNil(hoveredFeatureId) && hoveredFeatureId !== feature.id) {
          mapRef.current?.setFeatureState(
            { source: sourceName, id: hoveredFeatureId },
            { hover: false },
          );
        }
        hoveredFeatureId = feature.id;
        mapRef.current?.setFeatureState(
          { source: sourceName, id: hoveredFeatureId },
          { hover: true },
        );
      }
    });

    mapRef.current.on("mouseleave", layerId, () => {
      // 애니메이션 상태 리셋
      if (!isNil(hoveredFeatureId)) {
        mapRef.current?.setFeatureState(
          { source: sourceName, id: hoveredFeatureId },
          { hover: false },
        );
        hoveredFeatureId = undefined;
      }
    });

    mapRef.current.on("click", layerId, (e) => {
      const feature = e.features?.[0];

      if (feature) {
        router.push(`/feed/${feature.properties?.sido_cd}`);
      }
    });
  };
  const getHistories = useCallback(
    async (sidoGeojson: GeoJSON.FeatureCollection) => {
      popups.forEach((p) => p.remove());

      const rows = [];

      if (session.status !== "authenticated") {
        const localHistories = JSON.parse(localStorage.getItem("histories") || "[]");

        rows.push(...localHistories);
      } else {
        const res = await fetch(`/api/histories`, { method: "POST" });
        const data = await res.json();

        rows.push(...data.rows);
      }

      if (rows?.length > 0) {
        const newPopups: maplibregl.Popup[] = [];
        each(rows, (row) => {
          const container = document.createElement("div");
          container.className = "w-full h-full flex justify-center items-center";

          const imageCnt = row.images.length;
          const imageSrc = `/api/files${row.images[imageCnt - 1].src}`;

          if (imageCnt > 0) {
            const root = createRoot(container);
            root.render(
              <div className="relative flex h-full w-full items-center justify-center">
                <Image
                  key={row.id}
                  src={imageSrc}
                  alt={row.title}
                  width={0}
                  height={0}
                  className="h-full w-full object-cover"
                ></Image>
                <div className="absolute z-50 flex h-full w-full flex-1 items-center justify-center font-bold text-primary-foreground">
                  <span className="truncate">{imageCnt}</span>
                </div>
              </div>,
            );

            const popup = new maplibregl.Popup({
              className: "w-10 h-10 p-0",
              closeButton: false,
              closeOnClick: false,
            }).setDOMContent(container);

            popup.on("close", () => {
              root.unmount();
            }); // 메모리 누수 방지

            popup.setLngLat(row.lnglat).addTo(mapRef.current!);

            newPopups.push(popup);
          }
          setPopups(newPopups);
        });

        const grouped: Record<string, { [key: string]: unknown }[]> = rows.reduce(
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
          const feature = sidoGeojson?.features?.find(
            (feature) => feature.properties?.sido_cd === sido_cd,
          );
          if (!feature) return;

          mapRef.current?.setFeatureState(
            { source: "sido", id: feature?.properties?.id! },
            { count: rows.length },
          );
        });
      }

      mapRef.current?.resize();
    },
    [session.status],
  );

  const getSidoGeojson = async () => {
    const sidoGeojson = await fetch(`/api/geojson/sido`);
    const sidoGeojsonData = await sidoGeojson.json();

    const sidoList = sidoGeojsonData.features.map((feature: GeoJSON.Feature) => ({
      label: feature.properties?.sido_name,
      value: feature.properties?.sido_cd,
    }));

    setSidoList(sidoList);

    return sidoGeojsonData;
  };

  const onLoadMap = useCallback(async () => {
    if (!mapRef.current) return;

    const sidoGeojson = await getSidoGeojson();

    const sidoSource = mapRef.current.getSource("sido");
    if (!sidoSource)
      mapRef.current.addSource("sido", {
        type: "geojson",
        data: sidoGeojson,
        promoteId: "sido_cd",
      });

    const sidoLayer = mapRef.current.getLayer("sido-layer");
    if (!sidoLayer)
      mapRef.current.addLayer({
        id: "sido-layer",
        type: "fill",
        source: "sido",
        paint: {
          "fill-color": "#2563eb",
          "fill-opacity": [
            "max",
            // hover시 0.5
            ["case", ["boolean", ["feature-state", "hover"], false], 0.5, 0],
            // count 기반 기본 진하기
            [
              "interpolate",
              ["linear"],
              ["to-number", ["feature-state", "count"], 0], // ← properties.count 없으면 0
              0,
              0,
              1,
              0.1,
              25,
              0.4,
              50,
              0.6,
              75,
              0.8,
              100,
              1,
            ],
          ],
        },
      });

    const sidoBorderLayer = mapRef.current.getLayer("sido-border");
    if (!sidoBorderLayer)
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

    await getHistories(sidoGeojson);

    mapRef.current.resize();
  }, [session.status]);

  useEffect(() => {
    if (mapRef.current || session.status === "loading") return;

    const map = new maplibregl.Map({
      container: "map",
      style: "https://tiles.openfreemap.org/styles/liberty", // "https://demotiles.maplibre.org/style.json",
      center: [127.99391901208548, 36.47878625483224],
      zoom: 6.1,
      attributionControl: false,
    });

    map.on("load", onLoadMap);

    mapRef.current = map;

    map.resize();
  }, [session.status]);

  return <div id="map" className={cn("relative h-full w-full", className)}></div>;
}
