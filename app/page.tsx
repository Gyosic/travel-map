import { CookieArea } from "@/components/shared/CookieArea";
import { Navbar } from "@/components/shared/Navbar";
import TravelMap from "@/components/shared/TravelMap";
import { site } from "@/config";

const getSidoGeojson = async () => {
  const sidoGeojson = await fetch(`${site.baseurl}/api/geojson/sido`);
  const sidoGeojsonData = await sidoGeojson.json();
  return sidoGeojsonData;
};

export default async function Home() {
  // const sggGeojson = await fetch(`${site.baseurl}/api/geojson/sgg`);

  const sidoGeojsonData = await getSidoGeojson();

  // const sggGeojsonData = await sggGeojson.json();
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex h-screen min-h-screen w-full max-w-3xl flex-col items-center bg-white sm:items-start dark:bg-black">
        <CookieArea>
          <Navbar navigationLinks={[]} />
        </CookieArea>
        <TravelMap sidoGeojson={sidoGeojsonData} />
      </main>
    </div>
  );
}
