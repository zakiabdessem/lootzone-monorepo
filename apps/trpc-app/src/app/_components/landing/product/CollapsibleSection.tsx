"use client";

import { ChevronDown, ChevronUp } from "lucide-react";
import React, { useState } from "react";

interface CollapsibleProps {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

export const CollapsibleSection: React.FC<CollapsibleProps> = ({
  title,
  children,
  defaultOpen,
}) => {
  const [open, setOpen] = useState(!!defaultOpen);

  return (
    <div
      className={`border-b ${
        title === "Product type" ? "border-gray-200" : "border-transparent"
      } py-3`}
    >
      <button
        type="button"
        className="w-full flex items-center justify-between text-sm font-semibold text-[#212121]"
        onClick={() => setOpen((o) => !o)}
      >
        {title}
        {open ? (
          <ChevronUp className="w-4 h-4" />
        ) : (
          <ChevronDown className="w-4 h-4" />
        )}
      </button>
      {open && (
        <div className="mt-3 space-y-3 text-sm text-gray-700">{children}</div>
      )}
    </div>
  );
};
