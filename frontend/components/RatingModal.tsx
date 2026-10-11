"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { PhotoIcon, StarIcon, XMarkIcon } from "@heroicons/react/24/outline";

import { ratingService } from "@/helper/services/rating.service";
import { useApi } from "@/hooks/useApi";
import { useStore } from "@/store/StoreProvider";
import type { Product, Rating } from "@/types";
import Loading from "./Loading";

type RatingModalProps = {
  product: Product | null;
  onClose: () => void;
  onSaved?: (rating: Rating) => void;
};

type PendingPhotoUpdate = {
  ratingId: string;
  previousPhotoUrl: string | null;
  previewUrl: string;
};

export default function RatingModal({
  product,
  onClose,
  onSaved,
}: RatingModalProps) {
  const { user } = useStore();
  const { handleRequest } = useApi();
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [existingRating, setExistingRating] = useState<Rating | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [pendingPhotoUpdate, setPendingPhotoUpdate] =
    useState<PendingPhotoUpdate | null>(null);
  const previewObjectUrl = useRef<string | null>(null);

  const updatePhotoPreview = useCallback((preview: string | null) => {
    if (previewObjectUrl.current && previewObjectUrl.current !== preview) {
      URL.revokeObjectURL(previewObjectUrl.current);
      previewObjectUrl.current = null;
    }

    if (preview?.startsWith("blob:")) {
      previewObjectUrl.current = preview;
    }

    setPhotoPreview(preview);
  }, []);

  useEffect(() => {
    if (!product || !user) return;

    let isCurrent = true;
    const loadRating = async () => {
      setIsLoading(true);
      const result = await handleRequest(
        ratingService.getByProductId,
        product.id,
      );
      const ownRating =
        result.success && Array.isArray(result.data)
          ? (result.data.find((item) => item.user_name === user.username) ??
            null)
          : null;

      if (!isCurrent) return;

      if (result.success && Array.isArray(result.data)) {
        setExistingRating(ownRating);
        setRating(ownRating?.rating ?? 0);
        setComment(ownRating?.comment ?? "");
          setPhoto(null);

          const pendingUpdate =
            ownRating && pendingPhotoUpdate?.ratingId === ownRating.id
              ? pendingPhotoUpdate
              : null;

          if (
            pendingUpdate &&
            ownRating.photo_url === pendingUpdate.previousPhotoUrl
          ) {
            updatePhotoPreview(pendingUpdate.previewUrl);
          } else {
            updatePhotoPreview(ownRating?.photo_url ?? null);

            if (pendingUpdate) {
              setPendingPhotoUpdate(null);
            }
          }
      }

      if (isCurrent) setIsLoading(false);
    };

    void loadRating();

    return () => {
      isCurrent = false;
    };
  }, [product, user, pendingPhotoUpdate, handleRequest, updatePhotoPreview]);

  useEffect(
    () => () => {
      if (previewObjectUrl.current) {
          URL.revokeObjectURL(previewObjectUrl.current);
      }
    },
    [],
  );

  const handleSubmit = async () => {
    if (!product || rating === 0 || isSaving) return;

    setIsSaving(true);
    const result = existingRating
      ? await handleRequest(ratingService.update, {
          id: existingRating.id,
          rating,
          comment,
          photo,
        })
      : await handleRequest(ratingService.create, {
          product_id: product.id,
          rating,
          comment,
          photo,
        });

    if (result.success && result.data) {
      const savedRating = result.data as Rating;
      if (photo && photoPreview?.startsWith("blob:")) {
        setPendingPhotoUpdate({
          ratingId: savedRating.id,
          previousPhotoUrl:
            existingRating?.photo_url ?? savedRating.photo_url,
          previewUrl: photoPreview,
        });
        setPhoto(null);
      }
      onSaved?.(savedRating);
      onClose();
    }
    setIsSaving(false);
  };

  if (!product) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">
      <div className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-[28px] bg-white p-5 shadow-2xl dark:bg-slate-900 sm:p-6">
        <button
          type="button"
          onClick={onClose}
          aria-label="Close review dialog"
          className="absolute right-4 top-4 inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 text-slate-500 hover:text-slate-950 dark:border-slate-700 dark:hover:text-white"
        >
          <XMarkIcon className="h-5 w-5" />
        </button>

        <p className="text-xs font-bold uppercase tracking-[0.2em] text-teal-700">
          Delivered purchase
        </p>
        <h2 id="rating-modal-title" className="mt-2 pr-10 text-2xl font-black">
          Rate {product.name}
        </h2>

        {isLoading ? (
          <div className="mx-auto max-w-xl px-5 py-32 text-center">
            <Loading />
          </div>
        ) : (
          <>
            <div className="mt-7 flex gap-1" aria-label="Choose a rating">
              {[1, 2, 3, 4, 5].map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setRating(value)}
                  aria-label={`${value} star${value === 1 ? "" : "s"}`}
                  className="p-1"
                >
                  <StarIcon
                    className={`h-8 w-8 ${value <= rating ? "fill-amber-400 text-amber-400" : "text-slate-300"}`}
                  />
                </button>
              ))}
            </div>
            <textarea
              value={comment}
              onChange={(event) => setComment(event.target.value)}
              placeholder="Share your experience"
              maxLength={1000}
              className="mt-5 min-h-32 w-full rounded-2xl border border-slate-300 bg-transparent p-4 text-sm outline-none focus:border-teal-600 dark:border-slate-700"
            />
            <div className="mt-5">
              <label
                htmlFor="review-photo"
                className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-slate-300 px-4 py-2.5 text-sm font-bold text-slate-700 transition hover:border-teal-700 hover:text-teal-700 dark:border-slate-700 dark:text-slate-200"
              >
                <PhotoIcon className="h-5 w-5" />
                {photo ? "Change photo" : "Add a photo"}
              </label>
              <input
                id="review-photo"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="sr-only"
                onChange={(event) => {
                  const selectedPhoto = event.target.files?.[0] ?? null;
                  setPhoto(selectedPhoto);
                  setPendingPhotoUpdate(null);
                  updatePhotoPreview(
                    selectedPhoto ? URL.createObjectURL(selectedPhoto) : null,
                  );
                  event.target.value = "";
                }}
              />
              {photoPreview ? (
                <div className="mt-3 flex items-center gap-3">
                  <img
                    src={photoPreview}
                    alt="Selected review photo preview"
                    className="h-16 w-16 rounded-xl object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setPhoto(null);
                      setPendingPhotoUpdate(null);
                      updatePhotoPreview(null);
                    }}
                    className="text-xs font-bold text-slate-500 hover:text-red-600"
                  >
                    Remove photo
                  </button>
                </div>
              ) : null}
              {existingRating &&
              pendingPhotoUpdate &&
              pendingPhotoUpdate.ratingId === existingRating.id &&
              existingRating.photo_url === pendingPhotoUpdate.previousPhotoUrl ? (
                <p className="mt-2 text-xs text-slate-500" role="status">
                  Your new photo is processing.
                </p>
              ) : null}
            </div>
            <div className="mt-5 flex justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="rounded-full border border-slate-300 px-5 py-2.5 text-sm font-bold hover:border-teal-700 hover:text-teal-700 dark:border-slate-700"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={rating === 0 || isSaving}
                onClick={handleSubmit}
                className="rounded-full bg-slate-950 px-5 py-2.5 text-sm font-bold text-white hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-white dark:text-slate-950"
              >
                {isSaving
                  ? "Saving..."
                  : existingRating
                    ? "Update review"
                    : "Submit review"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
