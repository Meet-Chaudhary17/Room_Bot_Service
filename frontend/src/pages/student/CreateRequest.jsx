import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Clipboard, FileText, AlertCircle, Wrench } from 'lucide-react';
import toast from 'react-hot-toast';
import { createRequest } from '../../services/student.service';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';

const PREDEFINED_CATEGORIES = [
  { id: 'cleaning', name: 'Cleaning' },
  { id: 'electrical', name: 'Electrical Maintenance' },
  { id: 'plumbing', name: 'Plumbing' },
  { id: 'ac', name: 'AC Maintenance' },
  { id: 'furniture', name: 'Furniture & Carpentry' }
];

export default function CreateRequest() {
  const navigate = useNavigate();
  const location = useLocation();
  const preSelectedCategory = location.state?.category || '';

  // Form fields
  const [serviceTypeId, setServiceTypeId] = useState('');
  const [title, setTitle] = useState(preSelectedCategory ? `${preSelectedCategory} Request` : '');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState(1); // 1 = Low, 2 = Medium, 3 = High

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  // Map pre-selected category
  useEffect(() => {
    if (preSelectedCategory) {
      const normalized = preSelectedCategory.toLowerCase();
      const match = PREDEFINED_CATEGORIES.find(t => 
        t.name.toLowerCase().includes(normalized) || 
        normalized.includes(t.id)
      );
      if (match) {
        setServiceTypeId(match.id);
      }
    }
  }, [preSelectedCategory]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    const newErrors = {};

    if (!serviceTypeId) newErrors.serviceTypeId = 'Service Category is required';
    if (!title.trim()) newErrors.title = 'Title is required';
    if (!description.trim()) newErrors.description = 'Description is required';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    try {
      const response = await createRequest({
        title,
        description,
        serviceTypeId,
        priority: Number(priority)
      });
      toast.success(response.message || 'Service request submitted successfully!');
      navigate('/student/dashboard');
    } catch (err) {
      toast.error(err.message || 'Failed to submit service request. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-white p-8 border border-slate-100 rounded-3xl shadow-sm">
      <div className="mb-6 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
          <Wrench className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-800">Submit a Service Request</h2>
          <p className="text-xs font-semibold text-slate-400 mt-1">Provide details of the room maintenance required</p>
        </div>
      </div>

      <form className="space-y-4" onSubmit={handleSubmit}>
        {/* Service Type selector */}
        <div className="flex flex-col gap-1.5 w-full">
          <label className="text-xs font-bold text-slate-700">
            Service Category <span className="text-rose-500">*</span>
          </label>
          <select
            id="serviceTypeId"
            value={serviceTypeId}
            onChange={(e) => setServiceTypeId(e.target.value)}
            className={`
              w-full py-3 px-4 rounded-xl border text-sm font-semibold transition-all duration-200 focus:outline-none bg-white
              ${errors.serviceTypeId 
                ? 'border-rose-300 bg-rose-50/20 text-rose-900 focus:border-rose-500 focus:ring-1 focus:ring-rose-500' 
                : 'border-slate-200 text-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500'}
            `}
          >
            <option value="">Select a Service Category</option>
            {PREDEFINED_CATEGORIES.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
          {errors.serviceTypeId && <span className="text-xs font-medium text-rose-500 pl-1">{errors.serviceTypeId}</span>}
        </div>

        <Input
          id="title"
          label="Request Title"
          icon={Clipboard}
          required
          placeholder="e.g. Leaking pipe in bathroom"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          error={errors.title}
        />

        <div className="flex flex-col gap-1.5 w-full">
          <label htmlFor="description" className="text-xs font-bold text-slate-700">
            Request Description <span className="text-rose-500">*</span>
          </label>
          <textarea
            id="description"
            required
            rows={4}
            placeholder="Please detail the issue here, including room specifics or timestamps if needed..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className={`
              w-full py-3 px-4 rounded-xl border text-sm font-semibold transition-all duration-200 focus:outline-none
              ${errors.description 
                ? 'border-rose-300 bg-rose-50/20 text-rose-900 focus:border-rose-500 focus:ring-1 focus:ring-rose-500' 
                : 'border-slate-200 bg-white text-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500'}
            `}
          />
          {errors.description && <span className="text-xs font-medium text-rose-500 pl-1">{errors.description}</span>}
        </div>

        <div className="flex flex-col gap-1.5 w-full">
          <label className="text-xs font-bold text-slate-700">Priority Level</label>
          <div className="flex gap-4">
            {[
              { label: 'Low', val: 1 },
              { label: 'Medium', val: 2 },
              { label: 'High', val: 3 }
            ].map((p) => (
              <label key={p.val} className="flex items-center gap-2 text-xs font-bold text-slate-600 cursor-pointer">
                <input
                  type="radio"
                  name="priority"
                  value={p.val}
                  checked={priority === p.val}
                  onChange={() => setPriority(p.val)}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-slate-300 rounded-full cursor-pointer"
                />
                {p.label}
              </label>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
          <Button variant="outline" onClick={() => navigate('/student/dashboard')} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" loading={loading}>
            Submit Request
          </Button>
        </div>
      </form>
    </div>
  );
}