import { useState, useRef, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import * as XLSX from 'xlsx';
import InstitutionsTable from '../../components/Table/InstitutionsTable';
import { FiUploadCloud, FiFilter, FiX, FiChevronDown, FiChevronUp } from 'react-icons/fi';
import './Institutions.css';

const Institutions = () => {
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [headers, setHeaders] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const fileInputRef = useRef(null);

  // Filter states
  const [filters, setFilters] = useState({
    college: '',
    studentName: '',
    department: ''
  });

  // Check for mobile view
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Extract unique values for dropdowns
  const colleges = [...new Set(data.map(item => item.college || item.College || ''))].filter(Boolean);
  const departments = [...new Set(data.map(item => item.department || item.Department || ''))].filter(Boolean);

  // Apply filters
  useEffect(() => {
    if (data.length > 0) {
      const filtered = data.filter(item => {
        const collegeMatch = !filters.college || 
          (item.college || item.College || '').toLowerCase().includes(filters.college.toLowerCase());
        const studentMatch = !filters.studentName || 
          (item.studentName || item['Student Name'] || '').toLowerCase().includes(filters.studentName.toLowerCase());
        const deptMatch = !filters.department || 
          (item.department || item.Department || '').toLowerCase().includes(filters.department.toLowerCase());
        
        return collegeMatch && studentMatch && deptMatch;
      });
      setFilteredData(filtered);
    } else {
      setFilteredData([]);
    }
  }, [data, filters]);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsLoading(true);
    setError(null);
    setFilters({ college: '', studentName: '', department: '' });

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(firstSheet, { defval: null });
        
        if (jsonData.length === 0) {
          setError('The Excel file is empty');
          setIsLoading(false);
          return;
        }

        const cleanData = jsonData
          .filter(row => Object.values(row).some(val => val !== undefined && val !== null))
          .map((row, index) => {
            const cleanRow = {};
            Object.keys(row).forEach(key => {
              if (row[key] === 0 || row[key] === '0') {
                cleanRow[key.trim()] = 0;
              } else {
                cleanRow[key.trim()] = typeof row[key] === 'string' ? row[key].trim() : row[key];
              }
            });
            return { ...cleanRow, id: index + 1 };
          });

        setHeaders(Object.keys(cleanData[0]));
        setData(cleanData);
        setIsLoading(false);
      } catch (error) {
        setError('Error parsing Excel file: ' + error.message);
        setIsLoading(false);
      }
    };
    
    reader.onerror = () => {
      setError('Error reading file');
      setIsLoading(false);
    };
    
    reader.readAsArrayBuffer(file);
  };

  const handleProcessedData = (processedData) => {
    if (processedData && processedData.length > 0) {
      const cleanData = processedData.map(row => {
        const cleanRow = {};
        Object.keys(row).forEach(key => {
          if (row[key] === 0 || row[key] === '0') {
            cleanRow[key] = 0;
          } else {
            cleanRow[key] = row[key];
          }
        });
        return cleanRow;
      });
      
      setHeaders(Object.keys(cleanData[0]));
      setData(cleanData);
      setFilters({ college: '', studentName: '', department: '' });
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  // const clear Filters = () => {
  //   setFilters({ college: '', studentName: '', department: '' });
  // };

  const hasFilters = filters.college || filters.studentName || filters.department;

  return (
    <div className="dashboard-container">
      <AnimatePresence mode="wait">
        {!data.length ? (
          <motion.div
            className="upload-container"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          >
            <input 
              type="file" 
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept=".xlsx,.xls,.csv"
              style={{ display: 'none' }}
            />
            <motion.div 
              className="upload-card"
              whileHover={{ 
                scale: 1.02,
                boxShadow: "0 20px 40px rgba(77, 171, 247, 0.2)"
              }}
              whileTap={{ scale: 0.98 }}
              onClick={triggerFileInput}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ 
                scale: 1,
                opacity: 1,
                transition: { delay: 0.2, type: "spring", damping: 10 }
              }}
            >
              <motion.div
                animate={{
                  y: [0, -5, 0],
                  transition: { repeat: Infinity, duration: 2 }
                }}
              >
                <FiUploadCloud className="upload-icon" />
              </motion.div>
              <motion.h3
                initial={{ opacity: 0, y: 10 }}
                animate={{ 
                  opacity: 1,
                  y: 0,
                  transition: { delay: 0.3 }
                }}
              >
                Upload College Assessment Data
              </motion.h3>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ 
                  opacity: 1,
                  transition: { delay: 0.4 }
                }}
              >
                Click to browse Excel files (.xlsx, .xls)
              </motion.p>
              {isLoading && (
                <motion.div 
                  className="loading-bar"
                  initial={{ width: 0 }}
                  animate={{ 
                    width: '100%',
                    transition: { duration: 1.5, repeat: Infinity }
                  }}
                />
              )}
              {error && (
                <motion.p 
                  className="error-message"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ 
                    opacity: 1, 
                    height: 'auto',
                    transition: { type: "spring" }
                  }}
                >
                  {error}
                </motion.p>
              )}
            </motion.div>
          </motion.div>
        ) : (
          <motion.div
            className="table-container"
            initial={{ opacity: 0, y: 20 }}
            animate={{ 
              opacity: 1,
              y: 0,
              transition: { duration: 0.5, ease: "easeOut" }
            }}
            exit={{ opacity: 0 }}
          >
            

            <AnimatePresence>
              {showFilters && (
                <motion.div 
                  className="filters-panel"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ 
                    opacity: 1, 
                    height: 'auto',
                    transition: { 
                      opacity: { duration: 0.2 },
                      height: { duration: 0.3 }
                    }
                  }}
                  exit={{ 
                    opacity: 0, 
                    height: 0,
                    transition: { 
                      opacity: { duration: 0.1 },
                      height: { duration: 0.2 }
                    }
                  }}
                >
                  <div className="filter-grid">
                    <motion.div 
                      className="filter-group"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 }}
                    >
                      <label>College:</label>
                      <select
                        value={filters.college}
                        onChange={(e) => setFilters({...filters, college: e.target.value})}
                      >
                        <option value="">All Colleges</option>
                        {colleges.map(college => (
                          <option key={college} value={college}>{college}</option>
                        ))}
                      </select>
                    </motion.div>
                      className="filter-group"

                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                    >
                      <label>Department:</label>
                      <select
                        value={filters.department}
                        onChange={(e) => setFilters({...filters, department: e.target.value})}
                      >
                        <option value="">All Departments</option>
                        {departments.map(dept => (
                          <option key={dept} value={dept}>{dept}</option>
                        ))}
                      </select>
                    </motion.div>

                    <motion.div 
                      className="filter-group"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                    >
                      <label>Student Name:</label>
                      <input
                        type="text"
                        placeholder="Search student name"
                        value={filters.studentName}
                        onChange={(e) => setFilters({...filters, studentName: e.target.value})}
                      />
                    </motion.div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <motion.div 
              className="results-info"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              {hasFilters && (
                <p className="filter-status">
                  Showing <strong>{filteredData.length}</strong> of <strong>{data.length}</strong> records
                  {filters.college && (
                    <span className="filter-tag">College: {filters.college}</span>
                  )}
                  {filters.department && (
                    <span className="filter-tag">Department: {filters.department}</span>
                  )}
                  {filters.studentName && (
                    <span className="filter-tag">Student: {filters.studentName}</span>
                  )}
                </p>
              )}
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              <InstitutionsTable 
                headers={headers} 
                data={filteredData.length > 0 ? filteredData : data} 
                onFileUpload={handleProcessedData} 
                onClearData={() => {
                  setData([]);
                  setFilters({ college: '', studentName: '', department: '' });
                }}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Institutions;