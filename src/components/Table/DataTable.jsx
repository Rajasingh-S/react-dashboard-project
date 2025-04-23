import { useState, useMemo } from 'react';
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
  Button
} from '@mui/material';
import { 
  FiFilter, 
  FiX,
  FiDownload
} from 'react-icons/fi';
import './DataTable.css';

const DataTable = ({ headers, data, onClearData }) => {
  const [managerFilter, setManagerFilter] = useState('');
  const [courseFilter, setCourseFilter] = useState('');
  const [orderBy, setOrderBy] = useState('');
  const [order, setOrder] = useState('asc');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Extract unique managers and courses
  const { uniqueManagers, uniqueCourses } = useMemo(() => {
    const managers = new Set();
    const courses = new Set();
    
    data.forEach(item => {
      if (item.Manager || item.manager) managers.add(item.Manager || item.manager);
      if (item.Course || item.course) courses.add(item.Course || item.course);
    });
    
    return {
      uniqueManagers: Array.from(managers).sort(),
      uniqueCourses: Array.from(courses).sort()
    };
  }, [data]);

  // Filter and sort data
  const processedData = useMemo(() => {
    return data
      .filter(item => {
        const matchesManager = !managerFilter || 
          (item.Manager || item.manager) === managerFilter;
        const matchesCourse = !courseFilter || 
          (item.Course || item.course) === courseFilter;
        return matchesManager && matchesCourse;
      })
      .sort((a, b) => {
        if (!orderBy) return 0;
        const aValue = a[orderBy] || '';
        const bValue = b[orderBy] || '';
        
        if (order === 'asc') {
          return aValue.toString().localeCompare(bValue.toString());
        } else {
          return bValue.toString().localeCompare(aValue.toString());
        }
      });
  }, [data, managerFilter, courseFilter, orderBy, order]);

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

  return (
    <div className="data-table-container">
      <div className="table-header">
        <Typography variant="h6" className="table-title">
          Assessment Results
          <Chip 
            label={`${processedData.length} records`} 
            size="small" 
            sx={{ ml: 1, background: '#e3f2fd', color: '#1976d2' }}
          />
        </Typography>
        
        <Button 
          variant="contained" 
          startIcon={<FiDownload />}
          sx={{
            background: 'linear-gradient(135deg, #1976d2 0%, #2196f3 100%)',
            color: 'white',
            boxShadow: '0 2px 10px rgba(25, 118, 210, 0.3)',
            '&:hover': {
              background: 'linear-gradient(135deg, #1565c0 0%, #1e88e5 100%)'
            }
          }}
        >
          Export Data
        </Button>
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
            '& .MuiOutlinedInput-root': {
              background: '#f5f9ff',
              borderRadius: '8px'
            }
          }}
          variant="outlined"
        >
          <MenuItem value="">
            <em>All Managers</em>
          </MenuItem>
          {uniqueManagers.map(manager => (
            <MenuItem key={manager} value={manager}>
              {manager}
            </MenuItem>
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
            '& .MuiOutlinedInput-root': {
              background: '#f5f9ff',
              borderRadius: '8px'
            }
          }}
          variant="outlined"
        >
          <MenuItem value="">
            <em>All Courses</em>
          </MenuItem>
          {uniqueCourses.map(course => (
            <MenuItem key={course} value={course}>
              {course}
            </MenuItem>
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
          '&::-webkit-scrollbar': {
            height: '8px',
            width: '8px'
          },
          '&::-webkit-scrollbar-thumb': {
            backgroundColor: '#bdbdbd',
            borderRadius: '4px'
          }
        }}
      >
        <Table stickyHeader size="small" aria-label="assessment data table">
          <TableHead>
            <TableRow>
              {headers.map(header => (
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
                      '&:hover': {
                        color: '#0d47a1'
                      },
                      '&.Mui-active': {
                        color: '#0d47a1'
                      }
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
                  '&:nth-of-type(even)': {
                    backgroundColor: '#fafafa'
                  },
                  '&:hover': {
                    backgroundColor: '#f5f5f5'
                  }
                }}
              >
                {headers.map(header => (
                  <TableCell 
                    key={header} 
                    sx={{ 
                      whiteSpace: 'nowrap',
                      borderBottom: '1px solid #f0f0f0'
                    }}
                  >
                    {header.toLowerCase().includes('percentage') ? (
                      <Chip
                        label={`${row[header]}%`}
                        size="small"
                        sx={{
                          background: row[header] >= 50 ? '#e8f5e9' : '#ffebee',
                          color: row[header] >= 50 ? '#2e7d32' : '#c62828',
                          fontWeight: '500'
                        }}
                      />
                    ) : header.toLowerCase().includes('status') ? (
                      <Chip
                        label={row[header]}
                        size="small"
                        sx={{
                          background: row[header] === 'Qualified' ? '#e8f5e9' : '#ffebee',
                          color: row[header] === 'Qualified' ? '#2e7d32' : '#c62828',
                          fontWeight: '500'
                        }}
                      />
                    ) : (
                      row[header]
                    )}
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
  );
};

export default DataTable;