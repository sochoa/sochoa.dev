import { useEffect, useState } from 'react'
import { listStats, type VisitorStatResponse } from '@/api'

interface StatsData {
  totalPageViews: number
  totalUniqueVisitors: number
  averagePageViews: number
  topPages: Array<{ page: string; views: number }>
  topReferrers: Array<{ referrer: string; count: number }>
  recentStats: VisitorStatResponse[]
}

export default function VisitorStats() {
  const [stats, setStats] = useState<StatsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchStats() {
      try {
        setLoading(true)
        const data = await listStats()

        if (!data || data.length === 0) {
          setStats({
            totalPageViews: 0,
            totalUniqueVisitors: 0,
            averagePageViews: 0,
            topPages: [],
            topReferrers: [],
            recentStats: [],
          })
          return
        }

        // Calculate aggregated stats
        const totalPageViews = data.reduce((sum, s) => sum + (s.pageviews || 0), 0)
        const totalUniqueVisitors = data.reduce((sum, s) => sum + (s.unique_visitors || 0), 0)
        const averagePageViews = data.length > 0 ? Math.round(totalPageViews / data.length) : 0

        // Group by page to get top pages
        const pageStats = new Map<string, number>()
        data.forEach((stat) => {
          const current = pageStats.get(stat.page_path) || 0
          pageStats.set(stat.page_path, current + (stat.pageviews || 0))
        })
        const topPages = Array.from(pageStats.entries())
          .sort((a, b) => b[1] - a[1])
          .slice(0, 5)
          .map(([page, views]) => ({ page, views }))

        // Group by referrer to get top referrers
        const referrerStats = new Map<string, number>()
        data.forEach((stat) => {
          if (stat.referrer_domain) {
            const current = referrerStats.get(stat.referrer_domain) || 0
            referrerStats.set(stat.referrer_domain, current + 1)
          }
        })
        const topReferrers = Array.from(referrerStats.entries())
          .sort((a, b) => b[1] - a[1])
          .slice(0, 5)
          .map(([referrer, count]) => ({ referrer, count }))

        setStats({
          totalPageViews,
          totalUniqueVisitors,
          averagePageViews,
          topPages,
          topReferrers,
          recentStats: data,
        })
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load statistics')
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-4">
          Visitor Statistics
        </h1>
        <div className="text-center py-12">
          <p className="text-slate-600 dark:text-slate-300">Loading statistics...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-4">
          Visitor Statistics
        </h1>
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <p className="text-red-800 dark:text-red-200">Error: {error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
      <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-4">
        Visitor Statistics
      </h1>
      <p className="text-xl text-slate-600 dark:text-slate-300 mb-12">
        Anonymous visitor insights and traffic overview
      </p>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-6">
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
            Total Page Views
          </p>
          <p className="text-4xl font-bold text-slate-900 dark:text-white">
            {stats?.totalPageViews?.toLocaleString() || '0'}
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-6">
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
            Unique Visitors
          </p>
          <p className="text-4xl font-bold text-slate-900 dark:text-white">
            {stats?.totalUniqueVisitors?.toLocaleString() || '0'}
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-6">
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
            Average Per Day
          </p>
          <p className="text-4xl font-bold text-slate-900 dark:text-white">
            {stats?.averagePageViews?.toFixed(0) || '0'}
          </p>
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
        {/* Top Pages */}
        <section>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">
            Top Pages
          </h2>
          {stats?.topPages && stats.topPages.length > 0 ? (
            <div className="space-y-4">
              {stats.topPages.map((page, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg"
                >
                  <span className="text-slate-700 dark:text-slate-300 font-medium">
                    {page.page}
                  </span>
                  <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">
                    {page.views.toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-slate-600 dark:text-slate-400">No page views yet</p>
          )}
        </section>

        {/* Top Referrers */}
        <section>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">
            Top Referrers
          </h2>
          {stats?.topReferrers && stats.topReferrers.length > 0 ? (
            <div className="space-y-4">
              {stats.topReferrers.map((referrer, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg"
                >
                  <span className="text-slate-700 dark:text-slate-300 font-medium truncate">
                    {referrer.referrer || 'Direct'}
                  </span>
                  <span className="text-sm font-semibold text-blue-600 dark:text-blue-400 ml-2">
                    {referrer.count.toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-slate-600 dark:text-slate-400">No referrer data yet</p>
          )}
        </section>
      </div>

      {/* Recent Activity */}
      {stats?.recentStats && stats.recentStats.length > 0 && (
        <section>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">
            Recent Activity
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800">
                  <th className="text-left py-3 px-4 font-semibold text-slate-900 dark:text-white">
                    Date
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-900 dark:text-white">
                    Page Views
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-900 dark:text-white">
                    Unique Visitors
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-900 dark:text-white">
                    Top Page
                  </th>
                </tr>
              </thead>
              <tbody>
                {stats.recentStats.map((stat, index) => (
                  <tr
                    key={index}
                    className="border-b border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50"
                  >
                    <td className="py-3 px-4 text-slate-700 dark:text-slate-300">
                      {new Date(stat.date).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </td>
                    <td className="py-3 px-4 text-slate-700 dark:text-slate-300">
                      {stat.pageViews.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-slate-700 dark:text-slate-300">
                      {stat.uniqueVisitors.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-slate-700 dark:text-slate-300">
                      {stat.topPage}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* Privacy Notice */}
      <div className="mt-12 p-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg">
        <p className="text-sm text-slate-600 dark:text-slate-400">
          📊 All statistics are anonymized and collected without tracking personal information.
          No cookies or user identifiers are stored.
        </p>
      </div>
    </div>
  )
}
