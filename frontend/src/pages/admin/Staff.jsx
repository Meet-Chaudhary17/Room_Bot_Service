import React, { useState, useEffect } from 'react';
import { Search, UserCheck, UserX, ShieldCheck } from 'lucide-react';
import toast from 'react-hot-toast';
import { getStaff, toggleStaffStatus } from '../../services/admin.service';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import Loader from '../../components/common/Loader';
import EmptyState from '../../components/common/EmptyState';
import Pagination from '../../components/common/Pagination';

export default function Staff() {
  const [staffList, setStaffList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [hasPreviousPage, setHasPreviousPage] = useState(false);

  const fetchStaff = async () => {
    setLoading(true);
    try {
      const params = { page, limit };
      if (search.trim()) params.search = search;
      
      const res = await getStaff(params);
      setStaffList(res.data.staff || []);
      setTotalPages(res.data.pagination?.totalPages || 1);
      setHasNextPage(res.data.pagination?.hasNextPage || false);
      setHasPreviousPage(res.data.pagination?.hasPreviousPage || false);
    } catch (err) {
      toast.error('Failed to load staff listing.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaff();
  }, [page]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchStaff();
  };

  const handleToggleStatus = async (staffId, currentActive) => {
    try {
      await toggleStaffStatus(staffId, !currentActive);
      toast.success(currentActive ? 'Staff deactivated successfully!' : 'Staff account activated successfully!');
      fetchStaff();
    } catch (err) {
      toast.error(err.message || 'Action failed.');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-800">Staff Directory</h2>
        <p className="text-xs font-semibold text-slate-400 mt-1">Manage staff specialization, block coordinates and activation states</p>
      </div>

      {/* Search Header */}
      <div className="p-4 bg-white border border-slate-100 rounded-2xl shadow-sm">
        <form onSubmit={handleSearchSubmit} className="flex gap-2 max-w-md">
          <Input
            id="search"
            type="text"
            placeholder="Search by staff name or employee ID..."
            icon={Search}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <Button type="submit" variant="outline">
            Search
          </Button>
        </form>
      </div>

      {/* Grid List */}
      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <Loader size="lg" />
        </div>
      ) : staffList.length === 0 ? (
        <EmptyState 
          title="No staff found" 
          description="We couldn't find any staff accounts matching your queries."
          icon={ShieldCheck}
        />
      ) : (
        <div className="space-y-4">
          <div className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden">
            <table className="min-w-full divide-y divide-slate-100 text-left text-xs font-semibold text-slate-500">
              <thead className="bg-slate-50 text-slate-400 uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-4">Name</th>
                  <th className="px-6 py-4">Employee ID</th>
                  <th className="px-6 py-4">Specialization Role</th>
                  <th className="px-6 py-4">Assigned Block</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {staffList.map((staff) => (
                  <tr key={staff.id} className="hover:bg-slate-50/50">
                    <td className="px-6 py-4 font-bold text-slate-800">{staff.name}</td>
                    <td className="px-6 py-4">{staff.employeeId}</td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-0.5 text-[9px] font-bold text-indigo-600 bg-indigo-50 rounded-full border border-indigo-100">
                        {staff.role}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      Block {staff.block?.name || 'N/A'}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`
                        px-2 py-0.5 text-[9px] font-bold rounded-full border
                        ${staff.isActive 
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                          : 'bg-rose-50 text-rose-700 border-rose-200'}
                      `}>
                        {staff.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Button
                        variant={staff.isActive ? 'danger' : 'primary'}
                        size="sm"
                        onClick={() => handleToggleStatus(staff.id, staff.isActive)}
                        icon={staff.isActive ? UserX : UserCheck}
                      >
                        {staff.isActive ? 'Deactivate' : 'Activate'}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <Pagination
            page={page}
            totalPages={totalPages}
            onPageChange={setPage}
            hasNextPage={hasNextPage}
            hasPreviousPage={hasPreviousPage}
          />
        </div>
      )}
    </div>
  );
}