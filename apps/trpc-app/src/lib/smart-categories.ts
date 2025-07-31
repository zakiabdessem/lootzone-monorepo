import { useMemo, useState } from "react";

export type SmartCategoryNode = {
  id: string;
  name: string;
  category?: string; // For leaf nodes
  categoryGroup?: string[]; // For parent nodes
  children?: SmartCategoryNode[];
};

export const SMART_CATEGORIES: SmartCategoryNode[] = [
  {
    id: "design",
    name: "Design",
    children: [
      { id: "figma", name: "Figma", category: "Figma" },
      { id: "adobe", name: "Adobe", category: "Adobe" },
      { id: "3d-modeling", name: "3D Modeling", category: "3D Modeling" },
      { id: "canva", name: "Canva", category: "Canva" },
    ],
    categoryGroup: ["Figma", "Adobe", "3D Modeling", "Canva"],
  },
  {
    id: "tools",
    name: "Tools",
    categoryGroup: ["Programming", "Antivirus", "Discord"],
    children: [
      { id: "programming", name: "Programming", category: "Programming" },
      { id: "antivirus", name: "Antivirus", category: "Antivirus" },
      { id: "discord", name: "Discord", category: "Discord" },
    ],
  },
  {
    id: "entertainment",
    name: "Entertainment",
    children: [
      { id: "netflix", name: "Netflix", category: "Netflix" },
      { id: "crunchyroll", name: "Crunchyroll", category: "Crunchyroll" },
      { id: "hulu", name: "Hulu", category: "Hulu" },
      { id: "disney-plus", name: "Disney+", category: "Disney+" },
      { id: "hbo-max", name: "HBO Max", category: "HBO Max" },
      { id: "deezer", name: "Deezer", category: "Deezer" },
      { id: "spotify", name: "Spotify", category: "Spotify" },
      { id: "dazn", name: "Dazn", category: "Dazn" },
    ],
    categoryGroup: [
      "Netflix",
      "Crunchyroll",
      "Hulu",
      "Disney+",
      "HBO Max",
      "Deezer",
      "Spotify",
      "Dazn",
    ],
  },
  {
    id: "gaming",
    name: "Gaming",
    children: [
      { id: "valorant", name: "Valorant", category: "Valorant" },
      {
        id: "league-of-legends",
        name: "League of Legends",
        category: "League of Legends",
      },
      { id: "fortnite", name: "Fortnite", category: "Fortnite" },
      { id: "minecraft", name: "Minecraft", category: "Minecraft" },
      { id: "steam", name: "Steam", category: "Steam" },
      { id: "playstation", name: "Playstation", category: "Playstation" },
      { id: "xbox", name: "Xbox", category: "Xbox" },
      { id: "chatgpt", name: "ChatGPT", category: "ChatGPT" },
    ],
    categoryGroup: [
      "Valorant",
      "League of Legends",
      "Fortnite",
      "Minecraft",
      "Steam",
      "Playstation",
      "Xbox",
      "ChatGPT",
    ],
  },
  {
    id: "software",
    name: "Software",
    children: [
      { id: "windows", name: "Windows", category: "Windows" },
      { id: "google-play", name: "Google Play", category: "Google Play" },
    ],
    categoryGroup: ["Windows", "Google Play"],
  },
];

export function useSmartCategories() {
  return useMemo(() => SMART_CATEGORIES, []);
}
