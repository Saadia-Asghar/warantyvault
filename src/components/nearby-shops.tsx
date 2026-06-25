"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { MapPin, Navigation, Store, Loader2, AlertCircle } from "lucide-react";
import { formatDistance, mapsDirectionsUrl, PK_CITY_CENTERS } from "@/lib/geo";
import { ThemeToggle } from "@/components/theme-toggle";
import { Logo } from "@/components/logo";

type NearbyShop = {
  id: string;
  shopName: string;
  brandName: string | null;
  city: string;
  sector: string | null;
  address: string;
  phone: string;
  category: string;
  distanceKm: number;
  latitude: number;
  longitude: number;
  networkWarranty: boolean;
};

export function NearbyShopsClient({ embedded }: { embedded?: boolean }) {
  const [shops, setShops] = useState<NearbyShop[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [locationLabel, setLocationLabel] = useState("Your location");
  const [city, setCity] = useState("");

  const fetchNearby = useCallback(async (lat: number, lng: number, label: string) => {
    setLoading(true);
    setError("");
    setLocationLabel(label);
    try {
      const res = await fetch(`/api/shops/nearby?lat=${lat}&lng=${lng}&radiusKm=75`);
      const json = await res.json();
      if (!json.success) throw new Error(json.error ?? "Failed to load shops");
      setShops(json.data.shops);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not load nearby shops");
      setShops([]);
    } finally {
      setLoading(false);
    }
  }, []);

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
  }, [fetchNearby]);

  function useCity() {
    const center = PK_CITY_CENTERS[city];
    if (!center) return;
    void fetchNearby(center.lat, center.lng, center.label);
  }

  const content = (
    <>
      <div className="flex flex-wrap items-end gap-2">
        <div className="min-w-0 flex-1">
          <label className="text-xs text-[var(--text-tertiary)]">Or pick a city</label>
          <select
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className="mt-1 w-full rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] px-3 py-2.5 text-sm text-[var(--text-primary)]"
          >
            <option value="">Select city…</option>
            {Object.entries(PK_CITY_CENTERS).map(([key, c]) => (
              <option key={key} value={key}>
                {c.label}
              </option>
            ))}
          </select>
        </div>
        <button
          type="button"
          onClick={useCity}
          disabled={!city}
          className="btn-secondary shrink-0 px-4 py-2.5 text-sm disabled:opacity-40"
        >
          Search
        </button>
      </div>

      <p className="mt-4 flex items-center gap-1.5 text-xs text-[var(--text-muted)]">
        <MapPin className="h-3.5 w-3.5" />
        Showing approved outlets near <strong className="text-[var(--text-primary)]">{locationLabel}</strong>
      </p>

      {loading && (
        <div className="mt-10 flex flex-col items-center gap-2 text-[var(--text-muted)]">
          <Loader2 className="h-6 w-6 animate-spin" />
          <p className="text-sm">Finding shops…</p>
        </div>
      )}

      {error && !loading && (
        <div className="alert-banner-warning mt-6 flex items-start gap-2 text-sm">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          {error}
        </div>
      )}

      {!loading && !error && shops.length === 0 && (
        <p className="mt-10 text-center text-sm text-[var(--text-muted)]">
          No approved shops with location in this area yet.
        </p>
      )}

      <div className="mt-6 space-y-3">
        {shops.map((shop) => (
          <article
            key={shop.id}
            className="rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)] p-4"
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
          Visit approved brand outlets to buy with network warranty or process a claim.
        </p>
        {content}
        <p className="mt-8 text-center text-xs text-[var(--text-tertiary)]">
          <Link href="/get-started" className="text-[var(--accent)] hover:underline">
            Sign in as customer
          </Link>
          {" · "}
          <Link href="/verify" className="text-[var(--accent)] hover:underline">
            Verify warranty
          </Link>
        </p>
      </main>
    </div>
  );
}
