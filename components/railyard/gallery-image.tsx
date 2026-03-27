'use client';

import { useState } from 'react';
import { Package, MapPin } from 'lucide-react';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { buildGalleryUrl, buildGalleryCdnUrl } from '@/hooks/use-registry';

interface GalleryImageProps {
  type: 'mods' | 'maps';
  id: string;
  imagePath?: string;
  className?: string;
}

export function GalleryImage({
  type,
  id,
  imagePath,
  className,
}: GalleryImageProps) {
  const [state, setState] = useState<'loading' | 'loaded' | 'cdn' | 'error'>(
    imagePath ? 'loading' : 'error',
  );
  const FallbackIcon = type === 'mods' ? Package : MapPin;

  if (!imagePath || state === 'error') {
    return (
      <div
        className={cn(
          'flex w-full items-center justify-center bg-muted',
          className,
        )}
      >
        <FallbackIcon
          className="h-12 w-12 text-muted-foreground"
          aria-hidden="true"
        />
      </div>
    );
  }

  const primaryUrl = buildGalleryUrl(type, id, imagePath);
  const cdnUrl = buildGalleryCdnUrl(type, id, imagePath);

  return (
    <>
      {state === 'loading' && <Skeleton className={cn('w-full', className)} />}
      <Image
        src={state === 'cdn' ? cdnUrl : primaryUrl}
        alt=""
        fill
        unoptimized
        sizes="(max-width: 768px) 100vw, 33vw"
        className={cn(
          'w-full object-cover',
          state === 'loading' && 'hidden',
          className,
        )}
        onLoad={() => setState('loaded')}
        onError={() => {
          if (state === 'loading') setState('cdn');
          else setState('error');
        }}
      />
    </>
  );
}
