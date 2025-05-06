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
import { motion } from 'framer-motion';
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
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <Box sx={{
        width: '100%',
        height: 'calc(100vh - 200px)',
        overflow: 'auto',
        borderRadius: 3,
        border: `1px solid ${theme.palette.divider}`,
        background: theme.palette.mode === 'dark' ? '#1e1e2f' : '#f0f4ff',
        boxShadow: theme.shadows[3],
        '&::-webkit-scrollbar': {
          width: '8px'
        },
        '&::-webkit-scrollbar-thumb': {
          backgroundColor: theme.palette.primary.light,
          borderRadius: '4px'
        },
        '&::-webkit-scrollbar-track': {
          backgroundColor: theme.palette.background.default
        }
      }}>
        <TableContainer
          component={Paper}
          sx={{
            maxHeight: '100%',
            boxShadow: 'none',
            backgroundColor: 'transparent'
          }}
        >
          <Table stickyHeader size="small" aria-label="integrity table">
            <TableHead>
              <TableRow>
                {['Name', 'Integrity Score (out of 10)', 'Time Spent Offtab (in secs)'].map((column, idx) => (
                  <TableCell
                    key={column}
                    align={idx === 0 ? 'left' : 'right'}
                    sx={{
                      backgroundColor: theme.palette.primary.light,
                      color: theme.palette.primary.contrastText,
                      fontWeight: 'bold',
                      fontSize: '14px'
                    }}
                  >
                    <TableSortLabel
                      active={orderBy === column}
                      direction={orderBy === column ? order : 'asc'}
                      onClick={() => handleSort(column)}
                      sx={{
                        '& .MuiTableSortLabel-icon': {
                          color: theme.palette.primary.contrastText + ' !important'
                        }
                      }}
                    >
                      {column === 'Time Spent Offtab (in secs)' ? (
                        <Tooltip title="Time spent away from assessment">
                          <span>Off-task Time</span>
                        </Tooltip>
                      ) : (
                        column === 'Name' ? 'Employee Name' : 'Integrity Score'
                      )}
                    </TableSortLabel>
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {sortedData.map((row, index) => (
                <TableRow
                  key={index}
                  sx={{
                    backgroundColor: index % 2 === 0
                      ? theme.palette.mode === 'dark' ? '#252539' : '#eaf1ff'
                      : theme.palette.mode === 'dark' ? '#1b1b2c' : '#dbe7ff',
                    '&:hover': {
                      backgroundColor: theme.palette.action.hover
                    }
                  }}
                >
                  <TableCell sx={{
                    fontWeight: 500,
                    color: theme.palette.text.primary,
                    minWidth: 150
                  }}>
                    {row.Name}
                  </TableCell>
                  <TableCell align="right">
                    <Box sx={{
                      display: 'inline-block',
                      px: 1.5,
                      py: 0.5,
                      borderRadius: 1,
                      fontSize: '13px',
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
                      fontSize: '13px',
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
    </motion.div>
  );
};

export default IntegrityTable;
