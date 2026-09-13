"use client";

import Image from "next/image";
import { useMemo, useState } from "react";

import ProductWishlistButton from "../components/ProductWishlistButton";
import { useCart } from "../context/CartContext";

type ProductColor = {
  name: string;
  hex: string;
};

type Product = {
  sale_percent?: number | null;
shipping_text?: string | null;
  id: string;
  name: string;
  slug: string;

  price: number;
  currency: string;

  description: string | null;

  image_1: string | null;
  image_2: string | null;
  image_3: string | null;
  image_4: string | null;
  image_5: string | null;

  images?: string[];

  video_url: string | null;

  sizes: string[];

  colors: ProductColor[];

  stock: number;
};

type ProductVariant = {
  size: string;
  stock: number;
  color: string;
};

type ProductDetailsProps = {
  product: Product;
  variants: ProductVariant[];
};

export default function ProductDetails({
  product,
  variants,
}: ProductDetailsProps) {
  const { addToCart } =
    useCart();

  // ========================================
  // INITIAL COLOR
  // ========================================

  const initialColor =
    product.colors.length > 0
      ? product.colors[0].name
      : "";

  const [
    selectedColor,
    setSelectedColor,
  ] =
    useState(
      initialColor
    );

  const [
    selectedSize,
    setSelectedSize,
  ] =
    useState("");

  const [
    quantity,
    setQuantity,
  ] =
    useState(1);

  // ========================================
  // IMAGES
  // ========================================

  const images =
    useMemo(
      () => {
        if (
          Array.isArray(
            product.images
          ) &&
          product.images.length >
            0
        ) {
          return product.images;
        }

        return [
          product.image_1,
          product.image_2,
          product.image_3,
          product.image_4,
          product.image_5,
        ].filter(
          (
            image
          ): image is string =>
            Boolean(image)
        );
      },
      [
        product.images,
        product.image_1,
        product.image_2,
        product.image_3,
        product.image_4,
        product.image_5,
      ]
    );

  const mainImage =
    images[0] ||
    product.image_1 ||
    "/image/image_1.png";

  // ========================================
  // FORMAT PRICE
  // ========================================

  const formatUSD = (
    value: number
  ) =>
    new Intl.NumberFormat(
      "en-US",
      {
        style: "currency",

        currency:
          product.currency ||
          "USD",
      }
    ).format(
      value
    );
    const salePercent =
  Math.min(
    100,
    Math.max(
      0,
      Number(
        product.sale_percent ?? 0
      )
    )
  );

const hasSale =
  salePercent > 0;

const originalPrice =
  Number(product.price);

const salePrice =
  hasSale
    ? originalPrice *
      (1 - salePercent / 100)
    : originalPrice;

  // ========================================
  // FIND VARIANT
  // ========================================

  function findVariant(
    color: string,
    size: string
  ) {
    return variants.find(
      (variant) =>
        variant.color ===
          color &&
        variant.size ===
          size
    );
  }

  // ========================================
  // SELECTED VARIANT
  // ========================================

  const selectedVariant =
    selectedSize
      ? findVariant(
          selectedColor,
          selectedSize
        )
      : undefined;

  const selectedStock =
    selectedVariant?.stock ??
    0;

  // ========================================
  // TOTAL STOCK FOR SELECTED COLOR
  // ========================================

  const selectedColorStock =
    variants
      .filter(
        (variant) =>
          variant.color ===
          selectedColor
      )
      .reduce(
        (
          total,
          variant
        ) =>
          total +
          Number(
            variant.stock
          ),
        0
      );

  // ========================================
  // TOTAL PRODUCT STOCK
  // ========================================

  const totalStock =
    variants.reduce(
      (
        total,
        variant
      ) =>
        total +
        Number(
          variant.stock
        ),
      0
    );

  // ========================================
  // SELECT COLOR
  // ========================================

  const handleSelectColor = (
    color: string
  ) => {
    setSelectedColor(
      color
    );

    setSelectedSize(
      ""
    );

    setQuantity(
      1
    );
  };

  // ========================================
  // SELECT SIZE
  // ========================================

  const handleSelectSize = (
    size: string
  ) => {
    const variant =
      findVariant(
        selectedColor,
        size
      );

    if (
      !variant ||
      variant.stock <= 0
    ) {
      return;
    }

    setSelectedSize(
      size
    );

    setQuantity(
      1
    );
  };

  // ========================================
  // INCREASE
  // ========================================

  const handleIncrease =
    () => {
      if (
        !selectedSize
      ) {
        return;
      }

      if (
        quantity >=
        selectedStock
      ) {
        return;
      }

      setQuantity(
        (
          current
        ) =>
          current + 1
      );
    };

  // ========================================
  // DECREASE
  // ========================================

  const handleDecrease =
    () => {
      setQuantity(
        (
          current
        ) =>
          Math.max(
            1,
            current - 1
          )
      );
    };

  // ========================================
  // ADD TO BAG
  // ========================================

  const handleAddToBag =
    () => {
      if (
        !selectedColor
      ) {
        return;
      }

      if (
        !selectedSize
      ) {
        return;
      }

      if (
        selectedStock <=
        0
      ) {
        alert(
          "This size is sold out."
        );

        return;
      }

      if (
        quantity >
        selectedStock
      ) {
        alert(
          `Only ${selectedStock} item(s) left in ${selectedColor}, size ${selectedSize}.`
        );

        return;
      }

      addToCart({
        id:
          product.id,

        slug:
          product.slug,

        name:
          product.name,

        price:
  Number(
    salePrice.toFixed(2)
  ),

        image:
          mainImage,

        color:
          selectedColor ||
          "Default",

        size:
          selectedSize,

        quantity,

        stock:
          selectedStock,
      });

      alert(
        `${product.name} — ${selectedColor} — Size ${selectedSize} — Quantity ${quantity} added to bag.`
      );
    };

  // ========================================
  // PAGE
  // ========================================

  return (
    <section className="grid min-w-0 grid-cols-1 gap-8 px-4 py-6 sm:gap-10 sm:px-6 sm:py-8 lg:grid-cols-[1.5fr_0.7fr] lg:gap-12 lg:px-12 lg:py-10">

      {/* ========================================
          LEFT — PRODUCT GALLERY
      ======================================== */}

      <div className="min-w-0">

        <div className="grid grid-cols-2 gap-2 sm:gap-4">

          {images.map(
            (
              image,
              index
            ) => {

              const isLastOddImage =
                images.length %
                  2 !==
                  0 &&
                index ===
                  images.length -
                    1;

              if (
                isLastOddImage
              ) {
                return (
                  <div
                    key={
                      `${image}-${index}`
                    }
                    className="col-span-2 flex justify-center py-6 sm:py-10 lg:py-12"
                  >
                    <div className="relative aspect-[3/4] w-[72%] max-w-[560px] overflow-hidden bg-[#eee9e3] sm:w-[55%] lg:w-[48%]">

                      <Image
                        src={
                          image
                        }
                        alt={`${product.name} ${
                          index +
                          1
                        }`}
                        fill
                        sizes="(max-width: 640px) 72vw, (max-width: 1024px) 55vw, 32vw"
                        className="object-cover"
                      />

                    </div>
                  </div>
                );
              }

              return (
                <div
                  key={
                    `${image}-${index}`
                  }
                  className="relative aspect-[3/4] overflow-hidden bg-[#eee9e3]"
                >

                  <Image
                    src={
                      image
                    }
                    alt={`${product.name} ${
                      index +
                      1
                    }`}
                    fill
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 50vw, 32vw"
                    priority={
                      index ===
                      0
                    }
                    className="object-cover"
                  />

                </div>
              );
            }
          )}

        </div>

        {/* ========================================
            VIDEO
        ======================================== */}

        {product.video_url && (
          <section className="mt-14 sm:mt-20 lg:mt-24">

            <div className="mb-7 px-2 text-center sm:mb-10">

              <p className="text-[8px] tracking-[0.35em] text-gray-400 sm:text-[9px]">
                THE VIREL STORY
              </p>

              <h2 className="mt-3 font-serif text-2xl sm:mt-4 sm:text-3xl md:text-4xl">
                The Design
              </h2>

              <p className="mx-auto mt-3 max-w-md text-xs leading-6 text-gray-500 sm:mt-4 sm:text-sm">
                Discover the
                movement, details
                and silhouette of
                this VIREL piece.
              </p>

            </div>

            <div className="relative w-full overflow-hidden bg-black">

              <video
                src={
                  product.video_url
                }
                poster={
                  mainImage
                }
                controls
                playsInline
                preload="metadata"
                className="block h-auto max-h-[75vh] w-full object-contain sm:max-h-[80vh]"
              />

            </div>

            <p className="mt-4 text-center text-[8px] tracking-[0.3em] text-gray-400 sm:mt-5 sm:text-[9px]">
              VIREL — THE DETAILS
            </p>

          </section>
        )}

      </div>

      {/* ========================================
          RIGHT — PRODUCT INFO
      ======================================== */}

      <div className="min-w-0 lg:sticky lg:top-10 lg:self-start">

        <p className="text-[8px] tracking-[0.3em] text-gray-400 sm:text-[10px]">
          VIREL COLLECTION
        </p>

        <h1 className="mt-3 font-serif text-3xl sm:mt-4 sm:text-4xl">
          {product.name}
        </h1>

        <div className="mt-5">
  {hasSale ? (
    <div className="flex items-center gap-3">
      <span className="text-sm font-medium text-[#a87578]">
        {formatUSD(salePrice)}
      </span>

      <span className="text-xs text-[#9c8f8f] line-through">
        {formatUSD(originalPrice)}
      </span>

      <span className="bg-[#f0dfdb] px-2 py-1 text-[8px] tracking-[0.14em] text-[#a87578]">
        {salePercent}% OFF
      </span>
    </div>
  ) : (
    <p className="text-sm tracking-[0.05em]">
      {formatUSD(originalPrice)}
    </p>
  )}
</div>

        {/* ========================================
            COLOR
        ======================================== */}

        <div className="mt-7 border-t border-black/10 pt-6 sm:mt-10 sm:pt-7">

          <div className="flex items-center justify-between">

            <p className="text-[10px] tracking-[0.18em] sm:text-xs">
              COLOR
            </p>

            {selectedColor && (
              <p className="text-[10px] text-gray-400 sm:text-xs">
                {
                  selectedColor
                }
              </p>
            )}

          </div>

          {product.colors.length >
          0 ? (
            <div className="mt-4 flex flex-wrap gap-3">

              {product.colors.map(
                (
                  color
                ) => {

                  const selected =
                    selectedColor ===
                    color.name;

                  const colorStock =
                    variants
                      .filter(
                        (
                          variant
                        ) =>
                          variant.color ===
                          color.name
                      )
                      .reduce(
                        (
                          total,
                          variant
                        ) =>
                          total +
                          Number(
                            variant.stock
                          ),
                        0
                      );

                  const soldOut =
                    colorStock <=
                    0;

                  return (
                    <button
                      key={
                        color.name
                      }
                      type="button"
                      disabled={
                        soldOut
                      }
                      onClick={() =>
                        handleSelectColor(
                          color.name
                        )
                      }
                      className={`flex min-w-[120px] items-center gap-3 border px-4 py-3 text-left transition ${
                        soldOut
                          ? "cursor-not-allowed border-black/10 opacity-40"
                          : selected
                            ? "border-black"
                            : "border-black/20 hover:border-black"
                      }`}
                    >

                      <span
                        className="h-5 w-5 shrink-0 rounded-full border border-black/15"
                        style={{
                          backgroundColor:
                            color.hex,
                        }}
                      />

                      <span className="min-w-0">

                        <span className="block truncate text-[10px]">
                          {
                            color.name
                          }
                        </span>

                        <span className="mt-1 block text-[8px] text-gray-400">
                          {soldOut
                            ? "SOLD OUT"
                            : `${colorStock} AVAILABLE`}
                        </span>

                      </span>

                    </button>
                  );
                }
              )}

            </div>
          ) : (
            <p className="mt-3 text-sm text-gray-600">
              Default
            </p>
          )}

        </div>

        {/* ========================================
            SIZE
        ======================================== */}

        <div className="mt-7 sm:mt-8">

          <div className="flex items-center justify-between gap-3">

            <p className="text-[10px] tracking-[0.18em] sm:text-xs">
              SIZE
            </p>

            {selectedSize && (
              <p className="text-[10px] text-gray-400 sm:text-xs">
                Selected:{" "}
                {
                  selectedSize
                }
              </p>
            )}

          </div>

          <div className="mt-3 grid grid-cols-5 gap-1.5 sm:mt-4 sm:gap-2">

            {product.sizes.map(
              (
                size
              ) => {

                const variant =
                  findVariant(
                    selectedColor,
                    size
                  );

                const stock =
                  variant?.stock ??
                  0;

                const soldOut =
                  stock <=
                  0;

                const selected =
                  selectedSize ===
                  size;

                return (
                  <button
                    key={
                      size
                    }
                    type="button"
                    disabled={
                      soldOut
                    }
                    onClick={() =>
                      handleSelectSize(
                        size
                      )
                    }
                    className={`relative min-h-[58px] border px-1 py-2 transition sm:min-h-[64px] sm:px-2 ${
                      soldOut
                        ? "cursor-not-allowed border-black/10 bg-gray-100 text-gray-300"
                        : selected
                          ? "border-black bg-black text-white"
                          : "border-black/20 hover:border-black"
                    }`}
                  >

                    <span className="block text-[10px] sm:text-xs">
                      {
                        size
                      }
                    </span>

                    <span
                      className={`mt-1 block text-[7px] sm:text-[9px] ${
                        selected
                          ? "text-white/70"
                          : soldOut
                            ? "text-gray-300"
                            : "text-gray-400"
                      }`}
                    >
                      {soldOut
                        ? "SOLD OUT"
                        : `${stock} LEFT`}
                    </span>

                  </button>
                );
              }
            )}

          </div>

          {selectedSize && (
            <div className="mt-3 flex items-center justify-between gap-3 sm:mt-4">

              <p className="text-[10px] text-gray-500 sm:text-xs">
                {
                  selectedColor
                }{" "}
                · Size{" "}
                {
                  selectedSize
                }
              </p>

              <p className="text-[10px] text-gray-500 sm:text-xs">
                {
                  selectedStock
                }{" "}
                {selectedStock ===
                1
                  ? "piece"
                  : "pieces"}{" "}
                remaining
              </p>

            </div>
          )}

        </div>

        {/* ========================================
            QUANTITY
        ======================================== */}

        <div className="mt-7 sm:mt-8">

          <p className="text-[10px] tracking-[0.18em] sm:text-xs">
            QUANTITY
          </p>

          <div className="mt-3 flex flex-wrap items-center gap-3 sm:mt-4 sm:gap-5">

            <div className="flex w-fit items-center border border-black/20">

              <button
                type="button"
                onClick={
                  handleDecrease
                }
                disabled={
                  quantity <=
                  1
                }
                className="h-11 w-10 text-lg disabled:cursor-not-allowed disabled:text-gray-300 sm:h-12 sm:w-12"
              >
                −
              </button>

              <span className="flex h-11 w-10 items-center justify-center text-sm sm:h-12 sm:w-12">
                {
                  quantity
                }
              </span>

              <button
                type="button"
                onClick={
                  handleIncrease
                }
                disabled={
                  !selectedSize ||
                  quantity >=
                    selectedStock
                }
                className="h-11 w-10 text-lg disabled:cursor-not-allowed disabled:text-gray-300 sm:h-12 sm:w-12"
              >
                +
              </button>

            </div>

          </div>

        </div>

        {/* ========================================
            ADD TO BAG
        ======================================== */}

        <button
          type="button"
          disabled={
            !selectedColor ||
            !selectedSize ||
            selectedStock <=
              0
          }
          onClick={
            handleAddToBag
          }
          className={`mt-7 w-full py-4 text-[10px] tracking-[0.22em] transition sm:mt-9 sm:py-5 sm:text-xs ${
            selectedColor &&
            selectedSize &&
            selectedStock >
              0
              ? "bg-black text-white hover:bg-black/80"
              : "cursor-not-allowed bg-gray-300 text-gray-500"
          }`}
        >
          {!selectedColor
            ? "SELECT A COLOR"
            : !selectedSize
              ? "SELECT A SIZE"
              : selectedStock <=
                  0
                ? "SOLD OUT"
                : "ADD TO BAG"}
        </button>

        {/* ========================================
            WISHLIST
        ======================================== */}

        <div className="mt-2 sm:mt-3">

          <ProductWishlistButton
            productId={
              product.id
            }
          />

        </div>

        {/* ========================================
            DESCRIPTION
        ======================================== */}

        <div className="mt-8 border-t border-black/10 pt-6 sm:mt-10 sm:pt-7">

          <p className="text-[10px] tracking-[0.18em] sm:text-xs">
            DETAILS
          </p>

          <p className="mt-3 text-xs leading-6 text-gray-600 sm:mt-4 sm:text-sm sm:leading-7">
            {product.description ||
              "A timeless VIREL piece designed with refined proportions and an elegant silhouette."}
          </p>

        </div>
{/* ========================================
    SHIPPING
======================================== */}

<div className="mt-6 border-t border-black/10 pt-6 sm:mt-7 sm:pt-7">

  <p className="text-[10px] tracking-[0.18em] sm:text-xs">
    SHIPPING
  </p>

  <p className="mt-3 whitespace-pre-line text-xs leading-6 text-gray-600 sm:mt-4 sm:text-sm sm:leading-7">
    {product.shipping_text ||
      "Complimentary shipping on orders over $150."}
  </p>

</div>
        {/* ========================================
            AVAILABILITY
        ======================================== */}

        <div className="mt-6 border-t border-black/10 pt-6 sm:mt-7 sm:pt-7">

          <p className="text-[10px] tracking-[0.18em] sm:text-xs">
            AVAILABILITY
          </p>

          <p className="mt-3 text-xs text-gray-600 sm:mt-4 sm:text-sm">

            {selectedColor
              ? selectedColorStock >
                0
                ? `${selectedColorStock} pieces available in ${selectedColor}`
                : `${selectedColor} is out of stock`
              : totalStock > 0
                ? `${totalStock} pieces available`
                : "Out of stock"}

          </p>

        </div>

      </div>

    </section>
  );
}