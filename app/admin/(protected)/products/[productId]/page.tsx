import Link from "next/link";
import ImageUploader from "./ImageUploader";
import VideoUploader from "./VideoUploader";
import ColorEditor from "./ColorEditor";

import {
  notFound,
  redirect,
} from "next/navigation";

import { revalidatePath } from "next/cache";

import { createClient } from "@/app/lib/supabase/sever";
import { supabaseAdmin } from "@/app/lib/supabaseAdmin";
type PageProps = {
  params: Promise<{
    productId: string;
  }>;
};

type Variant = {
  size: string;
  stock: number;
  color: string;
};

type ProductColor = {
  name: string;
  hex: string;
};

export default async function EditProductPage({
  params,
}: PageProps) {

  // =====================================
  // CHECK ADMIN LOGIN
  // =====================================

  const supabase =
    await createClient();

  const {
    data: { user },
  } =
    await supabase.auth.getUser();

  const adminEmail =
    process.env.ADMIN_EMAIL;

  if (
    !user ||
    !adminEmail ||
    user.email !==
      adminEmail
  ) {
    redirect(
      "/admin/login"
    );
  }

  const { productId } =
    await params;


  // =====================================
  // GET PRODUCT
  // =====================================

  const {
    data: product,
    error: productError,
  } =
    await supabaseAdmin
      .from("products")
      .select("*")
      .eq(
        "id",
        productId
      )
      .single();

  if (
    productError ||
    !product
  ) {
    console.error(
      "Unable to load product:",
      productError
    );

    notFound();
  }


  // =====================================
  // GET VARIANTS
  // =====================================

  const {
    data: variants,
    error: variantError,
  } =
    await supabaseAdmin
      .from(
        "product_variants"
      )
      .select(
        "size, stock, color"
      )
      .eq(
        "product_id",
        productId
      );

  if (variantError) {
    console.error(
      "Unable to load variants:",
      variantError
    );
  }


  const productVariants: Variant[] =
    variants?.map(
      (variant) => ({
        size:
          variant.size,

        stock:
          Number(
            variant.stock
          ),

        color:
          variant.color ??
          "",
      })
    ) ?? [];


  // =====================================
  // PRODUCT IMAGES
  // =====================================

  const {
    data: productImages,
    error:
      productImagesError,
  } =
    await supabaseAdmin
      .from(
        "product_images"
      )
      .select(
        "id, image_url, sort_order"
      )
      .eq(
        "product_id",
        productId
      )
      .order(
        "sort_order",
        {
          ascending: true,
        }
      );

  if (
    productImagesError
  ) {
    console.error(
      "Unable to load product images:",
      productImagesError
    );
  }


  // =====================================
  // PRODUCT SIZES
  // =====================================

  const sizes: string[] =
    Array.isArray(
      product.sizes
    )
      ? product.sizes
      : [];


  // =====================================
  // PRODUCT COLORS
  // =====================================

  const productColors: ProductColor[] =
    Array.isArray(
      product.colors
    )
      ? product.colors
      : [];


  const hasColors =
    productColors.length >
    0;


  // =====================================
  // SAVE PRODUCT COLORS
  // =====================================

  async function saveProductColors(
    colors: ProductColor[]
  ) {
    "use server";

    const supabase =
      await createClient();

    const {
      data: {
        user,
      },
    } =
      await supabase.auth.getUser();

    const adminEmail =
      process.env.ADMIN_EMAIL;

    if (
      !user ||
      !adminEmail ||
      user.email !==
        adminEmail
    ) {
      redirect(
        "/admin/login"
      );
    }


    const cleanedColors =
      colors
        .map(
          (color) => ({
            name:
              String(
                color.name ??
                  ""
              ).trim(),

            hex:
              String(
                color.hex ??
                  ""
              )
                .trim()
                .toUpperCase(),
          })
        )
        .filter(
          (color) =>
            color.name
              .length > 0
        );


    if (
      cleanedColors.length ===
      0
    ) {
      throw new Error(
        "At least one color is required."
      );
    }


    for (
      const color of
        cleanedColors
    ) {

      if (
        !/^#[0-9A-F]{6}$/.test(
          color.hex
        )
      ) {
        throw new Error(
          `Invalid HEX color: ${color.hex}`
        );
      }
    }


    const {
      error,
    } =
      await supabaseAdmin
        .from("products")
        .update({
          colors:
            cleanedColors,

          updated_at:
            new Date().toISOString(),
        })
        .eq(
          "id",
          productId
        );


    if (error) {
      console.error(
        "Unable to save product colors:",
        error
      );

      throw new Error(
        "Unable to save product colors."
      );
    }


    revalidatePath(
      `/admin/products/${productId}`
    );

    revalidatePath(
      "/shop"
    );

    revalidatePath(
      `/shop/${product.slug}`
    );
  }


  // =====================================
  // UPDATE PRODUCT
  // =====================================

  async function updateProduct(
    formData: FormData
  ) {
    "use server";

    // =====================================
    // CHECK ADMIN
    // =====================================

    const supabase =
      await createClient();

    const {
      data: {
        user,
      },
    } =
      await supabase.auth.getUser();

    const adminEmail =
      process.env.ADMIN_EMAIL;

    if (
      !user ||
      !adminEmail ||
      user.email !==
        adminEmail
    ) {
      redirect(
        "/admin/login"
      );
    }


    // =====================================
    // READ FORM DATA
    // =====================================

    const name =
      String(
        formData.get(
          "name"
        ) ?? ""
      ).trim();

    const description =
      String(
        formData.get(
          "description"
        ) ?? ""
      ).trim();

   const price =
  Number(
    formData.get(
      "price"
    )
  );

const shippingText =
  String(
    formData.get(
      "shippingText"
    ) ?? ""
  ).trim();

const salePercentValue =
  String(
    formData.get(
      "salePercent"
    ) ?? ""
  ).trim();

const salePercent =
  salePercentValue === ""
    ? 0
    : Number(
        salePercentValue
      );

const isActive =
  formData.get(
    "isActive"
  ) === "on";


    // =====================================
    // VALIDATE
    // =====================================

    if (!name) {
      return;
    }
if (
  !Number.isFinite(price) ||
  price <= 0
) {
  return;
}
   if (
  !Number.isFinite(
    salePercent
  ) ||
  salePercent < 0 ||
  salePercent > 100
) {
  return;
}


    // =====================================
    // UPDATE PRODUCT
    // =====================================

    const {
      error:
        updateProductError,
    } =
      await supabaseAdmin
        .from("products")
        .update({
  name,

  price:
    Number(
      price.toFixed(
        2
      )
    ),

  sale_percent:
    salePercent,

  shipping_text:
    shippingText ||
    null,

  description:
    description ||
    null,

  is_active:
    isActive,

  updated_at:
    new Date().toISOString(),
})
        .eq(
          "id",
          productId
        );


    if (
      updateProductError
    ) {
      console.error(
        "Unable to update product:",
        updateProductError
      );

      return;
    }


    // =====================================
    // READ CURRENT COLORS
    //
    // From database at the time
    // the form is submitted.
    // =====================================

    const {
      data:
        currentProduct,
      error:
        currentProductError,
    } =
      await supabaseAdmin
        .from("products")
        .select(
          "colors"
        )
        .eq(
          "id",
          productId
        )
        .single();


    if (
      currentProductError
    ) {
      console.error(
        "Unable to load current colors:",
        currentProductError
      );

      return;
    }


    const currentColors: ProductColor[] =
      Array.isArray(
        currentProduct?.colors
      )
        ? currentProduct.colors
        : [];


    const currentHasColors =
      currentColors.length >
      0;


    // =====================================
    // UPDATE INVENTORY
    // =====================================

    if (
      currentHasColors
    ) {

      // ===================================
      // COLOR + SIZE INVENTORY
      // ===================================

      for (
        const color of
          currentColors
      ) {

        for (
          const size of
            sizes
        ) {

          const fieldName =
            `stock_${encodeURIComponent(
              color.name
            )}_${encodeURIComponent(
              size
            )}`;

          const stockValue =
            Number(
              formData.get(
                fieldName
              )
            );

          const safeStock =
            Number.isFinite(
              stockValue
            )
              ? Math.max(
                  0,
                  Math.floor(
                    stockValue
                  )
                )
              : 0;


          const {
            error:
              stockError,
          } =
            await supabaseAdmin
              .from(
                "product_variants"
              )
              .upsert(
                {
                  product_id:
                    productId,

                  color:
                    color.name,

                  size,

                  stock:
                    safeStock,

                  updated_at:
                    new Date().toISOString(),
                },
                {
                  onConflict:
                    "product_id,color,size",
                }
              );


          if (
            stockError
          ) {
            console.error(
              `Unable to update stock ${color.name} / ${size}:`,
              stockError
            );

            return;
          }
        }
      }

    } else {

      // ===================================
      // OLD STYLE:
      // SIZE + STOCK ONLY
      // ===================================

      for (
        const size of
          sizes
      ) {

        const stockValue =
          Number(
            formData.get(
              `stock_${size}`
            )
          );

        const safeStock =
          Number.isFinite(
            stockValue
          )
            ? Math.max(
                0,
                Math.floor(
                  stockValue
                )
              )
            : 0;


        const {
          error:
            stockError,
        } =
          await supabaseAdmin
            .from(
              "product_variants"
            )
            .upsert(
              {
                product_id:
                  productId,

                color: "",

                size,

                stock:
                  safeStock,

                updated_at:
                  new Date().toISOString(),
              },
              {
                onConflict:
                  "product_id,color,size",
              }
            );


        if (
          stockError
        ) {
          console.error(
            `Unable to update stock ${size}:`,
            stockError
          );

          return;
        }
      }
    }


    // =====================================
    // REFRESH
    // =====================================

    revalidatePath(
      "/admin/products"
    );

    revalidatePath(
      `/admin/products/${productId}`
    );

    revalidatePath(
      "/shop"
    );

    revalidatePath(
      `/shop/${product.slug}`
    );


    // =====================================
    // REDIRECT
    // =====================================

    redirect(
      `/admin/products/${productId}`
    );
  }


  // =====================================
  // HELPER
  // =====================================

  function getVariantStock(
    color: string,
    size: string
  ) {

    const variant =
      productVariants.find(
        (item) =>
          item.color ===
            color &&
          item.size ===
            size
      );

    return (
      variant?.stock ??
      0
    );
  }


  // =====================================
  // PAGE
  // =====================================

  return (
    <main className="min-h-screen bg-[#f8f6f2] text-black">

      {/* =====================================
          HEADER
      ===================================== */}

      <header className="border-b border-black/10 bg-white px-10 py-7">

        <div className="flex items-center justify-between">

          <div>

            <h1 className="font-serif text-2xl tracking-[0.25em]">
              VIREL
            </h1>

            <p className="mt-2 text-[9px] tracking-[0.3em] text-gray-400">
              ADMINISTRATION
            </p>

          </div>

          <div className="flex items-center gap-8">

            <Link
              href="/admin/orders"
              className="text-[10px] tracking-[0.18em] text-gray-400 transition hover:text-black"
            >
              ORDERS
            </Link>

            <Link
              href="/admin/products"
              className="text-[10px] tracking-[0.18em]"
            >
              PRODUCTS
            </Link>

          </div>

        </div>

      </header>


      {/* =====================================
          PAGE
      ===================================== */}

      <section className="mx-auto max-w-[1100px] px-10 py-12">

        {/* TITLE */}

        <div className="flex items-end justify-between border-b border-black/10 pb-10">

          <div>

            <p className="text-[10px] tracking-[0.3em] text-gray-400">
              EDIT PRODUCT
            </p>

            <h2 className="mt-3 font-serif text-5xl">
              {product.name}
            </h2>

            <p className="mt-4 text-sm text-gray-400">
              Product ID:{" "}
              {product.id}
            </p>

          </div>

          <Link
            href="/admin/products"
            className="text-[10px] tracking-[0.18em] underline underline-offset-4"
          >
            ← BACK TO PRODUCTS
          </Link>

        </div>


        {/* =====================================
            FORM
        ===================================== */}

        <form
          action={
            updateProduct
          }
          className="mt-10 grid grid-cols-1 gap-8 lg:grid-cols-[1fr_0.7fr]"
        >

          {/* =====================================
              LEFT
          ===================================== */}

          <div className="space-y-8">

            {/* ===================================
                PRODUCT INFORMATION
            =================================== */}

            <div className="bg-white p-8">

              <h3 className="text-[11px] tracking-[0.25em]">
                PRODUCT INFORMATION
              </h3>

              <div className="mt-7 space-y-6">

                {/* NAME */}

                <div>

                  <label
                    htmlFor="name"
                    className="text-[10px] tracking-[0.18em] text-gray-400"
                  >
                    PRODUCT NAME
                  </label>

                  <input
                    id="name"
                    name="name"
                    defaultValue={
                      product.name
                    }
                    required
                    className="
                      mt-3
                      w-full
                      border
                      border-black/20
                      bg-white
                      px-4
                      py-3
                      text-sm
                      outline-none
                      focus:border-black
                    "
                  />

                </div>


                {/* PRICE */}

                <div>

                  <label
                    htmlFor="price"
                    className="text-[10px] tracking-[0.18em] text-gray-400"
                  >
                    PRICE — USD
                  </label>

                  <input
                    id="price"
                    name="price"
                    type="number"
                    step="0.01"
                    min="0.01"
                    defaultValue={
                      Number(
                        product.price
                      )
                    }
                    required
                    className="mt-3 w-full border border-black/20 bg-white px-5 py-4 text-sm outline-none focus:border-black"
                  />

                </div>
{/* SALE */}

<div>
  <label
    htmlFor="salePercent"
    className="text-[10px] tracking-[0.18em] text-gray-400"
  >
    SALE — %
  </label>

  <input
    id="salePercent"
    name="salePercent"
    type="number"
    min="0"
    max="100"
    step="1"
    defaultValue={
      Number(
        product.sale_percent ??
        0
      )
    }
    className="mt-3 w-full border border-black/20 bg-white px-5 py-4 text-sm outline-none focus:border-black"
  />

  <p className="mt-2 text-[10px] leading-5 text-gray-400">
    Enter 0 for no sale. Example: 20 = 20% off.
  </p>
</div>

                {/* DESCRIPTION */}

                <div>

                  <label
                    htmlFor="description"
                    className="text-[10px] tracking-[0.18em] text-gray-400"
                  >
                    DESCRIPTION
                  </label>

                  <textarea
                    id="description"
                    name="description"
                    rows={6}
                    defaultValue={
                      product.description ??
                      ""
                    }
                    className="mt-3 w-full resize-none border border-black/20 bg-white px-5 py-4 text-sm leading-7 outline-none focus:border-black"
                  />

                </div>

              </div>

            </div>

{/* SHIPPING */}

<div>
  <label
    htmlFor="shippingText"
    className="text-[10px] tracking-[0.18em] text-gray-400"
  >
    SHIPPING INFORMATION
  </label>

  <textarea
    id="shippingText"
    name="shippingText"
    rows={4}
    defaultValue={
      product.shipping_text ??
      "Complimentary shipping on orders over $150."
    }
    className="mt-3 w-full resize-none border border-black/20 bg-white px-5 py-4 text-sm leading-6 outline-none focus:border-black"
  />
</div>
            {/* =====================================
                INVENTORY
            ===================================== */}

            <div className="bg-white p-8">

              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">

                <h3 className="text-[11px] tracking-[0.25em]">
                  {hasColors
                    ? "INVENTORY BY COLOR & SIZE"
                    : "INVENTORY BY SIZE"}
                </h3>

                <p className="text-[10px] text-gray-400">
                  {hasColors
                    ? "Each color has its own stock."
                    : "Shoe sizes · Units available"}
                </p>

              </div>


              {/* =================================
                  NO COLORS
              ================================= */}

              {!hasColors && (

                <div className="mt-7 grid grid-cols-2 gap-4 md:grid-cols-5">

                  {sizes.map(
                    (size) => {

                      const variant =
                        productVariants.find(
                          (item) =>
                            item.color ===
                              "" &&
                            item.size ===
                              size
                        );


                      return (

                        <div
                          key={size}
                        >

                          <label
                            htmlFor={`stock_${size}`}
                            className="text-[10px] tracking-[0.15em] text-gray-400"
                          >
                            SIZE{" "}
                            {size}
                          </label>

                          <input
                            id={`stock_${size}`}
                            name={`stock_${size}`}
                            type="number"
                            min="0"
                            step="1"
                            defaultValue={
                              variant?.stock ??
                              0
                            }
                            className="mt-3 w-full border border-black/20 px-4 py-4 text-center text-sm outline-none focus:border-black"
                          />

                        </div>
                      );
                    }
                  )}

                </div>
              )}


              {/* =================================
                  COLORS
              ================================= */}

              {hasColors && (

                <div className="mt-7 space-y-8">

                  {productColors.map(
                    (color) => (

                      <div
                        key={
                          color.name
                        }
                        className="border border-black/10 bg-[#fcfaf7]"
                      >

                        {/* COLOR HEADER */}

                        <div className="flex items-center gap-4 border-b border-black/10 px-5 py-4">

                          <span
                            className="h-7 w-7 rounded-full border border-black/15"
                            style={{
                              backgroundColor:
                                color.hex,
                            }}
                          />

                          <div>

                            <p className="text-[10px] tracking-[0.2em]">
                              {color.name}
                            </p>

                            <p className="mt-1 text-[9px] text-gray-400">
                              {color.hex}
                            </p>

                          </div>

                        </div>


                        {/* SIZES */}

                        <div className="grid grid-cols-2 gap-4 p-5 md:grid-cols-5">

                          {sizes.map(
                            (size) => {

                              const stock =
                                getVariantStock(
                                  color.name,
                                  size
                                );


                              const fieldName =
                                `stock_${encodeURIComponent(
                                  color.name
                                )}_${encodeURIComponent(
                                  size
                                )}`;


                              return (

                                <div
                                  key={`${color.name}-${size}`}
                                >

                                  <label
                                    htmlFor={fieldName}
                                    className="text-[10px] tracking-[0.15em] text-gray-400"
                                  >
                                    SIZE{" "}
                                    {size}
                                  </label>

                                  <input
                                    id={fieldName}
                                    name={fieldName}
                                    type="number"
                                    min="0"
                                    step="1"
                                    defaultValue={
                                      stock
                                    }
                                    className="mt-3 w-full border border-black/20 bg-white px-4 py-4 text-center text-sm outline-none focus:border-black"
                                  />

                                </div>

                              );
                            }
                          )}

                        </div>

                      </div>
                    )
                  )}

                </div>
              )}


              <p className="mt-6 text-xs leading-6 text-gray-400">

                {hasColors
                  ? "Stock is managed separately for every color and shoe size."
                  : "Set stock to 0 to mark a shoe size as sold out."}

              </p>

            </div>

          </div>


          {/* =====================================
              RIGHT
          ===================================== */}

          <div>

            <div className="sticky top-8 space-y-6">

              {/* =====================================
                  PRODUCT IMAGES
              ===================================== */}

              <ImageUploader
                productId={
                  product.id
                }
                slug={
                  product.slug
                }
                images={
                  productImages ??
                  []
                }
              />


              {/* =====================================
                  COLORS
              ===================================== */}

              <ColorEditor
                initialColors={
                  productColors
                }
                saveColors={
                  saveProductColors
                }
              />


              {/* =====================================
                  VIDEO
              ===================================== */}

              <VideoUploader
                productId={
                  product.id
                }
                slug={
                  product.slug
                }
                videoUrl={
                  product.video_url ??
                  null
                }
              />


              {/* =====================================
                  STATUS
              ===================================== */}

              <div className="bg-white p-8">

                <h3 className="text-[11px] tracking-[0.25em]">
                  PRODUCT STATUS
                </h3>

                <label className="mt-7 flex cursor-pointer items-center justify-between border border-black/10 p-5">

                  <div>

                    <p className="text-sm">
                      Active
                    </p>

                    <p className="mt-1 text-xs leading-5 text-gray-400">
                      Product is visible and
                      available for purchase.
                    </p>

                  </div>

                  <input
                    type="checkbox"
                    name="isActive"
                    defaultChecked={
                      product.is_active
                    }
                    className="h-4 w-4"
                  />

                </label>

              </div>


              {/* =====================================
                  SUMMARY
              ===================================== */}

              <div className="bg-white p-8">

                <h3 className="text-[11px] tracking-[0.25em]">
                  CURRENT PRODUCT
                </h3>

                <div className="mt-7 space-y-5 text-sm">

                  <div className="flex justify-between gap-6">

                    <span className="text-gray-400">
                      Name
                    </span>

                    <span className="text-right">
                      {product.name}
                    </span>

                  </div>


                  <div className="flex justify-between gap-6">

                    <span className="text-gray-400">
                      Slug
                    </span>

                    <span className="break-all text-right">
                      {product.slug}
                    </span>

                  </div>


                  <div className="flex justify-between">

                    <span className="text-gray-400">
                      Currency
                    </span>

                    <span>
                      {product.currency}
                    </span>

                  </div>


                  <div className="flex justify-between">

                    <span className="text-gray-400">
                      Colors
                    </span>

                    <span>
                      {hasColors
                        ? productColors.length
                        : "Default"}
                    </span>

                  </div>


                  <div className="flex justify-between">

                    <span className="text-gray-400">
                      Status
                    </span>

                    <span>
                      {product.is_active
                        ? "Active"
                        : "Hidden"}
                    </span>

                  </div>

                </div>

              </div>


              {/* =====================================
                  SAVE
              ===================================== */}

              <button
                type="submit"
                className="w-full bg-black px-6 py-5 text-[10px] tracking-[0.25em] text-white transition hover:bg-black/80"
              >
                SAVE CHANGES
              </button>


              {/* =====================================
                  VIEW PRODUCT
              ===================================== */}

              <Link
                href={`/shop/${product.slug}`}
                target="_blank"
                className="block border border-black/20 px-6 py-5 text-center text-[10px] tracking-[0.22em] transition hover:border-black"
              >
                VIEW PRODUCT
              </Link>

            </div>

          </div>

        </form>

      </section>

    </main>
  );
}