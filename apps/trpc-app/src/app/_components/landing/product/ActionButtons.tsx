import { Button } from "../ui/button";

const ActionButtons: React.FC = () => (
  <div className="grid grid-cols-2 gap-2">
    <Button className="w-full cursor-pointer bg-[#fad318] hover:bg-[#fad318]/80 text-black h-[45px] text-sm font-medium">
      Add to cart
    </Button>
    <Button className="w-full cursor-pointer bg-[#4618AC] hover:bg-[#4618AC]/80 text-white h-[45px] text-sm font-medium">
      Checkout Now
    </Button>
  </div>
);

export default ActionButtons;
