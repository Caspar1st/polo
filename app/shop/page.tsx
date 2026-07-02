import type { Metadata } from "next";
import PoloPonyLoader from "@/components/shared/PoloPonyLoader";

export const metadata: Metadata = { title: "Shop" };

export default function ShopPage() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
      <h1 className="text-4xl text-primary-900">Shop</h1>
      <p className="mt-3 max-w-xl text-ink-muted">
        Club apparel, polo gear and tournament capsule collections arrive in
        Milestone 7.
      </p>
      <PoloPonyLoader
        variant="empty"
        size={150}
        label="The shop shelves are still being stocked"
        className="mt-12"
      />
    </section>
  );
}
