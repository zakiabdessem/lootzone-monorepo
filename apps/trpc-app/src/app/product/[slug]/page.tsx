import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { api } from "~/trpc/server";
import ProductView from "./ProductView";

type PageProps = { params: Promise<{ slug: string }> };

export const revalidate = 60;

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await api.product.getBySlug.fetch({ slug });
  if (!product) return {};

  const title = product.title;
  const description = product.description;
  const url = `/product/${product.slug}`;

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      images: product.image ? [{ url: product.image }] : undefined,
      type: "product",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: product.image ? [product.image] : undefined,
    },
  };
}

export default async function ProductDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const product = await api.product.getBySlug.fetch({ slug });
  if (!product) notFound();

  const firstVariant = product.variants?.[0];
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.title,
    description: product.description,
    image: product.image ? [product.image] : [],
    sku: product.id,
    offers: firstVariant
      ? {
          "@type": "Offer",
          price: firstVariant.price,
          priceCurrency: "DZD",
          availability: "https://schema.org/InStock",
          url: `/product/${product.slug}`,
        }
      : undefined,
  } as const;

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ProductView product={product as any} />
    </>
  );
}
