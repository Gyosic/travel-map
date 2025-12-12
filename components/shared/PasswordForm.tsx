"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { isNil } from "es-toolkit/compat";
import { Eye, EyeClosed } from "lucide-react";
import { signOut } from "next-auth/react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

const schema = z
  .object({
    currentPassword: z
      .string({
        error: (issue) => (isNil(issue.input) ? "필수 입력값 입니다." : "유효하지 않은 값입니다."),
      })
      .min(1, "필수 입력값 입니다."),
    password: z
      .string({
        error: (issue) => (isNil(issue.input) ? "필수 입력값 입니다." : "유효하지 않은 값입니다."),
      })
      .min(1, "필수 입력값 입니다.")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[#@$!%*?&])[A-Za-z\d#@$!%*?&]{8,}$/,
        "영문자, 숫자, 특수문자를 포함한 8자 이상의 비밀번호를 입력해주세요.",
      ),
    confirmPassword: z
      .string({
        error: (issue) => (isNil(issue.input) ? "필수 입력값 입니다." : "유효하지 않은 값입니다."),
      })
      .min(1, "필수 입력값 입니다."),
  })
  .refine(
    (data) => {
      return data.password === data.confirmPassword;
    },
    { message: "비밀번호가 일치하지 않습니다.", path: ["confirmPassword"] },
  );

interface PasswordFormProps {
  email: string;
}
export function PasswordForm({ email }: PasswordFormProps) {
  const [isFirstOauthLogin, setIsFirstOauthLogin] = useState<boolean>(false);
  const [visiblePassword, setVisiblePassword] = useState<Record<string, boolean>>({
    currentPassword: false,
    password: false,
    confirmPassword: false,
  });

  const checkFirstOauthLogin = async () => {
    const res = await fetch("/api/users/check", {
      method: "POST",
      body: JSON.stringify({ email, type: "first-oauth-login" }),
    });

    const data = await res.json();

    setIsFirstOauthLogin(!data);
  };

  useEffect(() => {
    checkFirstOauthLogin();
  }, []);

  const FirstOauthLogin = () => {
    const form = useForm({
      resolver: zodResolver(schema.omit({ currentPassword: true })),
      mode: "onBlur",
      defaultValues: { password: "", confirmPassword: "" },
    });
    const { handleSubmit } = form;
    const onSubmit = handleSubmit(async (inputs) => {
      const res = await fetch("/api/users/password", {
        method: "PUT",
        body: JSON.stringify({ ...inputs, email, oauth: true }),
      });

      if (!res.ok) return toast.error(await res.text());

      signOut();
    });

    return (
      <Form {...form}>
        <form onSubmit={onSubmit} className="space-y-4">
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <div className="flex flex-col gap-2">
                  <FormLabel className="w-auto">비밀번호</FormLabel>

                  <FormControl>
                    <div className="flex w-full items-center gap-2">
                      <Input
                        className="bg-white"
                        type={visiblePassword.password ? "text" : "password"}
                        placeholder="********"
                        required
                        {...field}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="hover:bg-[#4fc3f7]/30"
                        onClick={() =>
                          setVisiblePassword((prev) => ({ ...prev, password: !prev.password }))
                        }
                      >
                        {visiblePassword.password ? <Eye /> : <EyeClosed />}
                      </Button>
                    </div>
                  </FormControl>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem>
                <div className="flex flex-col gap-2">
                  <FormLabel className="w-auto">비밀번호 확인</FormLabel>
                  <FormControl>
                    <div className="flex w-full items-center gap-2">
                      <Input
                        className="bg-white"
                        type={visiblePassword.confirmPassword ? "text" : "password"}
                        placeholder="********"
                        required
                        {...field}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="hover:bg-[#4fc3f7]/30"
                        onClick={() =>
                          setVisiblePassword((prev) => ({
                            ...prev,
                            confirmPassword: !prev.confirmPassword,
                          }))
                        }
                      >
                        {visiblePassword.confirmPassword ? <Eye /> : <EyeClosed />}
                      </Button>
                    </div>
                  </FormControl>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" className="w-full">
            변경
          </Button>
        </form>
      </Form>
    );
  };

  const NormalLogin = () => {
    const form = useForm({
      resolver: zodResolver(schema),
      mode: "onBlur",
      defaultValues: { currentPassword: "", password: "", confirmPassword: "" },
    });
    const { handleSubmit } = form;
    const onSubmit = handleSubmit(async (inputs) => {
      const res = await fetch("/api/users/password", {
        method: "PUT",
        body: JSON.stringify({ ...inputs, email }),
      });

      if (!res.ok) return toast.error(await res.text());

      signOut();
    });

    return (
      <Form {...form}>
        <form onSubmit={onSubmit} className="space-y-4">
          <FormField
            control={form.control}
            name="currentPassword"
            render={({ field }) => (
              <FormItem>
                <div className="flex flex-col gap-2">
                  <FormLabel className="w-auto">현재 비밀번호</FormLabel>
                  <FormControl>
                    <div className="flex w-full items-center gap-2">
                      <Input
                        className="bg-white"
                        type={visiblePassword.currentPassword ? "text" : "password"}
                        placeholder="********"
                        required
                        {...field}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="hover:bg-[#4fc3f7]/30"
                        onClick={() =>
                          setVisiblePassword((prev) => ({
                            ...prev,
                            currentPassword: !prev.currentPassword,
                          }))
                        }
                      >
                        {visiblePassword.currentPassword ? <Eye /> : <EyeClosed />}
                      </Button>
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
                  <FormLabel className="w-auto">비밀번호</FormLabel>
                  <FormControl>
                    <div className="flex w-full items-center gap-2">
                      <Input
                        className="bg-white"
                        type={visiblePassword.password ? "text" : "password"}
                        placeholder="********"
                        required
                        {...field}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="hover:bg-[#4fc3f7]/30"
                        onClick={() =>
                          setVisiblePassword((prev) => ({ ...prev, password: !prev.password }))
                        }
                      >
                        {visiblePassword.password ? <Eye /> : <EyeClosed />}
                      </Button>
                    </div>
                  </FormControl>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem>
                <div className="flex flex-col gap-2">
                  <FormLabel className="w-auto">비밀번호 확인</FormLabel>
                  <FormControl>
                    <div className="flex w-full items-center gap-2">
                      <Input
                        className="bg-white"
                        type={visiblePassword.confirmPassword ? "text" : "password"}
                        placeholder="********"
                        required
                        {...field}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="hover:bg-[#4fc3f7]/30"
                        onClick={() =>
                          setVisiblePassword((prev) => ({
                            ...prev,
                            confirmPassword: !prev.confirmPassword,
                          }))
                        }
                      >
                        {visiblePassword.confirmPassword ? <Eye /> : <EyeClosed />}
                      </Button>
                    </div>
                  </FormControl>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" className="w-full">
            변경
          </Button>
        </form>
      </Form>
    );
  };

  return isFirstOauthLogin ? <FirstOauthLogin /> : <NormalLogin />;
}
