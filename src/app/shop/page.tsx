import Link from "next/link";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";
import { formatDate, warrantyStatusLabel } from "@/lib/utils";
import { syncExpiredWarranties } from "@/lib/warranty-service";
import { ShopBottomNav } from "@/components/shop-bottom-nav";
import { ContextBanner } from "@/components/context-banner";
import { ShopTopBar } from "@/components/shop-top-bar";
import { ChevronRight, Package, Plus, TrendingUp } from "lucide-react";

export default async function ShopDashboardPage() {
  await syncExpiredWarranties();
  const session = await getSession();
  if (!session || session.role !== "shop") return null;

  const shop = await prisma.shop.findUnique({
    where: { id: session.sub },
    include: { company: { select: { brandName: true } } },
  });

  const [warranties, inStock, salesAgg] = await Promise.all([
    prisma.warranty.findMany({
      where: { shopId: session.sub },
      include: { buyer: { select: { name: true, phone: true } } },
      orderBy: { createdAt: "desc" },
      take: 20,
    }),
    prisma.stockItem.count({ where: { shopId: session.sub, status: "IN_STOCK" } }),
    prisma.warranty.aggregate({
      where: {
        shopId: session.sub,
        purchaseAmount: { not: null },
      },
      _sum: { purchaseAmount: true },
      _count: { _all: true },
    }),
  ]);

  const stats = {
    active: warranties.filter((w) => w.status === "ACTIVE").length,
    pending: warranties.filter((w) => w.status === "PENDING_TRANSFER").length,
    total: warranties.length,
    revenue: salesAgg._sum.purchaseAmount ?? 0,
    inStock,
  };

  const byProduct = warranties.reduce(
    (acc, w) => {
      const key = w.productName;
      acc[key] = (acc[key] ?? 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );
  const topProducts = Object.entries(byProduct)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3);

  const pendingApproval = shop?.approvalStatus === "PENDING";

  return (
    <div className="min-h-screen bg-[var(--bg-deep)] pb-24 md:pb-8">
      <ContextBanner role="shop" />
      <ShopTopBar
        title={session.name ?? "Outlet"}
        subtitle={`${shop?.company?.brandName ? `${shop.company.brandName} · ` : ""}${shop?.sector ? `${shop.sector}, ` : ""}${shop?.city ?? ""}`}
      />

      <main className="mx-auto max-w-lg px-4 py-6">
        {pendingApproval && (
          <div className="alert-banner alert-banner-warning mb-4">
            <p className="text-sm">
              Awaiting brand approval — you cannot issue network warranties yet.
            </p>
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          <div className="summary-card">
            <p className="text-sm text-[var(--text-muted)]">Sales sealed</p>
            <p className="mt-1 text-2xl font-bold text-[var(--text-primary)]">{stats.total}</p>
            <p className="mt-1 text-xs text-[var(--accent)]">
              {stats.active} active · {stats.pending} pending
            </p>
          </div>
          <div className="summary-card">
            <p className="text-sm text-[var(--text-muted)]">Revenue logged</p>
            <p className="mt-1 text-2xl font-bold text-[var(--text-primary)]">
              {stats.revenue > 0 ? `₨${Math.round(stats.revenue).toLocaleString("en-PK")}` : "—"}
            </p>
            <p className="mt-1 text-xs text-[var(--text-muted)]">{stats.inStock} in inventory</p>
          </div>
        </div>

        {topProducts.length > 0 && (
          <div className="mt-4 rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] p-4">
            <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[var(--text-tertiary)]">
              <TrendingUp className="h-3.5 w-3.5" />
              Top products
            </p>
            <ul className="mt-2 space-y-1 text-sm text-[var(--text-muted)]">
              {topProducts.map(([name, count]) => (
                <li key={name} className="flex justify-between">
                  <span className="truncate">{name}</span>
                  <span className="font-medium text-[var(--text-primary)]">{count}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {!pendingApproval && (
          <Link href="/shop/issue" className="btn-primary mt-6 w-full">
            <Plus className="h-5 w-5" /> Record sale & warranty
          </Link>
        )}

        <Link
          href="/shop/stock"
          className="mt-3 flex items-center justify-center gap-1 text-sm text-[var(--accent)] hover:underline"
        >
          Inventory ({stats.inStock} units) <ChevronRight className="h-4 w-4" />
        </Link>

        <h2 className="mb-2 mt-8 px-1 text-xs font-semibold uppercase tracking-wider text-[var(--text-tertiary)]">
          Recent activity
        </h2>

        {warranties.length > 0 ? (
          <div className="activity-feed">
            {warranties.map((w) => (
              <div key={w.id} className="activity-row">
                <div className="activity-icon">
                  <Package className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium text-[var(--text-primary)]">{w.productName}</p>
                  <p className="truncate font-mono text-xs text-[var(--text-tertiary)]">
                    {w.warrantyCode}
                  </p>
                  <p className="text-xs text-[var(--text-muted)]">
                    {w.buyer?.name ?? w.buyerName ?? w.buyerPhone} · {formatDate(w.endDate)}
                  </p>
                </div>
                <Badge
                  variant={
                    w.status === "ACTIVE"
                      ? "active"
                      : w.status === "PENDING_TRANSFER"
                        ? "pending"
                        : w.status === "PENDING_RESALE"
                          ? "pending"
                          : w.status === "EXPIRED"
                          ? "expired"
                          : "default"
                  }
                >
                  {warrantyStatusLabel(w.status)}
                </Badge>
              </div>
            ))}
          </div>
        ) : (
          <div className="activity-feed px-4 py-12 text-center">
            <p className="text-sm text-[var(--text-muted)]">
              No warranties yet — issue your first one to a customer.
            </p>
          </div>
        )}

        <Link
          href="/shop/records"
          className="mt-4 flex items-center justify-center gap-1 text-sm text-[var(--accent)] hover:underline"
        >
          Search all records (incl. expired) <ChevronRight className="h-4 w-4" />
        </Link>

        <Link
          href="/shop/verify"
          className="mt-2 flex items-center justify-center gap-1 text-sm text-[var(--text-muted)] hover:underline"
        >
          Verify customer QR <ChevronRight className="h-4 w-4" />
        </Link>
      </main>

      <ShopBottomNav />
    </div>
  );
}
