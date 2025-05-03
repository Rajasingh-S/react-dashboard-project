import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Box,
  Button,
  Avatar,
  Typography,
  useTheme,
  AppBar,
  Toolbar,
  IconButton
} from '@mui/material';
import Papa from 'papaparse';
import DataTable from '../../components/Table/DataTable';
import ChartView from '../../components/Charts/ChartView';
import { FiUploadCloud, FiPieChart, FiMinimize2} from 'react-icons/fi';
import * as XLSX from 'xlsx';
import useAssessmentStore from '../../store/assessmentStore';
import './AssessmentData.css';

const AssessmentData = () => {
  const fileInputRef = useRef(null);
  const theme = useTheme();
  const [fullscreen, setFullscreen] = useState(false);
  
  const {
    data,
    headers,
    loading: isLoading,
    error,
    hasData,
    showCharts,
    setData,
    setHeaders,
    setLoading,
    setError,
    setHasData,
    clearData,
    toggleView
  } = useAssessmentStore();

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && fullscreen) {
        setFullscreen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [fullscreen]);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setLoading(true);
    setError(null);
    setHasData(false);
    e.target.value = '';

    const fileName = file.name.toLowerCase();
    if (fileName.endsWith('.csv')) {
      handleCSVUpload(file);
    } else if (fileName.endsWith('.xlsx') || fileName.endsWith('.xls')) {
      handleExcelUpload(file);
    } else {
      setError('Unsupported file format. Please upload a CSV or Excel file.');
      setLoading(false);
    }
  };

  const handleCSVUpload = (file) => {
    Papa.parse(file, {
      header: true,
      complete: (results) => {
        if (results.data.length === 0) {
          setError('The CSV file is empty');
          setLoading(false);
          return;
        }

        const cleanData = results.data
          .filter(row => Object.values(row).some(val => val !== undefined && val !== null && val.toString().trim() !== ''))
          .map(row => {
            const cleanRow = {};
            Object.keys(row).forEach(key => {
              if (row[key] === 0 || row[key] === '0') {
                cleanRow[key.trim()] = 0;
              } else {
                cleanRow[key.trim()] = typeof row[key] === 'string' ? row[key].trim() : row[key];
              }
            });
            return cleanRow;
          });

        setHeaders(Object.keys(cleanData[0]));
        setData(cleanData);
        setHasData(true);
        setLoading(false);
      },
      error: (error) => {
        setError('Error parsing CSV file: ' + error.message);
        setLoading(false);
      }
    });
  };

  const handleExcelUpload = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array', cellDates: true });
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(firstSheet, { defval: '', raw: false });
        
        if (!jsonData || jsonData.length === 0) {
          throw new Error('Excel file is empty or could not be parsed');
        }

        const allColumns = new Set();
        jsonData.forEach(row => Object.keys(row).forEach(key => allColumns.add(key)));

        const processed = jsonData.map(row => {
          const newRow = {};
          Array.from(allColumns).forEach(header => {
            const value = row[header];
            if (value === undefined || value === null) {
              newRow[header] = '';
            } else if (typeof value === 'number') {
              newRow[header] = value;
            } else if (typeof value === 'string' && !isNaN(value) && value.trim() !== '') {
              newRow[header] = isNaN(parseFloat(value)) ? value : parseFloat(value);
            } else if (value instanceof Date) {
              newRow[header] = value.toISOString().split('T')[0];
            } else {
              newRow[header] = value.toString();
            }
          });
          return newRow;
        });

        setHeaders(Object.keys(processed[0]));
        setData(processed);
        setHasData(true);
        setLoading(false);
      } catch (error) {
        console.error('Error processing Excel file:', error);
        setError('Error processing Excel file: ' + error.message);
        setLoading(false);
      }
    };
    reader.onerror = (error) => {
      console.error('Error reading file:', error);
      setError('Error reading file: ' + error.message);
      setLoading(false);
    };
    reader.readAsArrayBuffer(file);
  };

  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  const toggleFullscreen = () => {
    setFullscreen(!fullscreen);
  };

  return (
    <div className="dashboard-container">
      {fullscreen && (
        <AppBar 
          position="fixed" 
          sx={{ 
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            backdropFilter: 'blur(10px)',
            boxShadow: 'none',
            zIndex: theme.zIndex.drawer + 1
          }}
        >
          <Toolbar>
            <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 600 }}>
              Assessment Analytics Dashboard
            </Typography>
            <IconButton
              color="inherit"
              onClick={toggleFullscreen}
              sx={{ color: theme.palette.text.primary }}
            >
              <FiMinimize2 />
            </IconButton>
          </Toolbar>
        </AppBar>
      )}

      <AnimatePresence mode="wait">
        {!hasData ? (
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
              accept=".csv,.xlsx,.xls"
              style={{ display: 'none' }}
            />
            <motion.div 
              className="upload-card"
              whileHover={{ scale: 1.02, boxShadow: "0 20px 40px rgba(77, 171, 247, 0.2)" }}
              whileTap={{ scale: 0.98 }}
              onClick={triggerFileInput}
            >
              <motion.div animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 2 }}>
                <FiUploadCloud className="upload-icon" />
              </motion.div>
              <Typography variant="h4" component="h3">
                Upload Assessment Data
              </Typography>
              <Typography variant="body1">
                Drag & drop or click to browse files
              </Typography>
              {isLoading && (
                <motion.div 
                  className="loading-bar"
                  initial={{ width: 0 }}
                  animate={{ width: '100%' }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                />
              )}
              {error && (
                <motion.div 
                  className="error-message"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  transition={{ type: "spring" }}
                >
                  {error}
                </motion.div>
              )}
            </motion.div>
          </motion.div>
        ) : (
          <motion.div
            className="table-container"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            style={{ 
              marginTop: fullscreen ? '64px' : '0',
              height: fullscreen ? 'calc(100vh - 64px)' : 'auto'
            }}
          >
            {showCharts ? (
              <ChartView 
                data={data} 
                onToggleView={toggleView}
                fullscreen={fullscreen}
                onToggleFullscreen={toggleFullscreen}
              />
            ) : (
              <DataTable />
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AssessmentData;