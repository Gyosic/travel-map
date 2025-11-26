import { AddButton } from "@/components/shared/AddButton";
import { FooterNavbar } from "@/components/shared/FooterNavbar";

export default function DefaultLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      {children}
      <AddButton />
      <FooterNavbar />
    </>
  );
}
