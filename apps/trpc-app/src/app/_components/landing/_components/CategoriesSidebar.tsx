"use client";

import { ChevronRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { api } from "~/trpc/react";

function CategoryItem({ category }: { category: any }) {
  const [isOpen, setIsOpen] = useState(false);
  const hasChildren = category.children && category.children.length > 0;

  return (
    <li className="border-b border-gray-200">
      <div
        className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50"
        onClick={() => hasChildren && setIsOpen(!isOpen)}
      >
        <div className="flex items-center gap-3">
          <Image
            src={category.icon || "/icons/category/e-gifts.svg"}
            alt=""
            width={24}
            height={24}
            className="w-6 h-6 object-contain"
          />
          <span className="font-semibold text-gray-800">{category.name}</span>
        </div>
        {hasChildren && (
          <ChevronRight
            className={`w-5 h-5 text-gray-500 transition-transform ${
              isOpen ? "rotate-90" : ""
            }`}
          />
        )}
      </div>
      {hasChildren && isOpen && (
        <ul className="bg-gray-50/50">
          {category.children?.map((child: any) => (
            <li key={child.id} className="border-t border-gray-200">
              <Link
                href={`/products?category=${child.slug}`}
                className="flex items-center gap-3 p-3 pl-5 cursor-pointer hover:bg-gray-100"
              >
                <Image
                  src={child.icon || "/icons/category/e-gifts.svg"}
                  alt=""
                  width={20}
                  height={20}
                  className="w-5 h-5 object-contain"
                />
                <span className="text-sm text-gray-700">{child.name}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </li>
  );
}

export default function CategoriesSidebar() {
  const { data: smartCategories, isLoading } = api.category.getSmart.useQuery();

  if (isLoading) {
    return (
      <div className="h-full flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <h3 className="font-bold text-xl text-gray-800">Categories</h3>
        </div>
        <div className="flex-1 overflow-y-auto p-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="mb-4">
              <div className="flex items-center gap-3 p-4">
                <div className="w-6 h-6 bg-gray-200 rounded animate-pulse" />
                <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!smartCategories || smartCategories.length === 0) {
    return (
      <div className="h-full flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <h3 className="font-bold text-xl text-gray-800">Categories</h3>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <p className="text-gray-500">No categories available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b border-gray-200">
        <h3 className="font-bold text-xl text-gray-800">Categories</h3>
      </div>
      <div className="flex-1 overflow-y-auto">
        <ul className="divide-y divide-gray-200">
          {smartCategories.map((cat: any) => (
            <CategoryItem key={cat.id} category={cat} />
          ))}
        </ul>
      </div>
    </div>
  );
}
