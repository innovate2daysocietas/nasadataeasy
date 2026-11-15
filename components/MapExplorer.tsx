"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { MapContainer, TileLayer, CircleMarker, Popup, useMapEvents, useMap } from "react-leaflet";
import type { LatLngTuple } from "leaflet";
import { Bookmark, Check, ChevronDown, ChevronUp, CloudRain, Compass, Copy, ExternalLink, Info, LoaderCircle, MapPin, RefreshCw, Share2, Sun, Thermometer, Wind } from "lucide-react";
import type { Story } from "@/lib/story";
import "leaflet/dist/leaflet.css";

type Coords={lat:number;lon:number};
const JUMPS:{name:string;coords:Coords}[]=[{name:"Kampala, Uganda",coords:{lat:0.3476,lon:32.5825}},{name:"Lira, Uganda",coords:{lat:2.2499,lon:32.9000}},{name:"Gulu, Uganda",coords:{lat:2.7724,lon:32.2881}},{name:"Soroti, Uganda",coords:{lat:1.7150,lon:33.6111}},{name:"Mbarara, Uganda",coords:{lat:-0.6072,lon:30.6545}},{name:"Nairobi, Kenya",coords:{lat:-1.2864,lon:36.8172}},{name:"Lagos, Nigeria",coords:{lat:6.5244,lon:3.3792}},{name:"New Delhi, India",coords:{lat:28.6139,lon:77.2090}}];
function Pick({onPick}:{onPick:(c:Coords)=>void}){useMapEvents({click:event=>onPick({lat:event.latlng.lat,lon:event.latlng.lng})});return null;}
function Jump({location}:{location:Coords}){const map=useMap();useEffect(()=>{map.flyTo([location.lat,location.lon],Math.max(map.getZoom(),7),{duration:1.2})},[location,map]);return null;}
function num(n:number,places=1){return n.toLocaleString("en-US",{maximumFractionDigits:places,minimumFractionDigits:places});}
const fmtCoords=(c:Coords)=>`${c.lat.toFixed(3)}°, ${c.lon.toFixed(3)}°`;
export default function MapExplorer(){
 const [coords,setCoords]=useState<Coords>({lat:1.3733,lon:32.2903});
 const [story,setStory]=useState<Story|null>(null);
 const [loading,setLoading]=useState(false);
 const [error,setError]=useState("");
 const [locationName,setLocationName]=useState("Uganda · selected point");
 const [search,setSearch]=useState("");
 const [base,setBase]=useState<"streets"|"satellite">("streets");
 const [expanded,setExpanded]=useState(false);
 const [copied,setCopied]=useState(false);

 const controller=useRef<AbortController|null>(null);
 const makeRequest=useCallback(async(point:Coords,name?:string)=>{
   controller.current?.abort();const c=new AbortController();controller.current=c;
   setCoords(point);setStory(null);setError("");setLoading(true);setExpanded(false);setCopied(false);
   if(name)setLocationName(name);else setLocationName(`Selected point · ${point.lat.toFixed(2)}°, ${point.lon.toFixed(2)}°`);
   const url=new URL(window.location.href);url.searchParams.set("lat",point.lat.toFixed(5));url.searchParams.set("lon",point.lon.toFixed(5));window.history.replaceState({},"",url.toString());
   try {const r=await fetch(`/api/story?lat=${encodeURIComponent(point.lat.toFixed(5))}&lon=${encodeURIComponent(point.lon.toFixed(5))}`,{signal:c.signal});const data=await r.json();if(!r.ok)throw new Error(typeof data.error==="string"?data.error:"We couldn't read this location right now.");if(!c.signal.aborted)setStory(data as Story);}
   catch(err){if(!c.signal.aborted)setError(err instanceof Error?err.message:"We couldn't load NASA data.");}
   finally{if(!c.signal.aborted)setLoading(false);}
 },[]);
 useEffect(()=>{const params=new URLSearchParams(window.location.search);const lat=Number(params.get("lat"));const lon=Number(params.get("lon"));const valid=params.has("lat")&&params.has("lon")&&Number.isFinite(lat)&&Number.isFinite(lon)&&Math.abs(lat)<=90&&Math.abs(lon)<=180;void makeRequest(valid?{lat,lon}:{lat:1.3733,lon:32.2903},valid?"Shared location":"Uganda · selected point");return ()=>controller.current?.abort();},[makeRequest]);
 const selectedName=locationName.startsWith("Selected point")?"this location":locationName;
 const shareText=story?`NASADATA EASY · ${selectedName}\n${story.headline}\n${story.narrative}\nWhat this means: ${story.takeaway}\nOne thing to try: ${story.suggestion}\nNASA POWER observations: ${story.startDate} to ${story.endDate}\nExplore at ${typeof window!=="undefined"?`${location.origin}/map?lat=${coords.lat.toFixed(5)}&lon=${coords.lon.toFixed(5)}`:"NASADATA EASY"}`:"";
 const share=async()=>{if(!story)return;try{if(navigator.share){await navigator.share({title:`NASADATA EASY — ${selectedName}`,text:shareText});return;}await navigator.clipboard.writeText(shareText);setCopied(true);window.setTimeout(()=>setCopied(false),2400);}catch{/* A user cancelling native sharing is not a page error. */}};
 const copy=async()=>{if(!story)return;try{await navigator.clipboard.writeText(shareText);setCopied(true);window.setTimeout(()=>setCopied(false),2400);}catch{setError("Your browser blocked copying. Please use the share control or select the story text.");}};
 const changeLocation=(c:Coords,name?:string)=>{setSearch("");void makeRequest(c,name);};
 return <div className="map-layout"><section className="map-section" aria-label="Interactive global map">
   <MapContainer center={[1.3733,32.2903]} zoom={6} zoomControl={false} className="leaflet-map" scrollWheelZoom={true}>
     {base==="streets"?<TileLayer attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"/>:<TileLayer attribution='Tiles &copy; Esri &mdash; Source: Esri, Maxar, Earthstar Geographics and partners' url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"/>}
     <Pick onPick={c=>changeLocation(c)}/><Jump location={coords}/>
     <CircleMarker center={[coords.lat,coords.lon] as LatLngTuple} radius={12} pathOptions={{color:"#ffffff",weight:3,fillColor:story?.wetness==="wetter"?"#238879":story?.wetness==="drier"?"#d28c4c":"#247ab8",fillOpacity:.95}}><Popup>Selected location<br/>{fmtCoords(coords)}</Popup></CircleMarker>
   </MapContainer>
   <div className="map-topbar"><span className="live-pip"/><span>EARTH EXPLORER</span><span className="map-topbar-label">Click anywhere to tell its story</span></div>
   <div className="map-search"><label><Compass size={18}/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search quick locations…" aria-label="Search preset locations"/></label>{search.trim()&&<div className="map-search-results">{JUMPS.filter(j=>j.name.toLowerCase().includes(search.trim().toLowerCase())).map(j=><button key={j.name} onClick={()=>changeLocation(j.coords,j.name)}><MapPin size={15}/>{j.name}</button>)}{!JUMPS.some(j=>j.name.toLowerCase().includes(search.trim().toLowerCase()))&&<p>No matching shortcut. Click anywhere on the map instead.</p>}</div>}</div>
   <div className="map-bottom"><div className="base-switch"><button className={base==="streets"?"active":""} onClick={()=>setBase("streets")}>Streets</button><button className={base==="satellite"?"active":""} onClick={()=>setBase("satellite")}>Satellite</button></div><div className="map-tip"><MapPin size={15}/> {fmtCoords(coords)}</div></div>
  </section>
  <aside className="story-side" aria-live="polite">
   <div className="side-top"><div><span className="eyebrow">A PLACE, A STORY</span><h1>What is Earth saying?</h1></div></div>
   <div className="place-select"><MapPin size={17}/><div><span>EXPLORING</span><strong>{locationName}</strong></div><button onClick={()=>void makeRequest(coords,locationName)} disabled={loading} title="Refresh this location" aria-label="Refresh this location"><RefreshCw size={17} className={loading?"spin":""}/></button></div>
   {loading&&<div className="story-loading" role="status"><LoaderCircle className="spin" size={35}/><h2>Reading NASA observations…</h2><p>Looking at the latest available daily rainfall and temperature for this point.</p><div className="skeleton-line"/><div className="skeleton-line short"/><div className="skeleton-line"/></div>}
   {!loading&&error&&<div className="story-error" role="alert"><Info size={26}/><h2>The story couldn't load</h2><p>{error}</p><p>We won't replace missing NASA observations with made-up values.</p><button className="button button-dark" onClick={()=>void makeRequest(coords,locationName)}>Try again <RefreshCw size={16}/></button></div>}
   {!loading&&story&&<div className="story-body"><div className={`weather-tag ${story.wetness}`}><span/> {story.wetness==="wetter"?"RAIN-FILLED PERIOD":story.wetness==="drier"?"LOW-RAIN PERIOD":"MIXED RAINFALL PERIOD"}</div><h2 className="story-title">{story.headline}</h2><p className="story-narrative">{story.narrative}</p><div className="story-meaning"><strong>WHAT THIS MEANS FOR YOU</strong><p>{story.takeaway}</p></div><div className="suggestion"><span><Sun size={18}/></span><div><strong>One thing to try</strong><p>{story.suggestion}</p></div></div><div className="story-actions"><button onClick={()=>void share()}><Share2 size={17}/> Share story</button><button onClick={()=>void copy()}>{copied?<Check size={17}/>:<Copy size={17}/>} {copied?"Copied":"Copy text"}</button></div><button className="tech-toggle" aria-expanded={expanded} onClick={()=>setExpanded(!expanded)}><span>See technical details</span>{expanded?<ChevronUp size={18}/>:<ChevronDown size={18}/>}</button>{expanded&&<div className="tech-detail"><div className="metric-grid"><Metric icon={<CloudRain size={17}/>} label="Rain (7 days)" value={`${num(story.metrics.rain7)} mm`}/><Metric icon={<CloudRain size={17}/>} label="Rain (observed period)" value={`${num(story.metrics.rain30)} mm`}/><Metric icon={<Thermometer size={17}/>} label="Average air temperature" value={`${num(story.metrics.tempAverage)} °C`}/><Metric icon={<Wind size={17}/>} label="Average wind" value={story.metrics.windAverage===null?"Unavailable":`${num(story.metrics.windAverage)} m/s`}/><Metric icon={<Sun size={17}/>} label="Average sunlight" value={story.metrics.solarAverage===null?"Unavailable":`${num(story.metrics.solarAverage,2)} kWh/m²/day`}/><Metric icon={<CloudRain size={17}/>} label="Average humidity" value={story.metrics.humidityAverage===null?"Unavailable":`${num(story.metrics.humidityAverage)}%`}/></div><p className="methodology">{story.methodology}</p></div>}<div className="observation-note"><div><Bookmark size={16}/><strong>NASA POWER · daily observations</strong></div><p>Period: {story.startDate} — {story.endDate}. This is not a live weather report or forecast. Latest available observations may be delayed.</p><a href="https://power.larc.nasa.gov/" target="_blank" rel="noopener noreferrer">Visit NASA POWER <ExternalLink size={14}/></a></div></div>}
   {!loading&&!story&&!error&&<p className="story-empty">Choose a point on the map to explore.</p>}
  </aside></div>;
}
function Metric({icon,label,value}:{icon:React.ReactNode;label:string;value:string}){return <div className="metric"><div>{icon}<span>{label}</span></div><strong>{value}</strong></div>}
