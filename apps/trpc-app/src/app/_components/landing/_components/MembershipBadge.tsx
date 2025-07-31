import React from "react";
import siteSettings from "@/lib/site-settings.json";
import Image from "next/image";

const MembershipBadge: React.FC = () => (
  <span className="inline-flex items-center gap-1 rounded-full border border-white/20 bg-white/60 backdrop-blur-sm px-3 py-1 text-[12px] font-medium text-gray-700 shadow-sm silver-shimmer">
    <span className="text-lg leading-none text-gray-700 cursor-pointer">
      <Image
        src="https://img.icons8.com/matisse/30/fire.png"
        alt="fire"
        width={20}
        height={20}
      />
    </span>{" "}
    {siteSettings.siteSubAnnouncement}
  </span>
);

export default MembershipBadge;
