"use client";
import { useEffect, useState } from "react";
import { useCheckout } from "~/hooks/use-checkout";
import { PaymentMethod } from "~/constants/enums";

function getCartId() {
  if (typeof window === "undefined") return "";
  return localStorage.getItem("cart_id") ?? "";
}

export default function CheckoutPage() {
  const [cartId, setCartId] = useState<string>("");
  const { placeOrderFromCart, isPlacing } = useCheckout(cartId);

  useEffect(() => {
    setCartId(getCartId());
  }, []);

  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [line1, setLine1] = useState("");
  const [city, setCity] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [country, setCountry] = useState("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!cartId) return;
    await placeOrderFromCart({
      email,
      billing: {
        fullName,
        email,
        line1,
        city,
        postalCode,
        country,
      },
      paymentMethod: PaymentMethod.CASH,
    });
    alert("Order placed as PENDING (Cash)");
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4">Checkout</h1>
      <form className="space-y-3" onSubmit={onSubmit}>
        <input className="border p-2 w-full" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <input className="border p-2 w-full" placeholder="Full name" value={fullName} onChange={(e) => setFullName(e.target.value)} />
        <input className="border p-2 w-full" placeholder="Address line 1" value={line1} onChange={(e) => setLine1(e.target.value)} />
        <div className="flex gap-2">
          <input className="border p-2 flex-1" placeholder="City" value={city} onChange={(e) => setCity(e.target.value)} />
          <input className="border p-2 flex-1" placeholder="Postal code" value={postalCode} onChange={(e) => setPostalCode(e.target.value)} />
        </div>
        <input className="border p-2 w-full" placeholder="Country" value={country} onChange={(e) => setCountry(e.target.value)} />
        <button className="px-4 py-2 bg-black text-white rounded" disabled={isPlacing}>
          {isPlacing ? "Placing..." : "Place order (Cash)"}
        </button>
      </form>
    </div>
  );
}