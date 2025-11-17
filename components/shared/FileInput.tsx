"use client";
import Image from "next/image";
import { useEffect, useState } from "react";
import { Accept } from "react-dropzone";
import { Card, CardContent } from "@/components/ui/card";
import { Carousel, CarouselContent, CarouselItem } from "@/components/ui/carousel";
import { Dropzone, DropzoneContent, DropzoneEmptyState } from "@/components/ui/shadcn-io/dropzone";

interface FileInputProps {
  accept?: Accept;
  multiple?: boolean;
  value?: File[];
  onChange?: (...args: unknown[]) => void;
}
export default function FileInput({ accept, multiple, onChange }: FileInputProps) {
  const [files, setFiles] = useState<File[] | undefined>();
  const [filePreview, setFilePreview] = useState<string[]>([]);

  const handleDrop = (files: File[]) => {
    if (multiple)
      setFiles((prev) => {
        if (prev) return prev.concat(files);
        else return files;
      });
    else setFiles(files);

    if (files.length > 0) {
      files.forEach((file) => {
        const fileReader = new FileReader();

        fileReader.onload = (e) => {
          if (typeof e.target?.result === "string") {
            if (multiple)
              setFilePreview((prev) => [...prev, e.target?.result as string].filter(Boolean));
            else setFilePreview([e.target?.result as string]);
          }
        };

        fileReader.readAsDataURL(file);
      });
    }
  };

  useEffect(() => {
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
        src={files}
      >
        <DropzoneEmptyState />
        <DropzoneContent>
          {/* {filePreview && (
            <div className="h-[102px] w-full">
              <img
                alt="Preview"
                className="absolute top-0 left-0 h-full w-full object-cover"
                src={filePreview}
              />
            </div>
          )} */}
        </DropzoneContent>
      </Dropzone>

      <Carousel className="w-full">
        <CarouselContent className="ml-0">
          {filePreview.map((src, index) => (
            <CarouselItem key={index} className="basis-full pl-0">
              <div className="w-full">
                <Card className="relative">
                  <CardContent className="flex h-[180px] p-0">
                    <span className="absolute top-0 right-2 font-bold">{index + 1}</span>
                    <Image
                      alt="Preview"
                      className="h-full w-full object-cover"
                      src={src || ""}
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
