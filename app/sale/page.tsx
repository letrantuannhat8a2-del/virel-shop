import Image from "next/image";
import Link from "next/link";
import WishlistButton from "../components/WishlistButton";
import { supabaseAdmin } from "../lib/supabaseAdmin";


// =====================================================
// TYPES
// =====================================================

type SearchParams = {
  category?: string;
  q?: string;
  sort?: string;
  sale?: string;
};


// =====================================================
// CATEGORY DATA
// =====================================================

const categories = [
  {
    label: "ALL SHOES",
    value: "",
  },
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


// =====================================================
// GET PRODUCTS
// =====================================================

async function getProducts(
  searchParams: SearchParams
) {
  let query = supabaseAdmin
    .from("products")
    .select(`
  id,
  name,
  slug,
  price,
  image_1,
  image_2,
  sale_percent,
  category,
  is_active,
  created_at,
  product_images (
    image_url,
    sort_order
  )
`)
   .eq("is_active", true)
.gt("sale_percent", 0);
if (searchParams.sale === "true") {
  query = query.gt(
    "sale_percent",
    0
  );
}

  // ===================================================
  // CATEGORY FILTER
  // ===================================================

  if (
    searchParams.category &&
    searchParams.category !== "all"
  ) {
    query = query.eq(
      "category",
      searchParams.category
    );
  }


  // ===================================================
  // SEARCH
  // ===================================================

  if (searchParams.q) {
    const search = searchParams.q
      .trim()
      .replace(/[%_]/g, "");

    if (search) {
      query = query.ilike(
        "name",
        `%${search}%`
      );
    }
  }


  // ===================================================
  // SORT
  // ===================================================

  switch (searchParams.sort) {
    case "price-low":
      query = query.order(
        "price",
        {
          ascending: true,
        }
      );
      break;

    case "price-high":
      query = query.order(
        "price",
        {
          ascending: false,
        }
      );
      break;

    case "oldest":
      query = query.order(
        "created_at",
        {
          ascending: true,
        }
      );
      break;

    default:
      query = query.order(
        "created_at",
        {
          ascending: false,
        }
      );
      break;
  }


  const {
    data,
    error,
  } = await query;


  if (error) {
    console.error(
      "Failed to load shop products:",
      error
    );

    return [];
  }


  return data ?? [];
}


// =====================================================
// BUILD URL
// =====================================================

function buildUrl(
  params: SearchParams,
  changes: Partial<SearchParams>
) {
  const next = {
    ...params,
    ...changes,
  };

  const search = new URLSearchParams();


  if (next.category) {
    search.set(
      "category",
      next.category
    );
  }

  if (next.q) {
    search.set(
      "q",
      next.q
    );
  }

  if (next.sort) {
    search.set(
      "sort",
      next.sort
    );
  }


  const query = search.toString();

  return query
  ? `/sale?${query}`
  : "/sale";
}


// =====================================================
// SHOP PAGE
// =====================================================

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;

  const products =
    await getProducts(params);


  const activeCategory =
    params.category || "";


  return (
    <main className="min-h-screen bg-[#fcfaf7] text-[#201b1b]">


      {/* =================================================
          ANNOUNCEMENT
      ================================================= */}

      <div className="flex h-9 items-center justify-center bg-[#efd9d7] px-4 text-center text-[8px] tracking-[0.24em] text-[#493b3b] sm:text-[9px]">
        COMPLIMENTARY SHIPPING ON ALL ORDERS OVER $150
      </div>


      {/* =================================================
          HEADER
      ================================================= */}

      <header className="sticky top-0 z-50 border-b border-[#201b1b]/10 bg-[#fcfaf7]/95 backdrop-blur-md">

        <div className="mx-auto grid h-[86px] max-w-[1800px] grid-cols-[1fr_auto_1fr] items-center px-6 lg:px-10">


          {/* LEFT */}

          <nav className="hidden items-center gap-4 whitespace-nowrap xl:flex 2xl:gap-6">

  <Link
    href="/exclusive"
    className="text-[8px] tracking-[0.1em] transition hover:text-[#b47d80]"
  >
    EXCLUSIVE COLLECTION
  </Link>

  {categories.map((category) => (
    <Link
      key={category.label}
      href={
        category.value
          ? `/shop?category=${category.value}`
          : "/shop"
      }
      className="text-[8px] tracking-[0.1em] transition hover:text-[#b47d80]"
    >
      {category.label}
    </Link>
  ))}

</nav>


          {/* LOGO */}

          <Link
            href="/"
            className="text-center"
          >

            <span className="block font-serif text-[34px] leading-none tracking-[0.25em] sm:text-[39px]">
              VIREL
            </span>

            <span className="mt-1 block text-[7px] tracking-[0.45em] text-[#8e7475]">
              BRIDAL SHOES
            </span>

          </Link>


          {/* RIGHT */}

          <div className="flex items-center justify-end gap-5">


            {/* SEARCH */}

            <a
              href="#shop-search"
              aria-label="Search"
              className="flex items-center gap-2"
            >

              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.35"
              >
                <circle
                  cx="11"
                  cy="11"
                  r="7"
                />

                <path d="m20 20-4-4" />

              </svg>

              <span className="hidden text-[8px] tracking-[0.15em] lg:block">
                SEARCH
              </span>

            </a>


            {/* ACCOUNT */}

            <Link
              href="/account"
              className="hidden items-center gap-2 sm:flex"
            >

              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.35"
              >
                <circle
                  cx="12"
                  cy="8"
                  r="3.5"
                />

                <path d="M5 21c.7-4.2 3-6.2 7-6.2s6.3 2 7 6.2" />

              </svg>

              <span className="hidden text-[8px] tracking-[0.15em] lg:block">
                ACCOUNT
              </span>

            </Link>


            {/* WISHLIST */}

            <Link
              href="/account/wishlist"
              className="flex items-center gap-2"
            >

              <svg
                width="19"
                height="19"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.35"
              >
                <path d="M20.8 8.6c0 5.5-8.8 10.4-8.8 10.4S3.2 14.1 3.2 8.6A4.6 4.6 0 0 1 12 6.1a4.6 4.6 0 0 1 8.8 2.5Z" />

              </svg>

              <span className="hidden text-[8px] tracking-[0.15em] lg:block">
                WISHLIST
              </span>

            </Link>


            {/* CART */}

            <Link
              href="/cart"
              className="flex items-center gap-2"
            >

              <svg
                width="19"
                height="19"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.35"
              >
                <path d="M5 8h14l-1 13H6L5 8Z" />

                <path d="M9 8V6a3 3 0 0 1 6 0v2" />

              </svg>

              <span className="hidden text-[8px] tracking-[0.15em] lg:block">
                CART
              </span>

            </Link>

          </div>

        </div>


        {/* =================================================
            CATEGORY NAV
        ================================================= */}

        <div className="border-t border-[#201b1b]/10">

          <div className="mx-auto flex max-w-[1700px] items-center justify-center gap-6 overflow-x-auto px-5 py-4 sm:gap-9">

            {categories.map(
              (category) => {

                const isActive =
                  activeCategory ===
                  category.value;

                return (
                  <Link
                    key={category.label}
                    href={
                      category.value
                        ? `/shop?category=${category.value}`
                        : "/shop"
                    }
                    className={`whitespace-nowrap border-b pb-1 text-[8px] tracking-[0.18em] transition ${
                      isActive
                        ? "border-[#201b1b] text-[#201b1b]"
                        : "border-transparent text-[#7e7070] hover:border-[#b47d80] hover:text-[#b47d80]"
                    }`}
                  >
                    {category.label}
                  </Link>
                );
              }
            )}

          </div>

        </div>

      </header>


      {/* =================================================
          SHOP HERO
      ================================================= */}

      <section className="border-b border-[#201b1b]/10 bg-[#f2e5e0] px-6 py-20 text-center sm:py-24">

        <p className="text-[8px] tracking-[0.4em] text-[#a77d7f]">
  VIREL SPECIAL EDIT
</p>

        <h1 className="mt-5 font-serif text-5xl tracking-[0.02em] sm:text-6xl md:text-7xl">
  Sale
</h1>

        <p className="mx-auto mt-5 max-w-xl text-xs leading-6 text-[#766969]">
          Discover refined footwear designed
          for unforgettable moments.
        </p>

      </section>


      {/* =================================================
          SEARCH + FILTER
      ================================================= */}

      <section
        id="shop-search"
        className="border-b border-[#201b1b]/10 bg-[#fffdfb] px-5 py-6 sm:px-8 md:px-12"
      >

        <div className="mx-auto flex max-w-[1700px] flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">


          {/* SEARCH FORM */}

          <form
            action="/sale"
            method="GET"
            className="flex w-full max-w-xl border-b border-[#201b1b]/30"
          >

            {activeCategory && (
              <input
                type="hidden"
                name="category"
                value={activeCategory}
              />
            )}

            <input
              type="text"
              name="q"
              defaultValue={params.q || ""}
              placeholder="Search shoes..."
              className="w-full bg-transparent px-1 py-3 text-xs outline-none placeholder:text-[#a99a9a]"
            />

            <button
              type="submit"
              className="px-3 text-[8px] tracking-[0.18em]"
            >
              SEARCH
            </button>

          </form>


          {/* SORT */}

          <div className="flex items-center justify-between gap-4 sm:justify-end">

            <span className="text-[8px] tracking-[0.16em] text-[#8d7d7d]">
              {products.length} ITEMS
            </span>


           <div className="relative">
  <details className="group">
    <summary className="cursor-pointer list-none border border-[#201b1b]/20 bg-transparent px-4 py-3 text-[8px] tracking-[0.12em]">
      SORT BY
      <span className="ml-3">⌄</span>
    </summary>

    <div className="absolute right-0 top-full z-30 mt-1 min-w-[190px] border border-[#201b1b]/10 bg-[#fffdfb] py-2 shadow-sm">

      <Link
        href={buildUrl(params, {
          sort: "newest",
        })}
        className="block px-4 py-3 text-[8px] tracking-[0.12em] hover:bg-[#f2e5e0]"
      >
        NEWEST
      </Link>

      <Link
        href={buildUrl(params, {
          sort: "price-low",
        })}
        className="block px-4 py-3 text-[8px] tracking-[0.12em] hover:bg-[#f2e5e0]"
      >
        PRICE: LOW TO HIGH
      </Link>

      <Link
        href={buildUrl(params, {
          sort: "price-high",
        })}
        className="block px-4 py-3 text-[8px] tracking-[0.12em] hover:bg-[#f2e5e0]"
      >
        PRICE: HIGH TO LOW
      </Link>

      <Link
        href={buildUrl(params, {
          sort: "oldest",
        })}
        className="block px-4 py-3 text-[8px] tracking-[0.12em] hover:bg-[#f2e5e0]"
      >
        OLDEST
      </Link>

    </div>
  </details>
</div>

          </div>

        </div>

      </section>


      {/* =================================================
          PRODUCTS
      ================================================= */}

      <section className="bg-[#fcfaf7] px-5 py-14 sm:px-8 md:px-12 lg:px-16">

        <div className="mx-auto max-w-[1700px]">


          {products.length > 0 ? (

            <div className="grid grid-cols-2 gap-x-4 gap-y-12 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">

              {products.map(
  (product) => {
    const mainImage =
      [...(product.product_images ?? [])]
        .sort(
          (a, b) =>
            a.sort_order - b.sort_order
        )[0]?.image_url ||
      product.image_1 ||
      "/image/image_1.png";
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

    return (

                  <Link
                    key={product.id}
                    href={`/shop/${product.slug}`}
                    className="group"
                  >


                    {/* IMAGE */}

                    <div className="relative aspect-[0.82] overflow-hidden bg-[#f3ebe7]">

                      <Image
                        src={mainImage}
                        alt={
                          product.name
                        }
                        fill
                        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                        className="object-cover transition duration-700 group-hover:scale-[1.04]"
                      />


                      {/* NEW */}

                     {hasSale ? (
  <span className="absolute left-3 top-3 bg-[#a87578] px-2 py-1 text-[7px] tracking-[0.12em] text-white">
    {salePercent}% OFF
  </span>
) : (
  <span className="absolute left-3 top-3 bg-white px-2 py-1 text-[7px] tracking-[0.12em] text-[#9b7778]">
    NEW
  </span>
)}


                      {/* WISHLIST */}

                      <WishlistButton productId={product.id} />

                    </div>


                    {/* PRODUCT INFO */}

                    <div className="pt-4">

                      <h2 className="line-clamp-2 text-[9px] tracking-[0.1em]">
                        {product.name}
                      </h2>

                      {hasSale ? (
  <div className="mt-2 flex flex-wrap items-center gap-2">
    <span className="text-[11px] font-medium text-[#a87578]">
      ${salePrice.toFixed(2)}
    </span>

    <span className="text-[9px] text-[#9c8f8f] line-through">
      ${originalPrice.toFixed(2)}
    </span>
  </div>
) : (
  <p className="mt-2 text-[10px]">
    ${originalPrice.toFixed(2)}
  </p>
)}


                      {/* COLOR DOTS */}

                      <div className="mt-3 flex gap-1.5">

                        <span className="h-2 w-2 rounded-full border border-[#c9b8b0] bg-[#eee2d8]" />

                        <span className="h-2 w-2 rounded-full bg-[#d8c1b5]" />

                        <span className="h-2 w-2 rounded-full bg-[#b79c8e]" />

                      </div>

                    </div>

                  </Link>

                );
              }
            )}

            </div>

          ) : (

            /* =================================================
               EMPTY STATE
            ================================================= */

            <div className="flex min-h-[400px] flex-col items-center justify-center text-center">

              <p className="text-[8px] tracking-[0.4em] text-[#a77d7f]">
                VIREL
              </p>

              <h2 className="mt-4 font-serif text-3xl">
                No shoes found
              </h2>

              <p className="mt-3 text-xs text-[#8b7c7c]">
                Try another search or
                collection.
              </p>

              <Link
                href="/shop"
                className="mt-7 border border-[#201b1b] px-8 py-4 text-[8px] tracking-[0.2em]"
              >
                VIEW ALL SHOES
              </Link>

            </div>

          )}

        </div>

      </section>


      {/* =================================================
          EDITORIAL BANNER
      ================================================= */}

      <section className="bg-[#f0dfdb] px-6 py-20">

        <div className="mx-auto max-w-4xl text-center">

          <p className="text-[8px] tracking-[0.4em] text-[#a77d7f]">
            VIREL BRIDAL SHOES
          </p>

          <h2 className="mt-5 font-serif text-4xl leading-tight sm:text-5xl">
            Every step deserves
            <br />
            something extraordinary.
          </h2>

          <p className="mx-auto mt-6 max-w-lg text-xs leading-7 text-[#766969]">
            Designed with elegance,
            crafted with intention and
            made for your most memorable
            moments.
          </p>

        </div>

      </section>


      {/* =================================================
          FOOTER
      ================================================= */}

      <footer className="border-t border-[#201b1b]/10 bg-[#f8f2ee] px-6 py-14 sm:px-10 lg:px-16">

        <div className="mx-auto max-w-[1700px]">

          <div className="grid grid-cols-2 gap-12 md:grid-cols-4 lg:grid-cols-5">


            {/* BRAND */}

            <div className="col-span-2 lg:col-span-2">

              <Link href="/">

                <span className="font-serif text-3xl tracking-[0.25em]">
                  VIREL
                </span>

                <span className="mt-1 block text-[7px] tracking-[0.4em] text-[#987c7d]">
                  BRIDAL SHOES
                </span>

              </Link>

              <p className="mt-6 max-w-sm text-xs leading-6 text-[#766969]">
                Elegant footwear designed
                for weddings, celebrations
                and unforgettable occasions.
              </p>

            </div>


            {/* SHOP */}

            <div>

              <h3 className="text-[8px] tracking-[0.2em]">
                SHOP
              </h3>

              <div className="mt-5 flex flex-col gap-3 text-[9px] text-[#766969]">

                <Link href="/shop">
                  New Arrivals
                </Link>

                <Link href="/shop?category=bridal">
                  Wedding Shoes
                </Link>

                <Link href="/shop?category=heels">
                  Heels
                </Link>

                <Link href="/shop?category=platform">
                  Platform
                </Link>

                <Link href="/shop?category=flats">
                  Flats
                </Link>

              </div>

            </div>


            {/* CLIENT CARE */}

            <div>

              <h3 className="text-[8px] tracking-[0.2em]">
                CLIENT CARE
              </h3>

              <div className="mt-5 flex flex-col gap-3 text-[9px] text-[#766969]">

                <Link href="/support">
                  Contact Us
                </Link>

                <Link href="/shipping">
                  Shipping & Returns
                </Link>

                <Link href="/size-guide">
                  Size Guide
                </Link>

                <Link href="/faq">
                  FAQs
                </Link>

                <Link href="/account">
                  My Account
                </Link>

              </div>

            </div>


            {/* ABOUT */}

            <div>

              <h3 className="text-[8px] tracking-[0.2em]">
                VIREL
              </h3>

              <div className="mt-5 flex flex-col gap-3 text-[9px] text-[#766969]">

                <Link href="/about">
                  About Us
                </Link>

                <a href="#">
                  Instagram
                </a>

                <a href="#">
                  Pinterest
                </a>

                <a href="#">
                  TikTok
                </a>

              </div>

            </div>

          </div>


          {/* BOTTOM */}

          <div className="mt-14 flex flex-col gap-4 border-t border-[#201b1b]/10 pt-6 text-[7px] tracking-[0.08em] text-[#948484] sm:flex-row sm:items-center sm:justify-between">

            <p>
              © 2026 VIREL BRIDAL SHOES.
              ALL RIGHTS RESERVED.
            </p>

            <div className="flex gap-6">

              <Link href="/privacy">
                PRIVACY POLICY
              </Link>

              <Link href="/terms">
                TERMS & CONDITIONS
              </Link>

            </div>

          </div>

        </div>

      </footer>

    </main>
  );
}