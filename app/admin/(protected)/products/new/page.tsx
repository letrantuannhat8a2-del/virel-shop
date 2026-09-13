import Link from "next/link";
import { redirect } from "next/navigation";

import { createClient } from "@/app/lib/supabase/sever";
import { supabaseAdmin } from "@/app/lib/supabaseAdmin";

const SHOE_SIZES = [
  "35",
  "36",
  "37",
  "38",
  "39",
  "40",
  "41",
];

const SHOE_CATEGORIES = [
  {
    label: "WEDDING SHOES",
    value: "bridal",
  },
  {
    label: "HEELS",
    value: "heels",
  },
  {
    label: "PLATFORM",
    value: "platform",
  },
  {
    label: "EVENING",
    value: "evening",
  },
  {
    label: "FLATS",
    value: "flats",
  },
  {
    label: "ACCESSORIES",
    value: "accessories",
  },
];

export default async function NewProductPage() {
  // =====================================
  // CHECK ADMIN LOGIN
  // =====================================

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const adminEmail =
    process.env.ADMIN_EMAIL;

  if (
    !user ||
    !adminEmail ||
    user.email !== adminEmail
  ) {
    redirect("/admin/login");
  }

  // =====================================
  // CREATE PRODUCT
  // =====================================

  async function createProduct(
    formData: FormData
  ) {
    "use server";

    // =====================================
    // CHECK ADMIN AGAIN
    // =====================================

    const supabase =
      await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    const adminEmail =
      process.env.ADMIN_EMAIL;

    if (
      !user ||
      !adminEmail ||
      user.email !== adminEmail
    ) {
      redirect("/admin/login");
    }

    // =====================================
    // BASIC PRODUCT DATA
    // =====================================

    const name =
      String(
        formData.get("name") ?? ""
      ).trim();

    const slug =
      String(
        formData.get("slug") ?? ""
      )
        .trim()
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(
          /[^a-z0-9-]/g,
          ""
        );

    const price =
      Number(
        formData.get("price")
      );

    const description =
      String(
        formData.get(
          "description"
        ) ?? ""
      ).trim();

    const category =
      String(
        formData.get(
          "category"
        ) ?? ""
      ).trim();

    const isActive =
      formData.get(
        "isActive"
      ) === "on";

    // =====================================
    // VALIDATE BASIC DATA
    // =====================================

    const validCategory =
      SHOE_CATEGORIES.some(
        (item) =>
          item.value === category
      );

    if (
      !name ||
      !slug ||
      !Number.isFinite(price) ||
      price <= 0 ||
      !validCategory
    ) {
      console.error(
        "Invalid product information."
      );

      return;
    }

    // =====================================
    // PREVENT DUPLICATE SLUG
    // =====================================

    const {
      data: existingProduct,
      error: slugError,
    } = await supabaseAdmin
      .from("products")
      .select("id")
      .eq("slug", slug)
      .maybeSingle();

    if (slugError) {
      console.error(
        "Unable to check product slug:",
        slugError
      );

      return;
    }

    if (existingProduct) {
      console.error(
        "Product slug already exists."
      );

      return;
    }

    // =====================================
    // UPLOAD PRODUCT IMAGES
    // =====================================

    const imageUrls: (
      | string
      | null
    )[] = [];

    const uploadedFiles: string[] =
      [];

    for (
      let index = 1;
      index <= 5;
      index++
    ) {
      const image =
        formData.get(
          `image_${index}`
        );

      // No image selected
      if (
        !(image instanceof File) ||
        image.size === 0
      ) {
        imageUrls.push(null);
        continue;
      }

      // Only accept image files
      if (
        !image.type.startsWith(
          "image/"
        )
      ) {
        console.error(
          `File ${index} is not an image.`
        );

        return;
      }

      // Maximum 10 MB each
      if (
        image.size >
        10 * 1024 * 1024
      ) {
        console.error(
          `Image ${index} is larger than 10 MB.`
        );

        return;
      }

      const originalName =
        image.name
          .normalize("NFD")
          .replace(
            /[\u0300-\u036f]/g,
            ""
          )
          .toLowerCase()
          .replace(
            /\s+/g,
            "-"
          )
          .replace(
            /[^a-z0-9._-]/g,
            ""
          );

      const fileName =
        `${Date.now()}-${index}-${originalName}`;

      const filePath =
        `${slug}/${fileName}`;

      const {
        error: uploadError,
      } =
        await supabaseAdmin.storage
          .from(
            "product-image"
          )
          .upload(
            filePath,
            image,
            {
              contentType:
                image.type,

              upsert: false,
            }
          );

      if (uploadError) {
        console.error(
          `Unable to upload image ${index}:`,
          uploadError
        );

        // Cleanup files already uploaded
        if (
          uploadedFiles.length >
          0
        ) {
          await supabaseAdmin.storage
            .from("product-image")
            .remove(
              uploadedFiles
            );
        }

        return;
      }

      uploadedFiles.push(
        filePath
      );

      const {
        data: publicUrlData,
      } =
        supabaseAdmin.storage
          .from(
            "product-image"
          )
          .getPublicUrl(
            filePath
          );

      imageUrls.push(
        publicUrlData.publicUrl
      );
    }

    // =====================================
    // CREATE PRODUCT
    // =====================================

    const {
      error: productError,
    } = await supabaseAdmin
      .from("products")
      .insert({
        id: slug,

        name,

        slug,

        price:
          Number(
            price.toFixed(2)
          ),

        currency: "USD",

        description:
          description || null,

        category,

        image_1:
          imageUrls[0] ?? null,

        image_2:
          imageUrls[1] ?? null,

        image_3:
          imageUrls[2] ?? null,

        image_4:
          imageUrls[3] ?? null,

        image_5:
          imageUrls[4] ?? null,

        sizes:
          SHOE_SIZES,

        // Inventory source is product_variants.
        // Keep products.stock synchronized at 0
        // because the checkout uses exact variants.
        stock: 0,

        is_active:
          isActive,
      });

    if (productError) {
      console.error(
        "Unable to create product:",
        productError
      );

      // Cleanup uploaded images
      if (
        uploadedFiles.length >
        0
      ) {
        await supabaseAdmin.storage
          .from("product-image")
          .remove(
            uploadedFiles
          );
      }

      return;
    }

    // =====================================
    // CREATE STOCK BY SHOE SIZE
    // =====================================

    const variantRows =
      SHOE_SIZES.map(
        (size) => {
          const stock =
            Number(
              formData.get(
                `stock_${size}`
              )
            );

          const safeStock =
            Number.isFinite(
              stock
            )
              ? Math.max(
                  0,
                  Math.floor(
                    stock
                  )
                )
              : 0;

          return {
            product_id:
              slug,

            size,

            stock:
              safeStock,
          };
        }
      );

    const {
      error: variantError,
    } = await supabaseAdmin
      .from(
        "product_variants"
      )
      .insert(
        variantRows
      );

    if (variantError) {
      console.error(
        "Unable to create product variants:",
        variantError
      );

      // Remove product if variants
      // could not be created.
      await supabaseAdmin
        .from("products")
        .delete()
        .eq(
          "id",
          slug
        );

      // Cleanup uploaded images
      if (
        uploadedFiles.length >
        0
      ) {
        await supabaseAdmin.storage
          .from("product-image")
          .remove(
            uploadedFiles
          );
      }

      return;
    }

    // =====================================
    // DONE
    // =====================================

    redirect(
      `/admin/products/${slug}`
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

      <header className="border-b border-black/10 bg-white">

        <div className="mx-auto flex min-h-20 max-w-7xl items-center justify-between px-6 py-6 sm:min-h-24 sm:px-10">

          <div>

            <h1 className="font-serif text-2xl tracking-[0.25em]">
              VIREL
            </h1>

            <p className="mt-2 text-[9px] tracking-[0.3em] text-gray-400">
              ADMINISTRATION
            </p>

          </div>

          <Link
            href="/admin/products"
            className="text-[9px] tracking-[0.18em] underline underline-offset-4 sm:text-[10px]"
          >
            ← BACK TO PRODUCTS
          </Link>

        </div>

      </header>

      {/* =====================================
          CONTENT
      ===================================== */}

      <section className="mx-auto max-w-[1100px] px-5 py-10 sm:px-8 sm:py-12 lg:px-10">

        {/* TITLE */}

        <div className="border-b border-black/10 pb-10">

          <p className="text-[10px] tracking-[0.3em] text-gray-400">
            VIREL PRODUCT MANAGEMENT
          </p>

          <h2 className="mt-3 font-serif text-4xl sm:text-5xl">
            Add Shoe
          </h2>

          <p className="mt-4 max-w-xl text-sm leading-6 text-gray-400">
            Create a VIREL bridal shoe
            and manage availability by
            shoe size.
          </p>

        </div>

        {/* =====================================
            FORM
        ===================================== */}

        <form
          action={createProduct}
          encType="multipart/form-data"
          className="mt-10 grid grid-cols-1 gap-8 lg:grid-cols-[1fr_0.7fr]"
        >

          {/* =====================================
              LEFT
          ===================================== */}

          <div className="space-y-8">

            {/* PRODUCT INFORMATION */}

            <div className="bg-white p-7 sm:p-8">

              <h3 className="text-[11px] tracking-[0.25em]">
                SHOE INFORMATION
              </h3>

              <div className="mt-7 space-y-6">

                {/* NAME */}

                <div>

                  <label
                    htmlFor="name"
                    className="text-[10px] tracking-[0.18em] text-gray-400"
                  >
                    SHOE NAME
                  </label>

                  <input
                    id="name"
                    name="name"
                    type="text"
                    placeholder="Celeste Pearl Heel"
                    required
                    className="mt-3 w-full border border-black/20 px-5 py-4 text-sm outline-none focus:border-black"
                  />

                </div>

                {/* SLUG */}

                <div>

                  <label
                    htmlFor="slug"
                    className="text-[10px] tracking-[0.18em] text-gray-400"
                  >
                    SLUG
                  </label>

                  <input
                    id="slug"
                    name="slug"
                    type="text"
                    placeholder="celeste-pearl-heel"
                    required
                    className="mt-3 w-full border border-black/20 px-5 py-4 text-sm outline-none focus:border-black"
                  />

                  <p className="mt-2 text-xs text-gray-400">
                    Use lowercase letters,
                    numbers and hyphens.
                  </p>

                </div>

                {/* CATEGORY */}

                <div>

                  <label
                    htmlFor="category"
                    className="text-[10px] tracking-[0.18em] text-gray-400"
                  >
                    SHOE CATEGORY
                  </label>

                  <select
                    id="category"
                    name="category"
                    defaultValue="bridal"
                    required
                    className="mt-3 w-full border border-black/20 bg-white px-5 py-4 text-sm outline-none focus:border-black"
                  >

                    {SHOE_CATEGORIES.map(
                      (category) => (
                        <option
                          key={
                            category.value
                          }
                          value={
                            category.value
                          }
                        >
                          {
                            category.label
                          }
                        </option>
                      )
                    )}

                  </select>

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
                    min="0.01"
                    step="0.01"
                    placeholder="128.00"
                    required
                    className="mt-3 w-full border border-black/20 px-5 py-4 text-sm outline-none focus:border-black"
                  />

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
                    placeholder="Describe the materials, heel height, details and fit..."
                    className="mt-3 w-full resize-none border border-black/20 px-5 py-4 text-sm leading-7 outline-none focus:border-black"
                  />

                </div>

              </div>

            </div>

            
            {/* =====================================
                INVENTORY
            ===================================== */}

            <div className="bg-white p-7 sm:p-8">

              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">

                <div>

                  <h3 className="text-[11px] tracking-[0.25em]">
                    INVENTORY BY SHOE SIZE
                  </h3>

                  <p className="mt-2 text-xs text-gray-400">
                    Set the available quantity
                    for each shoe size.
                  </p>

                </div>

                <p className="text-[10px] tracking-[0.12em] text-gray-400">
                  US/EU STYLE SIZE
                </p>

              </div>

              <div className="mt-7 grid grid-cols-2 gap-4 sm:grid-cols-4 md:grid-cols-7">

                {SHOE_SIZES.map(
                  (size) => (
                    <div
                      key={
                        size
                      }
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
                          0
                        }
                        required
                        className="mt-3 w-full border border-black/20 px-3 py-4 text-center text-sm outline-none focus:border-black"
                      />

                    </div>
                  )
                )}

              </div>

              <p className="mt-5 text-xs leading-6 text-gray-400">
                A quantity of 0 means the
                size is currently sold out.
              </p>

            </div>

          </div>

          {/* =====================================
              RIGHT
          ===================================== */}

          <div>

            <div className="sticky top-8 space-y-6">

              {/* =====================================
                  STATUS
              ===================================== */}

              <div className="bg-white p-7 sm:p-8">

                <h3 className="text-[11px] tracking-[0.25em]">
                  PRODUCT STATUS
                </h3>

                <label className="mt-7 flex cursor-pointer items-center justify-between border border-black/10 p-5">

                  <div>

                    <p className="text-sm">
                      Active
                    </p>

                    <p className="mt-1 text-xs leading-5 text-gray-400">
                      Make this shoe visible
                      and available for
                      purchase.
                    </p>

                  </div>

                  <input
                    name="isActive"
                    type="checkbox"
                    defaultChecked
                    className="h-4 w-4"
                  />

                </label>

              </div>

              {/* =====================================
                  VIREL INFO
              ===================================== */}

              <div className="bg-white p-7 sm:p-8">

                <p className="text-[9px] tracking-[0.25em] text-gray-400">
                  VIREL · BRIDAL SHOES
                </p>

                <p className="mt-4 text-xs leading-6 text-gray-400">
                  Product images are stored
                  securely in VIREL product
                  storage.
                </p>

                <div className="mt-6 border-t border-black/10 pt-5">

                  <div className="flex justify-between text-xs">

                    <span className="text-gray-400">
                      Sizes
                    </span>

                    <span>
                      35 — 41
                    </span>

                  </div>

                  <div className="mt-3 flex justify-between text-xs">

                    <span className="text-gray-400">
                      Currency
                    </span>

                    <span>
                      USD
                    </span>

                  </div>

                  <div className="mt-3 flex justify-between text-xs">

                    <span className="text-gray-400">
                      Images
                    </span>

                    <span>
                      Up to 5
                    </span>

                  </div>

                </div>

              </div>

              {/* =====================================
                  CREATE
              ===================================== */}

              <button
                type="submit"
                className="w-full bg-black px-6 py-5 text-[10px] tracking-[0.25em] text-white transition hover:bg-black/80"
              >
                CREATE SHOE
              </button>

            </div>

          </div>

        </form>

      </section>

    </main>
  );
}