// D:\ICANIO intern\React\dashboard-project\src\components\Charts\IntegrityTable.jsx
import React, { forwardRef, useRef, useState, useEffect } from 'react';
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
import { getInitials } from './chartUtils';

const IntegrityTable = forwardRef(({ data }, ref) => {
  const theme = useTheme();
  const [order, setOrder] = useState('desc');
  const [orderBy, setOrderBy] = useState('Integrity Score (out of 10)');
  const containerRef = useRef(null);
  const tableRef = useRef(null);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = 0;
    }
  }, [data]);

  const handleSort = (property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const sortedData = [...data].sort((a, b) => {
    const aVal = a[orderBy] || 0;
    const bVal = b[orderBy] || 0;
    return order === 'asc' ? aVal - bVal : bVal - aVal;
  });

  return (
    <Box
      ref={ref}
      data-export-container
      sx={{
        width: '100%',
        height: 'calc(100vh - 180px)',
        overflow: 'hidden',
        position: 'relative'
      }}
    >
      <Typography variant="h6" sx={{
        mb: 2,
        fontWeight: 700,
        background: theme.palette.mode === 'dark'
          ? 'linear-gradient(90deg, #4a6fa5, #166d67)'
          : 'linear-gradient(90deg, #1976d2, #0288d1)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        p: 2
      }}>
        Integrity Scores Overview
      </Typography>

      <TableContainer ref={containerRef} sx={{
        height: 'calc(100% - 80px)',
        '&::-webkit-scrollbar': { width: 10, height: 10 },
        '&::-webkit-scrollbar-thumb': {
          background: theme.palette.mode === 'dark'
            ? 'linear-gradient(135deg, #4a6fa5, #166d67)'
            : 'linear-gradient(135deg, #1976d2, #0288d1)',
          borderRadius: 4
        },
        '&::-webkit-scrollbar-track': {
          backgroundColor: theme.palette.mode === 'dark'
            ? 'rgba(255,255,255,0.05)'
            : 'rgba(0,0,0,0.05)'
        }
      }}>
        <Table ref={tableRef} stickyHeader size="small">
          <TableHead>
            <TableRow>
              <TableCell
                sx={{
                  position: 'sticky',
                  top: 0,
                  backgroundColor: theme.palette.mode === 'dark'
                    ? 'rgba(26, 32, 53, 0.9)'
                    : 'rgba(245, 247, 250, 0.9)',
                  minWidth: 300,
                  width: 300
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
                    minWidth: 200,
                    width: 200
                  }}
                >
                  <TableSortLabel
                    active={orderBy === column}
                    direction={orderBy === column ? order : 'asc'}
                    onClick={() => handleSort(column)}
                  >
                    {column === 'Time Spent Offtab (in secs)' ? 'Off-task Time' : 'Integrity Score'}
                  </TableSortLabel>
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {sortedData.map((row, index) => (
              <TableRow key={index}>
                <TableCell sx={{ display: 'flex', alignItems: 'center' }}>
                  <Avatar
                    sx={{
                      width: 32,
                      height: 32,
                      mr: 2,
                      bgcolor: `hsl(${180 + (index * 137.5) % 60}, 70%, ${
                        theme.palette.mode === 'dark' ? '40%' : '70%'
                      })`
                    }}
                  >
                    {getInitials(row.Name)}
                  </Avatar>
                  <Typography variant="body2" fontWeight={600}>
                    {row.Name}
                  </Typography>
                </TableCell>
                <TableCell align="right">
                  <Box
                    sx={{
                      display: 'inline-flex',
                      px: 2,
                      py: 1,
                      borderRadius: '16px',
                      fontWeight: 600,
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
                              : 'rgba(211, 47, 47, 0.15)'
                    }}
                  >
                    {row['Integrity Score (out of 10)']}/10
                  </Box>
                </TableCell>
                <TableCell align="right">
                  <Box
                    sx={{
                      display: 'inline-flex',
                      px: 2,
                      py: 1,
                      borderRadius: '16px',
                      fontWeight: 600,
                      backgroundColor: row['Time Spent Offtab (in secs)'] > 0
                        ? theme.palette.mode === 'dark'
                          ? 'rgba(211, 47, 47, 0.3)'
                          : 'rgba(211, 47, 47, 0.15)'
                        : theme.palette.mode === 'dark'
                          ? 'rgba(46, 125, 50, 0.3)'
                          : 'rgba(46, 125, 50, 0.15)'
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
    </Box>
  );
});

export default IntegrityTable;