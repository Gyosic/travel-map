import TravelMap from "@/components/shared/maplibre";
import { Navbar } from "@/components/shared/Navbar";
import { site } from "@/config";
import { CookieArea } from "@/components/shared/CookieArea";

export default async function Home() {
  // const sggGeojson = await fetch(`${site.baseurl}/api/geojson/sgg`);
  const sidoGeojson = await fetch(`${site.baseurl}/api/geojson/sido`);

  // const sggGeojsonData = await sggGeojson.json();
  const sidoGeojsonData = await sidoGeojson.json();

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex min-h-screen w-full h-screen max-w-3xl flex-col items-center bg-white dark:bg-black sm:items-start">
        <CookieArea>
          <Navbar navigationLinks={[]} />
        </CookieArea>
        <TravelMap sidoGeojson={sidoGeojsonData} />
      </main>
    </div>
  );
}
