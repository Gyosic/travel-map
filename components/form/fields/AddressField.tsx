"use client";

import { LucideIcon, MapPin, Search } from "lucide-react";
import maplibregl from "maplibre-gl";
import Script from "next/script";
import { useCallback, useEffect, useRef } from "react";
import { FieldPath, FieldValues } from "react-hook-form";
import { FormItemWrapper } from "@/components/form/FormItemWrapper";
import { TemplateFormItemProps } from "@/components/form/TemplateFormItem";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

declare global {
  interface Window {
    daum: {
      Postcode: new (options: {
        oncomplete: (data: DaumPostcodeData) => void;
        width?: string | number;
        height?: string | number;
      }) => {
        open: (options?: { q?: string }) => void;
        embed: (element: HTMLElement, options?: { q?: string }) => void;
      };
    };
  }
}

export interface DaumPostcodeData {
  zonecode: string; // 우편번호
  address: string; // 기본주소 (지번 또는 도로명)
  addressEnglish: string; // 영문 주소
  addressType: "R" | "J"; // R: 도로명, J: 지번
  userSelectedType: "R" | "J"; // 사용자가 선택한 주소 타입
  roadAddress: string; // 도로명 주소
  jibunAddress: string; // 지번 주소
  bname: string; // 법정동/법정리
  buildingName: string; // 건물명
  apartment: "Y" | "N"; // 아파트 여부
  autoRoadAddress: string; // 도로명 주소 (자동)
  autoJibunAddress: string; // 지번 주소 (자동)
  sido: string; // 시도
  sigungu: string; // 시군구
  sigunguCode: string; // 시군구 코드
  bcode: string; // 법정동 코드
  roadname: string; // 도로명
  buildingCode: string; // 건물관리번호
}

export interface VWorldGetAddressResponse {
  zipcode?: number; // 우편번호, 생략조건 : zipcode=false
  type?: "ROAD" | "PARCEL"; // 주소 유형(ROAD, PARCEL), 생략조건 : simple=true
  text: string; // 전체 주소 텍스트
  structure: {
    level0: string; // 국가
    level1: string; // 시·도
    level2: string; // 시·군·구
    level3: string; // (일반구)구
    level4L: string; // (도로)도로명, (지번)법정읍·면·동 명
    level4LC: string; // (도로)도로코드, (지번)법정읍·면·동 코드
    level4A: string; // (도로)행정읍·면·동 명, (지번)지원안함
    level4AC: string; // (도로)행정읍·면·동 코드, (지번)지원안함
    level5: string; // (도로)길, (지번)번지
    detail: string; // 상세주소
  };
}

export interface VWorldGetCoordResponse {
  crs: string; // 응답결과 좌표계
  point: {
    x: number; // x좌표
    y: number; // y좌표
  };
}

export function AddressField<T extends FieldValues, K extends FieldPath<T>>({
  fieldModel,
  field,
  isForm = true,
  className,
  labelPosition = "top",
  labelCls,
  addressOncomplete,
}: TemplateFormItemProps<T, K>) {
  const mapRef = useRef<maplibregl.Map>(null);
  const markerRef = useRef<maplibregl.Marker>(null);

  const onLoadMap = useCallback(() => {
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const center: [number, number] = [position.coords.longitude, position.coords.latitude];

        mapRef.current?.flyTo({ center });

        const res = await fetch(
          `/api/address?request=getAddress&type=BOTH&point=${center.join(",")}`,
        );
        const { response: { result = [] } = {} } = await res.json();

        let address = result.find((item: { type: string }) => item.type === "road");
        if (!address) address = result.find((item: { type: string }) => item.type === "parcel");

        const event = { target: { value: address.text } };
        field.onChange(event);

        const marker = new maplibregl.Marker().setLngLat(center).addTo(mapRef.current!);
        markerRef.current = marker;

        addressOncomplete?.({ ...address, point: { x: center[0], y: center[1] } });
      },
      (err) => {},
    );
  }, []);
  useEffect(() => {
    if (mapRef.current) return;

    const map = new maplibregl.Map({
      container: "map",
      style: "https://tiles.openfreemap.org/styles/liberty", // "https://demotiles.maplibre.org/style.json",
      center: [127.03278133746, 37.569869315524],
      zoom: 10,
      attributionControl: false,
    });

    map.on("load", onLoadMap);
    map.on("click", async (e) => {
      const { lng, lat } = e.lngLat;
      const center: [number, number] = [lng, lat];

      if (markerRef.current) markerRef.current.remove();

      markerRef.current = new maplibregl.Marker().setLngLat(center).addTo(map!);

      mapRef.current?.flyTo({ center });

      const res = await fetch(
        `/api/address?request=getAddress&type=BOTH&point=${center.join(",")}`,
      );
      const { response: { result = [] } = {} } = await res.json();

      let address = result.find((item: { type: string }) => item.type === "road");
      if (!address) address = result.find((item: { type: string }) => item.type === "parcel");

      const event = { target: { value: address.text } };
      field.onChange(event);

      addressOncomplete?.({ ...address, point: { x: lng, y: lat } });
    });
    map.resize();

    mapRef.current = map;
  }, [onLoadMap]);

  const handlePostcode = () => {
    new window.daum.Postcode({
      oncomplete: async (data: DaumPostcodeData) => {
        const { userSelectedType, jibunAddress, roadAddress } = data;
        const address = userSelectedType === "R" ? roadAddress : jibunAddress;
        const event = { target: { value: address } };

        const res = await fetch(
          `/api/address?request=getCoord&type=${userSelectedType === "R" ? "ROAD" : "PARCEL"}&address=${address}`,
        );
        const { response: { result: { point: { x, y } = {} } = {} } = {} } = await res.json();

        if (!!x && !!y) {
          if (markerRef.current) markerRef.current.remove();
          markerRef.current = new maplibregl.Marker()
            .setLngLat([Number(x), Number(y)])
            .addTo(mapRef.current!);
          mapRef.current?.flyTo({ center: [Number(x), Number(y)] });
        }

        field.onChange(event);

        addressOncomplete?.({ ...data, point: { x: Number(x), y: Number(y) } });
      },
    }).open();
  };

  return (
    <>
      <Script
        src="//t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js"
        strategy="lazyOnload"
      />

      <FormItemWrapper
        name={fieldModel.name}
        desc={fieldModel.desc}
        isForm={isForm}
        className={cn(className, labelPosition === "left" ? "flex flex-1 items-center" : "flex-1")}
        labelCls={labelCls}
        icon={(fieldModel.icon as LucideIcon) || MapPin}
      >
        <div className="flex flex-col gap-2">
          {/* 우편번호 + 주소 검색 버튼 */}
          <div className="flex items-center gap-2">
            <Input readOnly placeholder="주소를 검색하세요" value={field.value ?? ""} />
            <Button type="button" onClick={handlePostcode} variant="secondary" className="gap-2">
              <Search className="size-4" />
              주소 검색
            </Button>
          </div>
          <div id="map" className="h-50 w-full" />
        </div>
      </FormItemWrapper>
    </>
  );
}
