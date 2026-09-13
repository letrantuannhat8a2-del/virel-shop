import Link from "next/link";
import { redirect } from "next/navigation";

import { createClient } from "@/app/lib/supabase/sever";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // =====================================================
  // CHECK ADMIN LOGIN
  // =====================================================

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const adminEmail =
    process.env.ADMIN_EMAIL;

  const isAdmin =
    !!user?.email &&
    !!adminEmail &&
    user.email.toLowerCase() ===
      adminEmail.toLowerCase();

  if (!isAdmin) {
    redirect("/admin/login");
  }

  return (
    <div className="min-h-screen bg-[#f8f6f2] text-black">

      {/* ADMIN HEADER */}

      <header className="border-b border-black/10 px-10 py-7">

        <div className="flex items-center justify-between">

          {/* LOGO */}

          <Link
            href="/admin"
            className="block"
          >
            <h1 className="font-serif text-2xl tracking-[0.25em]">
              VIREL
            </h1>

            <p className="mt-2 text-[9px] tracking-[0.3em] text-gray-400">
              ADMINISTRATION
            </p>
          </Link>

          {/* MENU */}

          <nav className="flex gap-10 text-[11px] tracking-[0.25em]">

            <Link
              href="/admin/homepage"
              className="hover:opacity-60"
            >
              HOMEPAGE
            </Link>

            <Link
              href="/admin/orders"
              className="hover:opacity-60"
            >
              ORDERS
            </Link>

            <Link
              href="/admin/products"
              className="hover:opacity-60"
            >
              PRODUCTS
            </Link>
            <Link
    href="/admin/chat"
    className="hover:opacity-60"
  >
    CHAT
  </Link>

          </nav>

        </div>

      </header>

      {/* PAGE CONTENT */}

      {children}

    </div>
  );
}