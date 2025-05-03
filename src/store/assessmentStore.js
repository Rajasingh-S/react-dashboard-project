import { create } from 'zustand';
import axios from 'axios';

const useAssessmentStore = create((set) => ({
  data: [],
  headers: [],
  loading: false,
  error: null,
  hasData: false,
  showCharts: false,

  // Actions
  setData: (newData) => set({ data: newData }),
  setHeaders: (newHeaders) => set({ headers: newHeaders }),
  setLoading: (isLoading) => set({ loading: isLoading }),
  setError: (error) => set({ error }),
  setHasData: (hasData) => set({ hasData }),
  clearData: () => set({ data: [], headers: [], hasData: false, showCharts: false }),
  toggleView: () => set((state) => ({ showCharts: !state.showCharts })),

  fetchDataFromApi: async () => {
    try {
      set({ loading: true, error: null });
      const response = await axios.get('/api/assessment-data');
      const data = response.data;
      const headers = data.length > 0 ? Object.keys(data[0]) : [];
      set({ data, headers, hasData: true, loading: false });
    } catch (error) {
      set({ 
        error: error.response?.data?.message || 'Failed to fetch assessment data',
        loading: false
      });
    }
  }
}));

export default useAssessmentStore;