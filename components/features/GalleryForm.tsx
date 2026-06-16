"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { createGallery, updateGallery } from "@/app/actions/gallery";

interface ExistingImage {
  id: number;
  url: string;
  order: number;
}

interface GalleryFormProps {
  mode: "create" | "edit";
  postId?: number;
  defaultTitle?: string;
  defaultContent?: string;
  existingImages?: ExistingImage[];
  error?: string;
}

const INPUT =
  "w-full px-3 py-2 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary bg-white";

const LABELS = {
  create: { title: "갤러리 등록", back: "목록으로", submit: "등록" },
  edit:   { title: "갤러리 수정", back: "상세로",   submit: "저장" },
};

export function GalleryForm({
  mode,
  postId,
  defaultTitle,
  defaultContent,
  existingImages = [],
  error,
}: GalleryFormProps) {
  const [keepImages, setKeepImages] = useState<ExistingImage[]>(existingImages);
  const [newImageUrls, setNewImageUrls] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const backHref = mode === "create" ? "/gallery" : `/gallery/${postId}`;
  const action = mode === "create" ? createGallery : updateGallery;
  const labels = LABELS[mode];

  const allImages = [
    ...keepImages.map((img) => ({
      key: `keep-${img.id}`,
      url: img.url,
      onRemove: () => setKeepImages((prev) => prev.filter((i) => i.id !== img.id)),
    })),
    ...newImageUrls.map((url) => ({
      key: `new-${url}`,
      url,
      onRemove: () => setNewImageUrls((prev) => prev.filter((u) => u !== url)),
    })),
  ];

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setUploading(true);

    const uploaded = await Promise.all(
      Array.from(files).map(async (file) => {
        const res = await fetch("/api/gallery/upload", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ filename: file.name, contentType: file.type }),
        });
        const { presignedUrl, publicUrl } = await res.json();
        await fetch(presignedUrl, { method: "PUT", body: file, headers: { "Content-Type": file.type } });
        return publicUrl as string;
      })
    );

    setNewImageUrls((prev) => [...prev, ...uploaded]);
    setUploading(false);
    e.target.value = "";
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <div className="flex items-center gap-3 mb-6">
        <Link href={backHref} className="text-sm text-muted-foreground hover:text-primary">
          ← {labels.back}
        </Link>
        <h1 className="text-xl font-bold">{labels.title}</h1>
      </div>

      {error === "missing" && (
        <p className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-200">
          제목을 입력해주세요.
        </p>
      )}

      <form action={action} className="flex flex-col gap-5 bg-white border border-border rounded-xl p-6">
        {mode === "edit" && <input type="hidden" name="id" value={postId} />}

        {keepImages.map((img) => (
          <input key={img.id} type="hidden" name="keepImageId" value={img.id} />
        ))}
        {newImageUrls.map((url) => (
          <input key={url} type="hidden" name="imageUrl" value={url} />
        ))}

        <div>
          <label className="block text-sm font-medium mb-1.5">제목</label>
          <input
            type="text"
            name="title"
            required
            defaultValue={defaultTitle}
            className={INPUT}
            placeholder="갤러리 제목"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1.5">내용 (선택)</label>
          <textarea
            name="content"
            rows={4}
            defaultValue={defaultContent}
            className={`${INPUT} resize-none`}
            placeholder="행사 설명 등 내용을 입력하세요"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">이미지</label>

          {allImages.length > 0 && (
            <div className="flex flex-wrap gap-3 mb-3">
              {allImages.map(({ key, url, onRemove }) => (
                <div key={key} className="relative">
                  <Image
                    src={url}
                    alt=""
                    width={120}
                    height={90}
                    className="rounded-lg object-cover"
                    style={{ width: 120, height: 90 }}
                  />
                  <button
                    type="button"
                    onClick={onRemove}
                    className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full text-xs leading-none flex items-center justify-center"
                    aria-label="이미지 삭제"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={handleFileChange}
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="px-4 py-2 text-sm border border-border rounded-lg hover:bg-accent transition-colors disabled:opacity-50"
          >
            {uploading ? "업로드 중..." : "이미지 추가"}
          </button>
        </div>

        <div className="flex gap-2 justify-end pt-2">
          <Link
            href={backHref}
            className="px-4 py-2 text-sm border border-border rounded-lg hover:bg-accent transition-colors"
          >
            취소
          </Link>
          <button
            type="submit"
            disabled={uploading}
            className="px-4 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            {labels.submit}
          </button>
        </div>
      </form>
    </div>
  );
}
