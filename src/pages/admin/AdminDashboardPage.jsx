import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  AlertTriangle,
  ArrowUpRight,
  Award,
  Clock,
  Gauge,
  IndianRupee,
  Link2,
  Loader2,
  Package,
  Target,
  Timer,
  TrendingUp,
  UserCheck,
  UserPlus,
  Users,
  Wallet,
} from 'lucide-react'
import SEO from '../../components/SEO'
import AdminForbidden from '../../components/admin/AdminForbidden'
import { usePartnerAuth } from '../../hooks/usePartnerAuth'
import { adminGetStats } from '../../utils/partnerApi'

function formatRupees(paise) {
  return `₹${Math.round((paise || 0) / 100).toLocaleString('en-IN')}`
}

function formatDate(iso) {
  return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
}

function formatHours(hours) {
  if (hours === null || hours === undefined) return '—'
  if (hours < 24) return `${hours.toFixed(1)}h`
  return `${(hours / 24).toFixed(1)}d`
}

function StatTile({ icon: Icon, label, value, sub, accent = 'rose' }) {
  const accents = {
    rose: 'text-rose bg-blush/70',
    ink: 'text-ink bg-champagne/70',
  }
  return (
    <div className="rounded-2xl border border-white/60 bg-ivory/60 px-5 py-5 shadow-soft">
      <div className={`inline-flex h-8 w-8 items-center justify-center rounded-lg ${accents[accent]}`}>
        <Icon className="h-4 w-4" />
      </div>
      <p className="mt-3 font-serif text-3xl text-ink">{value}</p>
      <p className="text-xs uppercase tracking-[0.15em] text-ink-soft">{label}</p>
      {sub && <p className="mt-1 text-xs text-ink-soft/70">{sub}</p>}
    </div>
  )
}

// A dependency-free bar chart — this codebase has no charting library
// installed, and 30 daily bars don't need one. Zero-filled series in, SVG
// rects out; each bar's exact value is available on hover via <title> (a
// native tooltip, no extra JS). Generic over which field of the series to
// plot so both the revenue and the new-signups trend reuse it.
function DayBarChart({ byDay, valueKey, formatValue, colorClass = 'fill-rose', ariaLabel }) {
  const max = Math.max(1, ...byDay.map((d) => d[valueKey]))
  const width = 600
  const height = 140
  const gap = 2
  const barWidth = byDay.length > 0 ? width / byDay.length - gap : 0

  return (
    <div className="overflow-x-auto">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        preserveAspectRatio="none"
        className="h-36 w-full min-w-[480px]"
        role="img"
        aria-label={ariaLabel}
      >
        {byDay.map((d, i) => {
          const value = d[valueKey]
          const barHeight = value > 0 ? Math.max(2, (value / max) * (height - 4)) : 1
          return (
            <rect
              key={d.date}
              x={i * (barWidth + gap)}
              y={height - barHeight}
              width={Math.max(1, barWidth)}
              height={barHeight}
              rx={1.5}
              className={value > 0 ? colorClass : 'fill-champagne-deep/40'}
            >
              <title>
                {formatDate(d.date)} — {formatValue(value)}
              </title>
            </rect>
          )
        })}
      </svg>
      <div className="mt-1 flex justify-between text-[11px] text-ink-soft/70">
        <span>{byDay[0] ? formatDate(byDay[0].date) : ''}</span>
        <span>{byDay[byDay.length - 1] ? formatDate(byDay[byDay.length - 1].date) : ''}</span>
      </div>
    </div>
  )
}

function FunnelRow({ label, count, total, colorClass }) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0
  return (
    <div>
      <div className="flex items-center justify-between text-sm">
        <span className="capitalize text-ink-soft">{label.replace('_', ' ')}</span>
        <span className="font-medium text-ink">{count}</span>
      </div>
      <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-champagne/60">
        <div className={`h-full rounded-full ${colorClass}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}

// How many partners make it all the way from signing up to actually
// shipping a client invite — the single number that answers "is the
// portal working", not just "is it growing". Each step's bar is sized off
// signedUp (the top of the funnel), so the drop-off between steps reads
// directly as unfilled bar.
function ActivationFunnel({ funnel }) {
  const steps = [
    { label: 'Signed up', count: funnel.signedUp },
    { label: 'Approved', count: funnel.approved },
    { label: 'Bought credits', count: funnel.purchasedCredits },
    { label: 'Created an invite', count: funnel.createdInvite },
  ]
  const total = Math.max(1, funnel.signedUp)
  return (
    <div className="space-y-3">
      {steps.map((s) => {
        const pct = Math.round((s.count / total) * 100)
        return (
          <div key={s.label}>
            <div className="flex items-center justify-between text-sm">
              <span className="text-ink-soft">{s.label}</span>
              <span className="font-medium text-ink">
                {s.count} <span className="font-normal text-ink-soft/70">({pct}%)</span>
              </span>
            </div>
            <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-champagne/60">
              <div className="h-full rounded-full bg-rose" style={{ width: `${pct}%` }} />
            </div>
          </div>
        )
      })}
    </div>
  )
}

function PackageBreakdown({ packages }) {
  if (packages.length === 0) {
    return <p className="mt-3 text-sm text-ink-soft">No purchases yet.</p>
  }
  const maxRevenue = Math.max(1, ...packages.map((p) => p.revenuePaise))
  return (
    <div className="mt-3 space-y-3">
      {packages.map((pkg) => (
        <div key={pkg.packageId}>
          <div className="flex items-center justify-between text-sm">
            <span className="text-ink">{pkg.label}</span>
            <span className="text-ink-soft">
              {pkg.purchases} sold · {formatRupees(pkg.revenuePaise)}
            </span>
          </div>
          <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-champagne/60">
            <div className="h-full rounded-full bg-rose" style={{ width: `${Math.round((pkg.revenuePaise / maxRevenue) * 100)}%` }} />
          </div>
        </div>
      ))}
    </div>
  )
}

// "Dashboard" in the admin sidebar (see AdminShell.jsx) — the full-picture
// report an admin actually wants: revenue and credits sold across every
// partner, growth trend, the signup→invite activation funnel, program
// health (approval speed, credit utilization, per-partner averages), who's
// driving it (top partners, package popularity), who needs a nudge, and
// recent activity. Everything here comes from one GET /api/admin/stats
// call (see adminGetStats() in api/_lib/partnerHandlers.js) — no
// per-partner drilldown requests.
export default function AdminDashboardPage() {
  const { accessToken } = usePartnerAuth()
  const [stats, setStats] = useState(null)
  const [status, setStatus] = useState('loading') // loading | success | forbidden | error

  const load = useCallback(async () => {
    setStatus('loading')
    try {
      const result = await adminGetStats(accessToken)
      setStats(result.stats)
      setStatus('success')
    } catch (err) {
      setStatus(/not authorized|sign in required/i.test(err.message || '') ? 'forbidden' : 'error')
    }
  }, [accessToken])

  useEffect(() => {
    load()
  }, [load])

  if (status === 'forbidden') return <AdminForbidden />

  return (
    <div className="mx-auto max-w-6xl px-6 py-10 sm:py-14">
      <SEO title="Admin — Dashboard | InviteMyPeople" path="/admin/dashboard" noindex />

      <p className="text-xs uppercase tracking-[0.2em] text-ink-soft">Admin Panel</p>
      <h1 className="mt-1 font-serif text-3xl text-ink">Dashboard</h1>
      <p className="mt-1 text-sm text-ink-soft">
        Everything happening across the partner program — revenue, credits, and activity, at a glance.
      </p>

      {status === 'loading' && (
        <div className="flex items-center gap-2 py-16 text-ink-soft">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading dashboard…
        </div>
      )}
      {status === 'error' && <p className="py-16 text-ink-soft">Could not load dashboard data.</p>}

      {status === 'success' && stats && (
        <>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatTile
              icon={IndianRupee}
              label="Total Revenue"
              value={formatRupees(stats.revenue.totalPaise)}
              sub={`${formatRupees(stats.revenue.last30dPaise)} in last ${stats.windowDays} days`}
            />
            <StatTile
              icon={UserCheck}
              label="Active Partners"
              value={stats.partners.active}
              sub={`${stats.partners.total} total · ${stats.partners.newLast30d} new in ${stats.windowDays}d`}
            />
            <StatTile
              icon={Clock}
              label="Pending Approvals"
              value={stats.partners.pending_approval}
              sub={stats.partners.pending_approval > 0 ? 'Needs your review' : 'All caught up'}
              accent="ink"
            />
            <StatTile
              icon={Link2}
              label="Invites Created"
              value={stats.invites.total}
              sub={`${stats.invites.last30d} in last ${stats.windowDays} days`}
            />
          </div>

          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatTile
              icon={Wallet}
              label="Credits Sold"
              value={stats.credits.totalSold.toLocaleString('en-IN')}
              sub={`${stats.credits.totalRemaining.toLocaleString('en-IN')} still outstanding`}
              accent="ink"
            />
            <StatTile
              icon={Gauge}
              label="Credit Utilization"
              value={`${stats.health.creditUtilizationPct}%`}
              sub="Share of sold credits already spent on invites"
              accent="ink"
            />
            <StatTile
              icon={Award}
              label="Avg Revenue / Active Partner"
              value={formatRupees(stats.health.avgRevenuePerActivePartnerPaise)}
              sub={`${stats.health.avgInvitesPerActivePartner.toFixed(1)} invites / active partner`}
              accent="ink"
            />
            <StatTile
              icon={Timer}
              label="Avg Approval Time"
              value={formatHours(stats.health.avgApprovalHours)}
              sub="Signup to admin approval"
              accent="ink"
            />
          </div>

          <div className="mt-8 grid gap-4 lg:grid-cols-2">
            <div className="rounded-2xl border border-white/60 bg-ivory/60 px-5 py-5 shadow-soft">
              <div className="flex items-center gap-2 font-serif text-lg text-ink">
                <TrendingUp className="h-4 w-4 text-rose" />
                Revenue — last {stats.windowDays} days
              </div>
              <div className="mt-4">
                <DayBarChart
                  byDay={stats.revenue.byDay}
                  valueKey="amountPaise"
                  formatValue={formatRupees}
                  colorClass="fill-rose"
                  ariaLabel="Revenue by day over the last 30 days"
                />
              </div>
            </div>

            <div className="rounded-2xl border border-white/60 bg-ivory/60 px-5 py-5 shadow-soft">
              <div className="flex items-center gap-2 font-serif text-lg text-ink">
                <UserPlus className="h-4 w-4 text-rose" />
                New signups — last {stats.windowDays} days
              </div>
              <div className="mt-4">
                <DayBarChart
                  byDay={stats.signupsByDay}
                  valueKey="count"
                  formatValue={(v) => `${v} signup${v === 1 ? '' : 's'}`}
                  colorClass="fill-ink/70"
                  ariaLabel="New partner signups by day over the last 30 days"
                />
              </div>
            </div>
          </div>

          <div className="mt-4 grid gap-4 lg:grid-cols-2">
            <div className="rounded-2xl border border-white/60 bg-ivory/60 px-5 py-5 shadow-soft">
              <div className="flex items-center gap-2 font-serif text-lg text-ink">
                <Target className="h-4 w-4 text-rose" />
                Activation funnel
              </div>
              <p className="mt-1 text-xs text-ink-soft/70">Signup → approval → first purchase → first invite shipped.</p>
              <div className="mt-4">
                <ActivationFunnel funnel={stats.funnel} />
              </div>
            </div>

            <div className="rounded-2xl border border-white/60 bg-ivory/60 px-5 py-5 shadow-soft">
              <div className="flex items-center gap-2 font-serif text-lg text-ink">
                <Users className="h-4 w-4 text-rose" />
                Partner status
              </div>
              <div className="mt-4 space-y-3">
                <FunnelRow label="active" count={stats.partners.active} total={stats.partners.total} colorClass="bg-rose" />
                <FunnelRow
                  label="pending_approval"
                  count={stats.partners.pending_approval}
                  total={stats.partners.total}
                  colorClass="bg-ink/60"
                />
                <FunnelRow
                  label="suspended"
                  count={stats.partners.suspended}
                  total={stats.partners.total}
                  colorClass="bg-ink/30"
                />
                <FunnelRow
                  label="rejected"
                  count={stats.partners.rejected}
                  total={stats.partners.total}
                  colorClass="bg-ink/15"
                />
              </div>
              {stats.partners.pending_approval > 0 && (
                <Link
                  to="/admin/partners"
                  className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-rose"
                >
                  Review pending applications
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </Link>
              )}
            </div>
          </div>

          <div className="mt-4 grid gap-4 lg:grid-cols-2">
            <div className="rounded-2xl border border-white/60 bg-ivory/50 px-5 py-4 shadow-soft">
              <h3 className="flex items-center gap-2 font-serif text-lg text-ink">
                <Package className="h-4 w-4 text-rose" />
                Package popularity
              </h3>
              <PackageBreakdown packages={stats.packageBreakdown} />
            </div>

            <div className="rounded-2xl border border-white/60 bg-ivory/50 px-5 py-4 shadow-soft">
              <h3 className="flex items-center gap-2 font-serif text-lg text-ink">
                <AlertTriangle className="h-4 w-4 text-rose" />
                Needs a nudge
              </h3>
              <p className="mt-1 text-xs text-ink-soft/70">Active partners who haven&rsquo;t created a client invite yet.</p>
              <div className="mt-3 space-y-2.5">
                {stats.needsAttention.length === 0 && (
                  <p className="text-sm text-ink-soft">Every active partner has shipped at least one invite.</p>
                )}
                {stats.needsAttention.map((p) => (
                  <div key={p.id} className="flex items-center justify-between text-sm">
                    <div className="min-w-0">
                      <p className="truncate text-ink">{p.businessName}</p>
                      <p className="text-xs text-ink-soft/70">Joined {formatDate(p.createdAt)}</p>
                    </div>
                    <span className="shrink-0 text-xs text-ink-soft">
                      {p.hasPurchased ? `${p.creditsRemaining} credits left` : 'No purchase yet'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-8">
            <h2 className="flex items-center gap-2 font-serif text-xl text-ink">
              <Award className="h-4 w-4 text-rose" />
              Top partners by revenue
            </h2>
            {stats.topPartners.length === 0 ? (
              <div className="mt-4 rounded-2xl border border-white/60 bg-ivory/50 px-5 py-8 text-center text-ink-soft">
                No purchases yet.
              </div>
            ) : (
              <div className="mt-4 overflow-x-auto rounded-2xl border border-white/60 bg-ivory/50 shadow-soft">
                <table className="w-full min-w-[560px] text-sm">
                  <thead>
                    <tr className="border-b border-champagne-deep/30 text-left text-xs uppercase tracking-[0.1em] text-ink-soft">
                      <th className="px-5 py-3 font-medium">Partner</th>
                      <th className="px-5 py-3 font-medium">Status</th>
                      <th className="px-5 py-3 font-medium">Revenue</th>
                      <th className="px-5 py-3 font-medium">Invites</th>
                      <th className="px-5 py-3 font-medium">Credits left</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.topPartners.map((p) => (
                      <tr key={p.id} className="border-b border-champagne-deep/20 last:border-0">
                        <td className="px-5 py-3 text-ink">{p.businessName}</td>
                        <td className="px-5 py-3 capitalize text-ink-soft">{p.status.replace('_', ' ')}</td>
                        <td className="px-5 py-3 font-medium text-ink">{formatRupees(p.revenuePaise)}</td>
                        <td className="px-5 py-3 text-ink-soft">{p.invitesCreated}</td>
                        <td className="px-5 py-3 text-ink-soft">{p.creditsRemaining}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className="mt-8 grid gap-4 lg:grid-cols-3">
            <div className="rounded-2xl border border-white/60 bg-ivory/50 px-5 py-4 shadow-soft">
              <h3 className="font-serif text-lg text-ink">Recent purchases</h3>
              <div className="mt-3 space-y-2.5">
                {stats.recentTransactions.length === 0 && <p className="text-sm text-ink-soft">None yet.</p>}
                {stats.recentTransactions.map((t, i) => (
                  <div key={i} className="flex items-center justify-between text-sm">
                    <div className="min-w-0">
                      <p className="truncate text-ink">{t.businessName}</p>
                      <p className="text-xs text-ink-soft/70">{formatDate(t.createdAt)}</p>
                    </div>
                    <span className="shrink-0 font-medium text-rose">{formatRupees(t.amountPaise)}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-white/60 bg-ivory/50 px-5 py-4 shadow-soft">
              <h3 className="font-serif text-lg text-ink">Recent invites</h3>
              <div className="mt-3 space-y-2.5">
                {stats.recentInvites.length === 0 && <p className="text-sm text-ink-soft">None yet.</p>}
                {stats.recentInvites.map((inv) => (
                  <div key={inv.id} className="text-sm">
                    <p className="truncate text-ink">{inv.coupleNames}</p>
                    <p className="truncate text-xs text-ink-soft/70">
                      {inv.businessName} · {formatDate(inv.createdAt)}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-white/60 bg-ivory/50 px-5 py-4 shadow-soft">
              <h3 className="font-serif text-lg text-ink">Recent signups</h3>
              <div className="mt-3 space-y-2.5">
                {stats.recentSignups.length === 0 && <p className="text-sm text-ink-soft">None yet.</p>}
                {stats.recentSignups.map((p) => (
                  <div key={p.id} className="flex items-center justify-between text-sm">
                    <div className="min-w-0">
                      <p className="truncate text-ink">{p.businessName}</p>
                      <p className="text-xs text-ink-soft/70">{formatDate(p.createdAt)}</p>
                    </div>
                    <span className="shrink-0 rounded-full bg-champagne px-2 py-0.5 text-[11px] capitalize text-ink-soft">
                      {p.status.replace('_', ' ')}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
