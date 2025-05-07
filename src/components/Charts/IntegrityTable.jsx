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
  useTheme,
  Avatar
} from '@mui/material';
import { motion } from 'framer-motion';
import { useState } from 'react';
import { getInitials } from './chartUtils';

const IntegrityTable = ({ data }) => {
  const theme = useTheme();
  const [order, setOrder] = useState('desc');
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
      transition={{ duration: 0.6, delay: 0.3 }}
    >
      <Paper
        elevation={3}
        sx={{
          p: 3,
          borderRadius: 4,
          background: theme.palette.background.paper,
          height: 'calc(100vh - 200px)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden'
        }}
      >
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 700, color: theme.palette.text.primary }}>
          Integrity Scores Overview
        </Typography>
        <TableContainer sx={{ flex: 1, borderRadius: 2, overflow: 'auto' }}>
          <Table stickyHeader size="small" aria-label="integrity table">
            <TableHead>
              <TableRow>
                <TableCell
                  sx={{
                    backgroundColor: theme.palette.primary.dark,
                    color: theme.palette.primary.contrastText,
                    fontWeight: 'bold',
                    fontSize: '14px'
                  }}
                >
                  Candidate
                </TableCell>
                {['Integrity Score (out of 10)', 'Time Spent Offtab (in secs)'].map((column) => (
                  <TableCell
                    key={column}
                    align="right"
                    sx={{
                      backgroundColor: theme.palette.primary.dark,
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
                          color: `${theme.palette.primary.contrastText} !important`
                        }
                      }}
                    >
                      {column === 'Time Spent Offtab (in secs)' ? (
                        <Tooltip title="Time spent away from assessment">
                          <span>Off-task Time</span>
                        </Tooltip>
                      ) : (
                        'Integrity Score'
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
                      ? theme.palette.mode === 'dark' ? '#252539' : '#f5f9ff'
                      : theme.palette.mode === 'dark' ? '#1b1b2c' : '#eaf2ff',
                    '&:hover': {
                      backgroundColor: theme.palette.action.hover
                    }
                  }}
                >
                  <TableCell sx={{ display: 'flex', alignItems: 'center' }}>
                    <Typography variant="body2" fontWeight={500}>
                      {row.Name}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Box
                      sx={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        px: 1.5,
                        py: 0.5,
                        borderRadius: 12,
                        fontSize: '13px',
                        backgroundColor:
                          row['Integrity Score (out of 10)'] >= 8
                            ? 'rgba(46, 125, 50, 0.1)'
                            : row['Integrity Score (out of 10)'] >= 5
                              ? 'rgba(237, 108, 2, 0.1)'
                              : 'rgba(211, 47, 47, 0.1)',
                        color:
                          row['Integrity Score (out of 10)'] >= 8
                            ? theme.palette.success.dark
                            : row['Integrity Score (out of 10)'] >= 5
                              ? theme.palette.warning.dark
                              : theme.palette.error.dark,
                        fontWeight: 600
                      }}
                    >
                      {row['Integrity Score (out of 10)']}/10
                    </Box>
                  </TableCell>
                  <TableCell align="right">
                    <Box
                      sx={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        px: 1.5,
                        py: 0.5,
                        borderRadius: 12,
                        fontSize: '13px',
                        backgroundColor: row['Time Spent Offtab (in secs)'] > 0
                          ? 'rgba(211, 47, 47, 0.1)'
                          : 'rgba(46, 125, 50, 0.1)',
                        color: row['Time Spent Offtab (in secs)'] > 0
                          ? theme.palette.error.dark
                          : theme.palette.success.dark,
                        fontWeight: 600
                      }}
                    >
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
        <Typography variant="caption" sx={{ mt: 1, textAlign: 'right', color: theme.palette.text.secondary }}>
          Showing {sortedData.length} records
        </Typography>
      </Paper>
    </motion.div>
  );
};

export default IntegrityTable;