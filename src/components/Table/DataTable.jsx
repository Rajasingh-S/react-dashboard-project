import { useState, useMemo, useEffect } from 'react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Paper,
  TextField,
  MenuItem,
  TableSortLabel,
  Typography,
  Box,
  TablePagination,
  Chip,
  Button,
  Avatar,
  CircularProgress,
  Snackbar,
  Alert,
  useMediaQuery,
  ThemeProvider,
  createTheme
} from '@mui/material';
import { 
  FiFilter, 
  FiX,
  FiDownload,
  FiPieChart
} from 'react-icons/fi';
import * as XLSX from 'xlsx';
import useAssessmentStore from '../../store/assessmentStore';
import './DataTable.css';

const DataTable = () => {
  const { data, headers } = useAssessmentStore();
  const [managerFilter, setManagerFilter] = useState('');
  const [courseFilter, setCourseFilter] = useState('');
  const [orderBy, setOrderBy] = useState('');
  const [order, setOrder] = useState('asc');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const isMobile = useMediaQuery('(max-width:768px)');

  useEffect(() => {
    if (data.length > 0) {
      setLoading(false);
    }
  }, [data]);

  const theme = createTheme({
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            whiteSpace: 'nowrap',
            minWidth: 'auto',
            padding: isMobile ? '6px 8px' : '8px 16px'
          }
        }
      }
    }
  });

  const allHeaders = useMemo(() => {
    if (headers && headers.length > 0) return headers;
    if (data.length === 0) return [];
    const headerSet = new Set();
    data.forEach(row => Object.keys(row).forEach(key => headerSet.add(key)));
    return Array.from(headerSet);
  }, [headers, data]);

  const { uniqueManagers, uniqueCourses } = useMemo(() => {
    const managers = new Set();
    const courses = new Set();
    
    data.forEach(item => {
      const managerKey = Object.keys(item).find(k => k.toLowerCase().includes('manager'));
      const courseKey = Object.keys(item).find(k => k.toLowerCase().includes('course'));
      
      if (managerKey && item[managerKey]) managers.add(item[managerKey]);
      if (courseKey && item[courseKey]) courses.add(item[courseKey]);
    });
    
    return {
      uniqueManagers: Array.from(managers).sort(),
      uniqueCourses: Array.from(courses).sort()
    };
  }, [data]);

  const processedData = useMemo(() => {
    return data.filter(item => {
      const managerKey = Object.keys(item).find(k => k.toLowerCase().includes('manager'));
      const courseKey = Object.keys(item).find(k => k.toLowerCase().includes('course'));
      
      const matchesManager = !managerFilter || 
        (managerKey && item[managerKey] && item[managerKey].toString() === managerFilter);
      const matchesCourse = !courseFilter || 
        (courseKey && item[courseKey] && item[courseKey].toString() === courseFilter);
      return matchesManager && matchesCourse;
    }).sort((a, b) => {
      if (!orderBy) return 0;
      const aValue = a[orderBy] ?? '';
      const bValue = b[orderBy] ?? '';
      return order === 'asc' 
        ? aValue.toString().localeCompare(bValue.toString())
        : bValue.toString().localeCompare(aValue.toString());
    });
  }, [data, managerFilter, courseFilter, orderBy, order]);

  const handleExport = () => {
    const exportData = processedData.map(row => {
      const cleanRow = {};
      allHeaders.forEach(header => {
        if (header.includes('%') || header.toLowerCase().includes('score') || 
            header.toLowerCase().includes('count') || header.toLowerCase().includes('time') ||
            header === 'Batch') {
          cleanRow[header] = row[header] ?? 0;
        } else {
          cleanRow[header] = row[header] ?? '';
        }
      });
      return cleanRow;
    });

    const ws = XLSX.utils.json_to_sheet(exportData, { header: allHeaders });
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Data");
    XLSX.writeFile(wb, `Assessment_Data_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleSort = (property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const clearFilters = () => {
    setManagerFilter('');
    setCourseFilter('');
    setPage(0);
  };

  const renderCellValue = (value, header) => {
    if (header.toLowerCase().includes('percentage')) {
      return (
        <Chip
          label={`${value !== undefined && value !== '' ? value : 0}%`}
          size="small"
          sx={{
            background: (value || 0) >= 50 ? '#e8f5e9' : '#ffebee',
            color: (value || 0) >= 50 ? '#2e7d32' : '#c62828',
            fontWeight: '500'
          }}
        />
      );
    } else if (header.toLowerCase().includes('status') && !header.toLowerCase().includes('attendance')) {
      const statusValue = (value || '').toString().toLowerCase();
      const isQualified = statusValue === 'qualified' || 
                         (statusValue.includes('qualif') && !statusValue.includes('not'));
      
      return (
        <Chip
          label={isQualified ? 'Qualified' : 'Not Qualified'}
          size="small"
          sx={{
            background: isQualified ? '#e8f5e9' : '#ffebee',
            color: isQualified ? '#2e7d32' : '#c62828',
            fontWeight: '500'
          }}
        />
      );
    } else if (header.toLowerCase().includes('attendance')) {
      const attendanceValue = (value || '').toString().toLowerCase();
      const isPresent = attendanceValue === 'present' || 
                       attendanceValue === 'yes' ||
                       attendanceValue === 'attended' ||
                       attendanceValue === 'true' ||
                       attendanceValue === '1';
      
      return (
        <Chip
          label={isPresent ? 'Yes' : 'No'}
          size="small"
          sx={{
            background: isPresent ? '#e8f5e9' : '#ffebee',
            color: isPresent ? '#2e7d32' : '#c62828',
            fontWeight: '500'
          }}
        />
      );
    } else if (header.toLowerCase().includes('self-interested') || 
               header.toLowerCase().includes('self interested') || 
               header.toLowerCase().includes('interested candidate')) {
      const interestValue = (value || '').toString().toLowerCase();
      const isInterested = interestValue === 'yes' || 
                           interestValue === 'true' ||
                           interestValue === 'interested' ||
                           interestValue === '1';
      
      return (
        <Chip
          label={isInterested ? 'Yes' : 'No'}
          size="small"
          sx={{
            background: isInterested ? '#e8f5e9' : '#ffebee',
            color: isInterested ? '#2e7d32' : '#c62828',
            fontWeight: '500'
          }}
        />
      );
    } else if ((typeof value === 'number' || !isNaN(Number(value))) && 
               value !== '' && value !== null && value !== undefined) {
      return value.toString();
    } else {
      return value !== undefined && value !== null ? value.toString() : '';
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <ThemeProvider theme={theme}>
      <div className="data-table-container">
        <Snackbar
          open={snackbarOpen}
          autoHideDuration={6000}
          onClose={() => setSnackbarOpen(false)}
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        >
          <Alert onClose={() => setSnackbarOpen(false)} severity="error" sx={{ width: '100%' }}>
            {error}
          </Alert>
        </Snackbar>

        <div className="table-header">
          <div className="header-content">
            <Avatar sx={{ bgcolor: '#1976d2', width: 40, height: 40, mr: 2 }}>
              <FiPieChart size={20} />
            </Avatar>
            <div>
              <Typography variant="h5" className="table-title">
                Assessment Results
              </Typography>
              <Typography variant="subtitle2" className="table-subtitle">
                <Chip 
                  label={`${processedData.length} records`}
                  size="small"
                  sx={{
                    background: 'linear-gradient(135deg, #e3f2fd, #bbdefb)',
                    color: '#0d47a1',
                    fontWeight: '600',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                  }}
                />
                <span className="last-updated">
                  Last updated: {new Date().toLocaleTimeString()}
                </span>
              </Typography>
            </div>
          </div>
          
          <div className="action-buttons">
            <Button 
              variant="contained" 
              startIcon={<FiDownload />}
              onClick={handleExport}
              sx={{
                background: 'linear-gradient(135deg, #1976d2 0%, #2196f3 100%)',
                color: 'white',
                boxShadow: '0 2px 10px rgba(25, 118, 210, 0.3)',
                '&:hover': { background: 'linear-gradient(135deg, #1565c0 0%, #1e88e5 100%)' },
                mr: 2
              }}
            >
              {isMobile ? 'Export' : 'Export Data'}
            </Button>
            <Button 
              variant="contained" 
              startIcon={<FiPieChart />}
              onClick={() => useAssessmentStore.getState().toggleView()}
              sx={{
                background: 'linear-gradient(135deg, #4caf50 0%, #2e7d32 100%)',
                color: 'white',
                '&:hover': { background: 'linear-gradient(135deg, #388e3c 0%, #1b5e20 100%)' }
              }}
            >
              {isMobile ? 'Charts' : 'View Charts'}
            </Button>
          </div>
        </div>

        <div className="filter-container">
          <TextField
            select
            size="small"
            value={managerFilter}
            onChange={(e) => {
              setManagerFilter(e.target.value);
              setPage(0);
            }}
            label="Filter by Manager"
            sx={{ 
              minWidth: 220,
              mr: 2,
              '& .MuiOutlinedInput-root': { background: '#f5f9ff', borderRadius: '8px' }
            }}
            variant="outlined"
          >
            <MenuItem value=""><em>All Managers</em></MenuItem>
            {uniqueManagers.map(manager => (
              <MenuItem key={manager} value={manager}>{manager}</MenuItem>
            ))}
          </TextField>
          
          <TextField
            select
            size="small"
            value={courseFilter}
            onChange={(e) => {
              setCourseFilter(e.target.value);
              setPage(0);
            }}
            label="Filter by Course"
            sx={{ 
              minWidth: 220,
              '& .MuiOutlinedInput-root': { background: '#f5f9ff', borderRadius: '8px' }
            }}
            variant="outlined"
          >
            <MenuItem value=""><em>All Courses</em></MenuItem>
            {uniqueCourses.map(course => (
              <MenuItem key={course} value={course}>{course}</MenuItem>
            ))}
          </TextField>

          {(managerFilter || courseFilter) && (
            <Button
              startIcon={<FiX />}
              onClick={clearFilters}
              sx={{ ml: 2, color: '#f44336' }}
            >
              Clear Filters
            </Button>
          )}
        </div>

        <TableContainer 
          component={Paper} 
          sx={{ 
            borderRadius: '12px',
            border: '1px solid #e0e0e0',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)',
            maxHeight: 'calc(100vh - 280px)',
            '&::-webkit-scrollbar': { height: '8px', width: '8px' },
            '&::-webkit-scrollbar-thumb': { backgroundColor: '#bdbdbd', borderRadius: '4px' }
          }}
        >
          <Table stickyHeader size="small" aria-label="assessment data table">
            <TableHead>
              <TableRow>
                {allHeaders.map(header => (
                  <TableCell 
                    key={header}
                    sx={{ 
                      background: '#f5f9ff',
                      fontWeight: '600',
                      color: '#1976d2',
                      whiteSpace: 'nowrap',
                      borderBottom: '1px solid #e0e0e0'
                    }}
                  >
                    <TableSortLabel
                      active={orderBy === header}
                      direction={orderBy === header ? order : 'asc'}
                      onClick={() => handleSort(header)}
                      sx={{
                        '&:hover': { color: '#0d47a1' },
                        '&.Mui-active': { color: '#0d47a1' }
                      }}
                    >
                      {header}
                    </TableSortLabel>
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {(rowsPerPage > 0
                ? processedData.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                : processedData
              ).map((row, index) => (
                <TableRow 
                  key={index}
                  sx={{ 
                    '&:nth-of-type(even)': { backgroundColor: '#fafafa' },
                    '&:hover': { backgroundColor: '#f5f5f5' }
                  }}
                >
                  {allHeaders.map(header => (
                    <TableCell 
                      key={header} 
                      sx={{ whiteSpace: 'nowrap', borderBottom: '1px solid #f0f0f0' }}
                    >
                      {renderCellValue(row[header], header)}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        <TablePagination
          rowsPerPageOptions={[10, 25, 50, 100]}
          component="div"
          count={processedData.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          sx={{
            mt: 2,
            '& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows': {
              fontSize: '0.875rem'
            }
          }}
        />
      </div>
    </ThemeProvider>
  );
};

export default DataTable;