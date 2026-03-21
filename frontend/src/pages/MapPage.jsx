import React, { useState, useEffect, useRef } from 'react';
import { useLang } from '../context/LangContext';
import T from '../data/translations';
import { MAP_FACILITIES } from '../data/demoData';

// Known sector coordinates across Rwanda for proximity search
const SECTOR_COORDS = {
  'kimironko': { lat: -1.940, lng: 30.110 },
  'remera': { lat: -1.948, lng: 30.100 },
  'gisozi': { lat: -1.920, lng: 30.065 },
  'kacyiru': { lat: -1.931, lng: 30.065 },
  'gikondo': { lat: -1.935, lng: 30.082 },
  'nyamirambo': { lat: -1.975, lng: 30.045 },
  'kimisagara': { lat: -1.950, lng: 30.055 },
  'muhima': { lat: -1.955, lng: 30.075 },
  'gitega': { lat: -1.960, lng: 30.065 },
  'kanombe': { lat: -1.962, lng: 30.118 },
  'masaka': { lat: -1.968, lng: 30.105 },
  'gatenga': { lat: -1.960, lng: 30.088 },
  'nyarugunga': { lat: -1.972, lng: 30.098 },
  'gasabo': { lat: -1.925, lng: 30.090 },
  'kicukiro': { lat: -1.960, lng: 30.095 },
  'nyarugenge': { lat: -1.955, lng: 30.060 },
  'gisenyi': { lat: -1.680, lng: 29.320 },
  'rubavu': { lat: -1.680, lng: 29.325 },
  'huye': { lat: -2.590, lng: 29.740 },
  'musanze': { lat: -1.500, lng: 29.630 },
  'rwamagana': { lat: -1.950, lng: 30.435 },
  'kayonza': { lat: -1.892, lng: 30.650 },
  'ngoma': { lat: -2.166, lng: 30.497 },
  'bugesera': { lat: -2.213, lng: 30.085 },
  'muhanga': { lat: -2.086, lng: 29.753 },
  'karongi': { lat: -2.083, lng: 29.350 },
  'kibungo': { lat: -2.160, lng: 30.540 },
  'kinigi': { lat: -1.473, lng: 29.608 },
  'gatsata': { lat: -1.918, lng: 30.058 },
  'niboye': { lat: -1.978, lng: 30.098 },
  'gahanga': { lat: -1.997, lng: 30.099 },
  'kagarama': { lat: -1.980, lng: 30.090 },
};

function haversineKm(lat1, lng1, lat2, lng2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

const TYPE_COLORS = {
  recycler: '#16a34a',
  repair: '#0ea5e9',
  collection: '#f59e0b',
};

const TYPE_LABELS = {
  recycler: { en: 'Recycling Center', rw: 'Aho Imyanda Yoherezwa' },
  repair: { en: 'Repair Shop', rw: 'Iduka ryo Gusana' },
  collection: { en: 'Collection Point', rw: "Ahantu h'Itegurwa" },
};

const FACILITY_HOURS = {
  recycler: 'Mon–Fri 8am–5pm, Sat 8am–12pm',
  repair: 'Mon–Sat 8am–7pm',
  collection: 'Mon–Sat 7am–6pm',
};

export default function MapPage() {
  const { lang } = useLang();
  const t = T[lang];
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef([]);
  const [typeFilter, setTypeFilter] = useState('all');
  const [selected, setSelected] = useState(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResult, setSearchResult] = useState(null); // { type: 'exact'|'nearest'|'none', label, facilities }

  const filtered = typeFilter === 'all' ? MAP_FACILITIES : MAP_FACILITIES.filter(f => f.type === typeFilter);

  const handleSearch = () => {
    const q = searchQuery.trim();
    if (!q) { setSearchResult(null); return; }

    const ql = q.toLowerCase();
    // Apply type filter too
    const pool = typeFilter === 'all' ? MAP_FACILITIES : MAP_FACILITIES.filter(f => f.type === typeFilter);

    // 1. Exact/partial match in facility name or sector
    const exactMatches = pool.filter(f =>
      f.sector.toLowerCase().includes(ql) || f.name.toLowerCase().includes(ql)
    );
    if (exactMatches.length > 0) {
      setSearchResult({ type: 'exact', label: q, facilities: exactMatches });
      if (mapInstanceRef.current) {
        mapInstanceRef.current.setView([exactMatches[0].lat, exactMatches[0].lng], 13, { animate: true });
      }
      return;
    }

    // 2. Look up known sector coordinates for proximity search
    const sectorEntry = Object.entries(SECTOR_COORDS).find(([key]) =>
      key.includes(ql) || ql.includes(key)
    );
    if (sectorEntry) {
      const [, { lat, lng }] = sectorEntry;
      const nearest = pool
        .map(f => ({ ...f, distKm: haversineKm(lat, lng, f.lat, f.lng) }))
        .sort((a, b) => a.distKm - b.distKm)
        .slice(0, 3);
      setSearchResult({ type: 'nearest', label: q, facilities: nearest });
      if (nearest[0] && mapInstanceRef.current) {
        mapInstanceRef.current.setView([nearest[0].lat, nearest[0].lng], 12, { animate: true });
      }
      return;
    }

    // 3. Nothing found
    setSearchResult({ type: 'none', label: q, facilities: [] });
  };

  const clearSearch = () => { setSearchQuery(''); setSearchResult(null); };

  const displayedFacilities = searchResult ? searchResult.facilities : filtered;

  useEffect(() => {
    if (mapInstanceRef.current) return;

    const initMap = async () => {
      try {
        const L = await import('leaflet');
        await import('leaflet/dist/leaflet.css');

        if (!mapRef.current || mapRef.current._leaflet_id) return;

        delete L.Icon.Default.prototype._getIconUrl;
        L.Icon.Default.mergeOptions({
          iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
          iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
          shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
        });

        const map = L.map(mapRef.current, {
          center: [-1.9403, 29.8739],
          zoom: 8,
        });

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© OpenStreetMap contributors',
          maxZoom: 19,
        }).addTo(map);

        mapInstanceRef.current = map;
        setMapLoaded(true);
      } catch (e) {
        console.warn('Map load error:', e);
      }
    };

    initMap();

    return () => {
      if (mapInstanceRef.current) {
        try { mapInstanceRef.current.remove(); } catch (e) {}
        mapInstanceRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !mapLoaded) return;

    let L;
    try { L = require('leaflet'); } catch (e) { return; }

    markersRef.current.forEach(m => { try { m.remove(); } catch (e) {} });
    markersRef.current = [];

    filtered.forEach(facility => {
      const color = TYPE_COLORS[facility.type] || '#6b7280';
      const typeLabel = TYPE_LABELS[facility.type]?.[lang] || facility.type;

      const icon = L.divIcon({
        className: '',
        html: `<div style="width:28px;height:28px;border-radius:50% 50% 50% 0;background:${color};border:2.5px solid #fff;box-shadow:0 3px 10px rgba(0,0,0,.25);transform:rotate(-45deg);display:flex;align-items:center;justify-content:center;">
          <div style="width:8px;height:8px;border-radius:50%;background:rgba(255,255,255,.8);transform:rotate(45deg)"></div>
        </div>`,
        iconSize: [28, 28],
        iconAnchor: [14, 28],
        popupAnchor: [0, -30],
      });

      const popup = L.popup({ maxWidth: 240 }).setContent(
        `<div style="font-family:Montserrat,sans-serif;padding:2px 0">
          <div style="font-size:10px;font-weight:700;color:${color};text-transform:uppercase;letter-spacing:.5px;margin-bottom:5px">${typeLabel}</div>
          <div style="font-size:13px;font-weight:700;margin-bottom:5px">${facility.name}</div>
          <div style="font-size:11px;color:#6b7280;margin-bottom:3px">${facility.sector}</div>
          ${facility.materials ? `<div style="font-size:11px;color:#6b7280;margin-bottom:3px">Accepts: ${facility.materials}</div>` : ''}
          <div style="font-size:10px;color:#9ca3af;margin-top:5px">${FACILITY_HOURS[facility.type]}</div>
        </div>`
      );

      const marker = L.marker([facility.lat, facility.lng], { icon }).bindPopup(popup).addTo(map);
      marker.on('click', () => setSelected(facility));
      markersRef.current.push(marker);
    });
  }, [filtered, mapLoaded, lang]);

  const panTo = (facility) => {
    const map = mapInstanceRef.current;
    if (map) {
      map.setView([facility.lat, facility.lng], 14, { animate: true });
      const idx = filtered.findIndex(f => f.id === facility.id);
      if (idx !== -1 && markersRef.current[idx]) {
        markersRef.current[idx].openPopup();
      }
    }
    setSelected(facility);
  };

  return (
    <div className="pg pi">
      <div className="pg-h">
        <h1 className="pg-t">{t.map.heading}</h1>
        <p style={{ fontSize: 15, color: 'var(--text2)', marginTop: 6 }}>{t.map.sub}</p>
      </div>

      {/* Location Search */}
      <div style={{ marginBottom: 16, display: 'flex', gap: 8 }}>
        <div className="search-wrap" style={{ flex: 1 }}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" />
          </svg>
          <input
            className="search-input"
            placeholder={lang === 'en' ? 'Search by sector or area (e.g. Kacyiru, Nyamirambo)...' : 'Shakisha akarere (urugero: Kacyiru, Nyamirambo)...'}
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSearch()}
          />
        </div>
        <button className="btn-p" onClick={handleSearch} style={{ flexShrink: 0 }}>
          {lang === 'en' ? 'Search' : 'Shakisha'}
        </button>
        {searchResult && (
          <button className="btn-g" onClick={clearSearch} style={{ flexShrink: 0 }}>
            {lang === 'en' ? 'Clear' : 'Siba'}
          </button>
        )}
      </div>

      {/* Search result banner */}
      {searchResult && (
        <div style={{
          marginBottom: 14, padding: '10px 14px', borderRadius: 12, fontSize: 13, fontWeight: 500,
          background: searchResult.type === 'none' ? 'var(--red-l)' : searchResult.type === 'nearest' ? 'var(--amber-l)' : 'var(--green-l)',
          color: searchResult.type === 'none' ? 'var(--red)' : searchResult.type === 'nearest' ? '#92400e' : 'var(--green-d)',
          display: 'flex', alignItems: 'center', gap: 8,
        }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" />
          </svg>
          {searchResult.type === 'exact' && (lang === 'en'
            ? `${searchResult.facilities.length} result${searchResult.facilities.length !== 1 ? 's' : ''} found for "${searchResult.label}"`
            : `Ibikoresho ${searchResult.facilities.length} byabonetse kuri "${searchResult.label}"`)}
          {searchResult.type === 'nearest' && (lang === 'en'
            ? `No facilities in "${searchResult.label}" - showing ${searchResult.facilities.length} nearest locations`
            : `Nta bikoresho muri "${searchResult.label}" - herekanwa ibirindiro ${searchResult.facilities.length} biri hafi`)}
          {searchResult.type === 'none' && (lang === 'en'
            ? `No results found for "${searchResult.label}". Try a different sector name.`
            : `Nta bisubizo byabonetse kuri "${searchResult.label}".`)}
        </div>
      )}

      <div className="fb" style={{ marginBottom: 20 }}>
        {['all', 'recycler', 'repair', 'collection'].map(type => (
          <button key={type}
            className={`filter-btn${typeFilter === type ? ' active' : ''}`}
            onClick={() => { setTypeFilter(type); setSearchResult(null); }}
          >
            {type === 'all' ? t.map.allTypes : TYPE_LABELS[type]?.[lang] || type}
          </button>
        ))}
      </div>

      <div className="map-wrap" style={{ position: 'relative', marginBottom: 28 }}>
        <div ref={mapRef} style={{ width: '100%', height: '100%', borderRadius: 20 }} />
        {!mapLoaded && (
          <div style={{
            position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'var(--bg)', borderRadius: 20, color: 'var(--text2)',
          }}>
            <div style={{ textAlign: 'center' }}>
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"
                style={{ margin: '0 auto 10px', display: 'block', opacity: 0.3 }}>
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" />
              </svg>
              <p style={{ fontSize: 13 }}>Loading map...</p>
            </div>
          </div>
        )}
      </div>

      {/* Legend */}
      <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', marginBottom: 24, fontSize: 12, fontWeight: 600, color: 'var(--text2)' }}>
        {Object.entries(TYPE_LABELS).map(([type, labels]) => (
          <div key={type} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ width: 10, height: 10, borderRadius: 3, background: TYPE_COLORS[type], display: 'inline-block', flexShrink: 0 }} />
            {labels[lang]}
          </div>
        ))}
      </div>

      <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 14 }}>
        {searchResult && searchResult.type === 'nearest'
          ? (lang === 'en' ? `Nearest ${displayedFacilities.length} Facilities` : `Ibirindiro ${displayedFacilities.length} biri hafi`)
          : (lang === 'en' ? `${displayedFacilities.length} Facilities` : `Ibikoresho ${displayedFacilities.length}`)}
      </h3>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(270px,1fr))', gap: 14 }}>
        {displayedFacilities.map(f => (
          <div key={f.id}
            className="gc"
            style={{
              cursor: 'pointer', padding: '16px 18px',
              borderTop: `3px solid ${TYPE_COLORS[f.type]}`,
              opacity: selected && selected.id !== f.id ? 0.65 : 1,
              transition: 'opacity .2s, box-shadow .2s',
            }}
            onClick={() => panTo(f)}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
              <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '.5px', background: 'var(--bg)', borderRadius: 6, padding: '2px 8px' }}>
                {TYPE_LABELS[f.type]?.[lang]}
              </span>
            </div>
            <h4 style={{ fontSize: 14, fontWeight: 700, marginBottom: 6 }}>{f.name}</h4>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: 'var(--text2)', marginBottom: 4 }}>
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>
              {f.sector}
            </div>
            {f.materials && (
              <div style={{ fontSize: 11, color: 'var(--text3)', marginBottom: 4 }}>
                {lang === 'en' ? 'Accepts:' : 'Akira:'} {f.materials}
              </div>
            )}
            {f.distKm !== undefined && (
              <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--amber)', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                {f.distKm < 1 ? `${Math.round(f.distKm * 1000)}m` : `${f.distKm.toFixed(1)} km`} {lang === 'en' ? 'away' : 'urutonde'}
              </div>
            )}
            <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 6 }}>
              {FACILITY_HOURS[f.type]}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}