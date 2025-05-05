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
  Tooltip,
  useTheme
} from '@mui/material';
import { useState } from 'react';

const IntegrityTable = ({ data }) => {
  const theme = useTheme();
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
      border: `1px solid ${theme.palette.divider}`,
      backgroundColor: theme.palette.background.paper
    }}>
      <TableContainer 
        component={Paper} 
        sx={{ 
          maxHeight: '100%',
          boxShadow: 'none',
          backgroundColor: 'transparent',
          '& .MuiTableCell-root': {
            py: 1.5,
            px: 2,
            fontFamily: theme.typography.fontFamily
          }
        }}
      >
        <Table stickyHeader size="small" aria-label="integrity scores table">
          <TableHead>
            <TableRow>
              <TableCell sx={{ 
                backgroundColor: theme.palette.grey[100],
                fontWeight: 600,
                minWidth: 200,
                color: theme.palette.text.primary
              }}>
                <TableSortLabel
                  active={orderBy === 'Name'}
                  direction={orderBy === 'Name' ? order : 'asc'}
                  onClick={() => handleSort('Name')}
                >
                  Employee Name
                </TableSortLabel>
              </TableCell>
              <TableCell 
                align="right" 
                sx={{ 
                  backgroundColor: theme.palette.grey[100],
                  fontWeight: 600,
                  minWidth: 150,
                  color: theme.palette.text.primary
                }}
              >
                <TableSortLabel
                  active={orderBy === 'Integrity Score (out of 10)'}
                  direction={orderBy === 'Integrity Score (out of 10)' ? order : 'asc'}
                  onClick={() => handleSort('Integrity Score (out of 10)')}
                >
                  Integrity Score
                </TableSortLabel>
              </TableCell>
              <TableCell 
                align="right" 
                sx={{ 
                  backgroundColor: theme.palette.grey[100],
                  fontWeight: 600,
                  minWidth: 180,
                  color: theme.palette.text.primary
                }}
              >
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
                  '&:nth-of-type(odd)': { 
                    backgroundColor: theme.palette.grey[50] 
                  },
                  '&:hover': { 
                    backgroundColor: theme.palette.action.hover 
                  }
                }}
              >
                <TableCell sx={{ fontWeight: 500, color: theme.palette.text.primary }}>
                  {row.Name}
                </TableCell>
                <TableCell align="right">
                  <Box sx={{
                    display: 'inline-block',
                    px: 1.5,
                    py: 0.5,
                    borderRadius: 1,
                    backgroundColor: row['Integrity Score (out of 10)'] >= 8 
                      ? theme.palette.success.light 
                      : row['Integrity Score (out of 10)'] >= 5 
                        ? theme.palette.warning.light 
                        : theme.palette.error.light,
                    color: row['Integrity Score (out of 10)'] >= 8 
                      ? theme.palette.success.dark 
                      : row['Integrity Score (out of 10)'] >= 5 
                        ? theme.palette.warning.dark 
                        : theme.palette.error.dark,
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
                      ? theme.palette.error.light 
                      : theme.palette.success.light,
                    color: row['Time Spent Offtab (in secs)'] > 0 
                      ? theme.palette.error.dark 
                      : theme.palette.success.dark,
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