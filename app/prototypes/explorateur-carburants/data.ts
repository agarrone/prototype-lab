export const fuels = ['SP95-E10', 'Gazole', 'SP98', 'SP95', 'E85', 'GPLc'] as const;
export type Fuel = typeof fuels[number];
export type Station = { id: number; name: string; city: string; address: string; coordinates: [number, number]; automated: boolean; prices: Record<Fuel, number | null>; updated: string; fuelUpdated?: Record<Fuel,string> };
const places: [string,string,string,number,number][] = [
 ['TotalEnergies','Bordeaux','164 cours du Médoc',-0.568,44.864],['Carrefour','Bordeaux','Centre commercial Bordeaux Lac',-0.565,44.891],['Auchan','Bordeaux','Avenue des Quarante Journaux',-0.579,44.888],['Esso Express','Bordeaux','112 boulevard du Président Wilson',-0.598,44.845],['Intermarché','Bordeaux','Rue de la Benauge',-0.547,44.845],['TotalEnergies','Bordeaux','Quai de Paludate',-0.553,44.827],['E.Leclerc','Mérignac','55 avenue de la Somme',-0.674,44.833],['Carrefour','Mérignac','Avenue de la Marne',-0.645,44.841],['Intermarché','Pessac','Avenue Jean Jaurès',-0.632,44.806],['Auchan','Talence','Avenue du Maréchal Leclerc',-0.592,44.809],['E.Leclerc','Bègles','Rue des Frères Lumière',-0.548,44.793],['Super U','Cenon','Avenue René Cassagne',-0.523,44.86],['TotalEnergies','Lormont','Avenue de Paris',-0.523,44.881],['Esso Express','Le Bouscat','Avenue de la Libération',-0.616,44.867],['E.Leclerc','Bruges','Avenue de Terrefort',-0.609,44.887],['Intermarché','Floirac','Avenue Pasteur',-0.524,44.832],
 ['TotalEnergies','Montpellier','Avenue de Toulouse',3.861,43.592],['Carrefour','Montpellier','Route de Ganges',3.866,43.634],['E.Leclerc','Montpellier','Avenue Georges Frêche',3.914,43.597],['Esso Express','Montpellier','Avenue de la Justice',3.884,43.63],
 ['TotalEnergies','Paris','Quai de Bercy',2.386,48.833],['Esso Express','Paris','Boulevard de la Villette',2.374,48.881],['Carrefour','Paris','Boulevard de Grenelle',2.295,48.85],['TotalEnergies','Paris','Avenue de la Porte de Clignancourt',2.344,48.897],
];
// Positions et adresses synthétiques, réparties autour de villes de démonstration.
// Génération déterministe : les stations et leurs prix restent stables au rechargement.
const demoCities: [string, number, number][] = [
  ['Bordeaux', -0.579, 44.838], ['Paris', 2.352, 48.857],
  ['Montpellier', 3.877, 43.611], ['Lyon', 4.835, 45.764],
  ['Marseille', 5.369, 43.296], ['Toulouse', 1.444, 43.605],
  ['Lille', 3.058, 50.630], ['Nantes', -1.554, 47.218],
  ['Rennes', -1.678, 48.112], ['Strasbourg', 7.752, 48.573],
  ['Nice', 7.262, 43.710], ['Grenoble', 5.724, 45.188],
  ['Rouen', 1.100, 49.443], ['Caen', -0.370, 49.183],
  ['Brest', -4.486, 48.391], ['Quimper', -4.102, 47.996],
  ['Lorient', -3.370, 47.748], ['Angers', -0.563, 47.478],
  ['Le Mans', 0.199, 48.006], ['Tours', 0.684, 47.394],
  ['Orléans', 1.909, 47.903], ['Poitiers', 0.340, 46.580],
  ['La Rochelle', -1.151, 46.160], ['Limoges', 1.262, 45.833],
  ['Clermont-Ferrand', 3.087, 45.777], ['Dijon', 5.041, 47.322],
  ['Besançon', 6.024, 47.238], ['Metz', 6.176, 49.120],
  ['Nancy', 6.184, 48.693], ['Reims', 4.031, 49.258],
  ['Amiens', 2.295, 49.895], ['Saint-Quentin', 3.287, 49.848],
  ['Troyes', 4.074, 48.298], ['Auxerre', 3.573, 47.798],
  ['Nevers', 3.157, 46.990], ['Châteauroux', 1.693, 46.811],
  ['Pau', -0.370, 43.295], ['Bayonne', -1.474, 43.493],
  ['Perpignan', 2.895, 42.698], ['Nîmes', 4.360, 43.837],
  ['Avignon', 4.805, 43.949], ['Valence', 4.892, 44.934],
  ['Saint-Étienne', 4.387, 45.440], ['Annecy', 6.129, 45.899],
  ['Chambéry', 5.918, 45.565], ['Toulon', 5.928, 43.125],
  ['Ajaccio', 8.739, 41.919], ['Bastia', 9.450, 42.697],
];
const demoBrands = ['TotalEnergies', 'Carrefour', 'E.Leclerc', 'Intermarché', 'Esso Express', 'Super U'];
const demoRoads = ['avenue des Tilleuls', 'rue des Acacias', 'boulevard de la Gare', 'route des Prés', 'avenue du Parc', 'rue du Moulin'];
demoCities.forEach(([city, lng, lat], cityIndex) => {
  for (let index = 0; index < 12; index++) {
    const angle = index * 2.399963 + cityIndex * 0.73;
    const radius = 0.009 + Math.sqrt(index / 11) * 0.055;
    places.push([
      demoBrands[(cityIndex + index) % demoBrands.length], city,
      `${12 + index * 17} ${demoRoads[index % demoRoads.length]}`,
      Number((lng + Math.cos(angle) * radius / Math.cos(lat * Math.PI / 180)).toFixed(5)),
      Number((lat + Math.sin(angle) * radius).toFixed(5)),
    ]);
  }
});

export const stations: Station[] = places.map(([name,city,address,lng,lat],i)=>({id:i+1,name,city,address,coordinates:[lng,lat],automated:i%3!==0,fuelUpdated:Object.fromEntries(fuels.map((f,j)=>[f,`${(i+j)%11===3?'01/10':'02/10'} à ${8+(i+j)%5}:15`])) as Record<Fuel,string>,updated:i%4===0?'Hier à 18:30':`Aujourd’hui à ${8+i%4}:15`,prices:Object.fromEntries(fuels.map((f,j)=>[f,(i+j)%11===3?null:Number(([1.699,1.629,1.799,1.759,0.789,0.969][j]+(i < 24 ? (i%7)*0.024 : ((i*37+j*19)%251-60)/1000)).toFixed(3))])) as Record<Fuel,number|null>}));
export function price(value:number|null){return value===null?'Rupture':`${value.toFixed(3).replace('.',',')} €`;}
export function filterStations(query:string,fuel:Fuel,includeOut:boolean,automated:boolean){const q=query.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();return stations.filter(s=>`${s.city} ${s.address} ${s.name}`.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().includes(q)&&(includeOut||s.prices[fuel]!==null)&&(!automated||s.automated)).sort((a,b)=>(a.prices[fuel]??Infinity)-(b.prices[fuel]??Infinity));}
