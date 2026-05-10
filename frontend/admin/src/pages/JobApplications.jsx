import { useState, useMemo, useEffect, useCallback } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import {
  Search, Filter, Eye, Trash2, X, Loader2,
  ChevronLeft, ChevronRight, FileText, Download, ExternalLink,
  Briefcase, Calendar, Mail, Phone
} from 'lucide-react'
import { api } from '../api'
import { useAuth } from '../context/AuthContext'
import { SkeletonTable } from '../components/Skeleton'

const statusColors = {
  pending:     'bg-amber-50 text-amber-600 border-amber-200',
  reviewed:    'bg-blue-50 text-blue-600 border-blue-200',
  shortlisted: 'bg-green-50 text-green-600 border-green-200',
  rejected:    'bg-red-50 text-red-600 border-red-200',
}

const STATUSES = ['all', 'pending', 'reviewed', 'shortlisted', 'rejected']

// ── Authenticated resume fetch ──────────────────────────
// Plain <a href> can't send Authorization headers, so we
// fetch the blob in JS with the stored JWT and open it.
async function openResumeWithAuth(id, download = false, filename = 'resume') {
  const stored = localStorage.getItem('admin_session')
  const token  = stored ? JSON.parse(stored).token : null
  const res    = await fetch(`/api/job-applications/${id}/resume`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  })
  if (!res.ok) throw new Error(`Server returned ${res.status}`)
  const blob   = await res.blob()
  const url    = URL.createObjectURL(blob)
  if (download) {
    const a = document.createElement('a')
    a.href = url; a.download = filename; a.click()
    setTimeout(() => URL.revokeObjectURL(url), 5000)
  } else {
    window.open(url, '_blank')
    setTimeout(() => URL.revokeObjectURL(url), 30000)
  }
}

export default function JobApplications() {
  const { user } = useAuth()
  const [apps, setApps]               = useState([])
  const [loading, setLoading]         = useState(true)
  const [error, setError]             = useState('')
  const [search, setSearch]           = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [selected, setSelected]       = useState(null)
  const [showPanel, setShowPanel]     = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState(null)
  const [page, setPage]               = useState(1)
  const [resumeLoading, setResumeLoading] = useState({}) // { [appId]: 'open' | 'download' | null }
  const perPage = 10

  const load = useCallback(() => {
    setLoading(true)
    api.getJobApplications()
      .then(setApps)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => { load() }, [load])

  const filtered = useMemo(() => apps.filter(a => {
    const q = search.toLowerCase()
    const matchQ = !q
      || a.full_name?.toLowerCase().includes(q)
      || a.email?.toLowerCase().includes(q)
      || a.job_title?.toLowerCase().includes(q)
    const matchS = statusFilter === 'all' || a.status === statusFilter
    return matchQ && matchS
  }), [apps, search, statusFilter])

  const totalPages = Math.ceil(filtered.length / perPage)
  const paginated  = filtered.slice((page - 1) * perPage, page * perPage)

  const openView = (a) => { setSelected(a); setShowPanel(true) }

  // Authenticated resume open/download
  const handleResume = async (id, action, filename) => {
    setResumeLoading(prev => ({ ...prev, [id]: action }))
    try {
      await openResumeWithAuth(id, action === 'download', filename)
    } catch (e) {
      alert('Could not load resume. Please try again.')
    } finally {
      setResumeLoading(prev => ({ ...prev, [id]: null }))
    }
  }

  const updateStatus = async (id, status) => {
    try {
      const updated = await api.updateApplicationStatus(id, status)
      setApps(prev => prev.map(a => a.id === id ? { ...a, ...updated } : a))
      if (selected?.id === id) setSelected(prev => ({ ...prev, ...updated }))
    } catch (e) { alert(e.message) }
  }

  const handleDelete = async (id) => {
    try {
      await api.deleteJobApplication(id)
      setApps(prev => prev.filter(a => a.id !== id))
      setDeleteConfirm(null)
      if (selected?.id === id) setShowPanel(false)
    } catch (e) { alert(e.message) }
  }

  // Remove the old resumeUrl helper — we use handleResume instead

  if (error) return (
    <div className="bg-red-50 border border-red-200 text-red-700 rounded-2xl p-6 text-sm">{error}</div>
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-navy">Job Applications</h2>
          <p className="text-sm text-gray-500">
            {loading ? '…' : `${apps.filter(a => a.status === 'pending').length} pending · ${apps.length} total`}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text" value={search}
            onChange={e => { setSearch(e.target.value); setPage(1) }}
            placeholder="Search by name, email or role…"
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-primary transition-colors"
          />
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Filter size={16} className="text-gray-400" />
          {STATUSES.map(s => (
            <button key={s} onClick={() => { setStatusFilter(s); setPage(1) }}
              className={`px-3 py-2 rounded-lg text-xs font-medium transition-colors capitalize ${statusFilter === s ? 'bg-primary text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Table / Skeleton */}
      {loading ? (
        <SkeletonTable rows={6} cols={7}
          headers={['#', 'Applicant', 'Role', 'Department', 'Resume', 'Status', 'Actions']} />
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  {['#', 'Applicant', 'Role', 'Department', 'Resume', 'Status', 'Actions'].map(h => (
                    <th key={h} className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {paginated.map(a => (
                  <tr key={a.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                    <td className="px-4 py-3 text-sm text-gray-400">{a.id}</td>
                    <td className="px-4 py-3">
                      <p className="text-sm font-medium text-navy">{a.full_name}</p>
                      <p className="text-xs text-gray-400 truncate max-w-[160px]">{a.email}</p>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700 max-w-[160px]">
                      <p className="truncate">{a.job_title || '—'}</p>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-500">{a.department || '—'}</td>
                    <td className="px-4 py-3">
                      {a.resume_name ? (
                        <button
                          onClick={() => handleResume(a.id, 'open', a.resume_name)}
                          disabled={!!resumeLoading[a.id]}
                          className="inline-flex items-center gap-1.5 text-xs font-medium text-primary hover:underline disabled:opacity-50">
                          {resumeLoading[a.id] === 'open'
                            ? <Loader2 size={12} className="animate-spin" />
                            : <FileText size={13} />}
                          {a.resume_mime?.includes('pdf') ? 'PDF' : 'File'}
                        </button>
                      ) : (
                        <span className="text-xs text-gray-300">No file</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex px-2.5 py-1 rounded-lg text-xs font-medium border capitalize ${statusColors[a.status]}`}>
                        {a.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button onClick={() => openView(a)}
                          className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-primary transition-colors" title="View">
                          <Eye size={16} />
                        </button>
                        <button onClick={() => setDeleteConfirm(a.id)}
                          className="p-1.5 hover:bg-red-50 rounded-lg text-gray-400 hover:text-red-600 transition-colors" title="Delete">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {paginated.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-4 py-12 text-center text-gray-400 text-sm">
                      No applications found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
              <p className="text-xs text-gray-400">Page {page} of {totalPages}</p>
              <div className="flex gap-1">
                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                  className="p-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-30 text-gray-500"><ChevronLeft size={16} /></button>
                <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                  className="p-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-30 text-gray-500"><ChevronRight size={16} /></button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Delete Confirm */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          onClick={() => setDeleteConfirm(null)}>
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-navy">Delete Application?</h3>
            <p className="text-sm text-gray-500 mt-2">This will permanently remove the applicant's data and resume.</p>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setDeleteConfirm(null)}
                className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50">Cancel</button>
              <button onClick={() => handleDelete(deleteConfirm)}
                className="flex-1 px-4 py-2.5 bg-red-500 text-white rounded-xl text-sm font-medium hover:bg-red-600">Delete</button>
            </div>
          </div>
        </div>
      )}

      {/* Detail Modal Popup */}
      <AnimatePresence>
        {showPanel && selected && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowPanel(false)}
            className="fixed inset-0 z-[70] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.94, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: 12 }}
              transition={{ type: 'spring', damping: 25, stiffness: 280 }}
              onClick={e => e.stopPropagation()}
              className="w-full max-w-lg bg-white rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-primary/10 to-primary/5 rounded-xl flex items-center justify-center text-primary font-bold text-base border border-primary/10">
                    {selected.full_name?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-navy">{selected.full_name}</h3>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-bold border uppercase tracking-widest ${statusColors[selected.status]}`}>
                        {selected.status}
                      </span>
                      <span className="text-xs text-gray-400">{selected.job_title || 'Applicant'}</span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setShowPanel(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-navy transition-all"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Scrollable Body */}
              <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5 [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-gray-200 [&::-webkit-scrollbar-thumb]:rounded-full">

                {/* Job Summary */}
                <div className="bg-navy/[0.02] border border-navy/5 rounded-xl p-3.5 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-white rounded-lg flex items-center justify-center shadow-sm text-primary border border-gray-50">
                      <Briefcase size={16} />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-navy">{selected.job_title || 'General Application'}</p>
                      <p className="text-xs text-gray-500">{selected.department || 'Unspecified Dept'}</p>
                    </div>
                  </div>
                  <span className="text-xs font-semibold text-primary">NatooKart</span>
                </div>

                {/* Contact Info */}
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Contact Details</p>
                  <div className="rounded-xl border border-gray-100 divide-y divide-gray-100">
                    {[
                      { icon: Mail,     label: 'Email',      value: selected.email },
                      { icon: Phone,    label: 'Phone',      value: selected.phone || 'Not provided' },
                      { icon: Calendar, label: 'Applied On', value: new Date(selected.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) },
                    ].map((item, idx) => (
                      <div key={idx} className="px-4 py-3 flex items-center justify-between gap-4">
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <item.icon size={13} className="text-gray-400" />
                          <span className="text-xs text-gray-500 font-medium">{item.label}</span>
                        </div>
                        <span className="text-sm font-semibold text-navy text-right truncate max-w-[55%]">{item.value}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Resume */}
                {selected.resume_name && (
                  <div className="space-y-2">
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                      <FileText size={12} className="text-primary" /> Documents
                    </p>
                    <div className="bg-white border border-gray-100 rounded-xl p-3.5 flex items-center gap-3 shadow-sm">
                      <div className="w-9 h-9 bg-primary/5 rounded-lg flex items-center justify-center text-primary flex-shrink-0">
                        <FileText size={18} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-navy truncate">{selected.resume_name}</p>
                        <p className="text-xs text-gray-400">Resume • PDF/DOCX</p>
                      </div>
                      <div className="flex gap-1.5">
                        <button
                          onClick={() => handleResume(selected.id, 'open', selected.resume_name)}
                          disabled={!!resumeLoading[selected.id]}
                          className="p-2 bg-gray-50 hover:bg-primary/10 text-gray-500 hover:text-primary rounded-lg transition-all"
                          title="View"
                        >
                          {resumeLoading[selected.id] === 'open' ? <Loader2 size={15} className="animate-spin" /> : <Eye size={15} />}
                        </button>
                        <button
                          onClick={() => handleResume(selected.id, 'download', selected.resume_name)}
                          disabled={!!resumeLoading[selected.id]}
                          className="p-2 bg-gray-50 hover:bg-navy text-gray-500 hover:text-white rounded-lg transition-all"
                          title="Download"
                        >
                          {resumeLoading[selected.id] === 'download' ? <Loader2 size={15} className="animate-spin" /> : <Download size={15} />}
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Cover Message */}
                {selected.cover_message && (
                  <div className="space-y-2">
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Cover Message</p>
                    <div className="bg-gray-50 rounded-xl p-4">
                      <p className="text-sm text-gray-600 leading-relaxed italic">"{selected.cover_message}"</p>
                    </div>
                  </div>
                )}

                {/* Status Update */}
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Update Status</p>
                  <div className="grid grid-cols-2 gap-2">
                    {['pending','reviewed','shortlisted','rejected'].map(s => (
                      <button key={s}
                        onClick={() => updateStatus(selected.id, s)}
                        className={`py-2.5 rounded-xl text-xs font-bold border transition-all capitalize ${
                          selected.status === s
                            ? statusColors[s] + ' ring-1 ring-offset-1 ring-current'
                            : 'border-gray-200 text-gray-500 hover:border-primary/30 hover:bg-primary/5 hover:text-primary'
                        }`}>
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/60">
                <button
                  onClick={() => { setDeleteConfirm(selected.id); setShowPanel(false) }}
                  className="w-full py-2.5 bg-white border border-red-200 text-red-500 rounded-xl text-sm font-bold hover:bg-red-50 transition-all flex items-center justify-center gap-2"
                >
                  <Trash2 size={15} />
                  Delete Application
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
