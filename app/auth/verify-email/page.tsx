"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

export default function VerifyEmailPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("");

  const verifyEmail = async () => {
    try {
      const res = await fetch(`/api/auth/verify-email?token=${token}`);

      const data = await res.json();

      if (res.ok) {
        setStatus("success");
        setMessage(data.message);
      } else {
        setStatus("error");
        setMessage(data.error);
      }
    } catch {
      setStatus("error");
      setMessage("이메일 인증 중 오류가 발생했습니다.");
    }
  };

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("유효하지 않은 인증 링크입니다.");
      return;
    }

    // 이메일 인증 API 호출
    verifyEmail();
  }, [token]);

  return (
    <div className="flex min-h-screen w-full items-center justify-center">
      <div className="mx-auto w-full max-w-md space-y-6 rounded-lg border p-8 text-center shadow-lg">
        {status === "loading" && (
          <>
            <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600" />
            <h2 className="font-semibold text-xl">이메일 인증 중...</h2>
            <p className="text-gray-600 text-sm">잠시만 기다려주세요.</p>
          </>
        )}

        {status === "success" && (
          <>
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
              <svg
                className="h-8 w-8 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h2 className="font-semibold text-2xl text-green-600">인증 완료!</h2>
            <p className="text-gray-700">{message}</p>
            <Button onClick={() => router.push("/")} className="w-full">
              홈 페이지로 이동
            </Button>
          </>
        )}

        {status === "error" && (
          <>
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
              <svg
                className="h-8 w-8 text-red-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </div>
            <h2 className="font-semibold text-2xl text-red-600">인증 실패</h2>
            <p className="text-gray-700">{message}</p>
            <div className="space-y-2">
              <Button onClick={() => router.push("/signup")} variant="outline" className="w-full">
                회원가입 다시 하기
              </Button>
              <Button onClick={() => router.push("/")} variant="ghost" className="w-full">
                홈으로 돌아가기
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
