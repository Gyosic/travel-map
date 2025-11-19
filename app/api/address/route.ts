import { NextRequest, NextResponse } from "next/server";
import z from "zod";

const key = process.env.VWORLD_API_KEY;
const schema = z.object({
  type: z.enum(["ROAD", "PARCEL", "BOTH"]).default("ROAD"),
  address: z.string().optional(),
  point: z.string().optional(),
  request: z.enum(["getCoord", "getAddress"]).default("getCoord"),
});

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const { type, address, request, point } = await schema.parseAsync(
      Object.fromEntries(searchParams),
    );

    let data;
    if (request === "getCoord") {
      const res = await fetch(
        `https://api.vworld.kr/req/address?service=address&type=${type}&request=getCoord&key=${key}&format=json&address=${address}`,
      );

      data = await res.json();
    } else if (request === "getAddress") {
      const res = await fetch(
        `https://api.vworld.kr/req/address?service=address&crs=epsg:4326&type=${type}&request=getAddress&key=${key}&format=json&point=${point}`,
      );

      data = await res.json();
    }

    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json(err, { status: 500 });
  }
}
