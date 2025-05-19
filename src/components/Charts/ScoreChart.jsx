// D:\ICANIO intern\React\dashboard-project\src\components\Charts\ScoreChart.jsx
import React, { useRef, useEffect, useMemo } from 'react';
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

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

// Enhanced percentage plugin with perfect end-of-bar positioning
const percentagePlugin = {
  id: 'barPercentage',
  afterDatasetsDraw: (chart) => {
    const { ctx, data, chartArea: { right }, scales: { x, y } } = chart;
    
    data.datasets.forEach((dataset, datasetIndex) => {
      const meta = chart.getDatasetMeta(datasetIndex);
      meta.data.forEach((bar, index) => {
        const value = dataset.data[index];
        // Position at bar end + 8px padding
        const xPos = x.getPixelForValue(value) + (value === 100 ? 15 : 8);
        const yPos = bar.y;
        
        ctx.save();
        ctx.font = `bold ${chart.options.plugins.barPercentage.fontSize}px 'Montserrat'`;
        ctx.fillStyle = chart.options.plugins.barPercentage.fontColor;
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';
        // Only draw if within chart area (with 5px buffer)
        if (xPos < right - 5) {
          ctx.fillText(`${value}%`, xPos, yPos);
        }
        ctx.restore();
      });
    });
  }
};

const ScoreChart = ({ data }) => {
  const theme = useTheme();
  const chartRef = useRef(null);
  const containerRef = useRef(null);
  const isMobile = useMediaQuery('(max-width:600px)');
  const isTablet = useMediaQuery('(max-width:900px)');

  const sortedData = useMemo(() => 
    [...data].sort((a, b) => b['Overall Percentage'] - a['Overall Percentage']), 
    [data]
  );

  const generateBlueColors = (count) => {
    return Array.from({ length: count }, (_, i) =>
      `hsl(${190 + (i * 15) % 70}, 85%, ${50 + (i % 5) * 6}%)`
    );
  };

  const chartData = {
    labels: sortedData.map(item => item.Name),
    datasets: [{
      label: 'Score (%)',
      data: sortedData.map(item => item['Overall Percentage']),
      backgroundColor: generateBlueColors(sortedData.length),
      borderColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.15)',
      borderWidth: 1,
      borderRadius: 6,
      barThickness: isMobile ? 20 : 26,
      categoryPercentage: 0.85,
      barPercentage: 0.9
    }]
  };

  const options = {
    indexAxis: 'y',
    responsive: true,
    maintainAspectRatio: false,
    layout: {
      padding: {
        left: isMobile ? 25 : 45, // Increased left padding for names
        right: isMobile ? 80 : 100, // More space for percentages
        top: 20,
        bottom: 20
      }
    },
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (context) => `${context.parsed.x}%`
        }
      },
      barPercentage: {
        fontSize: isMobile ? 12 : 14,
        fontColor: theme.palette.text.primary
      }
    },
    scales: {
      x: {
        max: 105, // Extra space for 100% label
        min: 0,
        ticks: {
          callback: (value) => `${value}%`,
          font: { 
            size: isMobile ? 11 : 13,
            family: "'Montserrat', sans-serif",
          },
          color: theme.palette.text.secondary,
          stepSize: 10
        },
        grid: {
          drawTicks: false,
          color: theme.palette.mode === 'dark' 
            ? 'rgba(255,255,255,0.05)' 
            : 'rgba(0,0,0,0.05)'
        },
        afterFit: (axis) => {
          axis.paddingRight = 25; // Ensure space for 100% labels
        }
      },
      y: { 
        ticks: {
          font: {
            size: isMobile ? 14 : 16,
            family: "'Montserrat', sans-serif",
            weight: 600
          },
          color: theme.palette.text.primary,
          padding: 10,
          callback: (value) => {
            const label = chartData.labels[value];
            if (isMobile) {
              return label?.length > 18 ? `${label.substring(0, 15)}...` : label;
            }
            return label;
          }
        },
        grid: { display: false },
        afterFit: (axis) => {
          axis.width = isMobile ? 200 : 250; // Fixed width for perfect centering
        }
      }
    }
  };

  return (
    <Box
      data-export-container
      ref={containerRef}
      sx={{
        width: '100%',
        height: '100%',
        overflow: 'auto',
        p: 1,
        display: 'flex',
        justifyContent: 'center',
        '& > div': {
          width: '100%',
          minWidth: isMobile ? '100%' : '850px',
          margin: '0 auto !important',
          minHeight: Math.max(sortedData.length * 45, 550),
        }
      }}
    >
      <Bar
        ref={chartRef}
        data={chartData}
        options={options}
        plugins={[percentagePlugin]}
      />
    </Box>
  );
};

export default ScoreChart;