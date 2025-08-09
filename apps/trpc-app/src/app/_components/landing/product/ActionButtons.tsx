"use client";

import { Button } from "../ui/button";
import { useCart } from "@/hooks/useCart";

type Props = {
  productId: string;
  variantId: string;
};

const ActionButtons: React.FC<Props> = ({ productId, variantId }) => {
  const { add } = useCart();

  return (
    <div className="grid grid-cols-2 gap-2">
      <Button
        className="w-full cursor-pointer bg-[#fad318] hover:bg-[#fad318]/80 text-black h-[45px] text-sm font-medium"
        onClick={() => add({ productId, variantId, quantity: 1 })}
      >
        Add to cart
      </Button>
      <Button className="w-full cursor-pointer bg-[#4618AC] hover:bg-[#4618AC]/80 text-white h-[45px] text-sm font-medium">
        Checkout Now
      </Button>
    </div>
  );
};

export default ActionButtons;
