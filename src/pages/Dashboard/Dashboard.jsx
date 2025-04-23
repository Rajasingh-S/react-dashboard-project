import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Papa from 'papaparse';
import DataTable from '../../components/Table/DataTable';
import { FiUploadCloud } from 'react-icons/fi';
import './Dashboard.css';

const Dashboard = () => {
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
          .filter(row => Object.values(row).some(val => val && val.toString().trim()))
          .map(row => {
            const cleanRow = {};
            Object.keys(row).forEach(key => {
              cleanRow[key.trim()] = typeof row[key] === 'string' ? row[key].trim() : row[key];
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

  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  return (
    <div className="dashboard-container">
      <AnimatePresence>
        {!data.length && (
          <motion.div 
            className="upload-container"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3 }}
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
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={triggerFileInput}
            >
              <FiUploadCloud className="upload-icon" />
              <h3>Upload Assessment Data</h3>
              <p>CSV or Excel files supported</p>
              {isLoading && (
                <motion.div 
                  className="loading-bar"
                  initial={{ width: 0 }}
                  animate={{ width: '100%' }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                />
              )}
              {error && (
                <motion.p 
                  className="error-message"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                >
                  {error}
                </motion.p>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {data.length > 0 && (
        <motion.div
          className="table-container"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <DataTable 
            headers={headers} 
            data={data} 
            onClearData={() => setData([])}
          />
        </motion.div>
      )}
    </div>
  );
};

export default Dashboard;