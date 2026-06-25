import Link from "next/link";
import { Logo } from "@/components/logo";
import { LandingHero } from "@/components/landing-hero";
import { OnboardingRedirect } from "@/components/onboarding-redirect";
import { ThemeToggle } from "@/components/theme-toggle";

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <OnboardingRedirect />
      <header className="sticky top-0 z-50 border-b border-[var(--border)] bg-[var(--bg-deep)]">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3 sm:px-6">
          <Logo href="/" size={36} />
          <div className="flex items-center gap-2">
            <Link href="/get-started" className="btn-ghost hidden text-xs sm:inline-flex">
              Sign in
            </Link>
            <ThemeToggle />
            <Link href="/get-started" className="btn-primary btn-primary-sm">
              Create account
            </Link>
          </div>
        </div>
      </header>

      <main>
        <LandingHero />
      </main>

      <footer className="border-t border-[var(--border)] py-6 text-center text-xs text-[var(--text-tertiary)]">
        <p>ShopSeal PK · Digital shop sale & warranty records for Pakistan</p>
        <p className="mt-2">
          <Link href="/complaints" className="text-[var(--accent)] hover:underline">
            Submit a complaint
          </Link>
          {" · "}
          <Link href="/download" className="text-[var(--accent)] hover:underline">
            Android app
          </Link>
          {" · "}
          <Link href="/nearby" className="text-[var(--accent)] hover:underline">
            Shops near me
          </Link>
          {" · "}
          <Link href="/forgot-password" className="text-[var(--accent)] hover:underline">
            Forgot password
          </Link>
        </p>
      </footer>
    </div>
  );
}
