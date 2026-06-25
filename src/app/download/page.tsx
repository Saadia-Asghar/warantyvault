import Link from "next/link";
import { Logo } from "@/components/logo";
import { Download, Smartphone, Globe, Shield } from "lucide-react";
import { BRAND } from "@/lib/copy";
import { existsSync } from "fs";
import path from "path";

const APK_PATH = path.join(process.cwd(), "public", "downloads", "warrantyvault-pk.apk");
const hasApk = existsSync(APK_PATH);

export default function DownloadPage() {
  const appUrl =
    process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ??
    "https://warantyvault.vercel.app";

  return (
    <div className="min-h-screen bg-[var(--bg-deep)]">
      <header className="border-b border-[var(--border)] px-4 py-3">
        <Logo href="/" size={36} />
      </header>

      <main className="mx-auto max-w-lg px-4 py-10">
        <p className="text-xs font-semibold uppercase tracking-widest text-[var(--accent)]">
          Mobile app
        </p>
        <h1 className="mt-3 text-2xl font-bold text-[var(--text-primary)]">
          Install {BRAND.name}
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-[var(--text-muted)]">
          Use the same account and database as the website. Your warranties, chat, and map sync
          with your live deployment.
        </p>

        {hasApk ? (
          <a
            href="/downloads/warrantyvault-pk.apk"
            download
            className="btn-primary mt-8 flex w-full items-center justify-center gap-2"
          >
            <Download className="h-5 w-5" />
            Download Android APK
          </a>
        ) : (
          <div className="alert-banner alert-banner-warning mt-8">
            <p className="text-sm">
              APK not built on this server yet. Use <strong>Install from browser</strong> below, or
              build locally with <code className="font-mono text-xs">npm run android:build</code>{" "}
              after installing Android Studio.
            </p>
          </div>
        )}

        <div className="mt-8 space-y-3">
          <div className="panel flex gap-4 p-4">
            <div className="activity-icon shrink-0">
              <Smartphone className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-semibold text-[var(--text-primary)]">Android — Add to Home Screen</h2>
              <p className="mt-1 text-sm text-[var(--text-muted)]">
                Open{" "}
                <a href={appUrl} className="text-[var(--accent)] hover:underline">
                  {appUrl.replace(/^https?:\/\//, "")}
                </a>{" "}
                in Chrome → menu → <strong>Install app</strong> or <strong>Add to Home screen</strong>.
                Works offline shell; data loads from your database when online.
              </p>
            </div>
          </div>

          <div className="panel flex gap-4 p-4">
            <div className="activity-icon shrink-0">
              <Globe className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-semibold text-[var(--text-primary)]">Native APK (Capacitor)</h2>
              <p className="mt-1 text-sm text-[var(--text-muted)]">
                The Android project is in <code className="font-mono text-xs">android/</code>. It
                loads your deployed site in a secure WebView — API, chat, GPS map, and QR scanner all
                work against your Supabase database.
              </p>
              <p className="mt-2 text-xs text-[var(--text-tertiary)]">
                Build guide: <code className="font-mono">docs/MOBILE_APK_DEPLOY.md</code>
              </p>
            </div>
          </div>

          <div className="panel flex gap-4 p-4">
            <div className="activity-icon shrink-0">
              <Shield className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-semibold text-[var(--text-primary)]">Before installing</h2>
              <p className="mt-1 text-sm text-[var(--text-muted)]">
                Enable <strong>Install unknown apps</strong> for your browser or file manager if
                sideloading the APK. For Play Store release, use the signed AAB from Android Studio.
              </p>
            </div>
          </div>
        </div>

        <Link href="/get-started" className="btn-secondary mt-8 inline-flex w-full justify-center">
          Open web app
        </Link>
      </main>
    </div>
  );
}
