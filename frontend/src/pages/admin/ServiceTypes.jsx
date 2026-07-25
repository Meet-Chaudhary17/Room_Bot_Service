import React, { useState, useEffect } from 'react';
import { Settings, Trash2, Power, Plus } from 'lucide-react';
import toast from 'react-hot-toast';
import { getServiceTypes, createServiceType, toggleServiceTypeStatus } from '../../services/admin.service';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import Loader from '../../components/common/Loader';
import EmptyState from '../../components/common/EmptyState';

export default function ServiceTypes() {
  const [types, setTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Form states
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [errors, setErrors] = useState({});

  const fetchTypes = async () => {
    setLoading(true);
    try {
      const res = await getServiceTypes();
      setTypes(res.data.serviceTypes || []);
    } catch (err) {
      toast.error('Failed to load service types.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTypes();
  }, []);

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    const newErrors = {};

    if (!name.trim()) newErrors.name = 'Service type name is required';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setSubmitting(true);
    try {
      const response = await createServiceType({ name, description });
      toast.success(response.message || 'Service category created successfully!');
      setName('');
      setDescription('');
      fetchTypes();
    } catch (err) {
      toast.error(err.message || 'Failed to create service type.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleStatus = async (typeId, currentActive) => {
    try {
      await toggleServiceTypeStatus(typeId, !currentActive);
      toast.success(currentActive ? 'Service type deactivated successfully!' : 'Service type activated successfully!');
      fetchTypes();
    } catch (err) {
      toast.error(err.message || 'Action failed.');
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Create Service Type Form */}
      <div className="lg:col-span-1 bg-white p-6 border border-slate-100 rounded-3xl shadow-sm space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <Settings className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-800">Add Service Type</h3>
            <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Initialize a new maintenance category</p>
          </div>
        </div>

        <form onSubmit={handleCreateSubmit} className="space-y-4 pt-2">
          <Input
            id="name"
            label="Category Name"
            icon={Settings}
            required
            placeholder="e.g. Electrical Repair"
            value={name}
            onChange={(e) => setName(e.target.value)}
            error={errors.name}
          />

          <div className="flex flex-col gap-1.5 w-full">
            <label htmlFor="description" className="text-xs font-bold text-slate-700">Category Description</label>
            <textarea
              id="description"
              rows={3}
              placeholder="Provide a brief description of the services covered..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full py-3 px-4 rounded-xl border border-slate-200 bg-white text-sm font-semibold text-slate-800 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          <Button type="submit" className="w-full" loading={submitting}>
            <Plus className="w-4 h-4" />
            Create Service Type
          </Button>
        </form>
      </div>

      {/* Listing */}
      <div className="lg:col-span-2 bg-white p-6 border border-slate-100 rounded-3xl shadow-sm space-y-4">
        <div>
          <h3 className="text-sm font-bold text-slate-800">Service Types</h3>
          <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Active and soft-deleted service categories</p>
        </div>

        {loading ? (
          <div className="flex h-32 items-center justify-center">
            <Loader size="sm" />
          </div>
        ) : types.length === 0 ? (
          <EmptyState 
            title="No service types found" 
            description="Create service categories so students can file room maintenance requests."
            icon={Settings}
          />
        ) : (
          <div className="space-y-3">
            {types.map((type) => (
              <div 
                key={type.id} 
                className="p-4 border border-slate-100 rounded-xl flex items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-bold text-slate-800">{type.name}</p>
                    <span className={`
                      px-2 py-0.5 text-[9px] font-bold rounded-full border
                      ${type.isActive 
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                        : 'bg-rose-50 text-rose-700 border-rose-200'}
                    `}>
                      {type.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 font-semibold leading-normal">{type.description || 'No description provided'}</p>
                  <p className="text-[9px] text-slate-400 font-bold font-mono">ID: {type.id}</p>
                </div>

                <Button 
                  variant={type.isActive ? 'outline' : 'primary'} 
                  size="sm" 
                  onClick={() => handleToggleStatus(type.id, type.isActive)}
                  icon={Power}
                >
                  {type.isActive ? 'Deactivate' : 'Activate'}
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}