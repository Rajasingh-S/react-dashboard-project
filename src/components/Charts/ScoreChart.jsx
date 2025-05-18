// D:\ICANIO intern\React\dashboard-project\src\components\Charts\ScoreChart.jsx
import React, { useRef, useEffect } from 'react';
import { Box, useTheme, useMediaQuery } from '@mui/material';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { motion } from 'framer-motion';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const ScoreChart = ({ data }) => {
  const theme = useTheme();
  const chartRef = useRef(null);
  const containerRef = useRef(null);
  const isMobile = useMediaQuery('(max-width:600px)');

  useEffect(() => {
    if (containerRef.current && chartRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [data]);

  const sortedData = [...data].sort((a, b) => b['Overall Percentage'] - a['Overall Percentage']);

  const generateBlueColors = (count) => {
    return Array.from({ length: count }, (_, i) =>
      `hsl(${190 + (i * 15) % 70}, 85%, ${50 + (i % 5) * 6}%)`
    );
  };

  const chartData = {
    labels: sortedData.map(item => item.Name),
    datasets: [{
      label: 'Score',
      data: sortedData.map(item => item['Overall Percentage']),
      backgroundColor: generateBlueColors(sortedData.length),
      borderColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.15)',
      borderWidth: 1,
      borderRadius: 6,
      barThickness: isMobile ? 16 : 24,
      hoverBorderWidth: 2,
      hoverBorderColor: theme.palette.primary.light,
    }]
  };

  const options = {
    indexAxis: 'y',
    responsive: true,
    maintainAspectRatio: false,
    animation: { duration: 500 },
    layout: {
      padding: {
        left: isMobile ? 150 : 300,
        right: 50,
        top: 20,
        bottom: 40
      }
    },
    plugins: {
      legend: { display: false },
      tooltip: { enabled: true },
    },
    scales: {
      x: {
        max: 100,
        min: 0,
        ticks: {
          callback: (value) => `${value}%`,
          font: { size: isMobile ? 10 : 13 }
        }
      },
      y: { display: false }
    }
  };

  return (
    <Box
      data-export-container
      ref={containerRef}
      sx={{
        width: '100%',
        height: 'calc(100vh - 180px)',
        overflow: 'auto',
        position: 'relative',
        p: 2
      }}
    >
      <Box sx={{ minWidth: isMobile ? '100%' : '800px' }}>
        <Bar
          ref={chartRef}
          data={chartData}
          options={options}
        />
      </Box>
    </Box>
  );
};

export default ScoreChart;