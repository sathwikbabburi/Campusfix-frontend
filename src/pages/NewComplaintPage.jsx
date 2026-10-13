import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { categoriesApi, complaintsApi, aiApi } from '../services/api';
import PriorityBadge from '../components/common/PriorityBadge';

const NewComplaintPage = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    categoryId: '',
    priority: 'MEDIUM',
    locationBlock: 'Academic Block A',
    roomNumber: '',
    imageUrl: '',
  });

  const [aiSuggestion, setAiSuggestion] = useState(null);
  const [analyzingAi, setAnalyzingAi] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const res = await categoriesApi.getAll();
        if (res.success && res.data.length > 0) {
          setCategories(res.data);
          setFormData((prev) => ({ ...prev, categoryId: res.data[0].id.toString() }));
        }
      } catch (err) {
        console.error('Error fetching categories:', err);
      }
    };
    loadCategories();
  }, []);

  // Trigger AI auto-categorization when title/description have meaningful text
  const runAiCategorization = async (title, desc) => {
    if (!title && !desc) return;
    setAnalyzingAi(true);
    try {
      const res = await aiApi.categorize(title, desc);
      if (res.success && res.data) {
        setAiSuggestion(res.data);
      }
    } catch (err) {
      console.warn('AI Categorization check failed:', err);
    } finally {
      setAnalyzingAi(false);
    }
  };

  // Debounce AI trigger on typing
  useEffect(() => {
    const timer = setTimeout(() => {
      if (formData.title.length > 4 || formData.description.length > 8) {
        runAiCategorization(formData.title, formData.description);
      }
    }, 700);
    return () => clearTimeout(timer);
  }, [formData.title, formData.description]);

  const applyAiSuggestion = () => {
    if (!aiSuggestion) return;
    setFormData((prev) => ({
      ...prev,
      categoryId: aiSuggestion.categoryId.toString(),
      priority: aiSuggestion.suggestedPriority,
    }));
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.description || !formData.categoryId || !formData.locationBlock) {
      setError('Please fill in all mandatory fields');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const payload = {
        ...formData,
        categoryId: parseInt(formData.categoryId, 10),
      };
      const res = await complaintsApi.create(payload);
      if (res.success && res.data) {
        navigate(`/complaints/${res.data.id}`);
      }
    } catch (err) {
      setError(err.message || 'Failed to submit complaint');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Lodge a Campus Complaint</h1>
        <p className="text-xs text-gray-500 mt-1">
          Our intelligent AI router will inspect your complaint and dispatch it to the designated department.
        </p>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-xs text-red-700 font-medium">
          {error}
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: The Submission Form */}
        <form onSubmit={handleSubmit} className="lg:col-span-2 bg-white p-6 sm:p-8 rounded-3xl border border-gray-100 shadow-xs space-y-5">
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
              Issue Title *
            </label>
            <input
              type="text"
              name="title"
              required
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g. Sparks coming from Seminar Hall 2 ceiling fan regulator"
              className="w-full px-4 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
              Problem Description *
            </label>
            <textarea
              name="description"
              required
              rows={4}
              value={formData.description}
              onChange={handleChange}
              placeholder="Provide specific details about the defect, equipment number, or hazard noticed..."
              className="w-full px-4 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white resize-y"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                Category *
              </label>
              <select
                name="categoryId"
                value={formData.categoryId}
                onChange={handleChange}
                className="w-full px-3 py-2.5 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white font-medium"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name} (SLA: {c.slaHours}h)</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                Priority
              </label>
              <select
                name="priority"
                value={formData.priority}
                onChange={handleChange}
                className="w-full px-3 py-2.5 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white font-medium"
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High Priority</option>
                <option value="CRITICAL">Critical Safety</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                Campus Block / Zone *
              </label>
              <select
                name="locationBlock"
                value={formData.locationBlock}
                onChange={handleChange}
                className="w-full px-3 py-2.5 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white font-medium"
              >
                <option value="Academic Block A">Academic Block A</option>
                <option value="Academic Block B">Academic Block B</option>
                <option value="Academic Block C">Academic Block C</option>
                <option value="Central Library">Central Library</option>
                <option value="Boys Hostel 1 & 2">Boys Hostel 1 & 2</option>
                <option value="Boys Hostel 3">Boys Hostel 3</option>
                <option value="Girls Hostel 1 & 2">Girls Hostel 1 & 2</option>
                <option value="Campus Cafeteria">Campus Cafeteria</option>
                <option value="Sports Complex">Sports Complex</option>
                <option value="Auditorium">Main Auditorium</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                Room / Lab / Floor
              </label>
              <input
                type="text"
                name="roomNumber"
                value={formData.roomNumber}
                onChange={handleChange}
                placeholder="e.g. Lab 204 or Ground Floor Restroom"
                className="w-full px-4 py-2.5 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
              Photo URL / Evidence Link (Optional)
            </label>
            <input
              type="url"
              name="imageUrl"
              value={formData.imageUrl}
              onChange={handleChange}
              placeholder="https://images.unsplash.com/photo-..."
              className="w-full px-4 py-2.5 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3.5 px-6 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl text-sm font-bold shadow-lg shadow-blue-500/25 transition active:scale-98 disabled:opacity-50"
            >
              {submitting ? 'Submitting & Routing Ticket...' : '🚀 Submit Complaint Ticket'}
            </button>
          </div>
        </form>

        {/* Right 1 Col: AI Auto-Categorizer live preview card */}
        <div className="space-y-4">
          <div className="bg-gradient-to-br from-indigo-900 to-blue-900 text-white p-6 rounded-3xl shadow-xl relative overflow-hidden">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="text-xl">🤖</span>
                <h3 className="font-bold text-sm tracking-wide">CampusFix AI Assistant</h3>
              </div>
              {analyzingAi ? (
                <span className="text-[10px] text-blue-300 animate-pulse font-medium">Analyzing NLP...</span>
              ) : (
                <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              )}
            </div>

            {aiSuggestion ? (
              <div className="space-y-3.5 animate-in fade-in duration-300">
                <div className="bg-white/10 p-3 rounded-2xl border border-white/10 space-y-2">
                  <div className="text-[11px] text-blue-200 uppercase tracking-wider font-semibold">
                    Inferred Category
                  </div>
                  <div className="text-base font-extrabold text-white">
                    {aiSuggestion.categoryName}
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-[11px] text-emerald-300 bg-emerald-500/20 px-2 py-0.5 rounded border border-emerald-400/30">
                      SLA: {aiSuggestion.slaHours} Hours
                    </span>
                    <PriorityBadge priority={aiSuggestion.suggestedPriority} />
                  </div>
                </div>

                <div className="text-xs text-blue-100/80 leading-relaxed bg-black/20 p-3 rounded-xl border border-white/5">
                  <div className="font-semibold text-white mb-0.5">Automated Diagnosis:</div>
                  <p className="text-[11px]">{aiSuggestion.explanation}</p>
                </div>

                <div className="flex justify-between items-center text-[11px] text-blue-200">
                  <span>Routing: <strong>{aiSuggestion.department}</strong></span>
                  <span>Confidence: <strong>{Math.round(aiSuggestion.confidenceScore * 100)}%</strong></span>
                </div>

                <button
                  type="button"
                  onClick={applyAiSuggestion}
                  className="w-full py-2.5 bg-white text-blue-900 hover:bg-blue-50 rounded-xl text-xs font-bold transition shadow-md active:scale-95"
                >
                  ⚡ Apply AI Recommendations
                </button>
              </div>
            ) : (
              <div className="text-xs text-blue-200/80 leading-relaxed py-6 text-center space-y-2">
                <p>Type your issue title & description on the left.</p>
                <p className="text-[11px] text-blue-300/70">
                  CampusFix AI automatically predicts the department, checks urgent safety triggers, and calculates your SLA in real-time.
                </p>
              </div>
            )}
          </div>

          <div className="bg-white p-5 rounded-2xl border border-gray-100 text-xs text-gray-500 space-y-2 shadow-xs">
            <div className="font-bold text-gray-900 text-xs uppercase tracking-wider">💡 Duplicate Tip</div>
            <p className="text-[11px] leading-relaxed">
              Before submitting, you can search "All Issues" to see if a peer has already reported this exact issue. If so, simply upvote their ticket!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewComplaintPage;
