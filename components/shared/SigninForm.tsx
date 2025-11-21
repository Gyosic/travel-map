"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeClosed } from "lucide-react";
// import Image from "next/image";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { useEffect, useState } from "react";
import { useCookies } from "react-cookie";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <div className="flex flex-col gap-2">
                  <FormLabel className="w-auto">계정 ID</FormLabel>
                  <FormControl>
                    <div className="flex w-full">
                      <Input className="bg-white" placeholder={"Plase enter your ID"} {...field} />
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
                        placeholder="Plase enter your PASSWORD"
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
            <Checkbox
              id="remember"
              checked={remember}
              onCheckedChange={handleChangeRemember}
            ></Checkbox>
            <Label htmlFor="remember">아이디 기억하기</Label>
          </div>

          <div className="flex flex-col gap-2">
            <Button type="submit" size="lg" variant="default">
              로그인
            </Button>
            <Button type="button" variant="outline" onClick={() => signIn("google")}>
              Login with Google
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
