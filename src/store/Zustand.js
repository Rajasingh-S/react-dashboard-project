import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

const initialCharts = [
  {
    title: 'Qualification Status',
    type: 'pie',
    data: {
      labels: ['Qualified', 'Not Qualified'],
      datasets: [{
        data: [19, 41],
        backgroundColor: ['#10b981', '#3b82f6'],
        borderColor: 'white',
        borderWidth: 2
      }]
    },
    options: {
      responsive: true,
      plugins: {
        title: {
          display: true,
          text: 'Qualification Status'
        },
        legend: {
          position: 'right',
          labels: {
            usePointStyle: true,
            color: '#374151'
          }
        }
      }
    }
  },
  {
    title: 'Score Category Overview',
    type: 'bar',
    data: {
      labels: ['1-50', '51-70', '71-100'],
      datasets: [{
        label: 'Student Count',
        data: [39, 4, 15],
        backgroundColor: ['#3b82f6', '#3b82f6', '#3b82f6'],
        borderRadius: 6,
        borderColor: 'white',
        borderWidth: 2
      }]
    },
    options: {
      responsive: true,
      plugins: {
        title: {
          display: true,
          text: 'Score Category Overview'
        },
        legend: { display: false }
      },
      scales: {
        y: { beginAtZero: true },
        x: {}
      }
    }
  },
  {
    title: 'Department-Wise Average Score',
    type: 'bar',
    data: {
      labels: ['CSE', 'Mechanical', 'ECE'],
      datasets: [{
        data: [46, 33, 15],
        backgroundColor: ['#3b82f6', '#3b82f6', '#3b82f6'],
        borderColor: 'white',
        borderWidth: 2
      }]
    },
    options: {
      responsive: true,
      plugins: {
        title: {
          display: true,
          text: 'Department-Wise Average Score'
        },
        legend: {
          position: 'bottom',
          labels: {
            usePointStyle: true,
            color: '#374151'
          }
        }
      }
    }
  },
  {
    title: 'Integrity Score Distribution',
    type: 'bar',
    data: {
      labels: ['5', '6', '7', '8', '9', '10'],
      datasets: [{
        label: 'No. of Students',
        data: [1, 6, 2, 6, 0, 51],
        backgroundColor: '#3b82f6',
        borderColor: '#3b82f6',
        fill: true,
        tension: 0.4
      }]
    },
    options: {
      responsive: true,
      plugins: {
        title: {
          display: true,
          text: 'Integrity Score Distribution'
        },
        legend: { display: false }
      },
      scales: {
        y: { beginAtZero: true },
        x: {}
      }
    }
  }
];

export const useAssessmentStore = create(
  persist(
    (set, get) => ({
      // State
      charts: initialCharts,
      institutionsData: [],
      filters: {
        globalSearch: '',
        college: '',
        department: '',
        status: '',
        studentName: ''
      },
      selectedColumns: {},
      sortConfig: { key: null, direction: 'asc' },
      currentChartSlide: 0,
      showChartView: false,
      rowsPerPage: 10,
      currentPage: 1,

      // Derived state getters
      getFilteredData: () => {
        const { institutionsData: data, filters, sortConfig } = get();
        
        if (data.length === 0) return [];
        
        const normalize = (value) => value?.toString().toLowerCase().trim() || '';
        const headers = Object.keys(data[0] || {});

        const filtered = data.filter(row => {
          const matchesGlobal = filters.globalSearch
            ? headers.some(h => 
                normalize(row[h]).includes(normalize(filters.globalSearch)))
            : true;
          
          const matchesCollege = !filters.college || 
            normalize(row['College Name (Full Name)'] || row['college']).includes(normalize(filters.college));
          
          const matchesDept = !filters.department || 
            normalize(row['Department (Eg- CSE/AIDS)'] || row['department']).includes(normalize(filters.department));
          
          const matchesStatus = !filters.status || 
            normalize(row['Status'] || row['status']).includes(normalize(filters.status));

          const matchesStudent = !filters.studentName ||
            normalize(row['Student Name'] || row['studentName']).includes(normalize(filters.studentName));

          return matchesGlobal && matchesCollege && matchesDept && matchesStatus && matchesStudent;
        });

        if (!sortConfig.key) return filtered;
        
        return [...filtered].sort((a, b) => {
          const aVal = a[sortConfig.key] || '';
          const bVal = b[sortConfig.key] || '';
          return sortConfig.direction === 'asc'
            ? aVal.localeCompare(bVal)
            : bVal.localeCompare(aVal);
        });
      },

      getPaginatedData: () => {
        const { getFilteredData, rowsPerPage, currentPage } = get();
        const filteredData = getFilteredData();
        const startIndex = (currentPage - 1) * rowsPerPage;
        return filteredData.slice(startIndex, startIndex + rowsPerPage);
      },

      getUniqueValues: (field) => {
        const { institutionsData: data } = get();
        const values = data
          .map(item => item[field] || item[field.replace(' ', '').toLowerCase()] || '')
          .filter(value => value !== null && value !== undefined && value !== '');

        const uniqueMap = new Map();
        values.forEach(value => {
          const normalized = value.toString().toLowerCase().trim();
          if (!uniqueMap.has(normalized)) {
            uniqueMap.set(normalized, value);
          }
        });

        return Array.from(uniqueMap.values()).sort((a, b) => a.localeCompare(b));
      },

      // Actions
      setCharts: (charts) => set({ charts }),
      
      setInstitutionsData: (data) => {
        if (data.length > 0) {
          const headers = Object.keys(data[0]);
          const selectedColumns = headers.reduce((acc, header) => 
            ({ ...acc, [header]: true }), {});
          
          return set({ 
            institutionsData: data,
            selectedColumns,
            currentPage: 1
          });
        }
        return set({ institutionsData: data });
      },
      
      setFilters: (filters) => set({ filters, currentPage: 1 }),
      
      updateFilter: (key, value) => set(state => ({
        filters: { ...state.filters, [key]: value },
        currentPage: 1
      })),
      
      setSelectedColumns: (selectedColumns) => set({ selectedColumns }),
      
      toggleColumn: (header) => set(state => ({
        selectedColumns: {
          ...state.selectedColumns,
          [header]: !state.selectedColumns[header]
        }
      })),
      
      setSortConfig: (sortConfig) => set({ sortConfig }),
      
      setCurrentChartSlide: (index) => set({ currentChartSlide: index }),
      
      setShowChartView: (show) => set({ showChartView: show }),
      
      setRowsPerPage: (rows) => set({ rowsPerPage: rows, currentPage: 1 }),
      
      setCurrentPage: (page) => set({ currentPage: page }),
      
      nextPage: () => set(state => {
        const totalPages = Math.ceil(state.getFilteredData().length / state.rowsPerPage);
        return { currentPage: Math.min(state.currentPage + 1, totalPages) };
      }),
      
      prevPage: () => set(state => ({
        currentPage: Math.max(state.currentPage - 1, 1)
      })),
      
      clearData: () => set({
        institutionsData: [],
        filters: {
          globalSearch: '',
          college: '',
          department: '',
          status: '',
          studentName: ''
        },
        currentPage: 1
      }),
      
      resetFilters: () => set({
        filters: {
          globalSearch: '',
          college: '',
          department: '',
          status: '',
          studentName: ''
        },
        currentPage: 1
      })
    }),
    {
      name: 'assessment-dashboard-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        charts: state.charts,
        institutionsData: state.institutionsData,
        selectedColumns: state.selectedColumns,
        filters: state.filters,
        sortConfig: state.sortConfig,
        rowsPerPage: state.rowsPerPage
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          const filteredLength = state.getFilteredData?.().length || 0;
          const maxPage = Math.ceil(filteredLength / state.rowsPerPage) || 1;
          if (state.currentPage > maxPage) {
            state.setCurrentPage(maxPage);
          }
        }
      }
    }
  )
);