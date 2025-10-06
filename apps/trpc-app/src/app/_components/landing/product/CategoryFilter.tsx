"use client";

import { ChevronDown, ChevronRight } from "lucide-react";
import Image from "next/image";
import React, { useEffect, useRef, useState } from "react";
import { api } from "~/trpc/react";

interface CategoryFilterProps {
  selectedCats: Set<string>;
  setSelectedCats: React.Dispatch<React.SetStateAction<Set<string>>>;
}

// Type for category from database
type CategoryNode = {
  id: string;
  name: string;
  slug: string;
  icon: string | null;
  children?: CategoryNode[];
  parent?: CategoryNode | null;
};

export const CategoryFilter: React.FC<CategoryFilterProps> = ({
  selectedCats,
  setSelectedCats,
}) => {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({
    subscriptions: true,
  });
  const { data: smartCategories, isLoading } = api.category.getSmart.useQuery();

  // Auto-expand parent categories when all their children are selected
  useEffect(() => {
    if (!smartCategories) return;

    const newExpanded: Record<string, boolean> = { ...expanded };
    
    smartCategories.forEach((category) => {
      if (category.children && category.children.length > 0) {
        const childSlugs = category.children.map((child) => child.slug);
        const allChildrenSelected = childSlugs.every((slug) => selectedCats.has(slug));
        const someChildrenSelected = childSlugs.some((slug) => selectedCats.has(slug));
        
        // Expand if all or some children are selected
        if (allChildrenSelected || someChildrenSelected) {
          newExpanded[category.id] = true;
        }
      }
    });

    setExpanded(newExpanded);
  }, [smartCategories, selectedCats]);

  const toggleExpand = (id: string) => {
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleSelect = (node: CategoryNode) => {
    setSelectedCats((prev) => {
      const newSet = new Set(prev);

      if (node.children && node.children.length > 0) {
        // Parent node: toggle all children
        const childSlugs = node.children.map((child) => child.slug);
        const allSelected = childSlugs.every((slug) => newSet.has(slug));
        childSlugs.forEach((slug) => {
          if (allSelected) newSet.delete(slug);
          else newSet.add(slug);
        });
      } else {
        // Leaf node: toggle individual
        if (newSet.has(node.slug)) newSet.delete(node.slug);
        else newSet.add(node.slug);
      }

      return newSet;
    });
  };

  // Recursive component for tree nodes
  const TreeNode: React.FC<{
    node: CategoryNode;
    depth?: number;
  }> = ({ node, depth = 0 }) => {
    const checkboxRef = useRef<HTMLInputElement>(null);
    const hasChildren = !!(node.children && node.children.length > 0);
    const isExpanded = !!expanded[node.id];

    // Calculate selection states
    const childSlugs = node.children?.map((child) => child.slug) || [];
    const allSelected = hasChildren
      ? childSlugs.every((slug) => selectedCats.has(slug))
      : selectedCats.has(node.slug);
    const someSelected = hasChildren
      ? childSlugs.some((slug) => selectedCats.has(slug))
      : selectedCats.has(node.slug);
    const isLeaf = !hasChildren;

    // Set indeterminate state for parent nodes
    useEffect(() => {
      if (checkboxRef.current && hasChildren) {
        checkboxRef.current.indeterminate = someSelected && !allSelected;
      }
    }, [someSelected, allSelected, hasChildren]);

    return (
      <div key={node.id} style={{ marginLeft: depth * 16 }}>
        <div className="flex items-center gap-1 cursor-pointer select-none">
          {/* Expand/collapse icon */}
          <span
            className="w-6 h-6 flex items-center justify-center"
            onClick={(e) => {
              e.stopPropagation();
              if (hasChildren) toggleExpand(node.id);
            }}
          >
            {hasChildren ? (
              isExpanded ? (
                <ChevronDown className="w-4 h-4 text-gray-500" />
              ) : (
                <ChevronRight className="w-4 h-4 text-gray-500" />
              )
            ) : null}
          </span>

          {/* Checkbox */}
          <input
            ref={checkboxRef}
            type="checkbox"
            checked={isLeaf ? selectedCats.has(node.slug) : allSelected}
            onChange={() => toggleSelect(node)}
            className="accent-[#4618AC] w-4 h-4 rounded border-gray-300 focus:ring-0 focus:outline-none mr-1"
            onClick={(e) => e.stopPropagation()}
          />

          {/* Icon */}
          <span className="w-6 h-6 flex items-center justify-center [&_img]:brightness-0 [&_img]:saturate-100 [&_img]:[filter:invert(23%)_sepia(89%)_saturate(2574%)_hue-rotate(257deg)_brightness(76%)_contrast(101%)]">
            <Image
              src={node.icon || "/icons/icons8-file.svg"}
              alt="category"
              width={24}
              height={25}
            />
          </span>

          {/* Label */}
          <span
            className={`text-sm ${
              someSelected ? "font-semibold text-[#4618AC]" : "text-[#212121]"
            }`}
            onClick={() => toggleSelect(node)}
          >
            {node.name}
          </span>
        </div>

        {/* Children */}
        {hasChildren && isExpanded && (
          <div className="space-y-1 mt-1">
            {node.children!.map((child) => (
              <TreeNode key={child.id} node={child} depth={depth + 1} />
            ))}
          </div>
        )}
      </div>
    );
  };

  // Skeleton loader component
  if (isLoading) {
    return (
      <div className="space-y-3">
        {/* Skeleton for parent categories */}
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-gray-200 rounded animate-pulse" />
              <div className="w-4 h-4 bg-gray-200 rounded animate-pulse" />
              <div className="w-5 h-5 bg-gray-200 rounded animate-pulse" />
              <div className="h-4 bg-gray-200 rounded animate-pulse flex-1" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {smartCategories?.map((node) => (
        <TreeNode key={node.id} node={node} />
      ))}
    </div>
  );
};
