import React from 'react';
import { Plus, Trash2, LayoutDashboard } from 'lucide-react';
import { Category } from '../../types';

interface CategoryManagerProps {
  categories: Category[];
  isAddingCategory: boolean;
  setIsAddingCategory: (val: boolean) => void;
  newCategory: { name: string; description: string };
  setNewCategory: (cat: { name: string; description: string }) => void;
  handleCreateCategory: (e: React.FormEvent) => void;
  handleDeleteCategory: (id: number) => void;
}

export const CategoryManager: React.FC<CategoryManagerProps> = ({
  categories,
  isAddingCategory,
  setIsAddingCategory,
  newCategory,
  setNewCategory,
  handleCreateCategory,
  handleDeleteCategory,
}) => {
  return (
    <div className="animate-in slide-in-from-bottom-4 duration-500 space-y-8">
      <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm p-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h3 className="text-2xl font-extrabold text-gray-900 tracking-tight">Topic Management</h3>
            <p className="text-gray-500 font-medium mt-1">Manage news categories and areas of interest.</p>
          </div>
          {!isAddingCategory && (
            <button 
              onClick={() => setIsAddingCategory(true)}
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-extrabold rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-100 transition-all active:scale-95"
            >
              <Plus className="w-5 h-5" /> New Topic
            </button>
          )}
        </div>

        {isAddingCategory && (
          <form onSubmit={handleCreateCategory} className="mb-12 p-8 bg-gray-50/50 rounded-3xl border border-gray-100 space-y-6 animate-in zoom-in-95 duration-200">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-500 uppercase tracking-wider ml-1">Topic Name</label>
                <input 
                  type="text"
                  required
                  value={newCategory.name}
                  onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                  placeholder="e.g. Technology, Politics..."
                  className="w-full px-6 py-4 bg-white border border-gray-100 rounded-2xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all font-bold outline-none"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-500 uppercase tracking-wider ml-1">Description (Optional)</label>
                <input 
                  type="text"
                  value={newCategory.description}
                  onChange={(e) => setNewCategory({ ...newCategory, description: e.target.value })}
                  placeholder="Short description of the topic"
                  className="w-full px-6 py-4 bg-white border border-gray-100 rounded-2xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all font-medium outline-none"
                />
              </div>
            </div>
            <div className="flex gap-4">
              <button 
                type="submit"
                className="px-8 py-3 bg-blue-600 text-white font-extrabold rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-100 transition-all active:scale-95"
              >
                Create Topic
              </button>
              <button 
                type="button"
                onClick={() => setIsAddingCategory(false)}
                className="px-8 py-3 bg-white text-gray-500 font-extrabold rounded-xl border border-gray-100 hover:bg-gray-50 transition-all active:scale-95"
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map(cat => (
            <div key={cat.id} className="p-6 bg-white border border-gray-100 rounded-[2rem] shadow-sm hover:shadow-md transition-all group flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center font-bold text-xl">
                    {cat.name.charAt(0)}
                  </span>
                  <button 
                    onClick={() => handleDeleteCategory(cat.id)}
                    className="p-2 text-gray-300 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                    title="Delete Topic"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <h4 className="text-lg font-extrabold text-gray-900 mb-2">{cat.name}</h4>
                <p className="text-sm text-gray-500 font-medium leading-relaxed">{cat.description || 'No description provided.'}</p>
              </div>
              <div className="pt-6 mt-6 border-t border-gray-50 flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-gray-400">
                <span>Topic ID: {cat.id}</span>
                <span className="px-2 py-1 bg-gray-50 rounded-md">Live</span>
              </div>
            </div>
          ))}
          {categories.length === 0 && (
            <div className="col-span-full py-20 text-center">
              <LayoutDashboard className="w-12 h-12 text-gray-100 mx-auto mb-4" />
              <p className="text-gray-400 font-bold uppercase tracking-widest">No topics created yet.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
