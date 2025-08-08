"use client";

import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/hooks/useCart";
import { Button } from "../_components/landing/ui/button";
import { Input } from "../_components/landing/ui/input";

export default function CartPage() {
  const { items, itemCount, subtotalFormatted, updateQuantity, remove } = useCart();

  return (
    <div className="min-h-screen bg-[#f8f7ff]">
      <div className="max-w-[1024px] mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6 text-[#212121]">Your Cart</h1>

        {items.length === 0 ? (
          <div className="text-sm text-gray-600">
            Your cart is empty. <Link className="text-[#4618AC] underline" href="/products">Continue shopping</Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 flex flex-col gap-4">
              {items.map((it) => (
                <div key={it.variantId} className="flex gap-4 bg-white p-3 border border-gray-200">
                  <div className="relative w-20 h-24 shrink-0">
                    <Image src={it.image} alt={it.title} fill className="object-cover" />
                  </div>
                  <div className="flex-1">
                    <Link href={`/product/${it.slug}`} className="font-medium text-[#212121]">
                      {it.title}
                    </Link>
                    <div className="text-xs text-gray-500">{it.variantName}</div>
                    <div className="mt-2 flex items-center gap-3">
                      <label className="text-sm text-gray-600">Qty</label>
                      <Input
                        type="number"
                        min={1}
                        value={it.quantity}
                        onChange={(e) => updateQuantity(it.variantId, Number(e.target.value))}
                        className="w-20 h-8"
                      />
                      <Button
                        variant="secondary"
                        className="h-8"
                        onClick={() => remove(it.variantId)}
                      >
                        Remove
                      </Button>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-500">Unit</div>
                    <div className="font-semibold">{it.unitPrice.toLocaleString("fr-FR")} DA</div>
                    <div className="text-sm text-gray-500 mt-2">Total</div>
                    <div className="font-semibold">{it.lineTotal.toLocaleString("fr-FR")} DA</div>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-white p-4 border border-gray-200 h-fit">
              <div className="flex justify-between text-sm text-gray-600">
                <span>Items</span>
                <span>{itemCount}</span>
              </div>
              <div className="flex justify-between mt-2 text-base font-semibold">
                <span>Subtotal</span>
                <span>{subtotalFormatted}</span>
              </div>
              <Button className="w-full mt-4 bg-[#4618AC] hover:bg-[#4618AC]/90">Checkout</Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}