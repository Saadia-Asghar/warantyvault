"use client";

import { useCallback, useEffect, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { MapPin, Navigation, Store, Loader2, AlertCircle, Search, LocateFixed } from "lucide-react";
import { formatDistance, mapsDirectionsUrl, PK_CITY_CENTERS } from "@/lib/geo";
import { ThemeToggle } from "@/components/theme-toggle";
import { Logo } from "@/components/logo";
import type { MapShop } from "@/components/shops-map";

const ShopsMap = dynamic(() => import("@/components/shops-map").then((m) => m.ShopsMap), {
  ssr: false,
  loading: () => (
    <div className="flex h-[min(52vh,420px)] items-center justify-center rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)]">
      <Loader2 className="h-6 w-6 animate-spin text-[var(--text-muted)]" />
    </div>
  ),
});

type NearbyShop = MapShop & { networkWarranty: boolean; address: string; category: string };

export function NearbyShopsClient({ embedded }: { embedded?: boolean }) {
  const [shops, setShops] = useState<NearbyShop[]>([]);
  const [brands, setBrands] = useState<string[]>([]);
  const [cities, setCities] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [locationLabel, setLocationLabel] = useState("Your location");
  const [userPos, setUserPos] = useState({ lat: PK_CITY_CENTERS.islamabad.lat, lng: PK_CITY_CENTERS.islamabad.lng });
  const [city, setCity] = useState("");
  const [brand, setBrand] = useState("");
  const [query, setQuery] = useState("");
  const [radiusKm, setRadiusKm] = useState(75);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [liveTracking, setLiveTracking] = useState(false);

  useEffect(() => {
    fetch("/api/shops/filters")
      .then((r) => r.json())
      .then((j) => {
        if (j.success) {
          setBrands(j.data.brands);
          setCities(j.data.cities);
        }
      })
      .catch(() => {});
  }, []);

  const fetchNearby = useCallback(
    async (lat: number, lng: number, label: string) => {
      setLoading(true);
      setError("");
      setLocationLabel(label);
      setUserPos({ lat, lng });
      try {
        const params = new URLSearchParams({
          lat: String(lat),
          lng: String(lng),
          radiusKm: String(radiusKm),
        });
        if (brand) params.set("brand", brand);
        if (city) params.set("city", city);
        if (query.trim()) params.set("q", query.trim());
        const res = await fetch(`/api/shops/nearby?${params}`);
        const json = await res.json();
        if (!json.success) throw new Error(json.error ?? "Failed to load shops");
        setShops(json.data.shops);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Could not load nearby shops");
        setShops([]);
      } finally {
        setLoading(false);
      }
    },
    [brand, city, query, radiusKm]
  );

  useEffect(() => {
    if (!navigator.geolocation) {
      void fetchNearby(
        PK_CITY_CENTERS.islamabad.lat,
        PK_CITY_CENTERS.islamabad.lng,
        "Islamabad (default)"
      );
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        void fetchNearby(pos.coords.latitude, pos.coords.longitude, "Near you");
        setLiveTracking(true);
      },
      () => {
        void fetchNearby(
          PK_CITY_CENTERS.islamabad.lat,
          PK_CITY_CENTERS.islamabad.lng,
          "Islamabad (location denied)"
        );
      },
      { enableHighAccuracy: true, timeout: 12000 }
    );

    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        setUserPos({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setLiveTracking(true);
      },
      undefined,
      { enableHighAccuracy: true, maximumAge: 20_000 }
    );

    return () => navigator.geolocation.clearWatch(watchId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function refreshSearch() {
    void fetchNearby(userPos.lat, userPos.lng, locationLabel);
  }

  const content = (
    <>
      <div className="space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-tertiary)]" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && refreshSearch()}
            placeholder="Search shop, brand, or area…"
            className="input-field w-full pl-9"
          />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-xs text-[var(--text-tertiary)]">Brand / company</label>
            <select
              value={brand}
              onChange={(e) => setBrand(e.target.value)}
              className="mt-1 w-full rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] px-3 py-2.5 text-sm"
            >
              <option value="">All brands</option>
              {brands.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs text-[var(--text-tertiary)]">City</label>
            <select
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="mt-1 w-full rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] px-3 py-2.5 text-sm"
            >
              <option value="">All cities</option>
              {cities.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="flex flex-wrap items-end gap-2">
          <div className="min-w-[100px] flex-1">
            <label className="text-xs text-[var(--text-tertiary)]">Radius (km)</label>
            <select
              value={radiusKm}
              onChange={(e) => setRadiusKm(Number(e.target.value))}
              className="mt-1 w-full rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] px-3 py-2.5 text-sm"
            >
              {[25, 50, 75, 150].map((r) => (
                <option key={r} value={r}>
                  {r} km
                </option>
              ))}
            </select>
          </div>
          <button type="button" onClick={refreshSearch} className="btn-primary shrink-0 px-4 py-2.5 text-sm">
            Search
          </button>
          <button
            type="button"
            onClick={() => {
              if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition((pos) => {
                  void fetchNearby(pos.coords.latitude, pos.coords.longitude, "Near you");
                });
              }
            }}
            className="btn-secondary shrink-0 px-3 py-2.5"
            title="Use my location"
          >
            <LocateFixed className="h-4 w-4" />
          </button>
        </div>
      </div>

      <p className="mt-4 flex items-center gap-1.5 text-xs text-[var(--text-muted)]">
        <MapPin className="h-3.5 w-3.5" />
        {liveTracking && <span className="text-emerald-400">● Live</span>}
        Showing outlets near <strong className="text-[var(--text-primary)]">{locationLabel}</strong>
        {shops.length > 0 && ` · ${shops.length} found`}
      </p>

      {!loading && (
        <ShopsMap
          className="mt-4"
          userLat={userPos.lat}
          userLng={userPos.lng}
          shops={shops}
          radiusKm={radiusKm}
          selectedId={selectedId}
          onSelect={setSelectedId}
        />
      )}

      {loading && (
        <div className="mt-6 flex flex-col items-center gap-2 text-[var(--text-muted)]">
          <Loader2 className="h-6 w-6 animate-spin" />
          <p className="text-sm">Loading map & shops…</p>
        </div>
      )}

      {error && !loading && (
        <div className="alert-banner-warning mt-6 flex items-start gap-2 text-sm">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          {error}
        </div>
      )}

      {!loading && !error && shops.length === 0 && (
        <p className="mt-6 text-center text-sm text-[var(--text-muted)]">
          No approved shops in this area. Try a larger radius or different city.
        </p>
      )}

      <div className="mt-6 space-y-3">
        {shops.map((shop) => (
          <article
            key={shop.id}
            id={`shop-${shop.id}`}
            className={`rounded-2xl border bg-[var(--bg-surface)] p-4 transition ${
              selectedId === shop.id ? "border-[var(--accent)]" : "border-[var(--border)]"
            }`}
            onClick={() => setSelectedId(shop.id)}
          >
            <div className="flex items-start gap-3">
              <div className="activity-icon shrink-0">
                <Store className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-[var(--text-primary)]">{shop.shopName}</p>
                {shop.brandName && (
                  <p className="text-xs text-[var(--accent)]">{shop.brandName} network</p>
                )}
                <p className="mt-1 text-sm text-[var(--text-muted)]">
                  {shop.sector ? `${shop.sector}, ` : ""}
                  {shop.city}
                </p>
                <p className="mt-0.5 text-xs text-[var(--text-tertiary)]">{shop.address}</p>
                <p className="mt-2 text-xs font-medium text-[var(--accent)]">
                  {formatDistance(shop.distanceKm)} away
                  {shop.networkWarranty && " · Cross-outlet claims"}
                </p>
              </div>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              <a
                href={mapsDirectionsUrl(shop.latitude, shop.longitude, shop.shopName)}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary btn-primary-sm inline-flex items-center gap-1.5"
              >
                <Navigation className="h-3.5 w-3.5" />
                Directions
              </a>
              <a href={`tel:${shop.phone}`} className="btn-secondary btn-primary-sm text-xs">
                Call {shop.phone}
              </a>
            </div>
          </article>
        ))}
      </div>
    </>
  );

  if (embedded) return content;

  return (
    <div className="min-h-screen bg-[var(--bg-deep)] pb-24">
      <header className="sticky top-0 z-40 border-b border-[var(--border)] bg-[var(--bg-deep)]">
        <div className="mx-auto flex max-w-lg items-center justify-between px-4 py-3">
          <Logo href="/" size={32} />
          <ThemeToggle />
        </div>
      </header>
      <main className="mx-auto max-w-lg px-4 py-6">
        <h1 className="text-xl font-bold text-[var(--text-primary)]">Shops near you</h1>
        <p className="mt-1 text-sm text-[var(--text-muted)]">
          Live map · filter by brand or city · visit outlets for network warranty.
        </p>
        {content}
        <p className="mt-8 text-center text-xs text-[var(--text-tertiary)]">
          <Link href="/verify" className="text-[var(--accent)] hover:underline">
            Scan warranty QR
          </Link>
          {" · "}
          <Link href="/get-started" className="text-[var(--accent)] hover:underline">
            Sign in
          </Link>
        </p>
      </main>
    </div>
  );
}
