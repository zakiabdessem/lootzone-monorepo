import { ReactNode } from "react";
import Doc from "@/layouts/Doc";

export const metadata = {
  title: {
    template: "%s | Mira - React Material UI Admin Dashboard",
    default: "Mira - React Material UI Admin Dashboard",
  },
  description:
    "A professional package that comes with plenty of UI components, forms, tables, charts, dashboards, pages and svg icons. Each one is fully customizable, responsive and easy to use.",
  keywords: [
    "mira",
    "mui",
    "material app",
    "react",
    "material",
    "kit",
    "dashboard",
    "application",
    "admin",
    "template",
    "theme",
  ],
  authors: [{ name: "Bootlab", url: "https://bootlab.io/" }],
  metadataBase: new URL("https://mira.bootlab.io"),
};

export default function Layout({ children }: { children: ReactNode }) {
  return <Doc>{children}</Doc>;
}
