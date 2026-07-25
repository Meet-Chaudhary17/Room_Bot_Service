import React, { useState, useEffect } from 'react';
import { Home, Trash2, AlertTriangle, Plus } from 'lucide-react';
import toast from 'react-hot-toast';
import { getBlocks, createBlock, deleteBlock } from '../../services/admin.service';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import Loader from '../../components/common/Loader';
import EmptyState from '../../components/common/EmptyState';
import ConfirmDialog from '../../components/common/ConfirmDialog';

export default function Blocks() {
  const [blocks, setBlocks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Form states
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  // Delete states
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [selectedBlockId, setSelectedBlockId] = useState('');
  const [deleting, setDeleting] = useState(false);

  const fetchBlocks = async () => {
    setLoading(true);
    try {
      const res = await getBlocks();
      setBlocks(res.data.blocks || []);
    } catch (err) {
      toast.error('Failed to load blocks list.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBlocks();
  }, []);

  const handleCreateBlockSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('Block name is required');
      return;
    }

    setSubmitting(true);
    try {
      const response = await createBlock({ name });
      toast.success(response.message || 'Block created successfully!');
      setName('');
      fetchBlocks();
    } catch (err) {
      toast.error(err.message || 'Failed to create block.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    setDeleting(true);
    try {
      const response = await deleteBlock(selectedBlockId);
      toast.success(response.message || 'Block deleted successfully!');
      setConfirmOpen(false);
      fetchBlocks();
    } catch (err) {
      toast.error(err.message || 'Cannot delete block. Ensure no student/staff is associated with this block.');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Create Block Form */}
      <div className="lg:col-span-1 bg-white p-6 border border-slate-100 rounded-3xl shadow-sm space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <Home className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-800">Add Hostel Block</h3>
            <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Initialize a new residential wing block</p>
          </div>
        </div>

        <form onSubmit={handleCreateBlockSubmit} className="space-y-4 pt-2">
          <Input
            id="name"
            label="Block Name"
            icon={Home}
            required
            placeholder="e.g. Block C"
            value={name}
            onChange={(e) => setName(e.target.value)}
            error={error}
          />

          <Button type="submit" className="w-full" loading={submitting}>
            <Plus className="w-4 h-4" />
            Create Block
          </Button>
        </form>
      </div>

      {/* Blocks Listing */}
      <div className="lg:col-span-2 bg-white p-6 border border-slate-100 rounded-3xl shadow-sm space-y-4">
        <div>
          <h3 className="text-sm font-bold text-slate-800">Active Blocks</h3>
          <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Listing active hostel residential blocks</p>
        </div>

        {loading ? (
          <div className="flex h-32 items-center justify-center">
            <Loader size="sm" />
          </div>
        ) : blocks.length === 0 ? (
          <EmptyState 
            title="No blocks found" 
            description="Create a block to start assigning student and staff coordinates."
            icon={Home}
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {blocks.map((block) => (
              <div 
                key={block.id} 
                className="p-4 border border-slate-100 rounded-xl hover:border-slate-200 transition-all flex items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <p className="text-sm font-bold text-slate-800">{block.name}</p>
                  <p className="text-[10px] text-slate-400 font-bold font-mono truncate max-w-[150px]">
                    ID: {block.id}
                  </p>
                </div>

                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => { setSelectedBlockId(block.id); setConfirmOpen(true); }}
                  className="text-rose-600 hover:bg-rose-50"
                  icon={Trash2}
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Delete Confirmation Alert */}
      <ConfirmDialog
        isOpen={confirmOpen}
        title="Delete Block Coordinate"
        message="This action will delete the block coordinate. It will fail if students or staff are currently linked to this block."
        onConfirm={handleDeleteConfirm}
        onCancel={() => setConfirmOpen(false)}
        loading={deleting}
      />
    </div>
  );
}