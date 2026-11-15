import { NextRequest, NextResponse } from "next/server";
import { getNasaDaily } from "@/lib/nasa";
import { buildStory } from "@/lib/story";
export const runtime="nodejs";
export async function GET(req:NextRequest){
 const latRaw=req.nextUrl.searchParams.get("lat"); const lonRaw=req.nextUrl.searchParams.get("lon");
 if(latRaw===null||lonRaw===null||!latRaw.trim()||!lonRaw.trim()) return NextResponse.json({error:"Please provide latitude and longitude."},{status:400});
 const lat=Number(latRaw),lon=Number(lonRaw);
 if(!Number.isFinite(lat)||!Number.isFinite(lon)||Math.abs(lat)>90||Math.abs(lon)>180) return NextResponse.json({error:"Coordinates must be within latitude -90 to 90 and longitude -180 to 180."},{status:400});
 try {const daily=await getNasaDaily(lat,lon);return NextResponse.json(buildStory(lat,lon,daily),{headers:{"Cache-Control":"public, s-maxage=1800, stale-while-revalidate=3600"}});}catch(error){return NextResponse.json({error:error instanceof Error?error.message:"Unable to load NASA data."},{status:503});}
}
