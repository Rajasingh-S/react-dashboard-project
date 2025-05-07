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
          p: 4,
          borderRadius: '18px',
          background: theme.palette.mode === 'dark' 
            ? 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)' 
            : 'linear-gradient(135deg, #f5f7fa 0%, #e4e8f0 100%)',
          height: 'calc(100vh - 200px)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          boxShadow: theme.shadows[10],
          border: theme.palette.mode === 'dark' 
            ? '1px solid rgba(255,255,255,0.1)' 
            : '1px solid rgba(0,0,0,0.1)'
        }}
      >
        <Typography 
          variant="h6" 
          sx={{ 
            mb: 3, 
            fontWeight: 700, 
            color: theme.palette.text.primary,
            fontSize: '1.5rem',
            background: theme.palette.mode === 'dark' 
              ? 'linear-gradient(90deg, #ff6b6b, #feca57)' 
              : 'linear-gradient(90deg, #5f27cd, #1dd1a1)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}
        >
          Integrity Scores Overview
        </Typography>
        <TableContainer 
          component={Box}
          sx={{ 
            flex: 1,
            overflow: 'auto',
            position: 'relative',
            '&::-webkit-scrollbar': {
              height: '10px',
              width: '10px',
              borderRadius: '10px'
            },
            '&::-webkit-scrollbar-thumb': {
              background: theme.palette.mode === 'dark' 
                ? 'linear-gradient(135deg, #ff6b6b 0%, #feca57 100%)' 
                : 'linear-gradient(135deg, #5f27cd 0%, #1dd1a1 100%)',
              borderRadius: '10px'
            },
            '&::-webkit-scrollbar-track': {
              backgroundColor: theme.palette.mode === 'dark' 
                ? 'rgba(255,255,255,0.05)' 
                : 'rgba(0,0,0,0.05)'
            }
          }}
        >
          <Table 
            stickyHeader 
            size="small" 
            aria-label="integrity table"
            sx={{
              minWidth: 'max-content',
              tableLayout: 'fixed'
            }}
          >
            <TableHead>
              <TableRow>
                <TableCell
                  sx={{
                    position: 'sticky',
                    top: 0,
                    backgroundColor: theme.palette.mode === 'dark' 
                      ? 'rgba(26, 32, 53, 0.9)' 
                      : 'rgba(245, 247, 250, 0.9)',
                    color: theme.palette.text.primary,
                    fontWeight: 'bold',
                    fontSize: '15px',
                    fontFamily: "'Montserrat', sans-serif",
                    borderBottom: 'none',
                    zIndex: 2,
                    minWidth: '250px'
                  }}
                >
                  Candidate
                </TableCell>
                {['Integrity Score (out of 10)', 'Time Spent Offtab (in secs)'].map((column) => (
                  <TableCell
                    key={column}
                    align="right"
                    sx={{
                      position: 'sticky',
                      top: 0,
                      backgroundColor: theme.palette.mode === 'dark' 
                        ? 'rgba(26, 32, 53, 0.9)' 
                        : 'rgba(245, 247, 250, 0.9)',
                      color: theme.palette.text.primary,
                      fontWeight: 'bold',
                      fontSize: '15px',
                      fontFamily: "'Montserrat', sans-serif",
                      borderBottom: 'none',
                      zIndex: 2,
                      minWidth: '180px'
                    }}
                  >
                    <TableSortLabel
                      active={orderBy === column}
                      direction={orderBy === column ? order : 'asc'}
                      onClick={() => handleSort(column)}
                      sx={{
                        color: theme.palette.text.primary + '!important',
                        '& .MuiTableSortLabel-icon': {
                          color: theme.palette.text.primary + '!important'
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
                <motion.tr
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <TableCell 
                    sx={{ 
                      display: 'flex', 
                      alignItems: 'center',
                      borderBottom: theme.palette.mode === 'dark' 
                        ? '1px solid rgba(255,255,255,0.05)' 
                        : '1px solid rgba(0,0,0,0.05)',
                      backgroundColor: index % 2 === 0
                        ? theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)'
                        : 'transparent',
                      minWidth: '250px'
                    }}
                  >
                    <Avatar
                      sx={{
                        width: 32,
                        height: 32,
                        mr: 2,
                        bgcolor: theme.palette.mode === 'dark' 
                          ? `hsl(${(index * 137.5) % 360}, 70%, 30%)` 
                          : `hsl(${(index * 137.5) % 360}, 70%, 70%)`,
                        color: theme.palette.getContrastText(
                          theme.palette.mode === 'dark' 
                            ? `hsl(${(index * 137.5) % 360}, 70%, 30%)` 
                            : `hsl(${(index * 137.5) % 360}, 70%, 70%)`
                        ),
                        fontSize: '0.8rem',
                        fontWeight: 'bold'
                      }}
                    >
                      {getInitials(row.Name)}
                    </Avatar>
                    <Typography variant="body2" fontWeight={600}>
                      {row.Name}
                    </Typography>
                  </TableCell>
                  <TableCell 
                    align="right"
                    sx={{
                      borderBottom: theme.palette.mode === 'dark' 
                        ? '1px solid rgba(255,255,255,0.05)' 
                        : '1px solid rgba(0,0,0,0.05)',
                      backgroundColor: index % 2 === 0
                        ? theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)'
                        : 'transparent',
                      minWidth: '180px'
                    }}
                  >
                    <Box
                      sx={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        px: 2,
                        py: 1,
                        borderRadius: '16px',
                        fontSize: '14px',
                        fontWeight: 600,
                        fontFamily: "'Montserrat', sans-serif",
                        boxShadow: theme.shadows[1],
                        backgroundColor:
                          row['Integrity Score (out of 10)'] >= 8
                            ? theme.palette.mode === 'dark' 
                              ? 'rgba(46, 125, 50, 0.3)' 
                              : 'rgba(46, 125, 50, 0.15)'
                            : row['Integrity Score (out of 10)'] >= 5
                              ? theme.palette.mode === 'dark' 
                                ? 'rgba(237, 108, 2, 0.3)' 
                                : 'rgba(237, 108, 2, 0.15)'
                              : theme.palette.mode === 'dark' 
                                ? 'rgba(211, 47, 47, 0.3)' 
                                : 'rgba(211, 47, 47, 0.15)',
                        color:
                          row['Integrity Score (out of 10)'] >= 8
                            ? theme.palette.success.light
                            : row['Integrity Score (out of 10)'] >= 5
                              ? theme.palette.warning.light
                              : theme.palette.error.light,
                      }}
                    >
                      {row['Integrity Score (out of 10)']}/10
                    </Box>
                  </TableCell>
                  <TableCell 
                    align="right"
                    sx={{
                      borderBottom: theme.palette.mode === 'dark' 
                        ? '1px solid rgba(255,255,255,0.05)' 
                        : '1px solid rgba(0,0,0,0.05)',
                      backgroundColor: index % 2 === 0
                        ? theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)'
                        : 'transparent',
                      minWidth: '180px'
                    }}
                  >
                    <Box
                      sx={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        px: 2,
                        py: 1,
                        borderRadius: '16px',
                        fontSize: '14px',
                        fontWeight: 600,
                        fontFamily: "'Montserrat', sans-serif",
                        boxShadow: theme.shadows[1],
                        backgroundColor: row['Time Spent Offtab (in secs)'] > 0
                          ? theme.palette.mode === 'dark' 
                            ? 'rgba(211, 47, 47, 0.3)' 
                            : 'rgba(211, 47, 47, 0.15)'
                          : theme.palette.mode === 'dark' 
                            ? 'rgba(46, 125, 50, 0.3)' 
                            : 'rgba(46, 125, 50, 0.15)',
                        color: row['Time Spent Offtab (in secs)'] > 0
                          ? theme.palette.error.light
                          : theme.palette.success.light,
                      }}
                    >
                      {row['Time Spent Offtab (in secs)'] > 0
                        ? `${Math.floor(row['Time Spent Offtab (in secs)']/60)}m ${row['Time Spent Offtab (in secs)']%60}s`
                        : 'None'}
                    </Box>
                  </TableCell>
                </motion.tr>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <Typography 
            variant="caption" 
            sx={{ 
              mt: 2, 
              textAlign: 'right', 
              color: theme.palette.text.secondary,
              fontFamily: "'Montserrat', sans-serif",
              fontWeight: 600
            }}
          >
            Showing {sortedData.length} records
          </Typography>
        </motion.div>
      </Paper>
    </motion.div>
  );
};

export default IntegrityTable;