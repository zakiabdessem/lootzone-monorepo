import { HydrateClient, api } from "~/trpc/server";
import ProductsClient from "./ProductsClient";

// Data comes from API via tRPC

export const revalidate = 60;

export default async function ProductsPage() {
  await api.product.list.prefetch({ limit: 60 });
  return (
    <HydrateClient>
      <ProductsClient />
    </HydrateClient>
  );
}
