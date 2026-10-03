"use client";
import {useEffect,useRef,useState,useImperativeHandle} from 'react';
import maplibregl from 'maplibre-gl';
import {RiAddLine,RiSubtractLine,RiEarthLine,RiMap2Line,RiFocus3Line,RiLoader4Line} from '@remixicon/react';
import {createRoot} from 'react-dom/client';
import 'maplibre-gl/dist/maplibre-gl.css';
import {type Station,type Fuel,price,stations as allStations} from './data';
import StationDetails from './station-details';
export default function FuelMap({stations,fuel,selected,onSelect,navigation,locationRef}:{locationRef?:React.Ref<{locate:(done?:(error?:string)=>void)=>void}>;navigation:{coordinates:[number,number][];requestId:number}|null;stations:Station[];fuel:Fuel;selected:number|null;onSelect:(id:number|null)=>void}){
 const container=useRef<HTMLDivElement>(null),map=useRef<maplibregl.Map|null>(null),callback=useRef(onSelect);const [ready,setReady]=useState(false),[failed,setFailed]=useState(false),[isSatellite,setIsSatellite]=useState(false),[locating,setLocating]=useState(false),[locationError,setLocationError]=useState('');
 const locationMarker=useRef<maplibregl.Marker|null>(null);
 useImperativeHandle(locationRef,()=>({locate}));
 function locate(done?:(error?:string)=>void){
  if(!navigator.geolocation){setLocationError("La géolocalisation n’est pas disponible dans ce navigateur.");done?.("La géolocalisation n’est pas disponible dans ce navigateur.");return}
  const currentMap=map.current;setLocating(true);setLocationError('');
  navigator.geolocation.getCurrentPosition(position=>{
   if(!currentMap||map.current!==currentMap)return;
   setLocating(false);const center:[number,number]=[position.coords.longitude,position.coords.latitude];
   locationMarker.current?.remove();locationMarker.current=new maplibregl.Marker({color:"#000091"}).setLngLat(center).addTo(currentMap);
   currentMap.flyTo({center,zoom:13});callback.current(null);done?.();
  },error=>{if(map.current!==currentMap)return;setLocating(false);done?.(error.code===1?"Autorisez la localisation dans votre navigateur.":"Votre position n’a pas pu être obtenue. Réessayez.");setLocationError(error.code===1?"Autorisez la localisation dans votre navigateur pour vous situer sur la carte.":"Votre position n’a pas pu être obtenue. Réessayez.")},{enableHighAccuracy:false,timeout:10000,maximumAge:60000});
 }
 const values=stations.map(s=>s.prices[fuel]).filter((v):v is number=>v!==null).sort((a,b)=>a-b);
 const low=values[Math.floor(values.length/3)]??0,high=values[Math.floor(2*values.length/3)]??0;
 useEffect(()=>{callback.current=onSelect},[onSelect]);
 useEffect(()=>{if(!container.current)return;setReady(false);setFailed(false);let instance:maplibregl.Map;try{instance=new maplibregl.Map({container:container.current,style:'https://openmaptiles.geo.data.gouv.fr/styles/osm-bright/style.json',center:[2.4,46.6],zoom:5});map.current=instance;instance.on('click',()=>callback.current(null));instance.on('style.load',()=>{
 // Simplifier la mer sans modifier les cours d’eau ni les routes terrestres.
 for(const id of ['water-pattern','ferry','boundary-water']){if(instance.getLayer(id))instance.setLayoutProperty(id,'visibility','none')}

 instance.addSource('fuel-satellite',{type:'raster',tiles:['https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'],tileSize:256,attribution:'Imagerie © Esri'});
 const firstLabel=instance.getStyle().layers.find(layer=>layer.type==='symbol')?.id;
 instance.addLayer({id:'fuel-satellite',type:'raster',source:'fuel-satellite',layout:{visibility:'none'}},firstLabel);
 const bounds=new maplibregl.LngLatBounds();allStations.forEach(s=>bounds.extend(s.coordinates));instance.fitBounds(bounds,{padding:{top:110,bottom:160,left:55,right:55},maxZoom:12,duration:0});
 setReady(true);
 });instance.on('error',()=>setFailed(true));}catch{setFailed(true);return}const observer=new ResizeObserver(()=>instance.resize());observer.observe(container.current);return()=>{observer.disconnect();locationMarker.current?.remove();locationMarker.current=null;map.current=null;instance.remove()}},[]);
 useEffect(()=>{const m=map.current;if(!m||!ready)return;const cleanups=stations.map(s=>{const b=document.createElement('button');const value=s.prices[fuel];const color=value===null?'#161616':value<low?'#68a52c':value<high?'#c8ad35':'#ff7930';b.type='button';b.className='fuel-station-marker';b.setAttribute('aria-label',`${s.address}, ${s.city}, ${price(value)}`);b.style.cssText=`width:14px;height:14px;border-radius:50%;border:1px solid white;background:${color};outline:${selected===s.id?'2px solid #e1000f':'none'};outline-offset:2px;cursor:pointer`;const content=document.createElement('div');content.style.cssText='padding:8px;font-family:var(--font-marianne),Arial,sans-serif';let root:ReturnType<typeof createRoot>|null=null;const popup=new maplibregl.Popup({closeButton:false,offset:14,maxWidth:'350px'}).setDOMContent(content);const show=()=>{if(!root){root=createRoot(content);root.render(<StationDetails station={s}/>)}popup.setLngLat(s.coordinates).addTo(m)},hide=()=>popup.remove();b.onmouseenter=()=>{if(window.matchMedia('(hover: hover)').matches)show()};b.onmouseleave=hide;b.onfocus=show;b.onblur=hide;b.onkeydown=e=>{if(e.key==='Escape')hide()};b.onclick=e=>{e.stopPropagation();hide();callback.current(s.id)};const marker=new maplibregl.Marker({element:b}).setLngLat(s.coordinates).addTo(m);return()=>{popup.remove();marker.remove();queueMicrotask(()=>root?.unmount())}});return()=>cleanups.forEach(f=>f())},[stations,fuel,selected,ready,low,high]);
 useEffect(()=>{const m=map.current;if(!m||!ready||!navigation)return;const bounds=new maplibregl.LngLatBounds();navigation.coordinates.forEach(coordinates=>bounds.extend(coordinates));m.fitBounds(bounds,{padding:{top:110,bottom:160,left:55,right:55},maxZoom:navigation.coordinates.length===1?15:12,duration:0})},[navigation,ready]);
 return <div className="relative h-full min-h-[420px] bg-[#c8ddf0]"><div ref={container} className="absolute inset-0"/>
 <div className="fuel-map-controls absolute right-5 top-5 z-10 flex flex-col overflow-hidden rounded border border-[#E5E5E5] bg-white shadow-[0_2px_8px_rgba(0,0,0,.15)]">
 <button type="button" aria-label="Zoomer" onClick={()=>map.current?.zoomIn()} className="flex h-9 w-9 items-center justify-center border-b border-[#E5E5E5] hover:bg-[#eeeeee]"><RiAddLine size={20}/></button>
 <button type="button" aria-label="Dézoomer" onClick={()=>map.current?.zoomOut()} className="flex h-9 w-9 items-center justify-center border-b border-[#E5E5E5] hover:bg-[#eeeeee]"><RiSubtractLine size={20}/></button>
 <button type="button" disabled={!ready||locating} aria-label={locating?'Localisation en cours':'Me géolocaliser'} title="Me géolocaliser" aria-busy={locating} onClick={()=>locate()} className="flex h-9 w-9 items-center justify-center border-b border-[#E5E5E5] text-[#161616] hover:bg-[#eeeeee] disabled:opacity-40">{locating?<RiLoader4Line aria-hidden className="h-5 w-5 animate-spin motion-reduce:animate-none"/>:<RiFocus3Line aria-hidden size={20}/>}</button>
 <button type="button" disabled={!ready} aria-pressed={isSatellite} aria-label={isSatellite?'Afficher la vue plan':'Afficher la vue satellite'} title={isSatellite?'Vue plan':'Vue satellite'} onClick={()=>{const m=map.current;if(!m?.getLayer('fuel-satellite'))return;const next=!isSatellite;m.setLayoutProperty('fuel-satellite','visibility',next?'visible':'none');setIsSatellite(next)}} className={`flex h-9 w-9 items-center justify-center hover:bg-[#eeeeee] disabled:opacity-40 ${isSatellite?'bg-[#ececfe] text-[#000091]':''}`}>{isSatellite?<RiMap2Line size={20}/>:<RiEarthLine size={20}/>}</button>
 </div>{locationError&&<p role="alert" className="absolute right-16 top-20 z-20 max-w-64 rounded border border-[#e5e5e5] bg-white p-3 text-xs shadow">{locationError}</p>}{failed&&<p role="status" className="absolute left-5 top-24 max-w-72 rounded bg-white p-3 text-xs shadow">Le fond de carte est indisponible ou incomplet.</p>}<div className="fuel-map-legend absolute bottom-12 right-5 w-[280px] max-w-[calc(100%-2.5rem)] rounded border border-[#e5e5e5] bg-white p-3 shadow-[0_2px_4px_rgba(0,0,0,.08),0_4px_12px_rgba(0,0,0,.08)]"><p className="text-xs font-bold">Prix du {fuel} · €/litre</p>{values.length?<><div className="mt-2 grid grid-cols-3 gap-1"><span className="h-2 bg-[#68a52c]"/><span className="h-2 bg-[#c8ad35]"/><span className="h-2 bg-[#ff7930]"/></div><div className="mt-1 grid grid-cols-3 gap-1 text-[10px] text-[#666]"><span>&lt; {price(low)}</span><span>{price(low)}</span><span>≥ {price(high)}</span></div></>:<p className="mt-2 text-xs text-[#666]">Aucun prix disponible</p>}{stations.some(s=>s.prices[fuel]===null)&&<p className="mt-2 flex items-center gap-2 text-[10px]"><span className="h-2.5 w-2.5 rounded-full bg-[#161616]"/>Station en rupture</p>}</div></div>
}
