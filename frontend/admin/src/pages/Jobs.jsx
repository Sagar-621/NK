import { useState, useMemo, useEffect, useCallback } from 'react'
import { Search, Plus, Edit2, Trash2, ToggleLeft, ToggleRight, X, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react'
import { api } from '../api'
import { useAuth } from '../context/AuthContext'
import { SkeletonTable } from '../components/Skeleton'

const statusColors = {
  draft:  'bg-gray-50 text-gray-600 border-gray-200',
  active: 'bg-green-50 text-green-600 border-green-200',
  closed: 'bg-red-50 text-red-600 border-red-200',
}
const departments = ['Engineering','Operations','Logistics','Marketing','HR','Finance','Customer Support']
const jobTypes    = ['Full-time','Part-time','Contract','Remote']
const emptyForm   = { title: '', department: '', location: '', job_type: 'Full-time', description: '', requirements: '', deadline: '', status: 'draft' }

export default function Jobs() {
  const { user } = useAuth()
  const [jobs, setJobs]         = useState([])
  const [loading, setLoading]   = useState(true)
  const [saving, setSaving]     = useState(false)
  const [error, setError]       = useState('')
  const [search, setSearch]     = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [showModal, setShowModal] = useState(null)
  const [selected, setSelected] = useState(null)
  const [deleteConfirm, setDeleteConfirm] = useState(null)
  const [page, setPage]         = useState(1)
  const perPage = 5
  const [form, setForm]         = useState(emptyForm)

  const load = useCallback(() => {
    setLoading(true)
    api.getJobs()
      .then(setJobs)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => { load() }, [load])

  const filtered = useMemo(() => jobs.filter(j => {
    const ms = !search || j.title.toLowerCase().includes(search.toLowerCase()) || j.department.toLowerCase().includes(search.toLowerCase())
    const mf = statusFilter === 'all' || j.status === statusFilter
    return ms && mf
  }), [jobs, search, statusFilter])

  const totalPages = Math.ceil(filtered.length / perPage)
  const paginated  = filtered.slice((page - 1) * perPage, page * perPage)

  const openAdd  = () => { setForm(emptyForm); setShowModal('add') }
  const openEdit = (j) => { setForm({ title: j.title, department: j.department, location: j.location, job_type: j.job_type, description: j.description, requirements: j.requirements || '', deadline: j.deadline || '', status: j.status }); setSelected(j); setShowModal('edit') }

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      if (showModal === 'add') {
        const created = await api.createJob({ ...form, posted_by: user?.id })
        setJobs(prev => [created, ...prev])
      } else {
        const updated = await api.updateJob(selected.id, form)
        setJobs(prev => prev.map(j => j.id === selected.id ? updated : j))
      }
      setShowModal(null); setSelected(null)
    } catch (e) {
      alert(e.message)
    } finally {
      setSaving(false)
    }
  }

  const toggleStatus = async (id) => {
    const job = jobs.find(j => j.id === id)
    if (!job) return
    const next = job.status === 'active' ? 'closed' : job.status === 'closed' ? 'draft' : 'active'
    try {
      const updated = await api.updateJob(id, { status: next })
      setJobs(prev => prev.map(j => j.id === id ? updated : j))
    } catch (e) { alert(e.message) }
  }

  const handleDelete = async (id) => {
    try {
      await api.deleteJob(id)
      setJobs(prev => prev.filter(j => j.id !== id))
      setDeleteConfirm(null)
    } catch (e) { alert(e.message) }
  }

  if (error) return (
    <div className="bg-red-50 border border-red-200 text-red-700 rounded-2xl p-6 text-sm">{error}</div>
  )

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div><h2 className="text-xl font-bold text-navy">Job Postings</h2><p className="text-sm text-gray-500">{jobs.filter(j => j.status === 'active').length} active • {jobs.filter(j => j.status === 'draft').length} drafts</p></div>
        <button onClick={openAdd} className="flex items-center gap-2 px-4 py-2.5 bg-primary text-white rounded-xl text-sm font-medium hover:bg-primary-dark shadow-lg shadow-primary/20"><Plus size={16} /> Add Job</button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1"><Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" /><input type="text" value={search} onChange={e => { setSearch(e.target.value); setPage(1) }} placeholder="Search jobs..." className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-primary" /></div>
        <div className="flex items-center gap-2">
          {['all','draft','active','closed'].map(s => (<button key={s} onClick={() => { setStatusFilter(s); setPage(1) }} className={`px-3 py-2 rounded-lg text-xs font-medium capitalize ${statusFilter === s ? 'bg-primary text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>{s}</button>))}
        </div>
      </div>

      {loading ? (
        <SkeletonTable rows={5} cols={8}
          headers={['#','Title','Department','Location','Type','Status','Deadline','Actions']} />
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead><tr className="border-b border-gray-100">{['#','Title','Department','Location','Type','Status','Deadline','Actions'].map(h => <th key={h} className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3">{h}</th>)}</tr></thead>
              <tbody>
                {paginated.map(j => (
                  <tr key={j.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                    <td className="px-4 py-3 text-sm text-gray-400">{j.id}</td>
                    <td className="px-4 py-3 text-sm font-medium text-navy">{j.title}</td>
                    <td className="px-4 py-3 text-xs text-gray-500">{j.department}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{j.location}</td>
                    <td className="px-4 py-3 text-xs text-gray-500">{j.job_type}</td>
                    <td className="px-4 py-3"><span className={`inline-flex px-2.5 py-1 rounded-lg text-xs font-medium border capitalize ${statusColors[j.status]}`}>{j.status}</span></td>
                    <td className="px-4 py-3 text-xs text-gray-400">{j.deadline ? new Date(j.deadline).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }) : '—'}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button onClick={() => toggleStatus(j.id)} className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-primary" title="Toggle status">
                          {j.status === 'active' ? <ToggleRight size={18} className="text-green-500" /> : <ToggleLeft size={18} />}
                        </button>
                        <button onClick={() => openEdit(j)} className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-blue-600"><Edit2 size={16} /></button>
                        <button onClick={() => setDeleteConfirm(j.id)} className="p-1.5 hover:bg-red-50 rounded-lg text-gray-400 hover:text-red-600"><Trash2 size={16} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
                {paginated.length === 0 && <tr><td colSpan={8} className="px-4 py-12 text-center text-gray-400 text-sm">No jobs found.</td></tr>}
              </tbody>
            </table>
          </div>
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
              <p className="text-xs text-gray-400">Page {page} of {totalPages}</p>
              <div className="flex gap-1"><button onClick={() => setPage(p => Math.max(1,p-1))} disabled={page===1} className="p-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-30"><ChevronLeft size={16} /></button><button onClick={() => setPage(p => Math.min(totalPages,p+1))} disabled={page===totalPages} className="p-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-30"><ChevronRight size={16} /></button></div>
            </div>
          )}
        </div>
      )}

      {/* Delete Confirm */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setDeleteConfirm(null)}>
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-navy">Delete Job?</h3><p className="text-sm text-gray-500 mt-2">This will remove the posting permanently.</p>
            <div className="flex gap-3 mt-6"><button onClick={() => setDeleteConfirm(null)} className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-medium">Cancel</button><button onClick={() => handleDelete(deleteConfirm)} className="flex-1 px-4 py-2.5 bg-red-500 text-white rounded-xl text-sm font-medium hover:bg-red-600">Delete</button></div>
          </div>
        </div>
      )}

      {/* Add/Edit Modal */}
      {(showModal === 'add' || showModal === 'edit') && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowModal(null)}>
          <div className="bg-white rounded-2xl p-6 max-w-lg w-full shadow-2xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6"><h3 className="text-lg font-bold text-navy">{showModal === 'add' ? 'Post New Job' : 'Edit Job'}</h3><button onClick={() => setShowModal(null)} className="p-2 hover:bg-gray-100 rounded-xl"><X size={18} /></button></div>
            <form onSubmit={handleSave} className="space-y-4">
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Title *</label><input required value={form.title} onChange={e => setForm({...form, title: e.target.value})} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-primary" /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Department *</label><select required value={form.department} onChange={e => setForm({...form, department: e.target.value})} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-primary"><option value="">Select</option>{departments.map(d => <option key={d} value={d}>{d}</option>)}</select></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Location *</label><input required value={form.location} onChange={e => setForm({...form, location: e.target.value})} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-primary" /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Type</label><select value={form.job_type} onChange={e => setForm({...form, job_type: e.target.value})} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-primary">{jobTypes.map(t => <option key={t} value={t}>{t}</option>)}</select></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Deadline</label><input type="date" value={form.deadline} onChange={e => setForm({...form, deadline: e.target.value})} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-primary" /></div>
              </div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Description *</label><textarea required rows={3} value={form.description} onChange={e => setForm({...form, description: e.target.value})} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-primary resize-none" /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Requirements</label><textarea rows={3} value={form.requirements} onChange={e => setForm({...form, requirements: e.target.value})} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-primary resize-none" /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Status</label><select value={form.status} onChange={e => setForm({...form, status: e.target.value})} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-primary"><option value="draft">Draft</option><option value="active">Active</option><option value="closed">Closed</option></select></div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(null)} className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-medium">Cancel</button>
                <button type="submit" disabled={saving} className="flex-1 px-4 py-2.5 bg-primary text-white rounded-xl text-sm font-medium hover:bg-primary-dark disabled:opacity-60 flex items-center justify-center gap-2">
                  {saving && <Loader2 size={14} className="animate-spin" />}
                  {showModal === 'add' ? 'Post Job' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
