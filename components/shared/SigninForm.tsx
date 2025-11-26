"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeClosed } from "lucide-react";
import Link from "next/link";
// import Image from "next/image";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { ButtonHTMLAttributes, useEffect, useState } from "react";
import { useCookies } from "react-cookie";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { FieldSeparator } from "@/components/ui/field";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface SigninFormProps {
  callbackUrl?: string;
}

export function SigninForm({ callbackUrl }: SigninFormProps) {
  const router = useRouter();

  const credentialSchema = z.object({
    email: z.string().min(1, {
      message: "Username is required",
    }),
    password: z.string().min(1, {
      message: "Password is required",
    }),
  });

  const [visiblePassword, setVisiblePassword] = useState<boolean>(false);
  const [remember, setRemember] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    return localStorage.getItem("remember") === "true";
  });
  const [cookies] = useCookies(["auth_error"]);

  const form = useForm<z.infer<typeof credentialSchema>>({
    resolver: zodResolver(credentialSchema),
    defaultValues: { email: "", password: "" },
  });

  // 2. Define a submit handler.
  const handleSubmit = async (inputs: z.infer<typeof credentialSchema>) => {
    // Do something with the form values.
    // ✅ This will be type-safe and validated.

    try {
      const res = await signIn("credentials", {
        ...inputs,
        redirect: false,
      });

      if (res.error) {
        return toast("[로그인]", {
          description: cookies.auth_error || "로그인에 실패하였습니다.",
          position: "top-right",
        });
      }

      if (remember) {
        localStorage.setItem("rememberUsername", inputs.email!);
        localStorage.setItem("remember", remember.toString());
      } else {
        localStorage.removeItem("rememberUsername");
        localStorage.removeItem("remember");
      }

      if (callbackUrl) return router.push(callbackUrl);
    } catch {}
  };
  const handleChangeRemember = (isRemember: boolean) => {
    setRemember(isRemember);
  };

  useEffect(() => {
    const email = localStorage.getItem("rememberUsername");
    const remember = localStorage.getItem("remember") === "true";

    if (email && remember) {
      form.setValue("email", email);
    }
  }, []);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
        <div className="grid gap-4">
          <GoogleButton type="button" onClick={() => signIn("google")} />
          <NaverButton type="button" onClick={() => signIn("naver")} />
          <FieldSeparator className="*:data-[slot=field-separator-content]:bg-card">
            or
          </FieldSeparator>
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <div className="flex flex-col gap-2">
                  <FormLabel className="w-auto">계정 ID</FormLabel>
                  <FormControl>
                    <div className="flex w-full">
                      <Input className="bg-white" placeholder={"user@example.com"} {...field} />
                      <div />
                    </div>
                  </FormControl>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <div className="flex flex-col gap-2">
                  <FormLabel className="w-24">패스워드</FormLabel>
                  <FormControl>
                    <div className="flex w-full items-center gap-2">
                      <Input
                        id="current-password"
                        className="bg-white"
                        type={visiblePassword ? "text" : "password"}
                        placeholder="********"
                        required
                        {...field}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="hover:bg-[#4fc3f7]/30"
                        onClick={() => setVisiblePassword((prev) => !prev)}
                      >
                        {visiblePassword ? <Eye /> : <EyeClosed />}
                      </Button>
                    </div>
                  </FormControl>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="ml-auto flex gap-2">
            <div className="flex items-center gap-2">
              <Checkbox
                id="remember"
                checked={remember}
                onCheckedChange={handleChangeRemember}
              ></Checkbox>
              <Label htmlFor="remember">아이디 기억하기</Label>
            </div>
            <Link href="/signup" className="text-blue-500 text-sm">
              회원가입
            </Link>
          </div>

          <div className="flex flex-col gap-2">
            <Button type="submit" size="lg" variant="default">
              로그인
            </Button>
          </div>
          {/* <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              ID
            </Label>
            <Input id="name" defaultValue="Pedro Duarte" className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="email" className="text-right">
              PW
            </Label>
            <Input id="email" defaultValue="@peduarte" className="col-span-3" />
          </div> */}
        </div>
      </form>
    </Form>
  );
}

interface GoogleButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  appearance?: "standard" | "icon";
  text?: string;
}
export function GoogleButton({
  appearance = "standard",
  text = "Sign in with Google",
  className,
  ...props
}: GoogleButtonProps) {
  switch (appearance) {
    case "standard":
      return (
        <button
          className={cn("gsi-material-button rounded-sm border p-2", className)}
          type="button"
          {...props}
        >
          <div className="gsi-material-button-state"></div>
          <div className="gsi-material-button-content-wrapper flex items-center justify-center gap-2">
            <div className="gsi-material-button-icon size-5">
              <svg
                version="1.1"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 48 48"
                xmlnsXlink="http://www.w3.org/1999/xlink"
                style={{ display: "block" }}
              >
                <path
                  fill="#EA4335"
                  d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
                ></path>
                <path
                  fill="#4285F4"
                  d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
                ></path>
                <path
                  fill="#FBBC05"
                  d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
                ></path>
                <path
                  fill="#34A853"
                  d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
                ></path>
                <path fill="none" d="M0 0h48v48H0z"></path>
              </svg>
            </div>
            <span className="gsi-material-button-contents">{text}</span>
            <span style={{ display: "none" }}>{text}</span>
          </div>
        </button>
      );
    case "icon":
      return (
        <button
          type="button"
          className={cn("gsi-material-button size-10 rounded-sm border p-2", className)}
          {...props}
        >
          <div className="gsi-material-button-state"></div>
          <div className="gsi-material-button-content-wrapper">
            <div className="gsi-material-button-icon size-5">
              <svg
                version="1.1"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 48 48"
                xmlnsXlink="http://www.w3.org/1999/xlink"
                style={{ display: "block" }}
              >
                <path
                  fill="#EA4335"
                  d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
                ></path>
                <path
                  fill="#4285F4"
                  d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
                ></path>
                <path
                  fill="#FBBC05"
                  d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
                ></path>
                <path
                  fill="#34A853"
                  d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
                ></path>
                <path fill="none" d="M0 0h48v48H0z"></path>
              </svg>
            </div>
            <span style={{ display: "none" }}>{text}</span>
          </div>
        </button>
      );
  }
}

/* TODO  
  1. appearance 에 따라 버튼 모양 변경
  2. theme 상태에 따라 버튼 색깔 변경
*/
import Image from "next/image";
import NaverIconDark from "@/public/naver-icon-dark.png";
import NaverIconGreen from "@/public/naver-icon-green.png";
import NaverStandardDark from "@/public/naver-standard-dark.png";
import NaverStandardGreen from "@/public/naver-standard-green.png";

interface NaverButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  appearance?: "standard" | "icon";
}
export function NaverButton({ appearance = "standard", className, ...props }: NaverButtonProps) {
  switch (appearance) {
    case "standard":
      return (
        <Button type="button" variant="ghost" className={cn("border p-0", className)} {...props}>
          <Image
            src={NaverStandardGreen}
            alt="Naver"
            className="h-full w-full object-contain"
            width={100}
            height={100}
          />
        </Button>
      );
  }
}
