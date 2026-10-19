"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import {
  CONFERENCE_PHOTOS,
  PHOTO_CATEGORIES,
  ConferencePhoto,
  CONFERENCE_NEWS_INFO,
} from "@/lib/conferencePhotos";

export function ConferenceGallery() {
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [activePhotoIndex, setActivePhotoIndex] = useState<number | null>(null);

  const filteredPhotos =
    selectedCategory === "All"
      ? CONFERENCE_PHOTOS
      : CONFERENCE_PHOTOS.filter((p) => p.category === selectedCategory);

  const counts: Record<string, number> = {
    All: CONFERENCE_PHOTOS.length,
    "Plenary Sessions": CONFERENCE_PHOTOS.filter((p) => p.category === "Plenary Sessions").length,
    "Dignitaries & Groups": CONFERENCE_PHOTOS.filter((p) => p.category === "Dignitaries & Groups").length,
    "Conference Highlights": CONFERENCE_PHOTOS.filter((p) => p.category === "Conference Highlights").length,
  };

  const handlePrev = useCallback(() => {
    if (activePhotoIndex === null) return;
    setActivePhotoIndex((prev) =>
      prev === null || prev === 0 ? filteredPhotos.length - 1 : prev - 1
    );
  }, [activePhotoIndex, filteredPhotos.length]);

  const handleNext = useCallback(() => {
    if (activePhotoIndex === null) return;
    setActivePhotoIndex((prev) =>
      prev === null || prev === filteredPhotos.length - 1 ? 0 : prev + 1
    );
  }, [activePhotoIndex, filteredPhotos.length]);

  const handleClose = useCallback(() => {
    setActivePhotoIndex(null);
  }, []);

  // Keyboard controls for lightbox
  useEffect(() => {
    if (activePhotoIndex === null) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleClose();
      if (e.key === "ArrowLeft") handlePrev();
      if (e.key === "ArrowRight") handleNext();
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [activePhotoIndex, handleClose, handleNext, handlePrev]);

  // Lock body scroll when lightbox is open
  useEffect(() => {
    if (activePhotoIndex !== null) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [activePhotoIndex]);

  const activePhoto: ConferencePhoto | undefined =
    activePhotoIndex !== null ? filteredPhotos[activePhotoIndex] : undefined;

  return (
    <div>
      {/* Category Filter Pills */}
      <div className="gallery-filter-bar">
        {PHOTO_CATEGORIES.map((cat) => {
          const isActive = selectedCategory === cat;
          return (
            <button
              key={cat}
              type="button"
              className={`gallery-filter-btn ${isActive ? "active" : ""}`}
              onClick={() => {
                setSelectedCategory(cat);
                setActivePhotoIndex(null);
              }}
              aria-pressed={isActive}
            >
              <span>{cat}</span>
              <span className="gallery-filter-count">{counts[cat] ?? 0}</span>
            </button>
          );
        })}
      </div>

      {/* Photos Grid */}
      <div className="conference-gallery-grid">
        {filteredPhotos.map((photo, idx) => (
          <div
            key={photo.id}
            className="conference-photo-card"
            onClick={() => setActivePhotoIndex(idx)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                setActivePhotoIndex(idx);
              }
            }}
            aria-label={`View ${photo.title}`}
          >
            <div className="photo-thumb-wrapper">
              <Image
                src={photo.thumbSrc}
                alt={photo.title}
                width={photo.width}
                height={photo.height}
                className="gallery-img"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                loading={idx < 6 ? "eager" : "lazy"}
              />
              <div className="photo-card-overlay">
                <span className="category-pill">{photo.category}</span>
                <span className="expand-badge">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" />
                  </svg>
                  <span>Expand</span>
                </span>
              </div>
            </div>
            <div className="photo-card-caption">
              <h4>{photo.title}</h4>
              <p>{photo.caption}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Lightbox Modal */}
      {activePhoto && (
        <div
          className="gallery-lightbox-overlay"
          onClick={handleClose}
          role="dialog"
          aria-modal="true"
          aria-label={activePhoto.title}
        >
          <div
            className="gallery-lightbox-container"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Top Bar */}
            <div className="lightbox-top-bar">
              <div className="lightbox-meta">
                <span className="lightbox-category">{activePhoto.category}</span>
                <span className="lightbox-counter">
                  {(activePhotoIndex ?? 0) + 1} of {filteredPhotos.length}
                </span>
              </div>
              <div className="lightbox-controls">
                <a
                  href={activePhoto.fullSrc}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="lightbox-action-btn"
                  title="Open full resolution in new tab"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3" />
                  </svg>
                  <span>Full Res (2100px)</span>
                </a>
                <button
                  type="button"
                  onClick={handleClose}
                  className="lightbox-close-btn"
                  aria-label="Close dialog"
                >
                  &times;
                </button>
              </div>
            </div>

            {/* Main Stage */}
            <div className="lightbox-stage">
              <button
                type="button"
                className="lightbox-nav-btn prev"
                onClick={handlePrev}
                aria-label="Previous image"
              >
                &#10094;
              </button>

              <div className="lightbox-image-wrap">
                <Image
                  src={activePhoto.fullSrc}
                  alt={activePhoto.title}
                  width={activePhoto.width}
                  height={activePhoto.height}
                  className="lightbox-image"
                  priority
                  sizes="(max-width: 1200px) 95vw, 1200px"
                />
              </div>

              <button
                type="button"
                className="lightbox-nav-btn next"
                onClick={handleNext}
                aria-label="Next image"
              >
                &#10095;
              </button>
            </div>

            {/* Bottom Caption */}
            <div className="lightbox-details">
              <h3>{activePhoto.title}</h3>
              <p>{activePhoto.caption}</p>
              <div className="lightbox-credit-strip">
                <span>Credit: {CONFERENCE_NEWS_INFO.photoCredit}</span>
                <span className="dot">&middot;</span>
                <span>Venue: {CONFERENCE_NEWS_INFO.venue}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
