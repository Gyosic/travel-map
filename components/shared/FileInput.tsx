"use client";

import { X } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import { Accept } from "react-dropzone";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Carousel, CarouselContent, CarouselItem } from "@/components/ui/carousel";
import { Dropzone, DropzoneContent, DropzoneEmptyState } from "@/components/ui/shadcn-io/dropzone";
import { FileType } from "@/lib/schema/file";

interface FileInputProps {
  accept?: Accept;
  multiple?: boolean;
  value?: File[];
  onChange?: (...args: unknown[]) => void;
}
export default function FileInput({ accept, value = [], multiple, onChange }: FileInputProps) {
  const [files, setFiles] = useState<File[] | FileType[] | undefined>(value);
  const [filePreview, setFilePreview] = useState<File[]>([]);

  const handleDrop = (inputs: File[]) => {
    if (multiple)
      setFiles((prev) => {
        return prev?.concat(inputs) ?? inputs;
      });
    else setFiles(inputs);
  };

  const readAsDataURL = async (file: File) => {
    return new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === "string") resolve(reader.result);
        else reject(new Error("Failed to read file"));
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const parseFiles = async (files: File[]) => {
    const newFilePreview = [];
    for (const file of files) {
      try {
        const src = await readAsDataURL(file);

        newFilePreview.push({
          ...file,
          name: file.name,
          src,
          lastModified: file.lastModified,
          size: file.size,
        });
      } catch {
        newFilePreview.push({ ...file, src: `/api/files${file.src}` });
      }
    }

    setFilePreview(newFilePreview as File[]);
  };

  const handleRemove = async (name: string) => {
    const file = files?.find((file) => file.name === name);

    if (file) {
      if (!(file instanceof File)) {
        await fetch(`/api/files${file.src}`, { method: "DELETE" });
      }
      setFiles((prev) => prev?.filter((f) => f.name !== name) ?? []);
    }
  };

  useEffect(() => {
    parseFiles(files as File[]);

    onChange?.(files);
  }, [files]);

  return (
    <div className="relative flex w-full flex-col gap-2">
      <Dropzone
        multiple={multiple}
        maxFiles={10}
        accept={accept}
        onDrop={handleDrop}
        onError={console.error}
        src={files as File[]}
      >
        <DropzoneEmptyState />
        <DropzoneContent></DropzoneContent>
      </Dropzone>

      <Carousel className="w-full">
        <CarouselContent className="ml-0">
          {filePreview?.map((file, index) => (
            <CarouselItem key={index} className="basis-full pl-0">
              <div className="w-full">
                <Card className="relative">
                  <CardContent className="flex h-[180px] p-0">
                    <div className="absolute top-0 flex w-full items-center justify-between ps-2">
                      <span className="font-bold">{index + 1}</span>
                      <Button
                        variant="ghost"
                        type="button"
                        size="icon"
                        className="hover:bg-transparent hover:text-red-500"
                        onClick={() => handleRemove(file.name)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>

                    <Image
                      alt="Preview"
                      className="h-full w-full object-contain"
                      src={file.src}
                      width={1000}
                      height={1000}
                    />
                  </CardContent>
                </Card>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
    </div>
  );
}
