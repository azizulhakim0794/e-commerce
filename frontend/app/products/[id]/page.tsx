"use client";
import Link from "next/link";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import {
  ArrowLeftIcon,
  BellAlertIcon,
  CheckIcon,
  MinusIcon,
  PlusIcon,
  StarIcon,
} from "@heroicons/react/24/outline";
// import { getProduct } from "../../../lib/products";
import { product_service } from "@/helper/services/product.service";
import { ratingService } from "@/helper/services/rating.service";
import { useApi } from "@/hooks/useApi";
import { Product, CartItem, Rating } from "@/types";
import { useStore } from "@/store/StoreProvider";
import OrderCheckoutModal from "@/components/OrderCheckoutModal";
import RatingModal from "@/components/RatingModal";
import Alert from "@/components/Alart";

export default function ProductDetails() {
  const params = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
  const [checkoutItems, setCheckoutItems] = useState<CartItem[]>([]);
  const [ratings, setRatings] = useState<Rating[]>([]);
  const [isRatingModalOpen, setIsRatingModalOpen] = useState(false);
  const [alert, setAlert] = useState<{
    type: "success" | "error" | "warning" | "info";
    message: string;
  } | null>(null);
  const alertTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { handleRequest } = useApi();
  const { user } = useStore();
  const router = useRouter();

  useEffect(() => {
    const loadProduct = async () => {
      const result = await handleRequest(
        product_service.get_product,
        params.id,
      );

      if (result.success && result.data) {
        setProduct(result.data);
      }
    };

    const loadRatings = async () => {
      const result = await handleRequest(
        ratingService.getByProductId,
        params.id,
      );

      if (result.success && Array.isArray(result.data)) {
        setRatings(result.data);
      }
    };

    if (params.id) {
      loadProduct();
      loadRatings();
    }
  }, [params.id]);

  const handleProductIntoCart = async (quantity: number, product: Product) => {
    const loadProduct = async () => {
      const result = await handleRequest(
        product_service.save_product_into_cart,
        { quantity: quantity, product_id: product.id },
      );

      if (result.success && result.data) {
        router.push("/cart");
      }
    };

    if (params.id && user?.id) {
      loadProduct();
    } else if (!user?.id) {
      showAlert("After login you can add this product to cart.", "warning");
    }
  };

  const handleBuyNow = () => {
    if (!product) return;

    setCheckoutItems([
      {
        id: crypto.randomUUID(),
        product,
        quantity,
      },
    ]);
    setIsCheckoutModalOpen(true);
  };

  const showAlert = (
    message: string,
    type: "success" | "error" | "warning" | "info" = "warning",
  ) => {
    if (alertTimeoutRef.current) {
      clearTimeout(alertTimeoutRef.current);
    }

    setAlert({ type, message });

    alertTimeoutRef.current = setTimeout(() => {
      setAlert(null);
    }, 3000);
  };

  const handleAddToCart = () => {
    showAlert("We will alert you when this product is back in stock.", "info");
  };

  if (!product)
    return (
      <div className="mx-auto max-w-7xl px-5 py-32 text-center">
        <h1 className="text-3xl font-black">Product not found.</h1>
        <Link
          href="/products"
          className="mt-5 inline-block font-bold text-teal-700"
        >
          Back to products
        </Link>
      </div>
    );
  const ownRating = ratings.find(
    (rating) => rating.user_name === user?.username,
  );
  return (
    <div className="mx-auto max-w-7xl px-5 py-10 lg:px-8 lg:py-16">
      {alert && (
        <div className="fixed top-4 right-4 z-50 w-full max-w-sm px-4">
          <Alert type={alert.type} message={alert.message} />
        </div>
      )}

      <Link
        href="/products"
        className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-teal-700"
      >
        <ArrowLeftIcon className="h-4 w-4" /> Back to shop
      </Link>
      <div className="mt-8 grid gap-10 lg:grid-cols-2 lg:gap-20">
        <div>
          <div className="relative aspect-square overflow-hidden rounded-3xl bg-slate-100 dark:bg-slate-800">
            {product.image ? (
              <Image
                src={product.image}
                alt={product.name}
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-slate-200 text-sm font-bold uppercase tracking-[0.2em] text-slate-500 dark:bg-slate-700 dark:text-slate-300">
                No image
              </div>
            )}
          </div>
          <div className="mt-6">
            {user && !ownRating ? (
              <button
                type="button"
                onClick={() => setIsRatingModalOpen(true)}
                className="inline-flex items-center gap-2 rounded-full bg-teal-700 px-5 py-3 text-sm font-bold text-white transition hover:bg-teal-800"
              >
                <StarIcon className="h-4 w-4" /> Rate and review
              </button>
            ) : user && ownRating ? (
              <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2.5 dark:border-emerald-900 dark:bg-emerald-950/30">
                <span className="text-sm font-bold text-emerald-900 dark:text-emerald-200">
                  Reviewed
                </span>
                <div className="flex items-center gap-0.5">
                  {[1, 2, 3, 4, 5].map((value) => (
                    <StarIcon
                      key={value}
                      className={`h-4 w-4 ${value <= ownRating.rating ? "fill-amber-400 text-amber-400" : "text-slate-300"}`}
                    />
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        </div>
        <div className="flex flex-col justify-center">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-teal-700 dark:text-teal-400">
            {product.category}
          </p>
          <h1 className="mt-3 text-4xl font-black tracking-tight text-slate-950 sm:text-5xl dark:text-white">
            {product.name}
          </h1>
          <div className="mt-5 flex items-center gap-3">
            <span className="flex items-center gap-1 text-sm font-bold">
              <StarIcon className="h-5 w-5 fill-amber-400 text-amber-400" />{" "}
              {product.rating}
            </span>
            <span className="text-sm text-slate-500">
              {product.reviews} reviews
            </span>
            <span
              className={`text-sm font-bold ${product.stock > 0 ? "text-teal-700" : "text-[oklch(57.7%_0.245_27.325)]"} `}
            >
              {product.stock > 0 ? "In stock" : "Out of stock"}
            </span>
          </div>
          <p className="mt-7 text-lg leading-8 text-slate-600 dark:text-slate-300">
            {product.description}
          </p>
          <div className="mt-8 flex items-baseline gap-3">
            <span className="text-3xl font-black">${product.price}</span>
            {product.originalPrice && (
              <span className="text-lg text-slate-400 line-through">
                ${product.originalPrice}
              </span>
            )}
          </div>
          <div className="mt-8 flex flex-wrap gap-3">
            <div className="flex items-center rounded-full border border-slate-300 dark:border-slate-700">
              <button
                className="p-3"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                aria-label="Decrease quantity"
              >
                <MinusIcon className="h-4 w-4" />
              </button>
              <span className="w-8 text-center text-sm font-bold">
                {product.stock == 0 ? product.stock : quantity}
              </span>
              <button
                className="p-3"
                onClick={() =>
                  setQuantity(Math.min(product.stock, quantity + 1))
                }
                aria-label="Increase quantity"
              >
                <PlusIcon className="h-4 w-4" />
              </button>
            </div>

            {product.stock > 0 ? (
              <>
                <button
                  onClick={() => handleProductIntoCart(quantity, product)}
                  className="flex flex-1 items-center justify-center gap-2 rounded-full bg-slate-950 px-6 py-3 text-sm font-bold text-white hover:bg-teal-700 dark:bg-white dark:text-slate-950"
                >
                  <CheckIcon className="h-5 w-5" /> Add to cart
                </button>

                <button
                  type="button"
                  onClick={handleBuyNow}
                  className="w-full rounded-full border border-slate-300 px-6 py-3 text-center text-sm font-bold hover:border-teal-700 hover:text-teal-700 dark:border-slate-700"
                >
                  Buy now
                </button>
              </>
            ) : (
              <button
                onClick={() => handleAddToCart()}
                className="flex flex-1 items-center justify-center gap-2 rounded-full bg-slate-950 px-6 py-3 text-sm font-bold text-white hover:bg-teal-700 dark:bg-white dark:text-slate-950"
              >
                <BellAlertIcon className="h-5 w-5" /> Set alart when it in stock
              </button>
            )}
          </div>
          <div className="mt-10 border-t border-slate-200 pt-7 dark:border-slate-800">
            <h2 className="text-sm font-bold uppercase tracking-widest">
              Details
            </h2>
            <ul className="mt-4 grid gap-3 text-sm text-slate-600 sm:grid-cols-2 dark:text-slate-300">
              {(product.specs ?? []).map((spec: string) => (
                <li key={spec} className="flex items-center gap-2">
                  <CheckIcon className="h-4 w-4 text-teal-600" />
                  {spec}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
      <OrderCheckoutModal
        isOpen={isCheckoutModalOpen}
        items={checkoutItems}
        orderMode="buy-now"
        onClose={() => setIsCheckoutModalOpen(false)}
      />
      <RatingModal
        product={isRatingModalOpen ? product : null}
        onClose={() => setIsRatingModalOpen(false)}
        onSaved={(savedRating) => {
          const nextRatings = ratings.some(
            (rating) => rating.id === savedRating.id,
          )
            ? ratings.map((rating) =>
                rating.id === savedRating.id ? savedRating : rating,
              )
            : [savedRating, ...ratings];
          setRatings(nextRatings);
          setProduct((current) =>
            current
              ? {
                  ...current,
                  rating:
                    nextRatings.reduce(
                      (sum, rating) => sum + rating.rating,
                      0,
                    ) / nextRatings.length,
                  reviews: nextRatings.length,
                }
              : current,
          );
        }}
      />

      <section className="mt-20 border-t border-slate-200 pt-10 dark:border-slate-800">
        <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-teal-700 dark:text-teal-400">
              Customer reviews
            </p>
            <h2 className="mt-2 text-3xl font-black">What people think</h2>
          </div>
          <div className="space-y-4">
            {ratings.length === 0 ? (
              <p className="text-sm text-slate-500">No reviews yet.</p>
            ) : (
              ratings.map((rating) => (
                <article
                  key={rating.id}
                  className="border-b border-slate-200 pb-5 dark:border-slate-800"
                >
                  <div className="flex items-center justify-between gap-4">
                    <p className="font-bold">{rating.user_name}</p>
                    <div
                      className="flex"
                      aria-label={`${rating.rating} out of 5 stars`}
                    >
                      {[1, 2, 3, 4, 5].map((value) => (
                        <StarIcon
                          key={value}
                          className={`h-4 w-4 ${value <= rating.rating ? "fill-amber-400 text-amber-400" : "text-slate-300"}`}
                        />
                      ))}
                    </div>
                  </div>
                  {rating.comment && (
                    <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
                      {rating.comment}
                    </p>
                  )}
                  {rating.photo_url && (
                    <img
                      src={rating.photo_url}
                      alt={`Photo shared by ${rating.user_name}`}
                      className="mt-4 h-28 w-28 rounded-xl object-cover"
                    />
                  )}
                </article>
              ))
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
