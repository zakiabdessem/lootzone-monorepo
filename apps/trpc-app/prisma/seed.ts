import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Helper function to create slug from name
function createSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "") // Remove special characters
    .replace(/\s+/g, "-") // Replace spaces with hyphens
    .replace(/-+/g, "-") // Replace multiple hyphens with single
    .trim();
}

// Smart categories data (parent categories)
const smartCategories = [
  {
    name: "Design",
    description: "Creative design tools and software",
    icon: "/icons/category/adobe.svg",
    color: "#FF6B35",
    displayOrder: 1,
    type: "smart",
  },
  {
    name: "Tools",
    description: "Development and productivity tools",
    icon: "/icons/category/visual-studio.svg",
    color: "#4285F4",
    displayOrder: 2,
    type: "smart",
  },
  {
    name: "Entertainment",
    description: "Streaming and media services",
    icon: "/icons/category/netflix.svg",
    color: "#E50914",
    displayOrder: 3,
    type: "smart",
  },
  {
    name: "Gaming",
    description: "Games and gaming platforms",
    icon: "/icons/category/games.svg",
    color: "#00D4AA",
    displayOrder: 4,
    type: "smart",
  },
  {
    name: "Software",
    description: "Operating systems and applications",
    icon: "/icons/category/windows.svg",
    color: "#0078D4",
    displayOrder: 5,
    type: "smart",
  },
];

// Product categories data (based on your category.ts file)
const productCategories = [
  // Design subcategories
  {
    name: "Figma",
    icon: "/icons/category/figma.svg",
    parent: "Design",
    displayOrder: 1,
  },
  {
    name: "Adobe",
    icon: "/icons/category/adobe.svg",
    parent: "Design",
    displayOrder: 2,
  },
  {
    name: "3D Modeling",
    icon: "/icons/category/3d-modeling.png",
    parent: "Design",
    displayOrder: 3,
  },
  {
    name: "Canva",
    icon: "/icons/category/canva.svg",
    parent: "Design",
    displayOrder: 4,
  },

  // Tools subcategories
  {
    name: "Programming",
    icon: "/icons/category/visual-studio.svg",
    parent: "Tools",
    displayOrder: 1,
  },
  {
    name: "Antivirus",
    icon: "/icons/category/security-shield.png",
    parent: "Tools",
    displayOrder: 2,
  },
  {
    name: "Discord",
    icon: "/icons/category/discord.svg",
    parent: "Tools",
    displayOrder: 3,
  },

  // Entertainment subcategories
  {
    name: "Netflix",
    icon: "/icons/category/netflix.svg",
    parent: "Entertainment",
    displayOrder: 1,
  },
  {
    name: "Crunchyroll",
    icon: "/icons/category/crunchyroll.svg",
    parent: "Entertainment",
    displayOrder: 2,
  },
  {
    name: "Hulu",
    icon: "/icons/category/hulu.svg",
    parent: "Entertainment",
    displayOrder: 3,
  },
  {
    name: "Disney+",
    icon: "/icons/category/disney-plus.svg",
    parent: "Entertainment",
    displayOrder: 4,
  },
  {
    name: "HBO Max",
    icon: "/icons/category/hbo-max.svg",
    parent: "Entertainment",
    displayOrder: 5,
  },
  {
    name: "Deezer",
    icon: "/icons/category/deezer.png",
    parent: "Entertainment",
    displayOrder: 6,
  },
  {
    name: "Spotify",
    icon: "/icons/category/spotify.svg",
    parent: "Entertainment",
    displayOrder: 7,
  },
  {
    name: "Dazn",
    icon: "/icons/category/dazn.png",
    parent: "Entertainment",
    displayOrder: 8,
  },

  // Gaming subcategories
  {
    name: "Valorant",
    icon: "/icons/category/valorant.svg",
    parent: "Gaming",
    displayOrder: 1,
  },
  {
    name: "League of Legends",
    icon: "/icons/category/riot-games.svg",
    parent: "Gaming",
    displayOrder: 2,
  },
  {
    name: "Fortnite",
    icon: "/icons/category/fortnite.svg",
    parent: "Gaming",
    displayOrder: 3,
  },
  {
    name: "Minecraft",
    icon: "/icons/category/minecraft.png",
    parent: "Gaming",
    displayOrder: 4,
  },
  {
    name: "Steam",
    icon: "/icons/category/steam.svg",
    parent: "Gaming",
    displayOrder: 5,
  },
  {
    name: "Playstation",
    icon: "/icons/category/psn.svg",
    parent: "Gaming",
    displayOrder: 6,
  },
  {
    name: "Xbox",
    icon: "/icons/category/xbox.svg",
    parent: "Gaming",
    displayOrder: 7,
  },
  {
    name: "ChatGPT",
    icon: "/icons/category/chatgpt.svg",
    parent: "Gaming",
    displayOrder: 8,
  },

  // Software subcategories
  {
    name: "Windows",
    icon: "/icons/category/windows.svg",
    parent: "Software",
    displayOrder: 1,
  },
  {
    name: "Google Play",
    icon: "/icons/category/google-play.svg",
    parent: "Software",
    displayOrder: 2,
  },
  {
    name: "Apple",
    icon: "/icons/category/apple.svg",
    parent: "Software",
    displayOrder: 3,
  },
];

// Simple categories (for different UI contexts)
const simpleCategories = [
  {
    name: "Games",
    icon: "/icons/category/games.svg",
    type: "simple",
    displayOrder: 1,
    color: "#00D4AA",
  },
  {
    name: "Gaming eCards",
    icon: "/icons/category/e-cards-games.svg",
    type: "simple",
    displayOrder: 2,
    color: "#FF6B35",
  },
  {
    name: "eGift Cards",
    icon: "/icons/category/e-gifts.svg",
    type: "simple",
    displayOrder: 3,
    color: "#9C27B0",
  },
  {
    name: "E-money",
    icon: "/icons/category/e-money.svg",
    type: "simple",
    displayOrder: 4,
    color: "#4CAF50",
  },
  {
    name: "Steam Gift Cards",
    icon: "/icons/category/e-card-steam.svg",
    type: "simple",
    displayOrder: 5,
    color: "#1B2838",
  },
  {
    name: "PSN",
    icon: "/icons/category/psn.svg",
    type: "simple",
    displayOrder: 6,
    color: "#003087",
  },
  {
    name: "FIFA",
    icon: "/icons/category/fifa.svg",
    type: "simple",
    displayOrder: 7,
    color: "#326295",
  },
];

async function main() {
  console.log("🌱 Starting category seeding...");

  // Create smart categories (parent categories)
  console.log("📁 Creating smart categories...");
  const createdSmartCategories = new Map<string, string>();

  for (const category of smartCategories) {
    const created = await prisma.category.upsert({
      where: { slug: createSlug(category.name) },
      update: {},
      create: {
        name: category.name,
        slug: createSlug(category.name),
        description: category.description,
        icon: category.icon,
        color: category.color,
        displayOrder: category.displayOrder,
        type: category.type,
        isActive: true,
      },
    });
    createdSmartCategories.set(category.name, created.id);
    console.log(`  ✅ Created smart category: ${category.name}`);
  }

  // Create product categories (subcategories)
  console.log("🏷️  Creating product categories...");
  for (const category of productCategories) {
    const parentId = createdSmartCategories.get(category.parent);
    if (!parentId) {
      console.log(
        `  ⚠️  Parent category "${category.parent}" not found for "${category.name}"`
      );
      continue;
    }

    await prisma.category.upsert({
      where: { slug: createSlug(category.name) },
      update: {},
      create: {
        name: category.name,
        slug: createSlug(category.name),
        icon: category.icon,
        displayOrder: category.displayOrder,
        type: "product",
        parentId: parentId,
        isActive: true,
      },
    });
    console.log(
      `  ✅ Created product category: ${category.name} (under ${category.parent})`
    );
  }

  // Create simple categories
  console.log("🎯 Creating simple categories...");
  for (const category of simpleCategories) {
    await prisma.category.upsert({
      where: { slug: createSlug(category.name) },
      update: {},
      create: {
        name: category.name,
        slug: createSlug(category.name),
        icon: category.icon,
        displayOrder: category.displayOrder,
        type: category.type,
        color: category.color,
        isActive: true,
      },
    });
    console.log(`  ✅ Created simple category: ${category.name}`);
  }

  // Create some additional utility categories
  console.log("🔧 Creating utility categories...");
  const utilityCategories = [
    {
      name: "Featured",
      slug: "featured",
      icon: "/icons/category/games.svg",
      color: "#FFD700",
      displayOrder: 0,
      type: "utility",
      description: "Featured products and deals",
    },
    {
      name: "Popular",
      slug: "popular",
      icon: "/icons/category/games.svg",
      color: "#FF4081",
      displayOrder: 0,
      type: "utility",
      description: "Most popular products",
    },
    {
      name: "New Arrivals",
      slug: "new-arrivals",
      icon: "/icons/category/games.svg",
      color: "#00BCD4",
      displayOrder: 0,
      type: "utility",
      description: "Latest additions to our catalog",
    },
  ];

  for (const category of utilityCategories) {
    await prisma.category.upsert({
      where: { slug: category.slug },
      update: {},
      create: category,
    });
    console.log(`  ✅ Created utility category: ${category.name}`);
  }

  const totalCategories = await prisma.category.count();
  console.log(
    `🎉 Seeding completed! Created ${totalCategories} categories total.`
  );

  // Display category hierarchy
  console.log("\n🌳 Category Hierarchy:");
  const categories = await prisma.category.findMany({
    where: { parentId: null },
    include: {
      children: {
        orderBy: { displayOrder: "asc" },
      },
    },
    orderBy: { displayOrder: "asc" },
  });

  for (const category of categories) {
    console.log(`📁 ${category.name} (${category.type})`);
    if (category.children.length > 0) {
      for (const child of category.children) {
        console.log(`  └── ${child.name}`);
      }
    }
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error("❌ Seeding failed:", e);
    await prisma.$disconnect();
    process.exit(1);
  });
