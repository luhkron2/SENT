'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  X, 
  ChevronLeft, 
  ChevronRight, 
  ZoomIn, 
  ZoomOut, 
  Download,
  Image as ImageIcon,
  Video,
  Maximize2,
  Loader2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';

interface MediaItem {
  id: string;
  url: string;
  type: string;
  createdAt: string;
  issueId?: string;
  ticket?: number;
}

interface PhotoGalleryProps {
  issueId?: string;
  media?: MediaItem[];
  className?: string;
  title?: string;
}

export function PhotoGallery({ 
  issueId, 
  media: propMedia,
  className,
  title = "Photos & Media"
}: PhotoGalleryProps) {
  const [media, setMedia] = useState<MediaItem[]>(propMedia || []);
  const [loading, setLoading] = useState(!propMedia);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [zoom, setZoom] = useState(1);

  useEffect(() => {
    if (issueId && !propMedia) {
      const fetchMediaData = async () => {
        try {
          setLoading(true);
          const response = await fetch(`/api/issues/${issueId}`);
          if (response.ok) {
            const data = await response.json();
            setMedia(data.media || []);
          }
        } catch (error) {
          console.error('Failed to fetch media:', error);
        } finally {
          setLoading(false);
        }
      };
      fetchMediaData();
    }
  }, [issueId, propMedia]);

  useEffect(() => {
    if (propMedia) {
      setMedia(propMedia);
    }
  }, [propMedia]);

  const goToNext = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % media.length);
    setZoom(1);
  }, [media.length]);

  const goToPrevious = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + media.length) % media.length);
    setZoom(1);
  }, [media.length]);

  // Keyboard navigation
  useEffect(() => {
    if (!lightboxOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'Escape':
          closeLightbox();
          break;
        case 'ArrowLeft':
          goToPrevious();
          break;
        case 'ArrowRight':
          goToNext();
          break;
        case '+':
        case '=':
          setZoom(z => Math.min(z + 0.25, 3));
          break;
        case '-':
          setZoom(z => Math.max(z - 0.25, 0.5));
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightboxOpen, goToNext, goToPrevious]);

  const openLightbox = (index: number) => {
    setCurrentIndex(index);
    setZoom(1);
    setLightboxOpen(true);
    document.body.style.overflow = 'hidden';
  };

  const closeLightbox = () => {
    setLightboxOpen(false);
    setZoom(1);
    document.body.style.overflow = '';
  };

  const downloadMedia = async (item: MediaItem) => {
    try {
      const response = await fetch(item.url);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `media-${item.id}.${item.type.split('/')[1] || 'jpg'}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download failed:', error);
    }
  };

  const isVideo = (type: string) => type.startsWith('video/');
  const isImage = (type: string) => type.startsWith('image/');

  if (loading) {
    return (
      <Card className={cn("animate-pulse", className)}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Loader2 className="h-5 w-5 animate-spin" />
            Loading Media...
          </CardTitle>
        </CardHeader>
      </Card>
    );
  }

  if (media.length === 0) {
    return (
      <Card className={cn("", className)}>
        <CardContent className="p-6 text-center text-muted-foreground">
          <ImageIcon className="h-12 w-12 mx-auto mb-3 opacity-30" />
          <p>No photos or media attached</p>
        </CardContent>
      </Card>
    );
  }

  const currentMedia = media[currentIndex];

  return (
    <>
      <Card className={cn("", className)}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <ImageIcon className="h-5 w-5" />
              {title}
            </CardTitle>
            <Badge variant="outline">
              {media.length} {media.length === 1 ? 'item' : 'items'}
            </Badge>
          </div>
        </CardHeader>

        <CardContent>
          {/* Thumbnail Grid */}
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
            {media.map((item, index) => (
              <button
                key={item.id}
                onClick={() => openLightbox(index)}
                className={cn(
                  "relative aspect-square rounded-lg overflow-hidden",
                  "border-2 border-transparent hover:border-primary",
                  "transition-all hover:scale-105 focus:outline-none focus:ring-2 focus:ring-primary",
                  "group"
                )}
              >
                {isVideo(item.type) ? (
                  <div className="w-full h-full bg-slate-800 flex items-center justify-center">
                    <Video className="h-8 w-8 text-white" />
                  </div>
                ) : (
                  <img
                    src={item.url}
                    alt={`Media ${index + 1}`}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                )}
                
                {/* Hover overlay */}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Maximize2 className="h-6 w-6 text-white" />
                </div>

                {/* Type indicator */}
                <div className="absolute bottom-1 right-1">
                  {isVideo(item.type) ? (
                    <Badge variant="secondary" className="text-xs px-1 py-0">
                      <Video className="h-3 w-3" />
                    </Badge>
                  ) : null}
                </div>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Lightbox Modal */}
      {lightboxOpen && currentMedia && (
        <div 
          className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center"
          role="dialog"
          aria-modal="true"
          aria-label="Image lightbox"
        >
          {/* Backdrop button for closing */}
          <button
            type="button"
            className="absolute inset-0 w-full h-full bg-transparent cursor-default"
            onClick={closeLightbox}
            onKeyDown={(e) => {
              if (e.key === 'Escape') closeLightbox();
              if (e.key === 'ArrowLeft') goToPrevious();
              if (e.key === 'ArrowRight') goToNext();
            }}
            aria-label="Close lightbox"
          />
          {/* Close button */}
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-4 right-4 text-white hover:bg-white/20 z-10"
            onClick={closeLightbox}
          >
            <X className="h-6 w-6" />
          </Button>

          {/* Navigation - Previous */}
          {media.length > 1 && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute left-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/20 z-10"
              onClick={(e) => {
                e.stopPropagation();
                goToPrevious();
              }}
            >
              <ChevronLeft className="h-8 w-8" />
            </Button>
          )}

          {/* Navigation - Next */}
          {media.length > 1 && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/20 z-10"
              onClick={(e) => {
                e.stopPropagation();
                goToNext();
              }}
            >
              <ChevronRight className="h-8 w-8" />
            </Button>
          )}

          {/* Media display */}
          <button 
            type="button"
            className="max-w-[90vw] max-h-[85vh] flex items-center justify-center bg-transparent border-0 cursor-default"
            onClick={(e) => e.stopPropagation()}
          >
            {isVideo(currentMedia.type) ? (
              <video
                src={currentMedia.url}
                controls
                autoPlay
                className="max-w-full max-h-[85vh] rounded-lg"
              >
                <track kind="captions" />
              </video>
            ) : (
              <img
                src={currentMedia.url}
                alt={`Media ${currentIndex + 1}`}
                className="max-w-full max-h-[85vh] object-contain rounded-lg transition-transform"
                style={{ transform: `scale(${zoom})` }}
              />
            )}
          </button>

          {/* Bottom toolbar */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-black/60 rounded-full px-4 py-2">
            {/* Counter */}
            <span className="text-white text-sm px-2">
              {currentIndex + 1} / {media.length}
            </span>

            <div className="w-px h-6 bg-white/30" />

            {/* Zoom controls (for images only) */}
            {isImage(currentMedia.type) && (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-white hover:bg-white/20 h-8 w-8"
                  onClick={() => setZoom(z => Math.max(z - 0.25, 0.5))}
                  disabled={zoom <= 0.5}
                >
                  <ZoomOut className="h-4 w-4" />
                </Button>
                <span className="text-white text-xs w-12 text-center">
                  {Math.round(zoom * 100)}%
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-white hover:bg-white/20 h-8 w-8"
                  onClick={() => setZoom(z => Math.min(z + 0.25, 3))}
                  disabled={zoom >= 3}
                >
                  <ZoomIn className="h-4 w-4" />
                </Button>

                <div className="w-px h-6 bg-white/30" />
              </>
            )}

            {/* Download */}
            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:bg-white/20 h-8 w-8"
              onClick={() => downloadMedia(currentMedia)}
            >
              <Download className="h-4 w-4" />
            </Button>
          </div>

          {/* Thumbnail strip */}
          {media.length > 1 && (
            <div className="absolute bottom-20 left-1/2 -translate-x-1/2 flex gap-2 max-w-[80vw] overflow-x-auto p-2 bg-black/40 rounded-lg">
              {media.map((item, index) => (
                <button
                  key={item.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    setCurrentIndex(index);
                    setZoom(1);
                  }}
                  className={cn(
                    "w-12 h-12 rounded overflow-hidden flex-shrink-0 border-2 transition-all",
                    index === currentIndex 
                      ? "border-white scale-110" 
                      : "border-transparent opacity-60 hover:opacity-100"
                  )}
                >
                  {isVideo(item.type) ? (
                    <div className="w-full h-full bg-slate-700 flex items-center justify-center">
                      <Video className="h-4 w-4 text-white" />
                    </div>
                  ) : (
                    <img
                      src={item.url}
                      alt={`Thumbnail ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  )}
                </button>
              ))}
            </div>
          )}

          {/* Media info */}
          <div className="absolute top-4 left-4 text-white text-sm">
            <p className="opacity-80">
              {formatDistanceToNow(new Date(currentMedia.createdAt), { addSuffix: true })}
            </p>
            {currentMedia.ticket && (
              <Badge variant="secondary" className="mt-1">
                Ticket #{currentMedia.ticket}
              </Badge>
            )}
          </div>
        </div>
      )}
    </>
  );
}