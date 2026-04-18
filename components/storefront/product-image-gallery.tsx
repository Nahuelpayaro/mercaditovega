"use client";

import { useState } from "react";
import Image from "next/image";

type GalleryImage = { url: string; alt: string };

export function ProductImageGallery({ images }: { images: GalleryImage[] }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const active = images[activeIndex];

  return (
    <div className="space-y-3">
      <div className="relative aspect-square overflow-hidden rounded-[32px] border border-border bg-white shadow-[0_22px_50px_rgba(87,52,22,0.08)]">
        {active ? (
          <Image
            src={active.url}
            alt={active.alt}
            fill
            priority
            sizes="(max-width: 1024px) 100vw, 55vw"
            className="object-cover transition-opacity duration-200"
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-muted/30">
            <svg className="size-16 text-muted-foreground/40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3 21h18M3.75 3h16.5A.75.75 0 0121 3.75v16.5a.75.75 0 01-.75.75H3.75A.75.75 0 013 20.25V3.75A.75.75 0 013.75 3z" />
            </svg>
          </div>
        )}
      </div>

      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {images.map((img, i) => (
            <button
              key={img.url}
              type="button"
              onClick={() => setActiveIndex(i)}
              className={`relative size-16 shrink-0 overflow-hidden rounded-2xl border-2 transition-all duration-150 ${
                i === activeIndex
                  ? "border-primary shadow-sm"
                  : "border-border opacity-60 hover:opacity-100"
              }`}
            >
              <Image src={img.url} alt={img.alt} fill sizes="64px" className="object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
