import siteSettings from "@/lib/site-settings.json";
import Image from "next/image";
import Link from "next/link";
import { Button } from "../ui/button";

const whatsappLink = siteSettings.whatsappLink;
const telegramLink = siteSettings.telegramLink;

const ContactUs = () => {
  return (
    <section className="py-24 bg-[#f8f7ff]">
      <div className="max-w-[1440px] mx-auto px-4 text-center flex flex-col justify-center items-center">
        <h2 className="text-3xl font-extrabold text-[#212121] mb-4">
          Need Help? Contact Us
        </h2>
        <p className="text-gray-600 mb-8">
          Our team is available on WhatsApp to answer your questions and assist
          you with your orders.
        </p>
        <div className="flex gap-4">
          <Link href={whatsappLink} target="_blank" rel="noopener noreferrer">
            <Button className="flex items-center gap-2 bg-[#25D366] cursor-pointer hover:bg-[#1DA851] text-white px-6 py-4 rounded-none">
              <Image
                src="https://img.icons8.com/color/48/whatsapp--v1.png"
                alt="WhatsApp"
                width={20}
                height={20}
              />
              Chat on WhatsApp
            </Button>
          </Link>
          <Link href={telegramLink} target="_blank" rel="noopener noreferrer">
            <Button className="flex items-center gap-2 bg-[#0088cc] cursor-pointer hover:bg-[#0077b3] text-white px-6 py-4 rounded-none">
              <Image
                src="https://img.icons8.com/color/48/telegram-app--v1.png"
                alt="Telegram"
                width={20}
                height={20}
              />
              Chat on Telegram
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default ContactUs;
