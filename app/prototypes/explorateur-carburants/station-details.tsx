import { fuels, price, type Station } from './data';

export default function StationDetails({ station, variant = 'tooltip' }: { station: Station; variant?: 'tooltip' | 'table' }) {
  const coordinates = `${station.coordinates[1]},${station.coordinates[0]}`;
  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(coordinates)}`;
  const appleMapsUrl = `https://maps.apple.com/?ll=${encodeURIComponent(coordinates)}&q=${encodeURIComponent(station.address + ', ' + station.city)}`;
  return (
    <div>
      <h3 className="text-[16px] font-bold leading-6">{station.address}<br />{station.city}</h3>
      {variant === 'table' && <details key={station.id} className="mt-3 text-[12px]">
        <summary className="cursor-pointer font-medium text-[#000091] underline underline-offset-2">Ouvrir dans une application de cartes</summary>
        <div className="mt-2 flex flex-wrap gap-x-5 gap-y-2 rounded border border-[#e5e5e5] bg-[#f6f6f6] p-3">
          <a href={appleMapsUrl} target="_blank" rel="noopener noreferrer" className="text-[#000091] underline underline-offset-2">Plans ↗<span className="sr-only"> (nouvelle fenêtre)</span></a>
          <a href={googleMapsUrl} target="_blank" rel="noopener noreferrer" className="text-[#000091] underline underline-offset-2">Google Maps ↗<span className="sr-only"> (nouvelle fenêtre)</span></a>
        </div>
      </details>}
      {variant === 'table' ? (
        <div className="mt-4 overflow-hidden rounded border border-[#E5E5E5]">
          <table className="w-full border-collapse text-left text-[12px] leading-5">
            <caption className="sr-only">Prix, disponibilité et mise à jour des carburants de la station</caption>
            <thead className="bg-[#f6f6f6] text-[#161616]">
              <tr>
                <th scope="col" className="border-b border-[#E5E5E5] px-2 py-1 font-medium">Carburant</th>
                <th scope="col" className="border-b border-[#E5E5E5] px-2 py-1 text-right font-medium">Prix / L</th>
                <th scope="col" className="border-b border-[#E5E5E5] px-2 py-1 font-medium">Disponibilité</th>
                <th scope="col" className="border-b border-[#E5E5E5] px-2 py-1 font-medium">Mise à jour</th>
              </tr>
            </thead>
            <tbody>
              {fuels.map((fuel) => {
                const unavailable = station.prices[fuel] === null;
                return (
                  <tr key={fuel} className="border-b border-[#E5E5E5] text-[#3a3a3a] last:border-b-0">
                    <th scope="row" className="whitespace-nowrap px-2 py-2 font-normal">{fuel}</th>
                    <td className="whitespace-nowrap px-2 py-2 text-right tabular-nums">{unavailable ? '—' : price(station.prices[fuel])}</td>
                    <td className="px-2 py-2">{unavailable ? 'En rupture' : 'Disponible'}</td>
                    <td className="px-2 py-2 tabular-nums">{unavailable && <span className="block text-[10px] text-[#666]">Rupture depuis</span>}{station.fuelUpdated?.[fuel] ?? 'Non renseignée'}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-4">
          {fuels.map((fuel) => (
            <div key={fuel}>
              <p className={`text-[12px] font-bold ${station.prices[fuel] === null ? 'text-[#666]' : 'text-[#161616]'}`}>{fuel} : {station.prices[fuel] === null ? 'En rupture' : price(station.prices[fuel])}</p>
              <p className="mt-1 text-[11px] leading-4 text-[#666]">{station.prices[fuel] === null ? 'Depuis' : 'MAJ le'} {station.fuelUpdated?.[fuel] ?? 'Non renseignée'}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
