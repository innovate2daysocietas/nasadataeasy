"use client";
import dynamic from "next/dynamic";
const MapExplorer=dynamic(()=>import("@/components/MapExplorer"),{ssr:false,loading:()=> <div className="map-loading">Preparing the interactive Earth map…</div>});
export default function MapShell(){return <MapExplorer/>}
