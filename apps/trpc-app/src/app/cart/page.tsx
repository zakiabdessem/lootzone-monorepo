"use client";
import { useEffect, useState } from "react";
import { useCart } from "~/hooks/use-cart";
import { formatDA } from "~/lib/utils";

function getOrCreateCartId() {
  if (typeof window === "undefined") return "";
  const key = "cart_id";
  let id = localStorage.getItem(key);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(key, id);
  }
  return id;
}

export default function CartPage() {
  const [cartId, setCartId] = useState<string>("");
  useEffect(() => {
    setCartId(getOrCreateCartId());
  }, []);
  const { cart, isLoading, updateItemQuantity, removeItem, clear } = useCart(cartId);

  if (!cartId) return null;
  if (isLoading) return <div className="p-6">Loading cart...</div>;

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-semibold">Your Cart</h1>
      {cart && cart.items.length === 0 && (
        <div className="space-y-2">
          <div>Your cart is empty.</div>
          <button
            className="px-4 py-2 border rounded"
            onClick={async () => {
              await fetch("/api/trpc/cart.addItem", {
                method: "POST",
              });
            }}
          >
            Add a sample item (demo)
          </button>
        </div>
      )}
      {cart && cart.items.length > 0 && (
        <div className="space-y-4">
          {cart.items.map((item) => (
            <div key={item.id} className="flex items-center justify-between border p-3 rounded">
              <div>
                <div className="font-medium">{item.title}</div>
                <div className="text-sm text-gray-500">{formatDA(item.unitPrice)} x {item.quantity}</div>
              </div>
              <div className="flex items-center gap-2">
                <button className="px-2 py-1 border" onClick={() => updateItemQuantity(item.id, Math.max(1, item.quantity - 1))}>-</button>
                <span>{item.quantity}</span>
                <button className="px-2 py-1 border" onClick={() => updateItemQuantity(item.id, item.quantity + 1)}>+</button>
                <button className="px-3 py-1 border text-red-600" onClick={() => removeItem(item.id)}>Remove</button>
              </div>
            </div>
          ))}
          <div className="flex justify-between border-t pt-3">
            <div className="text-lg font-medium">Total</div>
            <div className="text-lg font-semibold">{formatDA(cart.grandTotal)}</div>
          </div>
          <div className="flex gap-3">
            <a href="/checkout" className="px-4 py-2 bg-black text-white rounded">Checkout</a>
            <button className="px-4 py-2 border rounded" onClick={() => clear()}>Clear</button>
          </div>
        </div>
      )}
    </div>
  );
}