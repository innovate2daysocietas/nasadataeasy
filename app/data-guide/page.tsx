import type { Metadata } from "next";
import DataGuide from "@/components/DataGuide";
import items from "@/lib/datasets.json";
export const metadata:Metadata={title:"NASA Data Guide"};
export default function Guide(){return <><section className="page-hero guide-hero container"><div className="eyebrow">THE NASA DATA GUIDE</div><h1>Earth data, <em>explained simply.</em></h1><p>Explore {items.length} real NASA Earth observation data products and resources. Understand what each one measures, why it matters, and where to find it in NASA's official catalog.</p><div className="guide-note">These links open targeted searches in the official NASA Earthdata catalog. Product versions and coverage can change; review each catalog record before use. Not every dataset powers the live NASADATA EASY map.</div></section><section className="container guide-section"><DataGuide/></section></>}
