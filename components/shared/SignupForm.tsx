"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeftIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { TemplateFormItem } from "@/components/form/TemplateFormItem";
import { GoogleButton, NaverButton } from "@/components/shared/SigninForm";
import { Button } from "@/components/ui/button";
import { Field, FieldDescription, FieldGroup, FieldSeparator } from "@/components/ui/field";
import { Form, FormField } from "@/components/ui/form";
import { UserFormType, userFormModel, userFormSchema } from "@/lib/schema/user.schema";

export function SignupForm() {
  const router = useRouter();
  const form = useForm<UserFormType>({
    resolver: zodResolver(userFormSchema),
    mode: "onBlur",
  });
  const [isDuplicate, setIsDuplicate] = useState(true);

  const { handleSubmit } = form;

  /* TODO
    1. 회원가입 Submit 로직 구현
    2. 메일 확인 로직 구현
    3. Oauth 계정 연동 로직 구현
  */
  const onSubmit = handleSubmit(async (data: UserFormType) => {
    if (isDuplicate) return toast.error("중복검사를 진행해주세요.");

    const res = await fetch("/api/users/signup", { method: "POST", body: JSON.stringify(data) });

    if (!res.ok) return toast.error("회원가입에 실패하였습니다. 다시 시도해주세요.");

    toast.success("회원가입이 완료되었습니다. 메일 인증 완료 후 로그인해주세요.");
    router.push("/");
  });

  const onDuplicateCheck = async (key: keyof UserFormType, value: string) => {
    const res = await fetch(`/api/users/check?key=${key}&value=${value}`);

    const data = await res.json();

    if (!!data) form.setError(key, { message: "이미 존재하는 이메일 입니다." });
    else form.clearErrors(key);

    setIsDuplicate(!!data);
  };

  return (
    <section className="container mx-auto h-full max-w-4xl flex-1 p-6">
      <div className="mb-6">
        <Button variant="ghost" onClick={() => router.back()}>
          <ArrowLeftIcon />
        </Button>
        <div className="flex justify-between gap-2">
          <div className="flex flex-col">
            <h3 className="font-semibold text-2xl">회원가입</h3>
            {/* <p className="mt-1 text-muted-foreground text-sm">아름다웠던 추억을 회상해 보세요.</p> */}
          </div>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={onSubmit}>
          <div className="flex flex-col gap-6">
            {Object.entries(userFormModel).map(([key, model]) => {
              return (
                <FormField
                  key={key}
                  control={form.control}
                  name={key as keyof UserFormType}
                  render={({ field }) => (
                    <TemplateFormItem
                      fieldModel={model}
                      field={field}
                      isDuplicate={isDuplicate}
                      onDuplicateCheck={(key, value) =>
                        onDuplicateCheck(key as keyof UserFormType, value)
                      }
                    />
                  )}
                />
              );
            })}
            <FieldGroup>
              <Field>
                <Button type="submit">회원가입</Button>
                <FieldSeparator>or</FieldSeparator>
                <GoogleButton
                  type="button"
                  text="Sign up with Google"
                  className="py-1"
                  onClick={() => signIn("google")}
                />
                <NaverButton
                  type="button"
                  text="Sign up with Naver"
                  onClick={() => signIn("naver")}
                />
                <FieldDescription className="px-6 text-center">
                  Already have an account? <a href="#">Sign in</a>
                </FieldDescription>
              </Field>
            </FieldGroup>
          </div>
        </form>
      </Form>
    </section>
  );
}
