import { AddButton } from "@/components/shared/AddButton";
import { CookieArea } from "@/components/shared/CookieArea";
import { FooterNavbar } from "@/components/shared/FooterNavbar";
import { Navbar } from "@/components/shared/Navbar";

export default function DefaultLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <CookieArea>
        <Navbar navigationLinks={[]} />
      </CookieArea>
      {children}
      <AddButton />
      <FooterNavbar />
    </>
  );
}
