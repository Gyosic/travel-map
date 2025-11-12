"use client";

import { LucideIcon, MapPin, Search } from "lucide-react";
import Script from "next/script";
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
  roadname: string; // 도로명
  buildingCode: string; // 건물관리번호
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
  const handlePostcode = () => {
    // if (!scriptLoaded || !window.daum) {
    //   alert("우편번호 서비스를 로딩중입니다. 잠시 후 다시 시도해주세요.");
    //   return;
    // }

    new window.daum.Postcode({
      oncomplete: (data: DaumPostcodeData) => {
        const event = { target: { value: data.address } };
        field.onChange(event);

        addressOncomplete?.(data);
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
        </div>
      </FormItemWrapper>
    </>
  );
}
