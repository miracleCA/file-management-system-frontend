"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

interface FileThumbnailProps {
  file: File;
}

export default function FileThumbnail({ file }: FileThumbnailProps) {
  const [preview, setPreview] = useState<string | null>(null);

  const isImage = file.type.startsWith("image/");

  useEffect(() => {
    if (!isImage) {
      setPreview(null);
      return;
    }

    const objectUrl = URL.createObjectURL(file);

    setPreview(objectUrl);

    return () => {
      URL.revokeObjectURL(objectUrl);
    };
  }, [file, isImage]);

  if (isImage && preview) {
    return (
      <div className="relative h-20 w-20 overflow-hidden rounded-lg border bg-gray-50">
        <Image src={preview} alt={file.name} fill unoptimized className="object-cover" />
      </div>
    );
  }

  if (file.type === "application/pdf") {
    return <div className="flex h-20 w-20 items-center justify-center rounded-lg border bg-red-50 text-3xl">📄</div>;
  }

  return <div className="flex h-20 w-20 items-center justify-center rounded-lg border bg-gray-50 text-3xl">📎</div>;
}
