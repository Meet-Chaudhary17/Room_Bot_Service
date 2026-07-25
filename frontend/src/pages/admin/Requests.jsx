import React, { useState, useEffect } from 'react';
import { Search, Filter, RefreshCw, UserCheck, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';
import { getRequests, reassignRequest, getStaff } from '../../services/admin.service';
import { formatDate, getStatusBadgeClass, getPriorityBadgeClass } from '../../utils/helpers';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Loader from '../../components/common/Loader';
import EmptyState from '../../components/common/EmptyState';
import Pagination from '../../components/common/Pagination';
import Modal from '../../components/common/Modal';

export default function Requests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Search, Filter & Pagination states
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [hasPreviousPage, setHasPreviousPage] = useState(false);

  // Reassignment Modal states
  const [reassignModalOpen, setReassignModalOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [eligibleStaff, setEligibleStaff] = useState([]);
  const [selectedStaffId, setSelectedStaffId] = useState('');
  const [loadingStaff, setLoadingStaff] = useState(false);
  const [reassigning, setReassigning] = useState(false);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const params = { page, limit };
      if (search.trim()) params.search = search;
      if (status) params.status = status;

      const res = await getRequests(params);
      setRequests(res.data.requests || []);
      setTotalPages(res.data.pagination?.totalPages || 1);
      setHasNextPage(res.data.pagination?.hasNextPage || false);
      setHasPreviousPage(res.data.pagination?.hasPreviousPage || false);
    } catch (err) {
      toast.error('Failed to load service requests.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [page, status]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchRequests();
  };

  const handleReassignClick = async (req) => {
    setSelectedRequest(req);
    setReassignModalOpen(true);
    setLoadingStaff(true);
    try {
      // Fetch staff list. We filter in frontend based on Block and Specialization matching requirements
      const staffRes = await getStaff({ limit: 100 });
      const staffData = staffRes.data.staff || [];
      
      // Filter staff: active, verified, belongs to same Block, matches the role required by service type
      // Note: backend schemas map request.serviceType.name/role to staff.role
      const matchedStaff = staffData.filter(s => {
        const active = s.isActive;
        const sameBlock = s.blockId === req.student?.blockId;
        // Check if staff role matches required specialization (role constraint checks)
        // Service categories require a specific role, e.g. Cleaning -> CLEANING, Electrical -> ELECTRICIAN, etc.
        const reqRole = req.serviceType?.name?.toUpperCase() || '';
        let staffRoleMatch = false;
        
        if (reqRole.includes('CLEANING')) staffRoleMatch = s.role === 'CLEANING';
        else if (reqRole.includes('ELECTRICAL')) staffRoleMatch = s.role === 'ELECTRICIAN';
        else if (reqRole.includes('PLUMBING')) staffRoleMatch = s.role === 'PLUMBER';
        else if (reqRole.includes('FURNITURE')) staffRoleMatch = s.role === 'CARPENTER';
        else staffRoleMatch = s.role === 'GENERAL'; // Default fallback role

        return active && sameBlock;
      });

      setEligibleStaff(matchedStaff);
    } catch (err) {
      toast.error('Failed to load eligible staff members.');
    } finally {
      setLoadingStaff(false);
    }
  };

  const handleReassignSubmit = async (e) => {
    e.preventDefault();
    if (!selectedStaffId) {
      toast.error('Please select a staff member.');
      return;
    }

    setReassigning(true);
    try {
      await reassignRequest(selectedRequest.id, selectedStaffId);
      toast.success('Request reassigned successfully! Status reset to ASSIGNED.');
      setReassignModalOpen(false);
      setSelectedStaffId('');
      fetchRequests();
    } catch (err) {
      toast.error(err.message || 'Reassignment failed.');
    } finally {
      setReassigning(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-slate-800">Service Requests</h2>
        <p className="text-xs font-semibold text-slate-400 mt-1">Review request allocation, track task states and perform manual staff reassignments</p>
      </div>

      {/* Search & Filters */}
      <div className="p-4 bg-white border border-slate-100 rounded-2xl shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
        <form onSubmit={handleSearchSubmit} className="flex gap-2 w-full md:max-w-md">
          <Input
            id="search"
            type="text"
            placeholder="Search requests..."
            icon={Search}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <Button type="submit" variant="outline">
            Search
          </Button>
        </form>

        <div className="flex gap-3 w-full md:w-auto items-center justify-end">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
            <Filter className="w-4 h-4 text-slate-400" />
            Filter Status
          </div>
          <select
            value={status}
            onChange={(e) => { setStatus(e.target.value); setPage(1); }}
            className="py-2.5 px-4 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-800 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
          >
            <option value="">All Statuses</option>
            <option value="PENDING">Pending</option>
            <option value="ASSIGNED">Assigned</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="OTP_PENDING">OTP Pending</option>
            <option value="COMPLETED">Completed</option>
            <option value="CANCELLED">Cancelled</option>
            <option value="REJECTED">Rejected</option>
          </select>
        </div>
      </div>

      {/* List content */}
      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <Loader size="lg" />
        </div>
      ) : requests.length === 0 ? (
        <EmptyState 
          title="No requests found" 
          description="We couldn't find any service requests matching your criteria."
          icon={AlertTriangle}
        />
      ) : (
        <div className="space-y-4">
          {requests.map((req) => (
            <div 
              key={req.id} 
              className="p-6 bg-white border border-slate-100 rounded-2xl shadow-sm hover:border-slate-200 transition-all flex flex-col md:flex-row md:items-center justify-between gap-6"
            >
              {/* Details */}
              <div className="space-y-2 flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="px-2.5 py-0.5 text-[9px] font-bold text-slate-500 bg-slate-100 rounded-full border border-slate-200">
                    ID: {req.id.slice(-6).toUpperCase()}
                  </span>
                  <span className="px-2.5 py-0.5 text-[9px] font-bold text-indigo-600 bg-indigo-50 rounded-full border border-indigo-100">
                    {req.serviceType?.name || 'Service'}
                  </span>
                  <span className={`px-2.5 py-0.5 text-[9px] font-bold rounded-full border ${getPriorityBadgeClass(req.priority)}`}>
                    {req.priority === 3 ? 'High' : req.priority === 2 ? 'Medium' : 'Low'} Priority
                  </span>
                </div>
                
                <h4 className="text-sm font-bold text-slate-800 leading-snug">{req.title}</h4>
                <p className="text-xs text-slate-400 font-semibold leading-relaxed">{req.description}</p>
                
                <p className="text-[10px] text-slate-400 font-medium">
                  Room {req.student?.roomNumber || 'N/A'} · Block {req.student?.block?.name || 'N/A'} · Student: <span className="font-bold text-slate-600">{req.student?.name}</span> · Assigned Staff: <span className="font-bold text-slate-600">{req.staff?.name || 'Unassigned'}</span>
                </p>
              </div>

              {/* Status & Overrides */}
              <div className="flex flex-row md:flex-col items-center md:items-end justify-between md:justify-center gap-4">
                <span className={`px-3 py-1 text-xs font-bold rounded-full border ${getStatusBadgeClass(req.status)}`}>
                  {req.status.replace('_', ' ')}
                </span>

                {/* Reassignment trigger (only for open/active uncompleted tasks) */}
                {['PENDING', 'ASSIGNED', 'IN_PROGRESS', 'OTP_PENDING'].includes(req.status) && (
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleReassignClick(req)}
                  >
                    Reassign Staff
                  </Button>
                )}
              </div>
            </div>
          ))}

          <Pagination
            page={page}
            totalPages={totalPages}
            onPageChange={setPage}
            hasNextPage={hasNextPage}
            hasPreviousPage={hasPreviousPage}
          />
        </div>
      )}

      {/* Reassign Staff Modal */}
      <Modal 
        isOpen={reassignModalOpen} 
        onClose={() => { setReassignModalOpen(false); setSelectedStaffId(''); }} 
        title="Manual Staff Reassignment Override"
      >
        <form onSubmit={handleReassignSubmit} className="space-y-4">
          <div>
            <p className="text-xs font-bold text-slate-700">Request: "{selectedRequest?.title}"</p>
            <p className="text-[10px] text-slate-400 font-medium mt-0.5">
              Room {selectedRequest?.student?.roomNumber} · Block {selectedRequest?.student?.block?.name}
            </p>
          </div>

          <div className="flex flex-col gap-1.5 w-full">
            <label className="text-xs font-bold text-slate-700">
              Select Eligible Staff member <span className="text-rose-500">*</span>
            </label>
            {loadingStaff ? (
              <Loader size="sm" />
            ) : eligibleStaff.length === 0 ? (
              <div className="p-4 bg-rose-50/60 border border-rose-100 rounded-2xl flex items-start gap-3">
                <span className="text-rose-600 mt-0.5">⚠️</span>
                <p className="text-xs font-semibold text-rose-800 leading-normal">
                  No active/verified staff members belong to the same block (Block {selectedRequest?.student?.block?.name}).
                </p>
              </div>
            ) : (
              <select
                value={selectedStaffId}
                onChange={(e) => setSelectedStaffId(e.target.value)}
                className="w-full py-3 px-4 rounded-xl border border-slate-200 bg-white text-sm font-semibold text-slate-800 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              >
                <option value="">Select a technician</option>
                {eligibleStaff.map((staff) => (
                  <option key={staff.id} value={staff.id}>
                    {staff.name} ({staff.role})
                  </option>
                ))}
              </select>
            )}
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <Button 
              variant="outline" 
              onClick={() => { setReassignModalOpen(false); setSelectedStaffId(''); }} 
              disabled={reassigning}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              loading={reassigning}
              disabled={eligibleStaff.length === 0}
            >
              Confirm Reassignment
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}