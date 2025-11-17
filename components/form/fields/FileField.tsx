import { isNil } from "es-toolkit";
import { ImageIcon, LucideIcon, Upload, X } from "lucide-react";
import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import { FieldPath, FieldValues } from "react-hook-form";
import z from "zod";
import { FormItemWrapper } from "@/components/form/FormItemWrapper";
import { TemplateFormItemProps } from "@/components/form/TemplateFormItem";
import FileInput from "@/components/shared/FileInput";
import { Button } from "@/components/ui/button";
import { FormLabel } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { fileSchema as zodFile } from "@/lib/schema/file";

export function FieldField<T extends FieldValues, K extends FieldPath<T>>({
  fieldModel,
  field,
  isForm = true,
  labelPosition = "top",
  labelCls,
}: TemplateFormItemProps<T, K>) {
  const [inputValue, setInputValue] = useState(field.value);
  const fileExt = useMemo(() => {
    if (fieldModel?.accept) return fieldModel.accept.join(",");
  }, []);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const getFileProperties = ({ file }: { file: File | z.infer<typeof zodFile> }) => {
    if (!file) return { src: "", name: "" };

    if (file instanceof File) {
      const { type = "", name = "", size = 0, lastModified = Date.now() } = file;
      return {
        isImageType: type.startsWith("image"),
        src: URL.createObjectURL(file),
        name,
        size,
        lastModified,
      };
    } else {
      const { type = "", src = "", originalname = "", size = 0, lastModified } = file || {};
      return {
        isImageType: type.startsWith("image"),
        src: `/api/files${src}`,
        name: originalname,
        size,
        lastModified,
      };
    }
  };

  const handleFileInput = () => {
    fileInputRef?.current?.click();
  };
  const onChangeFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (fieldModel.multiple) {
      // 동일한 파일 필터링. name이 같은 파일은 동일 파일로 간주
      const prev = inputValue || [];
      const filtered = files.filter(({ name }) => !prev.some(({ name: n }: File) => n === name));
      field.onChange([...prev, ...filtered]);
    } else {
      const [file] = files;
      field.onChange(file);
    }
  };

  const handleFileRemove = (i?: number) => {
    if (isNil(i)) {
      field.onChange([]);
    } else {
      const removed = [...inputValue.slice(0, i), ...inputValue.slice(i + 1)];
      field.onChange(removed);
    }
  };

  useEffect(() => {
    const value = field?.value;
    setInputValue(value);
  }, [field]);

  return fieldModel.multiple ? (
    <FormItemWrapper
      name={fieldModel.name}
      desc={fieldModel.desc}
      labelCls={labelCls}
      className={labelPosition === "left" ? "flex flex-1 items-center" : "flex-1"}
      isForm={isForm}
      icon={fieldModel.icon as LucideIcon}
      // formLabel={
      //   <FormLabel>
      //     {fieldModel.name}
      //     <Input
      //       {...field}
      //       value=""
      //       ref={fileInputRef}
      //       accept={fileExt}
      //       type="file"
      //       className="hidden w-0"
      //       multiple={fieldModel.multiple}
      //       onChange={onChangeFile}
      //     />
      //   </FormLabel>
      // }
    >
      <div className="flex w-full flex-col items-end">
        {/* <Button type="button" variant="outline" onClick={handleFileInput}>
          파일 선택
        </Button> */}
        <FileInput multiple={fieldModel.multiple} onChange={field.onChange} />
        {/* {inputValue?.length > 0 ? (
          inputValue?.map((file: File | z.infer<typeof zodFile>, i: number) => {
            return file ? (
              <div key={i} className="flex w-full items-center">
                <Image
                  src={getFileProperties({ file }).src}
                  alt="preview"
                  className="mr-2 size-20 max-h-20 max-w-20 rounded-full border object-contain"
                  width="0"
                  height="0"
                  unoptimized
                />
                <p className="flex-1 overflow-hidden text-ellipsis ps-2 text-sm">
                  {getFileProperties({ file }).name || "선택된 파일이 없습니다."}{" "}
                </p>
                <Button
                  type="button"
                  variant="ghost"
                  className="size-6 max-w-6 flex-1"
                  onClick={() => handleFileRemove(i)}
                >
                  <X />
                </Button>
              </div>
            ) : (
              <ImageIcon className="mr-2 size-20" strokeWidth={1} />
            );
          })
        ) : (
          <></>
        )} */}
      </div>
    </FormItemWrapper>
  ) : (
    <FormItemWrapper
      name={fieldModel.name}
      desc={fieldModel.desc}
      labelCls={labelCls}
      className={labelPosition === "left" ? "flex flex-1 items-center" : "flex-1"}
      isForm={isForm}
      icon={fieldModel.icon as LucideIcon}
      formLabel={
        <FormLabel>
          {fieldModel.name}
          <Input
            {...field}
            ref={fileInputRef}
            accept={fileExt}
            type="file"
            className="hidden w-0"
            value=""
            multiple={fieldModel.multiple}
            onChange={onChangeFile}
          />
        </FormLabel>
      }
    >
      <div className="flex w-full items-center">
        {inputValue?.length ? (
          <Image
            src={getFileProperties({ file: inputValue }).src}
            alt="preview"
            className="mr-2 size-20 max-h-20 max-w-20 rounded-full border object-contain"
            width="0"
            height="0"
            unoptimized
          />
        ) : (
          <Upload className="mr-2 size-20" strokeWidth={1} />
        )}
        <Button type="button" variant="outline" onClick={handleFileInput}>
          파일 선택
        </Button>
        <p className="flex-1 overflow-hidden text-ellipsis ps-2 text-sm">
          {getFileProperties({ file: inputValue }).name || "선택된 파일이 없습니다."}{" "}
        </p>
        {inputValue && (
          <Button
            type="button"
            variant="ghost"
            className="size-6 max-w-6 flex-1"
            onClick={() => handleFileRemove()}
          >
            <X />
          </Button>
        )}
      </div>
    </FormItemWrapper>
  );
}
