import { useCallback } from "react";
import { HistoryType } from "@/lib/schema/history.schema";

export interface Photo {
  src: string;
  alt?: string;
  caption?: string;
  date?: string;
  location?: string;
}

export function usePhotoStory() {
  /**
   * 히스토리 데이터에서 사진을 추출하고 랜덤하게 섞어서 반환
   */
  const generateStoryFromHistories = useCallback(
    (histories: HistoryType[], count?: number): Photo[] => {
      // 모든 이미지 추출
      const allPhotos: Photo[] = [];

      histories.forEach((history) => {
        if (history.images && history.images.length > 0) {
          history.images.forEach((image) => {
            allPhotos.push({
              src: `/api/files${image.src}`,
              alt: history.title || "여행 사진",
              caption: history.title,
              date: history.date ? new Date(history.date).toLocaleDateString("ko-KR") : undefined,
              location: history.address,
            });
          });
        }
      });

      // Fisher-Yates 셔플 알고리즘으로 랜덤하게 섞기
      const shuffled = [...allPhotos];
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }

      // 지정된 개수만큼만 반환 (기본값: 모두)
      return count ? shuffled.slice(0, count) : shuffled;
    },
    [],
  );

  /**
   * 특정 조건에 맞는 사진만 필터링하여 스토리 생성
   * 예: 특정 날짜 범위, 특정 지역 등
   */
  const generateFilteredStory = useCallback(
    (
      histories: HistoryType[],
      filters?: {
        startDate?: Date;
        endDate?: Date;
        location?: string;
        sidoCd?: string;
      },
    ): Photo[] => {
      let filtered = histories;

      if (filters) {
        filtered = histories.filter((history) => {
          // 날짜 필터
          if (filters.startDate && history.date) {
            if (new Date(history.date) < filters.startDate) return false;
          }
          if (filters.endDate && history.date) {
            if (new Date(history.date) > filters.endDate) return false;
          }

          // 위치 필터
          if (filters.location && history.address) {
            if (!history.address.includes(filters.location)) return false;
          }

          // 시도 코드 필터
          if (filters.sidoCd && history.sgg_cd) {
            if (!history.sgg_cd.startsWith(filters.sidoCd)) return false;
          }

          return true;
        });
      }

      return generateStoryFromHistories(filtered);
    },
    [generateStoryFromHistories],
  );

  /**
   * 최근 사진들로 스토리 생성
   */
  const generateRecentStory = useCallback(
    (histories: HistoryType[], count: number = 10): Photo[] => {
      // 날짜순 정렬 (최신순)
      const sorted = [...histories].sort((a, b) => {
        const dateA = new Date(a.date).getTime();
        const dateB = new Date(b.date).getTime();
        return dateB - dateA;
      });

      return generateStoryFromHistories(sorted, count);
    },
    [generateStoryFromHistories],
  );

  return {
    generateStoryFromHistories,
    generateFilteredStory,
    generateRecentStory,
  };
}
