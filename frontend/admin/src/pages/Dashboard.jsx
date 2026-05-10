import { useState, useEffect } from 'react'
import { Store, Bike, Briefcase, MessageSquare, TrendingUp, Clock, CheckCircle2, AlertCircle } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { api } from '../api'
import { SkeletonDashboard } from '../components/Skeleton'

const typeIcons = {
  approved_merchant:  <CheckCircle2 size={16} className="text-green-500" />,
  rejected_merchant:  <AlertCircle  size={16} className="text-red-500" />,
  activated_partner:  <CheckCircle2 size={16} className="text-green-500" />,
  rejected_partner:   <AlertCircle  size={16} className="text-red-500" />,
  posted_job:         <CheckCircle2 size={16} className="text-blue-500" />,
  replied_inquiry:    <Clock        size={16} className="text-blue-500" />,
}

function timeAgo(isoString) {
  const diff = Date.now() - new Date(isoString).getTime()
  const min  = Math.floor(diff / 60000)
  if (min < 60)   return `${min}m ago`
  const hrs = Math.floor(min / 60)
  if (hrs < 24)   return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}

function actionLabel(action) {
  return action?.replace(/_/g, ' ') ?? action
}

export default function Dashboard() {
  const { user } = useAuth()
  const [stats, setStats]       = useState(null)
  const [activity, setActivity] = useState([])
  const [loading, setLoading]   = useState(true)
  const [error, setError]       = useState('')

  useEffect(() => {
    setLoading(true)
    Promise.all([api.getDashboardStats(), api.getActivity()])
      .then(([s, a]) => { setStats(s); setActivity(a) })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <SkeletonDashboard />

  if (error) return (
    <div className="bg-red-50 border border-red-200 text-red-700 rounded-2xl p-6 text-sm">{error}</div>
  )

  const statCards = [
    { label: 'Total Merchants',   value: stats.merchantTotal,  pending: stats.merchantPending,  icon: Store,         color: 'bg-purple-50 text-purple-600', trend: '' },
    { label: 'Delivery Partners', value: stats.partnerTotal,   pending: stats.partnerPending,   icon: Bike,          color: 'bg-blue-50 text-blue-600',   trend: '' },
    { label: 'Active Jobs',       value: stats.jobsActive,     pending: stats.jobsDraft,        icon: Briefcase,     color: 'bg-amber-50 text-amber-600',  trend: '' },
    { label: 'Unread Messages',   value: stats.unreadMessages, pending: 0,                      icon: MessageSquare, color: 'bg-red-50 text-red-600',      trend: '' },
  ]

  const quickActions = [
    { label: 'Review pending merchants', count: stats.merchantPending, href: '/merchants',          color: 'text-purple-600 bg-purple-50 hover:bg-purple-100' },
    { label: 'Review pending partners',  count: stats.partnerPending,  href: '/delivery-partners',  color: 'text-blue-600 bg-blue-50 hover:bg-blue-100' },
    { label: 'Unread messages',          count: stats.unreadMessages,  href: '/contact-inquiries',  color: 'text-red-600 bg-red-50 hover:bg-red-100' },
    { label: 'Post a new job',           count: null,                  href: '/jobs',               color: 'text-amber-600 bg-amber-50 hover:bg-amber-100' },
  ]

  return (
    <div className="space-y-6">
      {/* Greeting */}
      <div>
        <h2 className="text-2xl font-bold text-navy">Welcome back, {user?.name?.split(' ')[0] || 'Admin'} 👋</h2>
        <p className="text-gray-500 text-sm mt-1">Here's what's happening with your platform today.</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {statCards.map((stat, i) => (
          <div key={i} className="bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-lg hover:translate-y-[-2px] transition-all duration-300">
            <div className="flex items-start justify-between">
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${stat.color}`}>
                <stat.icon size={22} />
              </div>
              {stat.trend && (
                <span className="flex items-center gap-1 text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-lg">
                  <TrendingUp size={12} />{stat.trend}
                </span>
              )}
            </div>
            <p className="text-2xl font-bold text-navy mt-4">{stat.value}</p>
            <p className="text-sm text-gray-500 mt-0.5">{stat.label}</p>
            {stat.pending > 0 && (
              <p className="text-xs text-amber-600 bg-amber-50 rounded-lg px-2 py-1 mt-3 inline-block">
                {stat.pending} pending review
              </p>
            )}
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 p-6">
          <h3 className="text-base font-semibold text-navy mb-4">Recent Activity</h3>
          {activity.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-8">No activity yet.</p>
          ) : (
            <div className="space-y-3">
              {activity.map((a, i) => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors">
                  {typeIcons[a.action] ?? <Clock size={16} className="text-gray-400" />}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-700 capitalize">
                      {actionLabel(a.action)}
                      {a.target_type && <span className="font-semibold text-navy"> ({a.target_type} #{a.target_id})</span>}
                    </p>
                    {a.admin_name && <p className="text-xs text-gray-400">by {a.admin_name}</p>}
                  </div>
                  <span className="text-xs text-gray-400 flex-shrink-0">{timeAgo(a.created_at)}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <h3 className="text-base font-semibold text-navy mb-4">Quick Actions</h3>
          <div className="space-y-2">
            {quickActions.map((action, i) => (
              <a key={i} href={action.href}
                className={`flex items-center justify-between p-3 rounded-xl text-sm font-medium transition-colors ${action.color}`}>
                <span>{action.label}</span>
                {action.count !== null && <span className="font-bold">{action.count}</span>}
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
