export type Daily = { date: string; rain: number | null; temperature: number | null; humidity: number | null; wind: number | null; sunlight: number | null };
export type Story = { location: { lat: number; lon: number }; headline: string; narrative: string; takeaway: string; suggestion: string; wetness: "wetter" | "mixed" | "drier"; metrics: { rain7: number; rain30: number; rainDays: number; tempAverage: number; humidityAverage: number | null; windAverage: number | null; solarAverage: number | null }; observations: Daily[]; startDate: string; endDate: string; source: string; generatedAt: string; methodology: string };
const sum = (values: number[]) => values.reduce((a,b)=>a+b,0);
const avg = (values: number[]) => values.length ? sum(values)/values.length : null;
const round = (n:number, digits=1) => Number(n.toFixed(digits));
const available = (list:Daily[], key:keyof Daily) => list.map(d=>d[key]).filter((n):n is number=>typeof n === "number" && Number.isFinite(n));

// Descriptive bands are editorial rules of thumb; not climate anomaly, drought, or crop advice.
export function buildStory(lat:number, lon:number, input:Daily[], generatedAt = new Date().toISOString()):Story {
  const complete = input.filter(d=>d.rain !== null && d.temperature !== null).sort((a,b)=>a.date.localeCompare(b.date)).slice(-30);
  if(complete.length < 7) throw new Error("Not enough recent NASA observations are available to tell a reliable story for this point.");
  const rain30=round(sum(available(complete,"rain")));
  const rain7=round(sum(available(complete.slice(-7),"rain")));
  const tempAverage=round(avg(available(complete,"temperature"))!);
  const humidity=avg(available(complete,"humidity"));
  const wind=avg(available(complete,"wind"));
  const sun=avg(available(complete,"sunlight"));
  const rainyDays=complete.filter(d=>(d.rain??0)>=1).length;
  const perDay=rain30/complete.length;
  const wetness = perDay < 2 ? "drier" : perDay >= 5 ? "wetter" : "mixed";
  const windowText = `${complete.length} observed days from ${complete[0].date} to ${complete[complete.length-1].date}`;
  const heading=wetness==="drier" ? "Rain has been limited here lately" : wetness==="wetter" ? "Rain has been a regular part of recent days" : "A mix of rainy and dry days";
  const narrative=wetness==="drier" ? `Across ${windowText}, NASA recorded about ${rain30} mm of rain, with at least 1 mm on ${rainyDays} days. The average daily air temperature was ${tempAverage}°C. This describes recent conditions, not a long-term drought assessment.` : wetness==="wetter" ? `Across ${windowText}, NASA recorded around ${rain30} mm of rain, with at least 1 mm on ${rainyDays} days. Average daily air temperature was ${tempAverage}°C. These observations describe a relatively rain-filled recent window, not a flood forecast.` : `Across ${windowText}, NASA recorded around ${rain30} mm of rain spread across ${rainyDays} days with at least 1 mm, while the average daily air temperature was ${tempAverage}°C. Conditions varied through this period.`;
  const takeaway=wetness==="drier" ? "There may be less recent rainfall to replenish stored water or surface soils." : wetness==="wetter" ? "Recent rainfall may have helped replenish water, but actual ground conditions can differ." : "Recent rain has been uneven; checking local soil conditions can help with decisions.";
  const suggestion=wetness==="drier" ? "Check soil moisture before watering and consider storing water when it becomes available." : wetness==="wetter" ? "Check drainage and soil conditions before watering or fieldwork." : "Look at the next local forecast and check the soil before planning watering or fieldwork.";
  return {location:{lat,lon}, headline:heading,narrative,takeaway,suggestion,wetness,metrics:{rain7,rain30,rainDays:rainyDays,tempAverage,humidityAverage:humidity===null?null:round(humidity),windAverage:wind===null?null:round(wind),solarAverage:sun===null?null:round(sun,2)},observations:complete,startDate:complete[0].date,endDate:complete[complete.length-1].date,source:"NASA POWER Daily Point API",generatedAt,methodology:"Recent descriptive bands use rain per observed day: below 2 mm/day (drier), 2 to below 5 (mixed), 5 or above (wetter). These are not climate normals, forecasts or drought classifications."};
}
