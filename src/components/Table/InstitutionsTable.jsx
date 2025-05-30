import { useState, useRef, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiUploadCloud, FiX, FiDownload, FiFilter,
  FiChevronDown, FiChevronUp, FiSearch, FiBarChart2
} from 'react-icons/fi';
import * as XLSX from 'xlsx';
import Chartview from "../Chart/Chartview";
import './InstitutionsTable.css';

const InstitutionsTable = ({ headers, data, onFileUpload, onClearData }) => {
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [filters, setFilters] = useState({ globalSearch: '', college: '', department: '', status: '' });
  const [showColumnSelector, setShowColumnSelector] = useState(false);
  const [selectedColumns, setSelectedColumns] = useState(() =>
    headers.reduce((acc, header) => ({ ...acc, [header]: true }), {})
  );
  const [isMobile, setIsMobile] = useState(false);
  const [showChartView, setShowChartView] = useState(false);
  const fileInputRef = useRef(null);
  const dropdownRef = useRef(null);

  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowColumnSelector(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const uniqueValues = useMemo(() => {
    const normalize = (value) => {
      if (!value) return null;
      return value.toString().trim().toLowerCase();
    };

    const getUniqueValues = (key) => {
      const values = data
        .map(item => item[key])
        .filter(value => value !== null && value !== undefined && value !== '')
        .map(value => ({
          normalized: normalize(value),
          original: value
        }));

      const uniqueMap = new Map();
      values.forEach(({normalized, original}) => {
        if (!uniqueMap.has(normalized)) {
          uniqueMap.set(normalized, original);
        }
      });

      return Array.from(uniqueMap.values())
        .sort((a, b) => a.localeCompare(b));
    };

    return {
      colleges: getUniqueValues('College Name (Full Name)'),
      departments: getUniqueValues('Department (Eg- CSE/AIDS)'),
      statuses: getUniqueValues('Status')
    };
  }, [data]);

  const handleSort = (key) => {
    const direction = sortConfig.key === key && sortConfig.direction === 'asc' ? 'desc' : 'asc';
    setSortConfig({ key, direction });
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(sheet, { defval: null });

        console.log('Parsed Data:', jsonData);
        onFileUpload(jsonData);
        fileInputRef.current.value = '';
      } catch (err) {
        console.error('Excel Parse Error:', err);
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const triggerUpload = () => fileInputRef.current.click();

  const exportToExcel = () => {
    const visibleHeaders = headers.filter(h => selectedColumns[h]);
    const exportData = filteredData.map(row => {
      const obj = {};
      visibleHeaders.forEach(h => (obj[h] = row[h]));
      return obj;
    });

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'InstitutionsData');
    XLSX.writeFile(wb, 'institutions_data.xlsx');
  };

  const filteredData = useMemo(() => {
    const normalize = (value) => value?.toString().toLowerCase().trim() || '';
    
    return data.filter(row => {
      const matchesGlobal = filters.globalSearch
        ? headers.some(h => 
            normalize(row[h]).includes(normalize(filters.globalSearch)))
        : true;
      
      const matchesCollege = !filters.college || 
        normalize(row['College Name (Full Name)']).includes(normalize(filters.college));
      
      const matchesDept = !filters.department || 
        normalize(row['Department (Eg- CSE/AIDS)']).includes(normalize(filters.department));
      
      const matchesStatus = !filters.status || 
        normalize(row['Status']).includes(normalize(filters.status));

      return matchesGlobal && matchesCollege && matchesDept && matchesStatus;
    });
  }, [data, filters, headers]);

  const sortedData = useMemo(() => {
    if (!sortConfig.key) return filteredData;
    return [...filteredData].sort((a, b) => {
      const aVal = a[sortConfig.key] || '';
      const bVal = b[sortConfig.key] || '';
      return sortConfig.direction === 'asc'
        ? aVal.localeCompare(bVal)
        : bVal.localeCompare(aVal);
    });
  }, [filteredData, sortConfig]);

  const toggleColumn = (header) => {
    setSelectedColumns(prev => ({ ...prev, [header]: !prev[header] }));
  };

  const totalPages = Math.ceil(sortedData.length / rowsPerPage);
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * rowsPerPage;
    return sortedData.slice(startIndex, startIndex + rowsPerPage);
  }, [sortedData, currentPage, rowsPerPage]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(1);
    }
  }, [totalPages, currentPage]);

  const Logo = () => (
    <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="10" y="28" width="6" height="12" fill="#4CAF50"/>
      <rect x="20" y="20" width="6" height="20" fill="#2196F3"/>
      <rect x="30" y="12" width="6" height="28" fill="#FFC107"/>
      <path d="M16 12L24 8L32 12L24 16L16 12Z" fill="#795548"/>
      <path d="M12 16L36 16L36 18L12 18L12 16Z" fill="#5D4037"/>
    </svg>
  );

  return (
    <div className="institutions-table-container">
      <div className="table-header">
        <div className="title-with-logo">
          <Logo />
          <h2>Institutions Assessment Data</h2>
        </div>
        <div className="table-actions">
          <input ref={fileInputRef} type="file" accept=".xlsx,.xls,.csv" onChange={handleFileUpload} hidden />
          {data.length > 0 && (
            <>
              <motion.button className="action-button chart-button" onClick={() => setShowChartView(!showChartView)} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <FiBarChart2 /> {showChartView ? 'Hide Charts' : 'Show Charts'}
              </motion.button>
              <motion.button className="action-button export-button" onClick={exportToExcel} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <FiDownload /> Export to Excel
              </motion.button>
              <motion.button className="action-button clear-button" onClick={onClearData} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <FiX /> Clear Data
              </motion.button>
            </>
          )}
        </div>
      </div>

      <AnimatePresence>
        {showChartView && data.length > 0 && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="chart-view-container">
            <Chartview data={filteredData} />
          </motion.div>
        )}
      </AnimatePresence>

      {data.length > 0 && !showChartView && (
        <div className="filters-container">
          <div className="filter-row">
            <div className="global-search">
              <FiSearch className="search-icon" />
              <input type="text" placeholder="Search across all columns..." value={filters.globalSearch} onChange={(e) => setFilters(prev => ({ ...prev, globalSearch: e.target.value }))} />
            </div>

            {[
              { field: 'college', label: 'College', options: uniqueValues.colleges },
              { field: 'department', label: 'Department', options: uniqueValues.departments },
              { field: 'status', label: 'Status', options: uniqueValues.statuses }
            ].map(({ field, label, options }) => (
              <div className="filter-group" key={field}>
                <select value={filters[field]} onChange={(e) => setFilters(prev => ({ ...prev, [field]: e.target.value }))}>
                  <option value="">All {label}</option>
                  {options.map(val => <option key={val} value={val}>{val}</option>)}
                </select>
              </div>
            ))}

            <div className="filter-group" ref={dropdownRef}>
              <motion.button className="action-button column-toggle-button" onClick={() => setShowColumnSelector(prev => !prev)} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <FiFilter /> Columns
              </motion.button>
              <AnimatePresence>
                {showColumnSelector && (
                  <motion.div className="column-selector-dropdown" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                    {headers.map(header => (
                      <label key={header} className="checkbox-label">
                        <input type="checkbox" checked={selectedColumns[header]} onChange={() => toggleColumn(header)} />
                        <span>{header}</span>
                      </label>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="filter-group">
              <motion.button className="action-button clear-filter-button" onClick={() => setFilters({ globalSearch: '', college: '', department: '', status: '' })} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                Reset Filters
              </motion.button>
            </div>
          </div>
        </div>
      )}

      {data.length > 0 && !showChartView ? (
        <div className="table-wrapper">
          <div className="table-info">
            Showing {filteredData.length} of {data.length} records
            <span className="pagination-control">
              Rows per page:&nbsp;
              <select value={rowsPerPage} onChange={(e) => setRowsPerPage(Number(e.target.value))}>
                {[5, 10, 20, 50, 100, 200].map(n => <option key={n} value={n}>{n}</option>)}
              </select>
            </span>
          </div>

          <div className="table-scroll-container">
            <table className="institutions-table">
              <thead>
                <tr>
                  {headers.map(header => selectedColumns[header] && (
                    <th key={header} onClick={() => handleSort(header)}>
                      <div className="header-content">
                        {header}
                        {sortConfig.key === header && (
                          <span className="sort-indicator">{sortConfig.direction === 'asc' ? '↑' : '↓'}</span>
                        )}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {paginatedData.length > 0 ? paginatedData.map((row, i) => (
                  <motion.tr key={row.id || i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.02 }}>
                    {headers.map(header => selectedColumns[header] && (
                      <td key={`${i}-${header}`}><div className="cell-content">{row[header] ?? '-'}</div></td>
                    ))}
                  </motion.tr>
                )) : (
                  <tr className="no-results">
                    <td colSpan={headers.length}>No records match your filters.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="pagination">
            <button onClick={() => setCurrentPage(p => Math.max(p - 1, 1))} disabled={currentPage === 1}>Previous</button>
            <span>Page {currentPage} of {totalPages}</span>
            <button onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))} disabled={currentPage === totalPages}>Next</button>
          </div>
        </div>
      ) : data.length === 0 ? (
        <motion.div className="no-data-message" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div className="upload-prompt">
            <FiUploadCloud size={48} />
            <h3>No data available</h3>
            <p>Upload an Excel file to get started</p>
            <motion.button className="action-button upload-prompt-button" onClick={triggerUpload} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <FiUploadCloud /> Upload File
            </motion.button>
          </div>
        </motion.div>
      ) : null}
    </div>
  );
};

export default InstitutionsTable;