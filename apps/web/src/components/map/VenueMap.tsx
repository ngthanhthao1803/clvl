"use client";

import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import { Locate, Navigation, ExternalLink } from "lucide-react";

export type MapVenueItem = {
  id: string;
  name: string;
  address?: string;
  district?: string;
  city?: string;
  latitude?: number;
  longitude?: number;
  price?: number;
  sessionTitle?: string;
  sessionId?: string;
  slotsLeft?: number;
  maxPlayers?: number;
  datetime?: string;
  googleMapsUrl?: string;
};

type VenueMapProps = {
  venues: MapVenueItem[];
  selectedId?: string | null;
  onSelectVenue?: (id: string) => void;
  center?: [number, number];
  zoom?: number;
  className?: string;
  interactive?: boolean;
  showUserLocationBtn?: boolean;
};

const DEFAULT_CENTER: [number, number] = [10.8231, 106.6297]; // TP. Hồ Chí Minh
const DEFAULT_ZOOM = 12;

export function VenueMap({
  venues,
  selectedId,
  onSelectVenue,
  center = DEFAULT_CENTER,
  zoom = DEFAULT_ZOOM,
  className = "h-[450px] w-full rounded-3xl",
  interactive = true,
  showUserLocationBtn = true,
}: VenueMapProps) {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<Map<string, L.Marker>>(new Map());
  const userMarkerRef = useRef<L.Marker | null>(null);
  const [locating, setLocating] = useState(false);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(
    null,
  );

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center,
      zoom,
      zoomControl: interactive,
      dragging: interactive,
      touchZoom: interactive,
      scrollWheelZoom: false, // Avoid hijacking page scroll
      doubleClickZoom: interactive,
    });

    // Standard OpenStreetMap tiles (100% Free, Public, No API Key Required)
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
      subdomains: ["a", "b", "c"],
    }).addTo(map);

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update Markers when venues or selectedId changes
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Remove existing markers
    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current.clear();

    const validVenues = venues.filter(
      (v) =>
        typeof v.latitude === "number" &&
        !isNaN(v.latitude) &&
        typeof v.longitude === "number" &&
        !isNaN(v.longitude),
    );

    if (validVenues.length === 0) return;

    const latLngs: L.LatLngExpression[] = [];

    validVenues.forEach((venue) => {
      const isSelected = selectedId === venue.id || selectedId === venue.sessionId;
      const priceText =
        venue.price !== undefined
          ? venue.price === 0
            ? "Free"
            : `${Math.round(venue.price / 1000)}k`
          : "🏸";

      // Custom Badminton Pill Marker
      const iconHtml = `
        <div class="group cursor-pointer transition-all duration-300 transform -translate-x-1/2 -translate-y-1/2 ${
          isSelected ? "scale-110 z-50" : "hover:scale-105 z-10"
        }">
          <div class="flex items-center gap-1.5 px-3 py-1.5 rounded-full shadow-lg border-2 font-bold text-xs ${
            isSelected
              ? "bg-emerald-600 border-white text-white ring-4 ring-emerald-400/50 shadow-emerald-600/40"
              : "bg-slate-900 border-white/90 text-white hover:bg-emerald-700"
          }">
            <span class="text-sm">🏸</span>
            <span class="tracking-tight">${priceText}</span>
          </div>
          <div class="w-2 h-2 bg-slate-900 rotate-45 mx-auto -mt-1 ${
            isSelected ? "bg-emerald-600" : ""
          }"></div>
        </div>
      `;

      const customIcon = L.divIcon({
        className: "custom-venue-pin",
        html: iconHtml,
        iconSize: [60, 34],
        iconAnchor: [30, 34],
        popupAnchor: [0, -32],
      });

      const marker = L.marker([venue.latitude!, venue.longitude!], {
        icon: customIcon,
      }).addTo(map);

      // Popup with rich information
      const navUrl =
        venue.googleMapsUrl ||
        `https://www.google.com/maps/dir/?api=1&destination=${venue.latitude},${venue.longitude}`;

      const popupHtml = `
        <div class="p-1 min-w-[220px] max-w-[260px] font-sans">
          <div class="flex items-center justify-between gap-1 border-b border-slate-100 pb-1.5 mb-1.5">
            <span class="text-[10px] font-extrabold uppercase tracking-wider text-emerald-600">Sân Cầu Lông</span>
            <span class="text-[10px] font-semibold text-slate-500">${venue.district || ""}</span>
          </div>
          <h4 class="font-bold text-slate-900 text-sm leading-tight">${venue.name}</h4>
          ${
            venue.address
              ? `<p class="text-[11px] text-slate-500 mt-1 line-clamp-2">${venue.address}</p>`
              : ""
          }
          ${
            venue.sessionTitle
              ? `<div class="mt-2 p-1.5 bg-emerald-50 rounded-xl border border-emerald-100 text-xs text-emerald-900">
                  <div class="font-bold truncate">🏸 ${venue.sessionTitle}</div>
                  <div class="text-[10px] text-emerald-700 mt-0.5">${
                    venue.datetime || ""
                  } ${
                    venue.slotsLeft !== undefined
                      ? `· Còn ${venue.slotsLeft} chỗ`
                      : ""
                  }</div>
                </div>`
              : ""
          }
          <div class="mt-2.5 flex items-center gap-2 pt-1 border-t border-slate-100">
            ${
              venue.sessionId
                ? `<a href="/sessions/${venue.sessionId}" class="flex-1 text-center py-1.5 px-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition">Xem Kèo</a>`
                : ""
            }
            <a href="${navUrl}" target="_blank" rel="noopener noreferrer" class="py-1.5 px-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold inline-flex items-center gap-1 transition" title="Chỉ đường Google Maps">
              <span>Chỉ đường</span>
              ↗
            </a>
          </div>
        </div>
      `;

      marker.bindPopup(popupHtml, {
        className: "custom-leaflet-popup",
        closeButton: true,
      });

      marker.on("click", () => {
        if (onSelectVenue) {
          onSelectVenue(venue.sessionId || venue.id);
        }
      });

      markersRef.current.set(venue.id, marker);
      latLngs.push([venue.latitude!, venue.longitude!]);
    });

    // If a venue is selected, open its popup and pan to it
    if (selectedId) {
      const targetVenue = validVenues.find(
        (v) => v.id === selectedId || v.sessionId === selectedId,
      );
      if (targetVenue) {
        const marker = markersRef.current.get(targetVenue.id);
        if (marker) {
          map.panTo([targetVenue.latitude!, targetVenue.longitude!], {
            animate: true,
            duration: 0.5,
          });
          marker.openPopup();
        }
      }
    } else if (latLngs.length > 1) {
      // Fit bounds to show all markers nicely
      try {
        const bounds = L.latLngBounds(latLngs);
        map.fitBounds(bounds, { padding: [40, 40], maxZoom: 15 });
      } catch {}
    } else if (latLngs.length === 1) {
      map.setView(latLngs[0], 14);
    }
  }, [venues, selectedId]);

  // Handle Geolocation
  const handleLocateMe = () => {
    if (!navigator.geolocation) {
      alert("Trình duyệt của bạn không hỗ trợ định vị GPS.");
      return;
    }

    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocating(false);
        const { latitude, longitude } = pos.coords;
        setUserLocation([latitude, longitude]);

        const map = mapInstanceRef.current;
        if (!map) return;

        // User Pulse Marker
        if (userMarkerRef.current) {
          userMarkerRef.current.remove();
        }

        const userIcon = L.divIcon({
          className: "custom-user-pin",
          html: `
            <div class="relative flex items-center justify-center">
              <span class="absolute h-8 w-8 rounded-full bg-sky-400 opacity-75 animate-ping"></span>
              <span class="relative flex h-4 w-4 rounded-full bg-sky-600 border-2 border-white shadow-md"></span>
            </div>
          `,
          iconSize: [32, 32],
          iconAnchor: [16, 16],
        });

        const marker = L.marker([latitude, longitude], { icon: userIcon })
          .addTo(map)
          .bindPopup("<b>Vị trí hiện tại của bạn</b>");

        userMarkerRef.current = marker;

        map.flyTo([latitude, longitude], 14, { duration: 1 });
      },
      (err) => {
        setLocating(false);
        alert("Không thể lấy vị trí của bạn: " + err.message);
      },
      { enableHighAccuracy: true, timeout: 8000 },
    );
  };

  return (
    <div className={`relative overflow-hidden border border-slate-200/90 shadow-sm ${className}`}>
      {/* Map Target Div */}
      <div ref={mapContainerRef} className="h-full w-full" />

      {/* Geolocation Control Button */}
      {showUserLocationBtn && (
        <button
          type="button"
          onClick={handleLocateMe}
          disabled={locating}
          title="Vị trí của tôi"
          className="absolute bottom-4 right-4 z-[400] flex items-center gap-1.5 rounded-full bg-white px-3.5 py-2 text-xs font-bold text-slate-800 shadow-md border border-slate-200 hover:bg-slate-50 transition active:scale-95"
        >
          <Locate
            className={`h-4 w-4 text-emerald-600 ${
              locating ? "animate-spin text-sky-600" : ""
            }`}
          />
          <span>{locating ? "Đang định vị..." : "Gần tôi"}</span>
        </button>
      )}
    </div>
  );
}

export default VenueMap;
