// D:\ICANIO intern\React\dashboard-project\src\components\Charts\ChartView.jsx
import React, { useState, useRef, useMemo } from 'react';
import {
  Box, Typography, Paper, Avatar, Button, useTheme, IconButton,
  FormControl, Select, MenuItem, useMediaQuery, LinearProgress,
  Stack, ButtonGroup
} from '@mui/material';
import { FiDownload, FiPieChart, FiChevronLeft, FiChevronRight, FiArrowLeft } from 'react-icons/fi';
import { usePromiseTracker, trackPromise } from 'react-promise-tracker';
import { motion, AnimatePresence } from 'framer-motion';
import { PDFExportManager } from '../../utils/pdfExport';
import ScoreChart from './ScoreChart';
import SelfInterestChart from './SelfInterestChart';
import AbsenteeHeatmap from './AbsenteeHeatmap';
import AttendanceChart from './AttendanceChart';
import IntegrityTable from './IntegrityTable';

const ChartView = ({ data, onToggleView }) => {
  const theme = useTheme();
  const { promiseInProgress } = usePromiseTracker();
  const [currentChart, setCurrentChart] = useState(0);
  const [selectedManager, setSelectedManager] = useState('All Managers');
  const chartRefs = useRef([]);
  const isMobile = useMediaQuery('(max-width:600px)');
  const isTablet = useMediaQuery('(max-width:900px)');

  const managers = useMemo(() => [
    'All Managers',
    ...new Set(data.map(item => item.Manager?.trim() || 'Unknown'))
  ], [data]);

  const filteredData = useMemo(() => (
    selectedManager === 'All Managers'
      ? data
      : data.filter(item => (item.Manager?.trim() || 'Unknown') === selectedManager)
  ), [data, selectedManager]);

  const charts = [
    { title: 'Overall Score Distribution', component: <ScoreChart data={filteredData} /> },
    { title: 'Self Interested Candidates', component: <SelfInterestChart data={filteredData} /> },
    { title: 'Absentee Analysis', component: <AbsenteeHeatmap data={filteredData} /> },
    { title: 'Attendance by Manager', component: <AttendanceChart data={filteredData} /> },
    { title: 'Integrity Scores', component: <IntegrityTable data={filteredData} /> },
  ];

  const handleDownloadPDF = async () => {
    const chartIndex = currentChart;
    const chartComponent = chartRefs.current[chartIndex];
    if (!chartComponent) return;

    try {
      const cleanupViewport = PDFExportManager.handleMobileViewport();
      const exportContainer = chartComponent.querySelector('[data-export-container]');

      const { canvas, title } = await trackPromise(
        PDFExportManager.captureFullContent(
          exportContainer || chartComponent,
          charts[chartIndex].title
        )
      );

      const pdf = await PDFExportManager.generatePDF(
        { canvas, title },
        chartIndex !== 4 // Portrait for IntegrityTable
      );

      pdf.save(`${title.replace(/[^\w]/g, '_')}.pdf`);
      cleanupViewport();
    } catch (error) {
      console.error('PDF Export Error:', error);
    }
  };

  const navigateChart = (direction) => {
    const newIndex = direction === 'next' 
      ? (currentChart + 1) % charts.length
      : (currentChart - 1 + charts.length) % charts.length;
    setCurrentChart(newIndex);
  };

  return (
    <Box sx={{ p: isMobile ? 1 : 3, height: '100vh', overflow: 'hidden', position: 'relative' }}>
      <AnimatePresence>
        {promiseInProgress && (
          <Box sx={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.9)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'column',
            color: '#fff'
          }}>
            <Typography variant="h6" gutterBottom>Generating PDF...</Typography>
            <LinearProgress sx={{ width: 300, height: 8, borderRadius: 4 }} />
          </Box>
        )}
      </AnimatePresence>

      {/* Responsive Header Section */}
      <Box sx={{
        display: 'flex',
        flexDirection: isMobile ? 'column' : 'row',
        justifyContent: 'space-between',
        alignItems: isMobile ? 'flex-start' : 'center',
        mb: 2,
        gap: 2
      }}>
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: 2,
          width: isMobile ? '100%' : 'auto'
        }}>
          <Avatar sx={{ 
            bgcolor: 'primary.main',
            width: isMobile ? 36 : 48,
            height: isMobile ? 36 : 48
          }}>
            <FiPieChart size={isMobile ? 18 : 24} />
          </Avatar>
          <Typography variant={isMobile ? 'h6' : 'h5'} fontWeight="bold" noWrap>
            {charts[currentChart].title}
          </Typography>
        </Box>

        <Stack 
          direction={isMobile ? 'column' : 'row'} 
          spacing={1}
          sx={{ 
            width: isMobile ? '100%' : 'auto',
            '& .MuiFormControl-root': { width: isMobile ? '100%' : 180 }
          }}
        >
          <FormControl size="small">
            <Select
              value={selectedManager}
              onChange={(e) => setSelectedManager(e.target.value)}
              sx={{
                bgcolor: 'primary.main',
                color: 'primary.contrastText',
                '& .MuiSelect-select': { py: 1 }
              }}
            >
              {managers.map(manager => (
                <MenuItem key={manager} value={manager}>
                  {isMobile ? manager.substring(0, 15) + (manager.length > 15 ? '...' : '') : manager}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          
          <ButtonGroup fullWidth={isMobile} sx={{ gap: 1 }}>
            <Button
              variant="contained"
              startIcon={<FiDownload size={18} />}
              onClick={handleDownloadPDF}
              sx={{ 
                textTransform: 'none',
                flex: isMobile ? 1 : 'none'
              }}
            >
              {isMobile ? 'PDF' : 'Export PDF'}
            </Button>
            
            <Button
              variant="outlined"
              startIcon={<FiArrowLeft size={18} />}
              onClick={onToggleView}
              sx={{ 
                textTransform: 'none',
                flex: isMobile ? 1 : 'none'
              }}
            >
              {isMobile ? 'Table' : 'Back to Table'}
            </Button>
          </ButtonGroup>
        </Stack>
      </Box>

      {/* Charts Container */}
      <Paper elevation={3} sx={{
        width: '100%',
        height: isMobile ? 'calc(100vh - 160px)' : 'calc(100vh - 180px)',
        borderRadius: theme.shape.borderRadius,
        boxShadow: theme.shadows[4],
        backgroundColor: theme.palette.background.paper,
        position: 'relative',
        overflow: 'hidden'
      }}>
        <Box sx={{
          width: '100%',
          height: '100%',
          position: 'relative',
          overflow: 'hidden'
        }}>
          {charts.map((chart, index) => (
            <Box
              key={index}
              ref={el => chartRefs.current[index] = el}
              sx={{
                position: 'absolute',
                width: '100%',
                height: '100%',
                left: `${(index - currentChart) * 100}%`,
                transition: 'left 0.3s ease',
                p: isMobile ? 1 : 2
              }}
            >
              {chart.component}
            </Box>
          ))}
        </Box>

        {/* Navigation Dots */}
        <Box sx={{
          position: 'absolute',
          bottom: 16,
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          gap: 1
        }}>
          {charts.map((_, index) => (
            <Box
              key={index}
              sx={{
                width: 10,
                height: 10,
                borderRadius: '50%',
                bgcolor: currentChart === index ? 'primary.main' : 'action.disabled',
                cursor: 'pointer',
                transition: 'background-color 0.2s'
              }}
              onClick={() => setCurrentChart(index)}
            />
          ))}
        </Box>

        {/* Navigation Arrows */}
        <IconButton
          onClick={() => navigateChart('prev')}
          sx={{ 
            position: 'absolute', 
            left: 8, 
            top: '50%',
            bgcolor: 'background.paper',
            boxShadow: 1,
            '&:hover': { bgcolor: 'action.hover' }
          }}
        >
          <FiChevronLeft />
        </IconButton>
        <IconButton
          onClick={() => navigateChart('next')}
          sx={{ 
            position: 'absolute', 
            right: 8, 
            top: '50%',
            bgcolor: 'background.paper',
            boxShadow: 1,
            '&:hover': { bgcolor: 'action.hover' }
          }}
        >
          <FiChevronRight />
        </IconButton>
      </Paper>
    </Box>
  );
};

export default ChartView;