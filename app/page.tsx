import Image from "next/image";
import Link from "next/link";
import HeroSlider from "./components/HeroSlider";
import { supabaseAdmin } from "./lib/supabaseAdmin";
export const dynamic = "force-dynamic";
type HomepageContent = {
  announcement?: {
    text?: string;
  };
  hero?: {
    slides?: {
      image: string;
      label?: string;
      title?: string;
      italicTitle?: string;
      description?: string;
      buttonText?: string;
      buttonLink?: string;
      positionX?: number;
      positionY?: number;
      zoom?: number;
    }[];
  };
  categories?: {
    items?: Category[];
  };
  editorial?: {
  enabled?: boolean;
  image?: string;
  label?: string;
  title?: string;
  italicTitle?: string;
  description?: string;
  buttonText?: string;
  buttonLink?: string;
  positionX?: number;
  positionY?: number;
  zoom?: number;
};
   featured?: {
    enabled?: boolean;
    label?: string;
    title?: string;
    description?: string;
    product_ids?: string[];
    buttonText?: string;
    buttonLink?: string;
  };

  brand_statement?: {
    enabled?: boolean;
    label?: string;
    title?: string;
    description?: string;
  };

  footer?: {
    enabled?: boolean;
    description?: string;

    shopLinks?: {
      label: string;
      href: string;
    }[];

    clientCareLinks?: {
      label: string;
      href: string;
    }[];

    aboutLinks?: {
      label: string;
      href: string;
    }[];

    copyright?: string;
  };

  service_strip?: {
    enabled?: boolean;

    items?: {
      title: string;
      subtitle: string;
    }[];
  };
};

type Category = {
  name: string;
  description?: string;
  image: string;
  link: string;
  positionX?: number;
  positionY?: number;
  zoom?: number;
};
const defaultEditorial = {
  enabled: true,
  image: "/image/image_4.png",
  label: "THE VIREL EDIT",
  title: "A little more",
  italicTitle: "extraordinary.",
  description:
    "Every pair is thoughtfully designed to elevate your style and become part of your most beautiful memories.",
  buttonText: "DISCOVER THE EDIT",
  buttonLink: "/shop",
  positionX: 50,
  positionY: 50,
  zoom: 1,
};

const defaultServiceStrip = {
  enabled: true,
  items: [
    {
      title: "COMPLIMENTARY GIFT WRAP",
      subtitle: "On all orders",
    },
    {
      title: "WORLDWIDE SHIPPING",
      subtitle: "Fast & reliable delivery",
    },
    {
      title: "SECURE PAYMENTS",
      subtitle: "Safe & trusted checkout",
    },
    {
      title: "DESIGNED TO LAST",
      subtitle: "Premium quality materials",
    },
  ],
};

// =====================================================
// GET HOMEPAGE CONTENT
// =====================================================

async function getHomepageContent() {
  const { data, error } = await supabaseAdmin
    .from("homepage_content")
    .select("*")
    .eq("id", 1)
    .single();

  if (error) {
    console.error(
      "Failed to load homepage content:",
      error
    );

    return null;
  }

  return data;
}

// =====================================================
// CATEGORIES
// =====================================================




// =====================================================
// GET NEW ARRIVALS FROM SUPABASE
// =====================================================

async function getNewArrivals() {
  const { data, error } = await supabaseAdmin
    .from("products")
    .select(`
      id,
      name,
      slug,
      price,
      image_1,
      image_2,
      category,
      is_active,
      product_images (
  image_url,
  sort_order
),
created_at
    `)
    .eq("is_active", true)
    .order("created_at", {
      ascending: false,
    })
    .limit(6);

  if (error) {
    console.error(
      "Failed to load new arrivals:",
      error
    );

    return [];
  }

  return data ?? [];
}

// =====================================================
// GET FEATURED PRODUCTS FROM SUPABASE
// =====================================================

// =====================================================
// GET FEATURED PRODUCTS FROM SUPABASE
// =====================================================

async function getFeaturedProducts(
  productIds: string[]
) {
  if (
    !productIds ||
    productIds.length === 0
  ) {
    return [];
  }

  const {
    data,
    error,
  } = await supabaseAdmin
    .from("products")
    .select(`
      id,
      name,
      slug,
      price,
      image_1,
      image_2,
      is_active
    `)
    .in("id", productIds)
    .eq("is_active", true);

  if (error) {
    console.error(
      "Failed to load featured products:",
      error
    );

    return [];
  }

  if (!data) {
    return [];
  }

  // Giữ đúng thứ tự sản phẩm
  // mà admin đã chọn trong product_ids
  const productMap = new Map(
    data.map((product) => [
      product.id,
      product,
    ])
  );

  return productIds
    .map((id) =>
      productMap.get(id)
    )
    .filter(
      (
        product
      ): product is NonNullable<
        typeof product
      > => Boolean(product)
    );
}
// =====================================================
// HOME
// =====================================================

export default async function Home() {
  const products = await getNewArrivals();
  const homepage = await getHomepageContent();
  const footer = {
    enabled:
      homepage?.footer?.enabled ?? true,

    description:
      homepage?.footer?.description ??
      "Elegant footwear designed for weddings, celebrations and unforgettable occasions.",

    shopLinks:
      homepage?.footer?.shopLinks ?? [
        {
          label: "New Arrivals",
          href: "/shop?sort=new",
        },
        {
          label: "Wedding Shoes",
          href: "/shop?category=wedding-shoes",
        },
        {
          label: "Heels",
          href: "/shop?category=heels",
        },
        {
          label: "Flats",
          href: "/shop?category=flats",
        },
        {
          label: "Sale",
          href: "/sale",
        },
      ],

    clientCareLinks:
      homepage?.footer?.clientCareLinks ?? [
        {
          label: "Contact Us",
          href: "/contact",
        },
        {
          label: "Shipping & Returns",
          href: "/shipping-returns",
        },
        {
          label: "Size Guide",
          href: "/size-guide",
        },
        {
          label: "FAQs",
          href: "/faq",
        },
        {
          label: "My Account",
          href: "/account",
        },
      ],

    aboutLinks:
      homepage?.footer?.aboutLinks ?? [
        {
          label: "About Us",
          href: "/about",
        },
        {
          label: "Instagram",
          href: "#",
        },
        {
          label: "Pinterest",
          href: "#",
        },
        {
          label: "TikTok",
          href: "#",
        },
      ],

    copyright:
      homepage?.footer?.copyright ??
      "© 2026 VIREL BRIDAL SHOES. ALL RIGHTS RESERVED.",
  };

  const categories: Category[] =
    homepage?.categories?.items ?? [];
const editorialData = homepage?.editorial;

const editorial =
  Array.isArray(editorialData)
    ? editorialData[0] ?? defaultEditorial
    : editorialData ?? defaultEditorial;

  const serviceStrip = {
    enabled:
      homepage?.service_strip?.enabled ??
      defaultServiceStrip.enabled,

    items:
      homepage?.service_strip?.items ??
      defaultServiceStrip.items,
  };

  const featuredIds =
    homepage?.featured?.product_ids ?? [];

   const featuredProducts =
    await getFeaturedProducts(
      featuredIds
    );

  return (
    <main className="min-h-screen bg-[#fcfaf7] text-[#201b1b]">

      {/* =====================================================
          TOP ANNOUNCEMENT
      ===================================================== */}

      <div className="flex h-9 items-center justify-center bg-[#efd9d7] px-4 text-center text-[8px] tracking-[0.24em] text-[#493b3b] sm:text-[9px]">
  {homepage?.announcement?.text ||
    "COMPLIMENTARY SHIPPING ON ALL ORDERS OVER $150"}
</div>


      {/* =====================================================
          HEADER
      ===================================================== */}

      <header className="sticky top-0 z-50 border-b border-[#201b1b]/10 bg-[#fcfaf7]/95 backdrop-blur-md">

        <div className="relative mx-auto flex h-[86px] max-w-[1800px] items-center px-6 lg:px-10">

         {/* LEFT NAV */}

<nav className=" mr-auto hidden items-center gap-4 whitespace-nowrap xl:flex 2xl:gap-6">

  <Link
    href="/exclusive"
    className="text-[8px] tracking-[0.1em] transition hover:text-[#b47d80]"
  >
    EXCLUSIVE COLLECTION
  </Link>

  <Link
    href="/shop"
    className="text-[8px] tracking-[0.1em] transition hover:text-[#b47d80]"
  >
    ALL SHOES
  </Link>

  <Link
    href="/shop?category=bridal"
    className="text-[8px] tracking-[0.1em] transition hover:text-[#b47d80]"
  >
    WEDDING SHOES
  </Link>

  <Link
    href="/shop?category=heels"
    className="text-[8px] tracking-[0.1em] transition hover:text-[#b47d80]"
  >
    HEELS
  </Link>

  <Link
    href="/shop?category=platform"
    className="text-[8px] tracking-[0.1em] transition hover:text-[#b47d80]"
  >
    PLATFORM
  </Link>

  <Link
    href="/shop?category=evening"
    className="text-[8px] tracking-[0.1em] transition hover:text-[#b47d80]"
  >
    EVENING
  </Link>

  <Link
    href="/shop?category=flats"
    className="text-[8px] tracking-[0.1em] transition hover:text-[#b47d80]"
  >
    FLATS
  </Link>

  <Link
    href="/shop?category=accessories"
    className="text-[8px] tracking-[0.1em] transition hover:text-[#b47d80]"
  >
    ACCESSORIES
  </Link>

</nav>


          {/* RIGHT NAV */}

          <div className=" ml-auto flex items-center justify-end gap-5">

            {/* SEARCH */}

            <Link
              href="/search"
              className="group flex items-center gap-2"
              aria-label="Search"
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

            </Link>


            {/* ACCOUNT */}

            <Link
              href="/account"
              className="group hidden items-center gap-2 sm:flex"
              aria-label="Account"
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
              className="group flex items-center gap-2"
              aria-label="Wishlist"
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
              className="group flex items-center gap-2"
              aria-label="Cart"
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


       {/* SECONDARY NAV */}

<div className="hidden border-t border-[#201b1b]/10 xl:block">

  <div className="flex h-11 items-center justify-center gap-9">

    <Link
      href="/shop?sale=true"
      className="text-[8px] tracking-[0.18em] text-[#a16f71] transition hover:text-[#201b1b]"
    >
      SALE
    </Link>

    <Link
      href="/about"
      className="text-[8px] tracking-[0.18em] transition hover:text-[#b47d80]"
    >
      ABOUT US
    </Link>

  </div>

</div>

        {/* MOBILE NAV */}

        <div className="flex overflow-x-auto border-t border-[#201b1b]/10 xl:hidden">

          <div className="mx-auto flex min-w-max gap-7 px-6 py-3">

            <Link
  href="/exclusive"
  className="text-[8px] tracking-[0.16em]"
>
  COLLECTION
</Link>

            <Link
              href="/shop?category=bridal"
              className="text-[8px] tracking-[0.16em]"
            >
              WEDDING
            </Link>

            <Link
              href="/shop?category=heels"
              className="text-[8px] tracking-[0.16em]"
            >
              HEELS
            </Link>

            <Link
              href="/shop?category=flats"
              className="text-[8px] tracking-[0.16em]"
            >
              FLATS
            </Link>

            <Link
              href="/shop?category=accessories"
              className="text-[8px] tracking-[0.16em]"
            >
              ACCESSORIES
            </Link>

            <Link
              href="/shop?sale=true"
              className="text-[8px] tracking-[0.16em] text-[#a16f71]"
            >
              SALE
            </Link>

          </div>

        </div>

      </header>


      {/* =====================================================
          HERO SLIDER
      ===================================================== */}

      <HeroSlider hero={homepage?.hero} />


      {/* =====================================================
    SERVICE STRIP
===================================================== */}

{serviceStrip.enabled !== false && (
  <section className="border-y border-black/10 bg-[#faf5f2]">

    <div className="mx-auto grid max-w-[1700px] grid-cols-2 lg:grid-cols-4">

      {(serviceStrip.items ?? []).map(
        (
          item: {
            title: string;
            subtitle: string;
          },
          index: number
        ) => (
          <div
            key={`service-${index}`}
            className="border-r border-b border-black/10 px-5 py-8 text-center last:border-r-0 lg:border-b-0"
          >

            <p className="text-[9px] tracking-[0.12em]">
              {item.title}
            </p>

            <p className="mt-2 text-[9px] text-[#897979]">
              {item.subtitle}
            </p>

          </div>
        )
      )}

    </div>

  </section>
)}


      {/* =====================================================
          CATEGORY COLLECTION
      ===================================================== */}

      <section className="bg-[#fcfaf7] px-5 py-16 sm:px-8 md:px-12 lg:px-16">

        <div className="mx-auto max-w-[1700px]">

          <div className="mb-9 text-center">

            <p className="text-[8px] tracking-[0.35em] text-[#aa8586]">
              EXPLORE VIREL
            </p>

            <h2 className="mt-3 font-serif text-3xl sm:text-4xl">
              Shop by Collection
            </h2>

          </div>


          <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-5">

            {categories.map((category) => (

              <Link
                href={category.link}
                key={`${category.name}-${category.link}`}
                className="group"
              >

                <div className="relative aspect-[4/3] overflow-hidden bg-[#f0e4df]">

                  <Image
  src={category.image}
  alt={category.name}
  fill
  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
  className="object-cover transition duration-700 group-hover:scale-105"
  style={{
    objectPosition: `${category.positionX ?? 50}% ${
      category.positionY ?? 50
    }%`,
    transform: `scale(${category.zoom ?? 1})`,
  }}
/>


                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/55 to-transparent px-4 pb-5 pt-16 text-center text-white">

                    <h3 className="font-serif text-xl">
                     {category.name}
                    </h3>

                    <p className="mt-1 text-[8px] tracking-[0.1em] text-white/80">
                      {category.description}
                    </p>

                    <p className="mt-3 text-[8px] tracking-[0.2em] opacity-0 transition group-hover:opacity-100">
                      SHOP NOW →
                    </p>

                  </div>

                </div>

              </Link>

            ))}

          </div>

        </div>

      </section>


      {/* =====================================================
          NEW ARRIVALS
      ===================================================== */}

      <section className="bg-[#fffdfb] px-5 py-16 sm:px-8 md:px-12 lg:px-16">

        <div className="mx-auto max-w-[1700px]">

          <div className="mb-10 flex items-end justify-between">

            <div>

              <p className="text-[8px] tracking-[0.35em] text-[#aa8586]">
                JUST ARRIVED
              </p>

              <h2 className="mt-3 font-serif text-4xl tracking-[0.02em] sm:text-5xl">
                New Arrivals
              </h2>

            </div>


            <Link
              href="/shop"
              className="hidden border-b border-[#201b1b] pb-1 text-[8px] tracking-[0.2em] sm:block"
            >
              VIEW ALL →
            </Link>

          </div>


          {/* PRODUCTS */}

          {products.length > 0 ? (

            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">

              {products.map((product) => {
  const sortedImages =
    [...(product.product_images ?? [])]
      .sort(
        (a, b) =>
          Number(a.sort_order ?? 0) -
          Number(b.sort_order ?? 0)
      );

  const mainImage =
    sortedImages[0]?.image_url ||
    product.image_1 ||
    "/image/image_1.png";

  return (
    <Link
      href={`/shop/${product.slug}`}
      key={product.id}
      className="group"
    >

      <div className="relative aspect-[0.82] overflow-hidden bg-[#f4eeea]">

        <Image
          src={mainImage}
          alt={product.name}
          fill
          sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 16vw"
          className="object-cover transition duration-700 group-hover:scale-[1.04]"
        />

        {/* NEW */}

        <span className="absolute left-3 top-3 bg-white px-2 py-1 text-[7px] tracking-[0.12em] text-[#9a7475]">
          NEW
        </span>

        {/* WISHLIST */}

        <span className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-lg">
          ♡
        </span>

      </div>


      {/* PRODUCT INFO */}

      <div className="pt-4">

        <h3 className="text-[9px] tracking-[0.12em]">
          {product.name}
        </h3>

        <p className="mt-2 text-[10px]">
          ${Number(product.price).toFixed(2)}
        </p>

        {/* COLOR DOTS */}

        <div className="mt-3 flex gap-1.5">

          <span className="h-2 w-2 rounded-full border border-[#c9b8b0] bg-[#eee2d8]" />

          <span className="h-2 w-2 rounded-full bg-[#d8c1b5]" />

          <span className="h-2 w-2 rounded-full bg-[#b79c8e]" />

        </div>

      </div>

    </Link>
  );
})}

            </div>

          ) : (

            <div className="py-20 text-center">

              <p className="text-[9px] tracking-[0.2em] text-[#897979]">
                NO PRODUCTS AVAILABLE
              </p>

            </div>

          )}


          <div className="mt-10 flex justify-center sm:hidden">

            <Link
              href="/shop"
              className="border border-[#201b1b] px-8 py-4 text-[8px] tracking-[0.2em]"
            >
              VIEW ALL
            </Link>

          </div>

        </div>

      </section>
     {/* =====================================================
    EDITORIAL
===================================================== */}

{editorial.enabled !== false && (
  <section className="bg-[#f0dfdb] px-5 py-16 sm:px-8 md:px-12 lg:px-16">

    <div className="mx-auto grid max-w-[1600px] lg:grid-cols-2">

      <div className="relative aspect-[4/3] overflow-hidden">

        <Image
          src={
            editorial.image ||
            "/image/image_4.png"
          }
          alt={
            editorial.label ||
            "VIREL bridal shoes"
          }
          fill
          sizes="(max-width: 1024px) 100vw, 50vw"
          className="object-cover"
          style={{
            objectPosition: `${
              editorial.positionX ?? 50
            }% ${
              editorial.positionY ?? 50
            }%`,
            transform: `scale(${
              editorial.zoom ?? 1
            })`,
          }}
        />

      </div>


      <div className="flex items-center px-8 py-16 sm:px-14 md:px-20">

        <div className="max-w-lg">

          <p className="text-[8px] tracking-[0.35em] text-[#9e7778]">
            {editorial.label}
          </p>

          <h2 className="mt-6 font-serif text-5xl leading-[1.05] sm:text-6xl">

            {editorial.title}

            <br />

            <span className="italic">
              {editorial.italicTitle}
            </span>

          </h2>

          <p className="mt-7 text-xs leading-7 text-[#675959] sm:text-sm">
            {editorial.description}
          </p>

          <Link
            href={
              editorial.buttonLink ||
              "/shop"
            }
            className="mt-8 inline-flex border-b border-[#201b1b] pb-2 text-[8px] tracking-[0.25em]"
          >
            {editorial.buttonText ||
              "DISCOVER THE EDIT"}
          </Link>

        </div>

      </div>

    </div>

  </section>
)}
{/* =====================================================
    FEATURED PRODUCTS
===================================================== */}

{homepage?.featured?.enabled !== false &&
  featuredProducts.length > 0 && (
    <section className="bg-[#fffdfb] px-5 py-16 sm:px-8 md:px-12 lg:px-16">

      <div className="mx-auto max-w-[1700px]">

        <div className="mb-10 text-center">

          <p className="text-[8px] tracking-[0.35em] text-[#aa8586]">
            {homepage?.featured?.label ||
              "FEATURED COLLECTION"}
          </p>

          <h2 className="mt-3 font-serif text-4xl tracking-[0.02em] sm:text-5xl">
            {homepage?.featured?.title ||
              "Our most loved pieces"}
          </h2>

          {homepage?.featured?.description && (
            <p className="mx-auto mt-5 max-w-xl text-xs leading-7 text-[#766969]">
              {homepage.featured.description}
            </p>
          )}

        </div>

        {/* PRODUCTS */}

        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">

          {featuredProducts.map(
            (product) => (

              <Link
                href={`/shop/${product.slug}`}
                key={product.id}
                className="group"
              >

                <div className="relative aspect-[0.82] overflow-hidden bg-[#f4eeea]">

                  <Image
                    src={
                      product.image_1 ||
                      "/image/image_1.png"
                    }
                    alt={product.name}
                    fill
                    sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                    className="object-cover transition duration-700 group-hover:scale-[1.04]"
                  />

                  <span className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-lg">
                    ♡
                  </span>

                </div>

                <div className="pt-4">

                  <h3 className="text-[9px] tracking-[0.12em]">
                    {product.name}
                  </h3>

                  <p className="mt-2 text-[10px]">
                    ${Number(
                      product.price
                    ).toFixed(2)}
                  </p>

                </div>

              </Link>

            )
          )}

        </div>

        {/* BUTTON */}

        {homepage?.featured?.buttonText && (
          <div className="mt-10 flex justify-center">

            <Link
              href={
                homepage.featured.buttonLink ||
                "/shop"
              }
              className="border border-[#201b1b] px-8 py-4 text-[8px] tracking-[0.2em] transition hover:bg-[#211c1c] hover:text-white"
            >
              {homepage.featured.buttonText}
            </Link>

          </div>
        )}

      </div>

    </section>
  )}

  {/* =====================================================
    BRAND STATEMENT
===================================================== */}

{homepage?.brand_statement?.enabled !== false && (
  <section className="bg-[#fffdfb] px-6 py-20 text-center">

    <p className="text-[8px] tracking-[0.4em] text-[#a77d7f]">
      {homepage?.brand_statement?.label ||
        "VIREL"}
    </p>

    <h2 className="mx-auto mt-5 max-w-3xl whitespace-pre-line font-serif text-4xl leading-tight sm:text-5xl md:text-6xl">
      {homepage?.brand_statement?.title ||
        "Made for the moments\nyou'll remember forever."}
    </h2>

    {homepage?.brand_statement?.description && (
      <p className="mx-auto mt-6 max-w-xl whitespace-pre-line text-xs leading-7 text-[#7b6d6d]">
        {homepage.brand_statement.description}
      </p>
    )}

  </section>
)}


{/* =====================================================
    FOOTER
===================================================== */}

{homepage?.footer?.enabled !== false && (
  <footer className="border-t border-black/10 bg-[#faf5f2] px-6 py-14 sm:px-10 lg:px-16">

    <div className="mx-auto max-w-[1700px]">

      <div className="grid gap-12 lg:grid-cols-[2fr_1fr_1fr_1fr]">

        {/* =================================================
            BRAND
        ================================================= */}

        <div>

          <h2 className="font-serif text-3xl tracking-[0.2em]">
            VIREL
          </h2>

          <p className="mt-2 text-[7px] tracking-[0.3em] text-[#a77d7f]">
            BRIDAL SHOES
          </p>

          {homepage?.footer?.description && (
            <p className="mt-7 max-w-sm text-xs leading-7 text-[#766969]">
              {homepage.footer.description}
            </p>
          )}

        </div>


        {/* =================================================
            SHOP
        ================================================= */}

        <div>

          <p className="text-[8px] tracking-[0.3em] text-[#967577]">
            SHOP
          </p>

          <div className="mt-6 space-y-4">

            {(homepage?.footer?.shopLinks ?? []).map(
              (
                link: {
                  label: string;
                  href: string;
                },
                index: number
              ) => (
                <Link
                  key={`shop-${index}`}
                  href={link.href}
                  className="block text-[10px] text-[#625959] transition hover:text-black"
                >
                  {link.label}
                </Link>
              )
            )}

          </div>

        </div>


        {/* =================================================
            CLIENT CARE
        ================================================= */}

        <div>

          <p className="text-[8px] tracking-[0.3em] text-[#967577]">
            CLIENT CARE
          </p>

          <div className="mt-6 space-y-4">

            {(homepage?.footer?.clientCareLinks ?? []).map(
              (
                link: {
                  label: string;
                  href: string;
                },
                index: number
              ) => (
                <Link
                  key={`care-${index}`}
                  href={link.href}
                  className="block text-[10px] text-[#625959] transition hover:text-black"
                >
                  {link.label}
                </Link>
              )
            )}

          </div>

        </div>


        {/* =================================================
            VIREL / SOCIAL
        ================================================= */}

        <div>

          <p className="text-[8px] tracking-[0.3em] text-[#967577]">
            VIREL
          </p>

          <div className="mt-6 space-y-4">

            {(homepage?.footer?.aboutLinks ?? []).map(
              (
                link: {
                  label: string;
                  href: string;
                },
                index: number
              ) => (
                <Link
                  key={`about-${index}`}
                  href={link.href}
                  className="block text-[10px] text-[#625959] transition hover:text-black"
                >
                  {link.label}
                </Link>
              )
            )}

          </div>

        </div>

      </div>


      {/* =================================================
          BOTTOM
      ================================================= */}

      <div className="mt-14 flex flex-col gap-5 border-t border-black/10 pt-6 sm:flex-row sm:items-center sm:justify-between">

        <p className="text-[7px] tracking-[0.08em] text-[#8b7777]">
          {homepage?.footer?.copyright ||
            "© 2026 VIREL BRIDAL SHOES. ALL RIGHTS RESERVED."}
        </p>

        <div className="flex gap-6">

          <Link
            href="/privacy"
            className="text-[7px] tracking-[0.08em] text-[#8b7777] transition hover:text-black"
          >
            PRIVACY POLICY
          </Link>

          <Link
            href="/terms"
            className="text-[7px] tracking-[0.08em] text-[#8b7777] transition hover:text-black"
          >
            TERMS & CONDITIONS
          </Link>

        </div>

      </div>

    </div>

  </footer>
)}


    </main>
  );
}