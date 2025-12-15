"use client";

import bbox from "@turf/bbox";
import maplibregl from "maplibre-gl";
import { useSession } from "next-auth/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { PhotoStory } from "@/components/shared/PhotoStory";
import { usePhotoStory } from "@/hooks/use-photo-story";
import { useSido } from "@/hooks/use-sido";
import { HistoryType } from "@/lib/schema/history.schema";
import { cn } from "@/lib/utils";

interface Photo {
  src: string;
  alt?: string;
  caption?: string;
  date?: string;
  location?: string;
}

interface StoryMapProps {
  className?: string;
}

export function StoryMap({ className }: StoryMapProps) {
  const session = useSession();
  // const router = useRouter();
  const mapRef = useRef<maplibregl.Map>(null);
  const { setSidoList } = useSido();
  const { generateRecentStory } = usePhotoStory();
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [isStoryOpen, setIsStoryOpen] = useState(false);

  const addInteractions = (sourceName: string) => {
    if (!mapRef.current) return;

    const layerId = `${sourceName}-layer`;

    mapRef.current.on("click", layerId, async (e) => {
      const feature = e.features?.[0];

      if (feature) {
        // TODO: 스토리 Tooltip 표시
        try {
          if (session.status !== "authenticated") {
            const localHistories = JSON.parse(localStorage.getItem("histories") || "[]");

            const storyPhotos = generateRecentStory(localHistories, 15);
            if (storyPhotos.length === 0) return;

            setPhotos(storyPhotos);
            setIsStoryOpen(true);
          } else {
            const res = await fetch(`/api/histories`, {
              method: "POST",
              body: JSON.stringify({
                where: [{ field: "sido_cd", operator: "eq", value: feature?.properties.sido_cd }],
              }),
            });
            const data = await res.json();

            const storyPhotos = generateRecentStory(data.rows, 15);
            if (storyPhotos.length === 0) return;

            setPhotos(storyPhotos);
            setIsStoryOpen(true);
          }
        } catch (error) {
          console.error("Failed to fetch histories:", error);
        }
      }
    });
  };
  const getHistories = useCallback(
    async (sidoGeojson: GeoJSON.FeatureCollection) => {
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
        const grouped: Record<string, HistoryType[]> = rows.reduce(
          (acc: Record<string, HistoryType[]>, { sgg_cd, ...row }) => {
            const sido_cd = sgg_cd.slice(0, 2);
            if (!acc[sido_cd]) acc[sido_cd] = [];

            acc[sido_cd].push(row);

            return acc;
          },
          {} as Record<string, HistoryType[]>,
        );

        // 순차 처리를 위한 async 함수
        const processImages = async () => {
          const entries = Object.entries(grouped);

          for (let i = 0; i < entries.length; i++) {
            const [sido_cd, rows] = entries[i];

            await new Promise<void>((resolve) => {
              const feature = sidoGeojson?.features?.find(
                (feature) => feature.properties?.sido_cd === sido_cd,
              );
              if (!feature) {
                resolve();
                return;
              }

              const image = rows[rows.length - 1].images?.[0];
              if (!image) {
                resolve();
                return;
              }

              const imageSrc = `/api/files${image?.src}`;
              const img = document.createElement("img");
              img.crossOrigin = "anonymous";
              img.src = imageSrc;

              img.onload = () => {
                try {
                  const imageBbox = bbox(feature);

                  // 이미지를 폴리곤 모양으로 클리핑 (최적화 버전)
                  const clippedCanvas = clipImageToPolygonOptimized(
                    img,
                    feature.geometry,
                    imageBbox,
                  );

                  // Canvas를 Data URL로 변환 (PNG로 투명도 유지)
                  const clippedImageUrl = clippedCanvas.toDataURL("image/png");

                  // Canvas 메모리 즉시 해제
                  const ctx = clippedCanvas.getContext("2d");
                  if (ctx) {
                    ctx.clearRect(0, 0, clippedCanvas.width, clippedCanvas.height);
                  }

                  // addSource
                  const imageSource = mapRef.current?.getSource(`${sido_cd}-image`);
                  if (!imageSource)
                    mapRef.current?.addSource(`${sido_cd}-image`, {
                      type: "image",
                      url: clippedImageUrl,
                      coordinates: [
                        [imageBbox[0], imageBbox[3]], // top-left
                        [imageBbox[2], imageBbox[3]], // top-right
                        [imageBbox[2], imageBbox[1]], // bottom-right
                        [imageBbox[0], imageBbox[1]], // bottom-left
                      ],
                    });
                  else {
                    // 기존 소스가 있으면 업데이트
                    (imageSource as maplibregl.ImageSource).updateImage({
                      url: clippedImageUrl,
                    });
                  }

                  const imageLayer = mapRef.current?.getLayer(`${sido_cd}-image-layer`);
                  if (!imageLayer)
                    mapRef.current?.addLayer({
                      id: `${sido_cd}-image-layer`,
                      type: "raster",
                      source: `${sido_cd}-image`,
                      paint: {
                        "raster-opacity": 1,
                      },
                    });

                  resolve();
                } catch (error) {
                  console.error(`Failed to process image for ${sido_cd}:`, error);
                  resolve();
                }
              };

              img.onerror = () => {
                console.error(`Failed to load image for ${sido_cd}`);
                resolve();
              };
            });

            // 각 이미지 처리 후 짧은 딜레이
            if (i < entries.length - 1) {
              await new Promise((resolve) => setTimeout(resolve, 100));
            }
          }
        };

        await processImages();
      }

      mapRef.current?.resize();
    },
    [session.status],
  );

  const getSidoGeojson = async () => {
    const sidoGeojson = await fetch(`/api/geojson/sido`);
    const sidoGeojsonData = await sidoGeojson.json();

    const sidoList = sidoGeojsonData.features.map((feature: GeoJSON.Feature) => {
      if (!mapRef.current?.hasImage(feature.properties?.sido_cd)) {
        const ImageComponent = document.createElement("img");
        ImageComponent.src = "";
        ImageComponent.width = 1;
        ImageComponent.height = 1;
        mapRef.current?.addImage(`${feature.properties?.sido_cd}`, ImageComponent, { sdf: true });
      }

      return {
        label: feature.properties?.sido_name,
        value: feature.properties?.sido_cd,
      };
    });

    setSidoList(sidoList);

    return sidoGeojsonData;
  };

  const onLoadMap = useCallback(async () => {
    if (!mapRef.current) return;

    const sidoGeojson = await getSidoGeojson();

    await getHistories(sidoGeojson);

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
          // "fill-pattern": ["get", "sido_cd"],
          // "fill-opacity": 0.95,
          "fill-color": "rgba(0,0,0,0)", // 투명
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

    mapRef.current.resize();
  }, [session.status]);

  const handleStoryClose = () => {
    setPhotos([]);
    setIsStoryOpen(false);
  };

  useEffect(() => {
    if (session.status === "loading") return;

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

    return () => mapRef.current?.remove();
  }, [session.status]);

  return (
    <>
      <div id="map" className={cn("relative h-full w-full", className)}></div>
      {isStoryOpen && photos.length > 0 && (
        <PhotoStory
          photos={photos}
          autoPlayInterval={4000}
          onClose={handleStoryClose}
          enableKenBurns={true}
        />
      )}
    </>
  );
}

/**
 * 메모리 효율적인 이미지 클리핑 함수
 */
function clipImageToPolygonOptimized(
  image: HTMLImageElement,
  geometry: GeoJSON.Geometry,
  imageBbox: number[],
) {
  // 최대 크기 제한으로 메모리 과부하 방지
  const MAX_DIMENSION = 1024;

  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d", {
    willReadFrequently: false,
    alpha: true,
  })!;

  // 이미지 크기 계산 및 제한
  let targetWidth = image.width;
  let targetHeight = image.height;

  const maxDimension = Math.max(targetWidth, targetHeight);
  if (maxDimension > MAX_DIMENSION) {
    const scale = MAX_DIMENSION / maxDimension;
    targetWidth = Math.round(targetWidth * scale);
    targetHeight = Math.round(targetHeight * scale);
  }

  canvas.width = targetWidth;
  canvas.height = targetHeight;

  // bbox 범위 계산
  const [minLng, minLat, maxLng, maxLat] = imageBbox;
  const bboxWidth = maxLng - minLng;
  const bboxHeight = maxLat - minLat;

  // GeoJSON 좌표를 Canvas 픽셀 좌표로 변환
  const geoToPixel = (lng: number, lat: number): [number, number] => {
    const x = ((lng - minLng) / bboxWidth) * canvas.width;
    const y = ((maxLat - lat) / bboxHeight) * canvas.height;
    return [x, y];
  };

  // 투명한 배경으로 시작
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // 클리핑 경로 생성
  ctx.save();
  ctx.beginPath();

  if (geometry.type === "Polygon") {
    geometry.coordinates.forEach((ring) => {
      ring.forEach(([lng, lat], i) => {
        const [x, y] = geoToPixel(lng, lat);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.closePath();
    });
  } else if (geometry.type === "MultiPolygon") {
    geometry.coordinates.forEach((polygon) => {
      polygon.forEach((ring) => {
        ring.forEach(([lng, lat], i) => {
          const [x, y] = geoToPixel(lng, lat);
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        });
        ctx.closePath();
      });
    });
  }

  ctx.clip();
  ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
  ctx.restore();

  return canvas;
}
