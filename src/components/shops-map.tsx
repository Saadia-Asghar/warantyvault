"use client";

import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { formatDistance } from "@/lib/geo";

export type MapShop = {
  id: string;
  shopName: string;
  brandName: string | null;
  city: string;
  sector: string | null;
  address: string;
  phone: string;
  latitude: number;
  longitude: number;
  distanceKm: number;
};

// Fix default marker icons in Next.js bundler
const shopIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const userIcon = new L.DivIcon({
  className: "",
  html: `<div style="width:14px;height:14px;border-radius:50%;background:#3b82f6;border:3px solid white;box-shadow:0 0 0 2px #3b82f6aa"></div>`,
  iconSize: [14, 14],
  iconAnchor: [7, 7],
});

function MapRecenter({ lat, lng, zoom }: { lat: number; lng: number; zoom: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView([lat, lng], zoom, { animate: true });
  }, [lat, lng, zoom, map]);
  return null;
}

type ShopsMapProps = {
  userLat: number;
  userLng: number;
  shops: MapShop[];
  radiusKm: number;
  selectedId?: string | null;
  onSelect?: (id: string) => void;
  className?: string;
};

export function ShopsMap({
  userLat,
  userLng,
  shops,
  radiusKm,
  selectedId,
  onSelect,
  className,
}: ShopsMapProps) {
  const zoom = radiusKm > 40 ? 10 : radiusKm > 15 ? 11 : 12;

  return (
    <div className={className}>
      <MapContainer
        center={[userLat, userLng]}
        zoom={zoom}
        scrollWheelZoom
        className="z-0 h-[min(52vh,420px)] w-full rounded-2xl border border-[var(--border)]"
        style={{ background: "var(--bg-elevated)" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapRecenter lat={userLat} lng={userLng} zoom={zoom} />
        <Marker position={[userLat, userLng]} icon={userIcon}>
          <Popup>You are here</Popup>
        </Marker>
        <Circle
          center={[userLat, userLng]}
          radius={radiusKm * 1000}
          pathOptions={{ color: "#3b82f6", fillColor: "#3b82f6", fillOpacity: 0.06, weight: 1 }}
        />
        {shops.map((shop) => (
          <Marker
            key={shop.id}
            position={[shop.latitude, shop.longitude]}
            icon={shopIcon}
            eventHandlers={{
              click: () => onSelect?.(shop.id),
            }}
            opacity={selectedId && selectedId !== shop.id ? 0.55 : 1}
          >
            <Popup>
              <div className="min-w-[160px] text-sm">
                <p className="font-semibold text-gray-900">{shop.shopName}</p>
                {shop.brandName && (
                  <p className="text-xs text-blue-600">{shop.brandName}</p>
                )}
                <p className="mt-1 text-xs text-gray-600">
                  {shop.sector ? `${shop.sector}, ` : ""}
                  {shop.city}
                </p>
                <p className="text-xs font-medium text-gray-800">
                  {formatDistance(shop.distanceKm)} away
                </p>
                <a href={`tel:${shop.phone}`} className="mt-2 block text-xs text-blue-600">
                  Call {shop.phone}
                </a>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
