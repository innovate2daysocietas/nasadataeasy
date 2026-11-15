import type { Daily } from "./story";
const PARAMETERS = ["PRECTOTCORR","T2M","RH2M","WS2M","ALLSKY_SFC_SW_DWN"] as const;
const compact=(d:Date)=>d.toISOString().slice(0,10).replaceAll("-","");
const value=(input:unknown):number|null=>typeof input==="number" && Number.isFinite(input) && input > -900 ? input : null;
type Result = { properties?: { parameter?: Record<string,Record<string,number>> } };
export async function getNasaDaily(lat:number,lon:number):Promise<Daily[]> {
 const end=new Date(); end.setUTCHours(0,0,0,0); end.setUTCDate(end.getUTCDate()-10);
 const start=new Date(end);start.setUTCDate(end.getUTCDate()-44);
 const url=new URL("https://power.larc.nasa.gov/api/temporal/daily/point");
 for (const [k,v] of Object.entries({parameters:PARAMETERS.join(","),community:"AG",longitude:String(lon),latitude:String(lat),start:compact(start),end:compact(end),format:"JSON"})) url.searchParams.set(k,v);
 let response:Response;
 try { response=await fetch(url.toString(),{signal:AbortSignal.timeout(14000),headers:{Accept:"application/json"},next:{revalidate:1800}}); } catch { throw new Error("NASA POWER could not be reached. Please try again shortly."); }
 if(!response.ok) throw new Error(`NASA POWER returned an error (${response.status}). Please retry this location.`);
 let json:Result;try {json=await response.json() as Result;}catch{throw new Error("NASA POWER returned unreadable data.");}
 const table=json.properties?.parameter;
 if(!table?.PRECTOTCORR || !table?.T2M) throw new Error("NASA did not return the rainfall and temperature observations needed for this story.");
 return Object.keys(table.PRECTOTCORR).filter(date=>/^\d{8}$/.test(date)).sort().map(date=>({
  date:`${date.slice(0,4)}-${date.slice(4,6)}-${date.slice(6,8)}`,
  rain:value(table.PRECTOTCORR?.[date]),temperature:value(table.T2M?.[date]),humidity:value(table.RH2M?.[date]),wind:value(table.WS2M?.[date]),sunlight:value(table.ALLSKY_SFC_SW_DWN?.[date])
 }));
}
