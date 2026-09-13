"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

import ProductWishlistButton from "../components/ProductWishlistButton";
import { useCart } from "../context/CartContext";

type ProductColor = {
  name: string;
  hex: string;
};

type Product = {
  id: string;
  name: string;
  slug: string;
  price: number;
  currency: string;

  description: string | null;

  colors: ProductColor[];

  image_1: string | null;
  image_2: string | null;
  image_3: string | null;
  image_4: string | null;
  image_5: string | null;

  images: string[];

  video_url: string | null;

  sizes: string[];

  stock: number;
};

type ProductVariant = {
  size: string;
  stock: number;
  color?: string | null;
};

type ProductDetailsProps = {
  product: Product;
  variants: ProductVariant[];
};


// =====================================================
// FORMAT DESCRIPTION
// =====================================================

function formatDescription(
  description: string
) {
  const normalized =
    description
      .replace(/\r\n/g, "\n")
      .replace(/\r/g, "\n")
      .trim();

  if (!normalized) {
    return [];
  }

  return normalized
    .split(/\n\s*\n/)
    .map((block) =>
      block.trim()
    )
    .filter(Boolean)
    .map((block) => {

      const lines =
        block
          .split("\n")
          .map((line) =>
            line.trim()
          )
          .filter(Boolean);

      if (!lines.length) {
        return {
          type: "paragraph" as const,
          text: "",
        };
      }

      const firstLine =
        lines[0];

      const headingPattern =
        /^(?:.*?)(?:✦|◆|★|♦)\s*(.+)$/;

      const headingMatch =
        firstLine.match(
          headingPattern
        );

      const isAllCapsHeading =
        firstLine.length > 3 &&
        firstLine ===
          firstLine.toUpperCase() &&
        /[A-Z]/.test(
          firstLine
        ) &&
        firstLine.length < 90;

      if (
        headingMatch ||
        isAllCapsHeading
      ) {
        return {
          type: "heading" as const,

          text: firstLine,

          content:
            lines
              .slice(1)
              .join("\n"),
        };
      }

      return {
        type: "paragraph" as const,

        text:
          lines.join("\n"),
      };
    });
}


// =====================================================
// PRODUCT DETAILS
// =====================================================

export default function ProductDetails({
  product,
  variants,
}: ProductDetailsProps) {

  const { addToCart } =
    useCart();


  // ===================================================
  // COLORS
  // ===================================================

  const colors =
    Array.isArray(
      product.colors
    )
      ? product.colors.filter(
          (color) =>
            color &&
            typeof color.name ===
              "string" &&
            color.name.trim()
              .length > 0
        )
      : [];


  // ===================================================
  // DOES PRODUCT HAVE COLORS?
  // ===================================================

  const hasColors =
    colors.length > 0;


  // ===================================================
  // SELECTED COLOR
  //
  // If product has colors:
  // automatically select first color.
  //
  // If product has no colors:
  // keep empty string.
  // ===================================================

  const [
    selectedColor,
    setSelectedColor,
  ] = useState(
    hasColors
      ? colors[0].name
      : ""
  );


  // ===================================================
  // SELECTED SIZE
  // ===================================================

  const [
    selectedSize,
    setSelectedSize,
  ] = useState("");


  // ===================================================
  // QUANTITY
  // ===================================================

  const [
    quantity,
    setQuantity,
  ] = useState(1);


  // ===================================================
  // IMAGES
  // ===================================================

  const images =
    product.images &&
    product.images.length > 0
      ? product.images
      : [
          product.image_1,
          product.image_2,
          product.image_3,
          product.image_4,
          product.image_5,
        ].filter(
          (image): image is string =>
            Boolean(image)
        );


  // ===================================================
  // MAIN IMAGE
  // ===================================================

  const mainImage =
    images[0] ||
    "/image/image_1.png";


  // ===================================================
  // PRICE
  // ===================================================

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
    ).format(value);


  // ===================================================
  // GET STOCK FOR COLOR + SIZE
  // ===================================================

  const getStock = (
    color: string,
    size: string
  ) => {

    const variant =
      variants.find(
        (item) => {

          const variantColor =
            item.color ??
            "";

          return (
            item.size ===
              size &&
            variantColor ===
              color
          );
        }
      );

    return Math.max(
      0,
      Number(
        variant?.stock ?? 0
      )
    );
  };


  // ===================================================
  // GET CURRENT SIZE STOCK
  // ===================================================

  const getSizeStock = (
    size: string
  ) => {

    if (hasColors) {
      return getStock(
        selectedColor,
        size
      );
    }

    // -----------------------------------------------
    // OLD PRODUCT WITHOUT COLOR
    // -----------------------------------------------

    return getStock(
      "",
      size
    );
  };


  // ===================================================
  // SELECTED SIZE STOCK
  // ===================================================

  const selectedStock =
    selectedSize
      ? getSizeStock(
          selectedSize
        )
      : 0;


  // ===================================================
  // TOTAL STOCK
  // ===================================================

  const totalStock =
    hasColors
      ? variants.reduce(
          (
            total,
            variant
          ) => {

            const variantColor =
              variant.color ??
              "";

            if (
              variantColor !==
              selectedColor
            ) {
              return total;
            }

            return (
              total +
              Math.max(
                0,
                Number(
                  variant.stock ??
                    0
                )
              )
            );
          },
          0
        )
      : variants.reduce(
          (
            total,
            variant
          ) => {

            const variantColor =
              variant.color ??
              "";

            if (
              variantColor !==
              ""
            ) {
              return total;
            }

            return (
              total +
              Math.max(
                0,
                Number(
                  variant.stock ??
                    0
                )
              )
            );
          },
          0
        );


  // ===================================================
  // SELECT COLOR
  // ===================================================

  const handleSelectColor = (
    color: string
  ) => {

    if (
      color ===
      selectedColor
    ) {
      return;
    }

    setSelectedColor(
      color
    );

    // -----------------------------------------------
    // VERY IMPORTANT:
    // Reset size because stock can change
    // when color changes.
    // -----------------------------------------------

    setSelectedSize("");

    setQuantity(1);
  };


  // ===================================================
  // SELECT SIZE
  // ===================================================

  const handleSelectSize = (
    size: string
  ) => {

    const stock =
      getSizeStock(size);


    if (stock <= 0) {
      return;
    }


    setSelectedSize(
      size
    );

    setQuantity(1);
  };


  // ===================================================
  // INCREASE QUANTITY
  // ===================================================

  const handleIncrease = () => {

    if (!selectedSize) {
      return;
    }

    if (
      quantity >=
      selectedStock
    ) {
      return;
    }

    setQuantity(
      (current) =>
        current + 1
    );
  };


  // ===================================================
  // DECREASE QUANTITY
  // ===================================================

  const handleDecrease = () => {

    setQuantity(
      (current) =>
        Math.max(
          1,
          current - 1
        )
    );
  };


  // ===================================================
  // ADD TO BAG
  // ===================================================

  const handleAddToBag = () => {

    // -----------------------------------------------
    // COLOR CHECK
    //
    // Only required if product has colors.
    // -----------------------------------------------

    if (
      hasColors &&
      !selectedColor
    ) {

      alert(
        "Please select a color."
      );

      return;
    }


    // -----------------------------------------------
    // SIZE CHECK
    // -----------------------------------------------

    if (!selectedSize) {

      alert(
        "Please select a size."
      );

      return;
    }


    // -----------------------------------------------
    // STOCK CHECK
    // -----------------------------------------------

    if (
      selectedStock <= 0
    ) {

      alert(
        "This size is sold out."
      );

      return;
    }


    // -----------------------------------------------
    // QUANTITY CHECK
    // -----------------------------------------------

    if (
      quantity >
      selectedStock
    ) {

      alert(
        `Only ${selectedStock} item(s) left in size ${selectedSize}.`
      );

      return;
    }


    // -----------------------------------------------
    // COLOR FOR CART
    //
    // No-color products use Ivory
    // so old products still work with
    // the CartContext structure.
    // -----------------------------------------------

    const cartColor =
      hasColors
        ? selectedColor
        : "Ivory";


    // -----------------------------------------------
    // ADD TO CART
    // -----------------------------------------------

    addToCart({

      id:
        product.id,

      name:
        product.name,

      slug:
        product.slug,

      price:
        Number(
          product.price
        ),

      image:
        mainImage,

      color:
        cartColor,

      size:
        selectedSize,

      quantity,

      stock:
        selectedStock,
    });


    // -----------------------------------------------
    // SUCCESS
    // -----------------------------------------------

    alert(
      `${product.name} — ${cartColor} — Size ${selectedSize} — Quantity ${quantity} added to bag.`
    );
  };


  // ===================================================
  // RENDER
  // ===================================================

  return (

    <section className="min-h-screen bg-[#fcfaf7]">


      {/* =================================================
          BREADCRUMB
      ================================================= */}

      <div className="border-b border-[#201b1b]/10 px-5 py-4 sm:px-8 lg:px-12">

        <div className="mx-auto max-w-[1700px] text-[8px] tracking-[0.16em] text-[#9a8888]">

          <Link
            href="/"
            className="hover:text-[#a87578]"
          >
            HOME
          </Link>

          <span className="mx-2">
            /
          </span>

          <Link
            href="/shop"
            className="hover:text-[#a87578]"
          >
            SHOP
          </Link>

          <span className="mx-2">
            /
          </span>

          <span className="text-[#201b1b]">
            {product.name}
          </span>

        </div>

      </div>


      {/* =================================================
          MAIN PRODUCT
      ================================================= */}

      <div className="mx-auto grid max-w-[1800px] grid-cols-1 lg:grid-cols-[1.45fr_0.75fr]">


        {/* =================================================
            LEFT — GALLERY
        ================================================= */}

        <div className="min-w-0 px-3 py-3 sm:px-6 sm:py-6 lg:px-8">

          <div className="grid grid-cols-2 gap-2 sm:gap-4">

            {images.map(
              (image, index) => {

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
                      key={`${image}-${index}`}
                      className="col-span-2 flex justify-center py-4 sm:py-8"
                    >

                      <div className="relative aspect-square w-[72%] overflow-hidden bg-[#f1e6e2] sm:w-[58%] lg:w-[48%]">

                        <Image
                          src={image}
                          alt={`${product.name} ${
                            index + 1
                          }`}
                          fill
                          sizes="50vw"
                          className="object-cover transition duration-700 hover:scale-[1.02]"
                        />

                      </div>

                    </div>
                  );
                }


                return (

                  <div
                    key={`${image}-${index}`}
                    className="relative aspect-square overflow-hidden bg-[#f1e6e2]"
                  >

                    <Image
                      src={image}
                      alt={`${product.name} ${
                        index + 1
                      }`}
                      fill
                      priority={
                        index === 0
                      }
                      sizes="50vw"
                      className="object-cover transition duration-700 hover:scale-[1.02]"
                    />

                  </div>
                );
              }
            )}

          </div>


          {/* =================================================
              VIDEO
          ================================================= */}

          {product.video_url && (

            <section className="mt-16 sm:mt-24">

              <div className="mb-8 text-center">

                <p className="text-[8px] tracking-[0.38em] text-[#a87578]">
                  THE VIREL EDIT
                </p>

                <h2 className="mt-3 font-serif text-3xl sm:text-4xl">
                  The Details
                </h2>

                <p className="mx-auto mt-4 max-w-md text-xs leading-6 text-[#817373]">
                  Discover the silhouette,
                  movement and details
                  behind this VIREL design.
                </p>

              </div>


              <div className="overflow-hidden bg-black">

                <video
                  src={
                    product.video_url
                  }
                  poster={
                    mainImage ||
                    undefined
                  }
                  controls
                  playsInline
                  preload="metadata"
                  className="block h-auto max-h-[80vh] w-full object-contain"
                />

              </div>


              <p className="mt-4 text-center text-[8px] tracking-[0.3em] text-[#a28d8d]">
                VIREL — THE DETAILS
              </p>

            </section>
          )}

        </div>


        {/* =================================================
            RIGHT — PRODUCT INFORMATION
        ================================================= */}

        <aside className="border-t border-[#201b1b]/10 px-6 py-10 sm:px-10 sm:py-14 lg:sticky lg:top-0 lg:h-fit lg:border-l lg:border-t-0 lg:px-12 lg:py-16">


          {/* COLLECTION */}

          <p className="text-[8px] tracking-[0.35em] text-[#a87578]">
            VIREL BRIDAL SHOES
          </p>


          {/* PRODUCT NAME */}

          <h1 className="mt-4 font-serif text-4xl leading-tight sm:text-5xl">
            {product.name}
          </h1>


          {/* PRICE */}

          <p className="mt-5 text-sm tracking-[0.05em]">
            {formatUSD(
              Number(
                product.price
              )
            )}
          </p>


          {/* DIVIDER */}

          <div className="my-8 h-px bg-[#201b1b]/10" />


          {/* =================================================
              COLOR
          ================================================= */}

          {hasColors && (

            <div>

              <div className="flex items-center justify-between">

                <p className="text-[9px] tracking-[0.22em]">
                  COLOR
                </p>

                {selectedColor && (

                  <span className="text-[9px] text-[#9c8585]">
                    {selectedColor}
                  </span>

                )}

              </div>


              <div className="mt-4 flex flex-wrap gap-3">

                {colors.map(
                  (color) => {

                    const selected =
                      selectedColor ===
                      color.name;


                    return (

                      <button
                        key={
                          color.name
                        }
                        type="button"
                        onClick={() =>
                          handleSelectColor(
                            color.name
                          )
                        }
                        aria-label={`Select ${color.name}`}
                        aria-pressed={
                          selected
                        }
                        className={`
                          group
                          flex
                          items-center
                          gap-3
                          border
                          px-4
                          py-3
                          transition
                          ${
                            selected
                              ? "border-[#201b1b] bg-[#fffdfb]"
                              : "border-[#201b1b]/15 bg-transparent hover:border-[#201b1b]/50"
                          }
                        `}
                      >

                        <span
                          className={`
                            h-5
                            w-5
                            rounded-full
                            border
                            border-[#b8aaa5]
                            transition
                            ${
                              selected
                                ? "scale-110"
                                : "group-hover:scale-105"
                            }
                          `}
                          style={{
                            backgroundColor:
                              color.hex,
                          }}
                        />

                        <span className="text-[10px] tracking-[0.05em] text-[#766868]">
                          {color.name}
                        </span>

                      </button>
                    );
                  }
                )}

              </div>

            </div>
          )}


          {/* =================================================
              SIZE
          ================================================= */}

          <div
            className={
              hasColors
                ? "mt-9"
                : "mt-2"
            }
          >

            <div className="flex items-center justify-between">

              <p className="text-[9px] tracking-[0.22em]">
                SELECT SIZE
              </p>

              {selectedSize && (

                <span className="text-[9px] text-[#9c8585]">
                  SIZE{" "}
                  {selectedSize}
                </span>

              )}

            </div>


            <div className="mt-4 grid grid-cols-4 gap-2 sm:grid-cols-5">

              {product.sizes.map(
                (size) => {

                  const stock =
                    getSizeStock(
                      size
                    );


                  const soldOut =
                    stock <= 0;


                  const selected =
                    selectedSize ===
                    size;


                  return (

                    <button
                      key={size}
                      type="button"
                      disabled={
                        soldOut
                      }
                      onClick={() =>
                        handleSelectSize(
                          size
                        )
                      }
                      className={`
                        min-h-[60px]
                        border
                        text-center
                        transition
                        ${
                          soldOut
                            ? "cursor-not-allowed border-black/10 bg-[#eeeae7] text-[#c5bdbc]"
                            : selected
                              ? "border-[#201b1b] bg-[#201b1b] text-white"
                              : "border-[#201b1b]/20 bg-[#fffdfb] hover:border-[#201b1b]"
                        }
                      `}
                    >

                      <span className="block text-[10px]">
                        {size}
                      </span>


                      <span
                        className={`
                          mt-1
                          block
                          text-[7px]
                          ${
                            selected
                              ? "text-white/60"
                              : soldOut
                                ? "text-[#c5bdbc]"
                                : "text-[#9b8888]"
                          }
                        `}
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

              <p className="mt-3 text-[9px] text-[#887777]">

                {selectedStock}{" "}

                {selectedStock ===
                1
                  ? "piece"
                  : "pieces"}{" "}

                available in size{" "}

                {selectedSize}.

              </p>

            )}

          </div>


          {/* =================================================
              QUANTITY
          ================================================= */}

          <div className="mt-9">

            <p className="text-[9px] tracking-[0.22em]">
              QUANTITY
            </p>


            <div className="mt-4 flex w-fit items-center border border-[#201b1b]/20">

              <button
                type="button"
                onClick={
                  handleDecrease
                }
                disabled={
                  quantity <= 1
                }
                className="h-12 w-12 text-lg disabled:text-[#c8c0be]"
              >
                −
              </button>


              <span className="flex h-12 w-12 items-center justify-center text-xs">
                {quantity}
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
                className="h-12 w-12 text-lg disabled:text-[#c8c0be]"
              >
                +
              </button>

            </div>

          </div>


          {/* =================================================
              ADD TO BAG
          ================================================= */}

          <button
            type="button"
            disabled={
              (hasColors &&
                !selectedColor) ||
              !selectedSize ||
              selectedStock <= 0
            }
            onClick={
              handleAddToBag
            }
            className={`
              mt-9
              w-full
              py-5
              text-[9px]
              tracking-[0.3em]
              transition
              ${
                (!hasColors ||
                  selectedColor) &&
                selectedSize &&
                selectedStock > 0
                  ? "bg-[#201b1b] text-white hover:bg-[#a87578]"
                  : "cursor-not-allowed bg-[#ddd5d2] text-[#9d9290]"
              }
            `}
          >

            {hasColors &&
            !selectedColor
              ? "SELECT A COLOR"
              : !selectedSize
                ? "SELECT A SIZE"
                : selectedStock <=
                    0
                  ? "SOLD OUT"
                  : "ADD TO BAG"}

          </button>


          {/* =================================================
              WISHLIST
          ================================================= */}

          <div className="mt-3">

            <ProductWishlistButton
              productId={
                product.id
              }
            />

          </div>


          {/* =================================================
              DESCRIPTION
          ================================================= */}

          <div className="mt-10 border-t border-[#201b1b]/10 pt-7">

            <p className="text-[9px] tracking-[0.25em] text-[#201b1b]">
              DETAILS
            </p>


            <div className="mt-7">

              {product.description ? (

                <div className="space-y-5">

                  {formatDescription(
                    product.description
                  ).map(
                    (
                      section,
                      index
                    ) => {

                      if (
                        section.type ===
                        "heading"
                      ) {

                        return (

                          <div
                            key={index}
                            className="pt-1"
                          >

                            <h3
                              className="
                                font-serif
                                text-[14px]
sm:text-[15px]
leading-[1.65]
                                tracking-[0.02em]
                                text-[#201b1b]
                              "
                            >
                              {section.text}
                            </h3>


                            {section.content && (

                              <p
                                className="
                                  mt-3
                                  whitespace-pre-line
                                  break-words
                                  text-[14px]
sm:text-[15px]
leading-[1.65]
                                  tracking-[0.01em]
                                  text-[#756969]
                                "
                              >
                                {section.content}
                              </p>

                            )}

                          </div>
                        );
                      }


                      return (

                        <p
                          key={index}
                          className="
                            whitespace-pre-line
                            break-words
                           text-[14px]
sm:text-[15px]
leading-[1.65]
                            tracking-[0.01em]
                            text-[#756969]
                          "
                        >
                          {section.text}
                        </p>

                      );
                    }
                  )}

                </div>

              ) : (

                <p
                  className="
                   text-[14px]
sm:text-[15px]
leading-[1.65]
                    text-[#756969]
                  "
                >
                  A refined VIREL
                  design created
                  for elegant
                  occasions, bridal
                  moments and
                  unforgettable
                  celebrations.
                </p>

              )}

            </div>

          </div>


          {/* =================================================
              SHIPPING
          ================================================= */}

          <div className="mt-7 border-t border-[#201b1b]/10 pt-7">

            <p className="text-[9px] tracking-[0.22em]">
              SHIPPING
            </p>

            <p className="mt-4 text-xs leading-6 text-[#756969]">
              Complimentary shipping
              on orders over $150.
            </p>

          </div>


          {/* =================================================
              AVAILABILITY
          ================================================= */}

          <div className="mt-7 border-t border-[#201b1b]/10 pt-7">

            <div className="flex items-center justify-between">

              <p className="text-[9px] tracking-[0.22em]">
                AVAILABILITY
              </p>

              <span
                className={`
                  text-[9px]
                  ${
                    totalStock > 0
                      ? "text-[#8c6f70]"
                      : "text-[#9d9290]"
                  }
                `}
              >
                {totalStock > 0
                  ? "IN STOCK"
                  : "SOLD OUT"}
              </span>

            </div>

          </div>

        </aside>

      </div>

    </section>
  );
}