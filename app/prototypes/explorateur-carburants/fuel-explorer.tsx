"use client";
import {useMemo,useState,useRef,useEffect} from 'react';
import {RiArrowLeftLine,RiFocus3Line,RiSearchLine,RiArrowDownSLine,RiSidebarFoldLine,RiSidebarUnfoldLine} from '@remixicon/react';
import FuelMap from './fuel-map';
import './mobile.css';
import {stations,fuels,price,type Fuel} from './data';
import StationDetails from './station-details';
export default function FuelExplorer({embedded=false}:{embedded?:boolean}){
 const [fuel,setFuel]=useState<Fuel>('SP95-E10'),[out,setOut]=useState(false),[selected,setSelected]=useState<number|null>(null),[collapsed,setCollapsed]=useState(false),[query,setQuery]=useState(''),[searchError,setSearchError]=useState(''),[navigation,setNavigation]=useState<{coordinates:[number,number][];requestId:number}|null>(null);
 const [searchOpen,setSearchOpen]=useState(false),[activeSuggestion,setActiveSuggestion]=useState(-1),[locating,setLocating]=useState(false);
 const [mobilePanel,setMobilePanel]=useState(false);
 const [mobileView,setMobileView]=useState<'filters'|'station'>('filters');

 useEffect(()=>{const media=window.matchMedia('(max-width: 1023px)');const reset=()=>{if(!media.matches)setMobilePanel(false)};media.addEventListener('change',reset);return()=>media.removeEventListener('change',reset)},[]);
 const panelRef=useRef<HTMLElement>(null);
 const panelHistory=useRef(false);
 useEffect(()=>{
  if(mobilePanel){
   if(!panelHistory.current){window.history.pushState({...window.history.state,fuelPanel:true},'');panelHistory.current=true}
   panelRef.current?.querySelector<HTMLButtonElement>('.fuel-mobile-back')?.focus({preventScroll:true});
  }else if(panelHistory.current){panelHistory.current=false;if(window.history.state?.fuelPanel)window.history.back()}
 },[mobilePanel,mobileView]);
 useEffect(()=>{const back=()=>{panelHistory.current=false;setMobilePanel(false)};window.addEventListener('popstate',back);return()=>window.removeEventListener('popstate',back)},[]);
 const locationRef=useRef<{locate:(done?:(error?:string)=>void)=>void}>(null);
 function locateFromSearch(){setLocating(true);setSearchError('');locationRef.current?.locate(error=>{setLocating(false);if(error){setSearchError(error);setSearchOpen(true)}else{setSearchOpen(false);setQuery('')}})}
 const normalize=(s:string)=>s.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
 const suggestions=query.trim().length<2?[]:stations.filter(s=>normalize(s.address+' '+s.city).includes(normalize(query.trim()))||normalize(s.city+' '+s.address).includes(normalize(query.trim()))).slice(0,5);
 function chooseAddress(s:typeof stations[number]){setQuery(`${s.address}, ${s.city}`);setMobilePanel(false);setSearchOpen(false);setSearchError('');setSelected(null);setNavigation({coordinates:[s.coordinates],requestId:Date.now()})}
 const results=useMemo(()=>stations.filter(s=>out||s.prices[fuel]!==null),[out,fuel]);
 function searchAddress(){
  const text=normalize(query.trim());
  if(!text){setSearchError('');setSearchOpen(true);return}
  const matches=stations.filter(s=>normalize(s.address+' '+s.city).includes(text)||normalize(s.city+' '+s.address).includes(text));
  if(!matches.length){setSearchError('Aucune adresse trouvée. Vérifiez votre saisie ou utilisez votre position.');setSearchOpen(true);return}
  setMobilePanel(false);setSearchOpen(false);setSearchError('');setSelected(null);setNavigation({coordinates:matches.map(s=>s.coordinates),requestId:Date.now()});
 }
 const fuelStatistics=fuels.map(type=>{
  const prices=stations.map(station=>station.prices[type]).filter((value):value is number=>value!==null).sort((a,b)=>a-b);
  return {fuel:type,mean:prices.length?prices.reduce((sum,value)=>sum+value,0)/prices.length:null,median:prices.length?(prices[Math.floor((prices.length-1)/2)]+prices[Math.floor(prices.length/2)])/2:null};
 });
 const values=stations.map(s=>s.prices[fuel]).filter((v):v is number=>v!==null).sort((a,b)=>a-b);
 const mean=values.length?values.reduce((a,b)=>a+b,0)/values.length:null;
 const median=values.length?(values[Math.floor((values.length-1)/2)]+values[Math.floor(values.length/2)])/2:null;
 const station=results.find(s=>s.id===selected);
 return <main className={`${embedded?'fuel-embedded ':''}fuel-explorer min-h-dvh bg-white text-[#161616] [&_button]:cursor-pointer [&_button:focus-visible]:outline-2 [&_button:focus-visible]:outline-[#000091]`}>
 <header className="fuel-header flex min-h-[108px] items-center justify-between gap-6 border-b border-[#e5e5e5] px-5 py-4"><div><div className="flex flex-wrap items-center gap-2"><h1 className="text-[25px] font-extrabold leading-8">Explorateur des prix des carburants</h1><span className="bg-[#e8edff] px-1.5 py-0.5 text-[11px] font-bold text-[#000091]">BETA</span></div><p className="mt-1 text-[14px] leading-6">Consultez les prix et la disponibilité des carburants dans les stations.</p></div></header>
 <section className="fuel-shell relative flex h-[calc(100dvh-108px)] min-h-[580px]">
 {!collapsed||mobilePanel?<aside ref={panelRef} onKeyDown={e=>{if(e.key==='Escape')setMobilePanel(false)}} aria-label={mobileView==='station'?'Fiche station':'Informations sur les prix'} className={`fuel-sidebar flex w-[400px] shrink-0 flex-col overflow-y-auto border-r border-[#e5e5e5] bg-white p-5 ${mobilePanel?'fuel-panel-open':''} ${mobileView==='station'?'fuel-station-panel':'fuel-filter-panel'}`}>
 <div className="fuel-panel-heading"><button type="button" onClick={()=>setMobilePanel(false)} className="fuel-mobile-back mb-5 hidden items-center gap-2 text-[13px] font-medium text-[#000091]"><RiArrowLeftLine size={18}/>Retour à la carte</button></div><div className="fuel-filter-content"><div className="flex items-center justify-between"><h2 className="text-xl font-bold">Prix des carburants</h2><button className="fuel-desktop-toggle" aria-label="Replier le panneau" onClick={()=>setCollapsed(true)}><RiSidebarFoldLine size={19}/></button></div>
 <label className="mt-4 block text-xs font-medium text-[#3a3a3a]">Type de carburant<span className="relative mt-1 block"><select value={fuel} onChange={e=>setFuel(e.target.value as Fuel)} className="h-9 w-full appearance-none rounded border border-[#e5e5e5] bg-[#f6f6f6] py-0 pl-2 pr-9 text-[13px] font-normal">{fuels.map(f=><option key={f}>{f}</option>)}</select><RiArrowDownSLine aria-hidden className="pointer-events-none absolute right-2 top-1/2 h-5 w-5 -translate-y-1/2"/></span></label>
 <div className="mt-4 flex items-center justify-between gap-3"><span id="out-label" className="text-xs">Afficher les stations en rupture de {fuel}</span><button role="switch" aria-checked={out} aria-labelledby="out-label" onClick={()=>setOut(!out)} className={`flex h-6 w-11 shrink-0 items-center rounded-full p-0.5 ${out?'justify-end bg-[#000091]':'justify-start bg-[#929292]'}`}><span className="h-5 w-5 rounded-full bg-white"/></button></div>
 <div className="mt-5 grid grid-cols-2 gap-3 border-y border-[#e5e5e5] py-5">{[['Prix moyen',mean],['Prix médian',median]].map(([label,v])=><div key={String(label)}><p className="text-xs text-[#666]">{label}</p><p className="mt-1 text-xl font-bold text-[#161616]">{v===null?'—':price(v as number)}</p><p className="text-[11px] text-[#666]">par litre</p></div>)}</div>
 </div>
 <section className="fuel-price-information" aria-labelledby="fuel-prices-title">
 <h2 id="fuel-prices-title" className="text-xl font-bold">Informations sur les prix</h2>
 <p className="mt-2 text-[13px] text-[#666]">Prix en euros par litre</p>
 <div className="mt-4 overflow-hidden rounded border border-[#E5E5E5]">
 <table className="w-full border-collapse text-left text-[12px] leading-5">
 <caption className="sr-only">Prix moyen et médian par litre pour chaque carburant</caption>
 <thead className="bg-[#f6f6f6] text-[#161616]"><tr><th scope="col" className="border-b border-[#E5E5E5] px-2 py-1 text-left font-medium">Carburant</th><th scope="col" className="border-b border-[#E5E5E5] px-2 py-1 text-right font-medium">Prix moyen</th><th scope="col" className="border-b border-[#E5E5E5] px-2 py-1 text-right font-medium">Prix médian</th></tr></thead>
 <tbody>{fuelStatistics.map(stat=><tr key={stat.fuel} className={`border-b border-[#E5E5E5] text-[#3a3a3a] last:border-b-0 ${stat.fuel===fuel?'bg-[#ececfe]':''}`}><th scope="row" className="whitespace-nowrap px-2 py-2 text-left font-normal">{stat.fuel}<span className="sr-only">{stat.fuel===fuel?' (sélectionné)':''}</span></th><td className="whitespace-nowrap px-2 py-2 text-right tabular-nums">{stat.mean===null?'—':price(stat.mean)}</td><td className="whitespace-nowrap px-2 py-2 text-right tabular-nums">{stat.median===null?'—':price(stat.median)}</td></tr>)}</tbody>
 </table>
 </div>
 <p className="mt-5 text-[13px] leading-6 text-[#666]">Pour chaque carburant, les statistiques sont calculées sur l’ensemble des stations disposant d’un prix, hors ruptures. Elles ne dépendent ni de la recherche ni de la zone affichée sur la carte.</p>

 </section>
 {station?<div className="fuel-station-content mt-6"><StationDetails station={station} variant="table"/></div>:<p className="fuel-desktop-help mt-6 text-[13px] leading-6 text-[#666]">{results.length?'Survolez un point pour consulter les carburants disponibles et leur prix.':'Aucune station dans cette sélection. Essayez Bordeaux, Montpellier ou Paris.'}</p>}
 <p className="fuel-touch-help">Touchez un point sur la carte pour consulter les carburants disponibles et leur prix.</p>
 <footer className="fuel-sources mt-auto pt-8"><p className="border-t border-[#e5e5e5] pt-4 text-[12px] italic leading-5 text-[#666]">Les sources de données utilisées pour réaliser cette application <a className="text-[#000091] underline underline-offset-2" href="https://www.data.gouv.fr/datasets/prix-des-carburants-en-france-flux-instantane-v2-amelioree/" target="_blank" rel="noreferrer">sont disponibles sur data.gouv.fr</a>. Pour plus d'informations <a className="text-[#000091] underline underline-offset-2" href="https://www.prix-carburants.gouv.fr/" target="_blank" rel="noreferrer">rendez-vous sur le site officiel.</a></p></footer>
 </aside>:null}
 <div className={`fuel-map-area relative min-h-[420px] min-w-0 flex-1 ${mobilePanel?'fuel-map-covered':''} ${mobilePanel&&mobileView==='station'?'fuel-station-visible':''}`} inert={mobilePanel||undefined}><FuelMap locationRef={locationRef} navigation={navigation} stations={results} fuel={fuel} selected={station?.id??null} onSelect={id=>{setSelected(id);if(id!==null){setCollapsed(false);setMobileView('station');setMobilePanel(window.matchMedia('(max-width: 1023px)').matches);setSearchOpen(false)}else setMobilePanel(false)}}/>
 {collapsed&&<button aria-label="Afficher le panneau" onClick={()=>setCollapsed(false)} className="fuel-desktop-toggle absolute left-3 top-5 z-20 rounded border border-[#ddd] bg-white p-2 shadow"><RiSidebarUnfoldLine size={20}/></button>}
 <form onBlur={e=>{if(!e.currentTarget.contains(e.relatedTarget as Node))setSearchOpen(false)}} onKeyDown={e=>{if(e.key==='Escape')setSearchOpen(false)}} onSubmit={e=>{e.preventDefault();searchAddress()}} className={`fuel-search absolute top-5 z-10 w-[440px] max-w-[calc(100%-6rem)] rounded border border-[#e5e5e5] bg-white p-2 shadow-[0_2px_4px_rgba(0,0,0,.08),0_4px_12px_rgba(0,0,0,.08)] ${collapsed?'left-16':'left-5'}`}><div className="flex"><input role="combobox" aria-expanded={searchOpen} aria-controls="fuel-address-results" aria-autocomplete="list" aria-activedescendant={searchOpen&&activeSuggestion>=0?`fuel-address-${activeSuggestion}`:undefined} onFocus={()=>setSearchOpen(true)} onKeyDown={e=>{if(e.key==='ArrowDown'&&suggestions.length){e.preventDefault();setSearchOpen(true);setActiveSuggestion(i=>(i+1)%suggestions.length)}else if(e.key==='ArrowUp'&&suggestions.length){e.preventDefault();setActiveSuggestion(i=>(i-1+suggestions.length)%suggestions.length)}else if(e.key==='Enter'&&searchOpen&&activeSuggestion>=0&&suggestions[activeSuggestion]){e.preventDefault();chooseAddress(suggestions[activeSuggestion])}}} aria-label="Rechercher une commune ou une adresse" placeholder="Rechercher une commune ou une adresse" value={query} onChange={e=>{setQuery(e.target.value);setSearchError('');setSearchOpen(true);setActiveSuggestion(-1)}} className="h-9 min-w-0 flex-1 bg-[#f6f6f6] px-3 text-[13px] outline-[#000091]"/><button aria-label="Rechercher" className="bg-[#000091] px-3 text-white"><RiSearchLine size={19}/></button></div>{searchOpen&&<div className="mt-2 border-t border-[#e5e5e5] pt-2">
 {!query.trim()&&!searchError?<div className="px-2 py-2"><p className="text-[14px] font-bold">Trouvez les stations près de vous</p></div>:null}
 <div id="fuel-address-results" role="listbox" aria-label="Adresses proposées">{!searchError&&suggestions.map((s,i)=><button type="button" role="option" aria-selected={activeSuggestion===i} id={`fuel-address-${i}`} key={s.id} onClick={()=>chooseAddress(s)} className={`block w-full rounded px-3 py-2 text-left text-[13px] hover:bg-[#f6f6f6] ${activeSuggestion===i?'bg-[#ececfe]':''}`}><span className="block font-medium">{s.address}</span><span className="text-xs text-[#666]">{s.city}</span></button>)}</div>
 {searchError||query.trim().length>=2&&!suggestions.length?<p role="status" className="px-2 py-2 text-xs leading-5 text-[#666]">{searchError||'Aucune adresse trouvée. Vérifiez votre saisie ou utilisez votre position.'}</p>:null}
 {query.trim().length===1&&!searchError?<p className="px-2 py-2 text-xs text-[#666]">Continuez à saisir votre adresse.</p>:null}
 <button type="button" disabled={locating} onClick={locateFromSearch} className="mt-1 flex w-full items-center gap-2 rounded px-2 py-2 text-[13px] font-medium text-[#000091] hover:bg-[#ececfe] disabled:opacity-50"><RiFocus3Line aria-hidden size={18}/>{locating?'Localisation en cours…':'Me géolocaliser'}</button>
 </div>}</form>
 <div className={`fuel-quick-filters ${searchOpen?'fuel-search-active':''}`}>
 <label className="sr-only" htmlFor="mobile-fuel">Type de carburant</label>
 <div className="relative min-w-0 flex-1"><select id="mobile-fuel" value={fuel} onChange={e=>setFuel(e.target.value as Fuel)} className="fuel-quick-control fuel-quick-select">{fuels.map(f=><option key={f} value={f}>{f}</option>)}</select><RiArrowDownSLine aria-hidden className="pointer-events-none absolute right-2 top-3 h-5 w-5"/></div>
 <button type="button" aria-pressed={out} onClick={()=>setOut(!out)} className="fuel-quick-control" aria-label={`Afficher les stations en rupture de ${fuel}`}>Ruptures</button>
 <button type="button" onClick={()=>{setMobileView('filters');setMobilePanel(true);setSearchOpen(false)}} className="fuel-quick-control" aria-label="Informations sur les prix" aria-expanded={mobilePanel&&mobileView==='filters'}>Infos prix</button>
 </div>

 </div></section></main>
}
