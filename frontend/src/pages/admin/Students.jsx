import React, { useState, useEffect } from 'react';
import { Search, UserMinus, UserCheck, ShieldAlert } from 'lucide-react';
import toast from 'react-hot-toast';
import { getStudents, toggleStudentBlock } from '../../services/admin.service';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import Loader from '../../components/common/Loader';
import EmptyState from '../../components/common/EmptyState';
import Pagination from '../../components/common/Pagination';

export default function Students() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [hasPreviousPage, setHasPreviousPage] = useState(false);

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const params = { page, limit };
      if (search.trim()) params.search = search;
      
      const res = await getStudents(params);
      setStudents(res.data.students || []);
      setTotalPages(res.data.pagination?.totalPages || 1);
      setHasNextPage(res.data.pagination?.hasNextPage || false);
      setHasPreviousPage(res.data.pagination?.hasPreviousPage || false);
    } catch (err) {
      toast.error('Failed to load students list.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, [page]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchStudents();
  };

  const handleToggleBlock = async (studentId, currentBlocked) => {
    try {
      await toggleStudentBlock(studentId, !currentBlocked);
      toast.success(currentBlocked ? 'Student unblocked successfully!' : 'Student blocked successfully!');
      fetchStudents();
    } catch (err) {
      toast.error(err.message || 'Action failed.');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-800">Student Directory</h2>
        <p className="text-xs font-semibold text-slate-400 mt-1">Manage student accounts, registration indices and block actions</p>
      </div>

      {/* Search Header */}
      <div className="p-4 bg-white border border-slate-100 rounded-2xl shadow-sm">
        <form onSubmit={handleSearchSubmit} className="flex gap-2 max-w-md">
          <Input
            id="search"
            type="text"
            placeholder="Search by student name or ID..."
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
      ) : students.length === 0 ? (
        <EmptyState 
          title="No students found" 
          description="We couldn't find any student accounts matching your queries."
          icon={ShieldAlert}
        />
      ) : (
        <div className="space-y-4">
          <div className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden">
            <table className="min-w-full divide-y divide-slate-100 text-left text-xs font-semibold text-slate-500">
              <thead className="bg-slate-50 text-slate-400 uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-4">Name</th>
                  <th className="px-6 py-4">Registration No</th>
                  <th className="px-6 py-4">Email / Phone</th>
                  <th className="px-6 py-4">Room & Block</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {students.map((student) => (
                  <tr key={student.id} className="hover:bg-slate-50/50">
                    <td className="px-6 py-4 font-bold text-slate-800">{student.name}</td>
                    <td className="px-6 py-4">{student.registrationNo}</td>
                    <td className="px-6 py-4">
                      <div>{student.email}</div>
                      <div className="text-[10px] text-slate-400 font-medium">{student.phone || 'No phone'}</div>
                    </td>
                    <td className="px-6 py-4">
                      Room {student.roomNumber || 'N/A'} · Block {student.block?.name || 'N/A'}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Button
                        variant={student.isBlocked ? 'secondary' : 'danger'}
                        size="sm"
                        onClick={() => handleToggleBlock(student.id, student.isBlocked)}
                        icon={student.isBlocked ? UserCheck : UserMinus}
                      >
                        {student.isBlocked ? 'Unblock' : 'Block'}
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