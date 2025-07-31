import { ReactNode } from "react";

export const metadata = {
  title: "Welcome",
};

export default function Layout({ children }: { children: ReactNode }) {
  return children;
}
