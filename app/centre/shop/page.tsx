import type { Metadata } from "next";

import { PermissionDeniedState } from "@/components/states";
import { createClient } from "@/lib/db/server";
import { getCurrentCentreContext } from "@/features/centres/current-membership";
import { listOrderableProducts } from "@/features/inventory/queries";
import { ShopCart } from "@/features/orders/components/shop-cart";

export const metadata: Metadata = { title: "Shop", robots: { index: false } };

export default async function ShopPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const context = user
    ? await getCurrentCentreContext(supabase, user.id)
    : null;

  if (!context) {
    return (
      <div>
        <h1 className="text-page-title text-navy-900">Shop</h1>
        <PermissionDeniedState className="mt-8" />
      </div>
    );
  }

  const products = await listOrderableProducts(context.centreId);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-page-title text-navy-900">Shop</h1>
        <p className="text-body text-text-secondary mt-1">
          Books, ID cards, certificate stationery and marketing material from
          head office. Payment is taken from your wallet at checkout.
        </p>
      </div>

      <ShopCart centreId={context.centreId} products={products} />
    </div>
  );
}
