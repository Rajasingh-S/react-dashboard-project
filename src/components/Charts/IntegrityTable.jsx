import { 
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  TableSortLabel,
  Tooltip
} from '@mui/material';
import { useState } from 'react';

const IntegrityTable = ({ data }) => {
  const [order, setOrder] = useState('asc');
  const [orderBy, setOrderBy] = useState('Integrity Score (out of 10)');

  const handleSort = (property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const sortedData = [...data].sort((a, b) => {
    const aValue = a[orderBy] || 0;
    const bValue = b[orderBy] || 0;
    return order === 'asc' ? aValue - bValue : bValue - aValue;
  });

  return (
    <Box sx={{ 
      width: '100%',
      height: '100%',
      overflow: 'auto',
      borderRadius: 2,
      border: '1px solid #e0e0e0'
    }}>
      <TableContainer component={Paper} sx={{ 
        maxHeight: '100%',
        boxShadow: 'none',
        '& .MuiTableCell-root': {
          py: 1.5,
          px: 2
        }
      }}>
        <Table stickyHeader size="small" aria-label="integrity scores table">
          <TableHead>
            <TableRow>
              <TableCell sx={{ 
                backgroundColor: '#f5f5f5',
                fontWeight: 600,
                minWidth: 200
              }}>
                <TableSortLabel
                  active={orderBy === 'Name'}
                  direction={orderBy === 'Name' ? order : 'asc'}
                  onClick={() => handleSort('Name')}
                >
                  Employee Name
                </TableSortLabel>
              </TableCell>
              <TableCell align="right" sx={{ 
                backgroundColor: '#f5f5f5',
                fontWeight: 600,
                minWidth: 150
              }}>
                <TableSortLabel
                  active={orderBy === 'Integrity Score (out of 10)'}
                  direction={orderBy === 'Integrity Score (out of 10)' ? order : 'asc'}
                  onClick={() => handleSort('Integrity Score (out of 10)')}
                >
                  Integrity Score
                </TableSortLabel>
              </TableCell>
              <TableCell align="right" sx={{ 
                backgroundColor: '#f5f5f5',
                fontWeight: 600,
                minWidth: 180
              }}>
                <TableSortLabel
                  active={orderBy === 'Time Spent Offtab (in secs)'}
                  direction={orderBy === 'Time Spent Offtab (in secs)' ? order : 'asc'}
                  onClick={() => handleSort('Time Spent Offtab (in secs)')}
                >
                  <Tooltip title="Time spent away from assessment">
                    <span>Off-task Time</span>
                  </Tooltip>
                </TableSortLabel>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {sortedData.map((row, index) => (
              <TableRow 
                key={index}
                sx={{ 
                  '&:nth-of-type(odd)': { backgroundColor: '#fafafa' },
                  '&:hover': { backgroundColor: '#f5f5f5' }
                }}
              >
                <TableCell sx={{ fontWeight: 500 }}>
                  {row.Name}
                </TableCell>
                <TableCell align="right">
                  <Box sx={{
                    display: 'inline-block',
                    px: 1.5,
                    py: 0.5,
                    borderRadius: 1,
                    backgroundColor: row['Integrity Score (out of 10)'] >= 8 
                      ? 'rgba(56, 142, 60, 0.1)' 
                      : row['Integrity Score (out of 10)'] >= 5 
                        ? 'rgba(255, 152, 0, 0.1)' 
                        : 'rgba(244, 67, 54, 0.1)',
                    color: row['Integrity Score (out of 10)'] >= 8 
                      ? '#388e3c' 
                      : row['Integrity Score (out of 10)'] >= 5 
                        ? '#f57c00' 
                        : '#d32f2f',
                    fontWeight: 600
                  }}>
                    {row['Integrity Score (out of 10)']}/10
                  </Box>
                </TableCell>
                <TableCell align="right">
                  <Box sx={{
                    display: 'inline-block',
                    px: 1.5,
                    py: 0.5,
                    borderRadius: 1,
                    backgroundColor: row['Time Spent Offtab (in secs)'] > 0 
                      ? 'rgba(244, 67, 54, 0.1)' 
                      : 'rgba(56, 142, 60, 0.1)',
                    color: row['Time Spent Offtab (in secs)'] > 0 
                      ? '#d32f2f' 
                      : '#388e3c',
                    fontWeight: 600
                  }}>
                    {row['Time Spent Offtab (in secs)'] > 0 
                      ? `${Math.floor(row['Time Spent Offtab (in secs)']/60)}m ${row['Time Spent Offtab (in secs)']%60}s` 
                      : 'None'}
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default IntegrityTable;