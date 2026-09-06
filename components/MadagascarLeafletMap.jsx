'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import L from 'leaflet';
import step25Data from '../lib/step25Data';

const MADAGASCAR_CENTER = [-18.7669, 46.8691];
const DEFAULT_ZOOM = 6;

const MODEL_ZONES = {
  ANTANANARIVO: { label: 'Antananarivo', coordinates: [-18.8792, 47.5079] },
  ANTSIRANANA: { label: 'Antsiranana', coordinates: [-12.2787, 49.2917] },
  FIANARANTSOA: { label: 'Fianarantsoa', coordinates: [-21.4527, 47.0857] },
  MAHAJANGA: { label: 'Mahajanga', coordinates: [-15.7167, 46.3167] },
  TOAMASINA: { label: 'Toamasina', coordinates: [-18.1492, 49.4023] },
  TOLIARY: { label: 'Toliary', coordinates: [-23.35, 43.6667] },
};

const TILE_LAYERS = {
  light: {
    name: 'Claire',
    icon: '☀️',
    url: 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
    attribution: '&copy; OpenStreetMap &copy; CARTO',
  },
  osm: {
    name: 'OSM',
    icon: '🗺️',
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; OpenStreetMap',
  },
  dark: {
    name: 'Sombre',
    icon: '🌙',
    url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
    attribution: '&copy; OpenStreetMap &copy; CARTO',
  },
};

const levelColors = {
  CRITICAL: '#ef4444',
  HIGH: '#f97316',
  MODERATE: '#eab308',
  LOW: '#10b981',
  UNKNOWN: '#64748b',
};

function formatPercentile(value) {
  if (value === null || value === undefined || Number.isNaN(Number(value))) return '—';
  return `${Number(value).toFixed(1)}e`;
}

export default function MadagascarLeafletMap({ data = step25Data.provinces }) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const tileLayerRef = useRef(null);
  const geojsonLayerRef = useRef(null);
  const markersGroupRef = useRef(null);

  const [geoData, setGeoData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTile, setActiveTile] = useState('light');
  const [horizon, setHorizon] = useState('24h');
  const [filterRisk, setFilterRisk] = useState('ALL');
  const [selectedZone, setSelectedZone] = useState(null);

  const visibleZones = useMemo(() => {
    if (filterRisk === 'ALL') return data;
    const key = horizon === '24h' ? 'risk24h' : 'risk6h';
    return data.filter((zone) => zone[key]?.level === filterRisk);
  }, [data, filterRisk, horizon]);

  useEffect(() => {
    fetch('/madagascar.geojson')
      .then((res) => res.json())
      .then((geo) => {
        setGeoData(geo);
        setLoading(false);
      })
      .catch((error) => {
        console.error('Erreur chargement GeoJSON:', error);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: MADAGASCAR_CENTER,
      zoom: DEFAULT_ZOOM,
      minZoom: 5,
      maxZoom: 11,
      zoomControl: false,
    });

    L.control.zoom({ position: 'topright' }).addTo(map);
    mapInstanceRef.current = map;

    setTimeout(() => map.invalidateSize(), 150);

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (tileLayerRef.current) {
      map.removeLayer(tileLayerRef.current);
    }

    const config = TILE_LAYERS[activeTile];
    const layer = L.tileLayer(config.url, {
      attribution: config.attribution,
      subdomains: 'abcd',
      maxZoom: 19,
    });

    layer.addTo(map);
    tileLayerRef.current = layer;
  }, [activeTile]);

  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !geoData) return;

    if (geojsonLayerRef.current) map.removeLayer(geojsonLayerRef.current);

    const layer = L.geoJSON(geoData, {
      style: {
        fillColor: '#334155',
        weight: 1.2,
        opacity: 0.65,
        color: '#94a3b8',
        fillOpacity: 0.08,
      },
      onEachFeature: (feature, regionLayer) => {
        const props = feature.properties || {};
        regionLayer.bindTooltip(
          `<strong>${props.name || 'Région'}</strong>${props.capital ? `<br/>Chef-lieu : ${props.capital}` : ''}<br/><span style="font-size:11px;color:#64748b">Les risques IA sont affichés sur les 6 zones de modélisation.</span>`,
          { sticky: true },
        );
      },
    });

    layer.addTo(map);
    geojsonLayerRef.current = layer;
  }, [geoData]);

  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (markersGroupRef.current) map.removeLayer(markersGroupRef.current);

    const group = L.layerGroup();
    const riskKey = horizon === '24h' ? 'risk24h' : 'risk6h';

    visibleZones.forEach((zone) => {
      const meta = MODEL_ZONES[zone.province];
      if (!meta) return;

      const risk = zone[riskKey];
      const color = levelColors[risk?.level] || levelColors.UNKNOWN;

      const icon = L.divIcon({
        className: 'jirama-model-zone-marker',
        html: `
          <div style="position:relative;width:24px;height:24px;background:${color};border:3px solid white;border-radius:50%;box-shadow:0 0 0 6px ${color}33,0 4px 16px rgba(0,0,0,.35)"></div>
        `,
        iconSize: [24, 24],
        iconAnchor: [12, 12],
      });

      const marker = L.marker(meta.coordinates, { icon });
      marker.bindTooltip(
        `<strong>${meta.label}</strong><br/>${horizon} : ${risk?.level || 'UNKNOWN'} — ${formatPercentile(risk?.percentile)} percentile`,
        { direction: 'top', offset: [0, -10] },
      );
      marker.on('click', () => setSelectedZone(zone));
      marker.addTo(group);
    });

    group.addTo(map);
    markersGroupRef.current = group;
  }, [visibleZones, horizon]);

  const activeRisk = selectedZone
    ? (horizon === '24h' ? selectedZone.risk24h : selectedZone.risk6h)
    : null;

  return (
    <div className="relative w-full overflow-hidden rounded-2xl border border-white/10 bg-slate-950/90 shadow-2xl">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 bg-slate-900/95 p-4 text-white">
        <div>
          <h3 className="font-bold">Carte des 6 zones de modélisation</h3>
          <p className="mt-1 text-xs text-slate-400">
            Snapshot historique : {step25Data.snapshotLabel} • risque relatif, pas probabilité
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setHorizon('6h')}
            className={`rounded-full px-3 py-1 text-xs font-bold ${horizon === '6h' ? 'bg-orange-500 text-white' : 'bg-slate-800 text-slate-300'}`}
          >
            6h
          </button>
          <button
            type="button"
            onClick={() => setHorizon('24h')}
            className={`rounded-full px-3 py-1 text-xs font-bold ${horizon === '24h' ? 'bg-orange-500 text-white' : 'bg-slate-800 text-slate-300'}`}
          >
            24h
          </button>

          <select
            value={filterRisk}
            onChange={(event) => setFilterRisk(event.target.value)}
            className="rounded-full border border-slate-700 bg-slate-800 px-3 py-1 text-xs text-white"
            aria-label="Filtrer les niveaux de risque"
          >
            <option value="ALL">Tous les niveaux</option>
            <option value="CRITICAL">Critique</option>
            <option value="HIGH">Élevé</option>
            <option value="MODERATE">Modéré</option>
            <option value="LOW">Faible</option>
          </select>

          <select
            value={activeTile}
            onChange={(event) => setActiveTile(event.target.value)}
            className="rounded-full border border-slate-700 bg-slate-800 px-3 py-1 text-xs text-white"
            aria-label="Choisir le fond de carte"
          >
            {Object.entries(TILE_LAYERS).map(([key, item]) => (
              <option key={key} value={key}>{item.icon} {item.name}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4">
        <div className="relative h-[520px] bg-slate-950 lg:col-span-3">
          {loading && (
            <div className="absolute inset-0 z-20 flex items-center justify-center bg-slate-950/80 text-sm text-white">
              Chargement de la carte…
            </div>
          )}
          <div ref={mapContainerRef} className="h-full w-full" />

          <div className="absolute bottom-4 left-4 z-[500] rounded-xl border border-white/10 bg-slate-900/90 p-3 text-xs text-slate-200 shadow-xl">
            <strong className="mb-2 block text-white">Niveaux Step 25</strong>
            {Object.entries(levelColors).filter(([key]) => key !== 'UNKNOWN').map(([key, color]) => (
              <div className="mb-1 flex items-center gap-2" key={key}>
                <span className="inline-block h-3 w-3 rounded-full" style={{ backgroundColor: color }} />
                <span>{key}</span>
              </div>
            ))}
          </div>
        </div>

        <aside className="min-h-[520px] border-t border-white/10 bg-slate-900/95 p-5 text-white lg:border-l lg:border-t-0">
          {selectedZone ? (
            <div className="space-y-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-orange-400">Zone modèle</span>
                  <h4 className="mt-1 text-2xl font-black">{MODEL_ZONES[selectedZone.province]?.label}</h4>
                </div>
                <button type="button" onClick={() => setSelectedZone(null)} className="text-slate-400 hover:text-white">✕</button>
              </div>

              <div className="rounded-xl border border-white/10 bg-slate-800/70 p-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-400">Risque {horizon}</span>
                  <span className="rounded-full px-2 py-1 text-xs font-black text-white" style={{ backgroundColor: levelColors[activeRisk?.level] || levelColors.UNKNOWN }}>
                    {activeRisk?.level || 'UNKNOWN'}
                  </span>
                </div>
                <div className="mt-2 text-4xl font-black">{formatPercentile(activeRisk?.percentile)}</div>
                <div className="text-xs text-slate-400">percentile historique dans la zone</div>
              </div>

              <div className="space-y-2 text-xs">
                <div className="rounded-lg bg-slate-800/60 p-3">
                  <span className="block text-slate-400">Modèle 6h</span>
                  <strong>{selectedZone.risk6h.model}</strong>
                  <span className="ml-2 text-amber-300">{selectedZone.risk6h.status}</span>
                </div>
                <div className="rounded-lg bg-slate-800/60 p-3">
                  <span className="block text-slate-400">Modèle 24h</span>
                  <strong>{selectedZone.risk24h.model}</strong>
                  <span className="ml-2 text-emerald-300">{selectedZone.risk24h.status}</span>
                </div>
                <div className="rounded-lg bg-slate-800/60 p-3">
                  <span className="block text-slate-400">Coupure planifiée connue</span>
                  <strong>{selectedZone.planned.next24h ? 'Oui dans les 24h' : 'Aucune dans le snapshot'}</strong>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex h-full flex-col justify-center text-center">
              <div className="text-4xl">⚡</div>
              <h4 className="mt-3 text-lg font-bold">Sélectionne une zone</h4>
              <p className="mt-2 text-sm text-slate-400">
                Clique sur un marqueur pour afficher les résultats 6h et 24h issus du notebook 25.
              </p>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
