import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Papa from 'papaparse';
import DataTable from '../../components/Table/DataTable';
import { FiUploadCloud } from 'react-icons/fi';
import './AssessmentData.css';

const AssessmentData = () => {
  const [data, setData] = useState([]);
  const [headers, setHeaders] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsLoading(true);
    setError(null);

    Papa.parse(file, {
      header: true,
      complete: (results) => {
        if (results.data.length === 0) {
          setError('The CSV file is empty');
          setIsLoading(false);
          return;
        }

        const cleanData = results.data
          .filter(row => Object.values(row).some(val => val !== undefined && val !== null && val.toString().trim() !== ''))
          .map(row => {
            const cleanRow = {};
            Object.keys(row).forEach(key => {
              // Preserve zero values by checking explicitly for undefined and null
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
        setIsLoading(false);
      },
      error: (error) => {
        setError('Error parsing CSV file: ' + error.message);
        setIsLoading(false);
      }
    });
  };

  // Function to handle processed data from DataTable component
  const handleProcessedData = (processedData) => {
    if (processedData && processedData.length > 0) {
      // Preserve all values including zeros
      const cleanData = processedData.map(row => {
        const cleanRow = {};
        Object.keys(row).forEach(key => {
          // Preserve zero values explicitly
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
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

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
              accept=".csv,.xlsx,.xls"
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
                Upload Assessment Data
              </motion.h3>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ 
                  opacity: 1,
                  transition: { delay: 0.4 }
                }}
              >
                Drag & drop or click to browse files
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
            <DataTable 
              headers={headers} 
              data={data} 
              onFileUpload={handleProcessedData} 
              onClearData={() => setData([])}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AssessmentData;