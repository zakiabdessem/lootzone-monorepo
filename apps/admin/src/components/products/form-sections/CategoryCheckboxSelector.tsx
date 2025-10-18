"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Box,
  Button,
  Checkbox,
  CircularProgress,
  FormControl,
  FormHelperText,
  IconButton,
  InputAdornment,
  TextField,
  Typography,
} from "@mui/material";
import {
  ChevronRight as ChevronRightIcon,
  ExpandMore as ExpandMoreIcon,
  Search as SearchIcon,
} from "@mui/icons-material";

interface CategoryRecord {
  id: string;
  name: string;
  parentId?: string | null;
  displayOrder?: number | null;
}

interface CategoryNode extends CategoryRecord {
  children: CategoryNode[];
}

interface CategoryCheckboxSelectorProps {
  categories: CategoryRecord[];
  selectedCategoryIds: string[];
  onChange: (categoryIds: string[]) => void;
  error?: boolean;
  helperText?: string;
  isLoading?: boolean;
}

export default function CategoryCheckboxSelector({
  categories,
  selectedCategoryIds,
  onChange,
  error = false,
  helperText,
  isLoading = false,
}: CategoryCheckboxSelectorProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());

  const selectedSet = useMemo(
    () => new Set(selectedCategoryIds),
    [selectedCategoryIds]
  );

  const { tree, descendantsMap, allCategoryIds } = useMemo(() => {
    const nodesById = new Map<string, CategoryNode>();
    const sortedCategories = [...categories].sort((a, b) => {
      const orderA = a.displayOrder ?? 0;
      const orderB = b.displayOrder ?? 0;
      if (orderA !== orderB) {
        return orderA - orderB;
      }
      return a.name.localeCompare(b.name);
    });

    sortedCategories.forEach((category) => {
      nodesById.set(category.id, {
        ...category,
        parentId: category.parentId ?? null,
        children: [],
      });
    });

    const roots: CategoryNode[] = [];

    nodesById.forEach((node) => {
      if (node.parentId && nodesById.has(node.parentId)) {
        nodesById.get(node.parentId)!.children.push(node);
      } else {
        roots.push(node);
      }
    });

    const buildDescendantsMap = (node: CategoryNode, map: Map<string, string[]>) => {
      const descendants: string[] = [];
      node.children.forEach((child) => {
        descendants.push(child.id);
        const childDescendants = buildDescendantsMap(child, map);
        descendants.push(...childDescendants);
      });
      map.set(node.id, descendants);
      return descendants;
    };

    const map = new Map<string, string[]>();
    roots.forEach((root) => {
      buildDescendantsMap(root, map);
    });

    const allIds = Array.from(nodesById.keys());

    return { tree: roots, descendantsMap: map, allCategoryIds: allIds };
  }, [categories]);

  const rootIds = useMemo(() => tree.map((node) => node.id), [tree]);

  useEffect(() => {
    if (rootIds.length === 0) {
      return;
    }
    setExpandedNodes((prev) => {
      const next = new Set(prev);
      rootIds.forEach((id) => next.add(id));
      return next;
    });
  }, [rootIds]);

  const filteredTree = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    if (!query) {
      return tree;
    }

    const filterNodes = (nodes: CategoryNode[]): CategoryNode[] => {
      return nodes
        .map((node) => {
          const filteredChildren = filterNodes(node.children);
          const matches = node.name.toLowerCase().includes(query);
          if (matches || filteredChildren.length) {
            return {
              ...node,
              children: filteredChildren,
            };
          }
          return null;
        })
        .filter((node): node is CategoryNode => node !== null);
    };

    return filterNodes(tree);
  }, [searchTerm, tree]);

  const isSearchActive = searchTerm.trim().length > 0;

  const displayedTree = isSearchActive ? filteredTree : tree;

  const getSelectionState = (node: CategoryNode) => {
    const descendants = descendantsMap.get(node.id) ?? [];
    const totalIds = [node.id, ...descendants];
    const selectedCount = totalIds.reduce(
      (count, id) => (selectedSet.has(id) ? count + 1 : count),
      0
    );

    if (selectedCount === 0) {
      return { checked: false, indeterminate: false };
    }

    if (selectedCount === totalIds.length) {
      return { checked: true, indeterminate: false };
    }

    return { checked: false, indeterminate: true };
  };

  const toggleNodeExpansion = (nodeId: string) => {
    setExpandedNodes((prev) => {
      const next = new Set(prev);
      if (next.has(nodeId)) {
        next.delete(nodeId);
      } else {
        next.add(nodeId);
      }
      return next;
    });
  };

  useEffect(() => {
    if (!isSearchActive) {
      return;
    }

    const collectIds = (nodes: CategoryNode[]): string[] => {
      const ids: string[] = [];
      const traverse = (node: CategoryNode) => {
        ids.push(node.id);
        node.children.forEach(traverse);
      };
      nodes.forEach(traverse);
      return ids;
    };

    const visibleIds = collectIds(filteredTree);
    setExpandedNodes((prev) => {
      const next = new Set(prev);
      visibleIds.forEach((id) => next.add(id));
      return next;
    });
  }, [filteredTree, isSearchActive]);

  const handleNodeToggle = (node: CategoryNode, checked: boolean) => {
    const descendants = descendantsMap.get(node.id) ?? [];
    const idsToUpdate = [node.id, ...descendants];

    if (checked) {
      const next = new Set(selectedSet);
      idsToUpdate.forEach((id) => next.add(id));
      onChange(Array.from(next));
      return;
    }

    const next = new Set(selectedSet);
    idsToUpdate.forEach((id) => next.delete(id));
    onChange(Array.from(next));
  };

  const selectAll = () => {
    onChange(allCategoryIds);
  };

  const clearAll = () => {
    onChange([]);
  };

  const renderTree = (nodes: CategoryNode[], depth = 0) => {
    return nodes.map((node) => {
      const hasChildren = node.children.length > 0;
      const { checked, indeterminate } = getSelectionState(node);
      const isExpanded = expandedNodes.has(node.id) || isSearchActive;

      return (
        <Box key={node.id}>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              py: 0.5,
              pl: depth * 2,
            }}
          >
            {hasChildren ? (
              <IconButton
                size="small"
                onClick={() => toggleNodeExpansion(node.id)}
                sx={{ mr: 1 }}
              >
                {isExpanded ? <ExpandMoreIcon fontSize="inherit" /> : <ChevronRightIcon fontSize="inherit" />}
              </IconButton>
            ) : (
              <Box sx={{ width: 24, mr: 1 }} />
            )}
            <Checkbox
              size="small"
              checked={checked}
              indeterminate={indeterminate}
              onChange={(event) => handleNodeToggle(node, event.target.checked)}
            />
            <Typography variant="body2" sx={{ flex: 1 }}>
              {node.name}
            </Typography>
          </Box>
          {hasChildren && isExpanded && (
            <Box sx={{ ml: 3 }}>{renderTree(node.children, depth + 1)}</Box>
          )}
        </Box>
      );
    });
  };

  return (
    <FormControl fullWidth error={error} component="fieldset">
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          mb: 1,
          gap: 1,
        }}
      >
        <Typography variant="subtitle1">Categories</Typography>
        <Box sx={{ display: "flex", gap: 1 }}>
          <Button size="small" variant="outlined" onClick={selectAll} disabled={isLoading || !categories.length}>
            Select All
          </Button>
          <Button size="small" variant="text" onClick={clearAll} disabled={isLoading}>
            Clear
          </Button>
        </Box>
      </Box>

      <TextField
        size="small"
        placeholder="Search categories"
        value={searchTerm}
        onChange={(event) => setSearchTerm(event.target.value)}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon fontSize="small" />
            </InputAdornment>
          ),
        }}
        sx={{ mb: 2 }}
      />

      <Box
        sx={{
          maxHeight: 260,
          overflowY: "auto",
          border: "1px solid",
          borderColor: error ? "error.main" : "divider",
          borderRadius: 1,
          p: 1,
        }}
      >
        {isLoading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
            <CircularProgress size={24} />
          </Box>
        ) : categories.length === 0 ? (
          <Typography variant="body2" color="text.secondary" align="center" sx={{ py: 3 }}>
            No categories available.
          </Typography>
        ) : displayedTree.length === 0 ? (
          <Typography variant="body2" color="text.secondary" align="center" sx={{ py: 3 }}>
            No categories match your search.
          </Typography>
        ) : (
          renderTree(displayedTree)
        )}
      </Box>

      {helperText && <FormHelperText>{helperText}</FormHelperText>}
    </FormControl>
  );
}
