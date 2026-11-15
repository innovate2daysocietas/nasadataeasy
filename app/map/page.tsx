import type { Metadata } from "next";
import MapShell from "@/components/MapShell";
export const metadata:Metadata={title:"Explore the map"};
export default function MapPage(){return <div className="explore-page"><MapShell/></div>}
