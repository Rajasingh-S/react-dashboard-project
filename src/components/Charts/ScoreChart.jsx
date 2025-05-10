import { Bar } from 'react-chartjs-2';
import { Box, useTheme, useMediaQuery } from '@mui/material';
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
import { interpolateSinebow } from 'd3-scale-chromatic';
import { useEffect, useRef } from 'react';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const ScoreChart = ({ data }) => {
  const theme = useTheme();
  const containerRef = useRef(null);
  const chartRef = useRef(null);

  const isMobile = useMediaQuery('(max-width:600px)');
  const isTablet = useMediaQuery('(max-width:900px)');

  const sortedData = [...data].sort((a, b) => b['Overall Percentage'] - a['Overall Percentage']);
  
  // Fixed settings regardless of data length
  const barHeight = isMobile ? 16 : isTablet ? 20 : 24;
  const barSpacing = 5; // Fixed 5px gap between bars
  const chartHeight = sortedData.length * (barHeight + barSpacing) + 80;
  const maxNameLength = Math.max(...sortedData.map(item => item.Name.length));
  const nameAreaWidth = Math.min(isMobile ? 150 : isTablet ? 200 : 300, maxNameLength * 8);

  useEffect(() => {
    if (containerRef.current && chartRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, []);

  const chartData = {
    labels: sortedData.map(item => item.Name),
    datasets: [{
      label: 'Score',
      data: sortedData.map(item => item['Overall Percentage']),
      backgroundColor: sortedData.map((_, i) => interpolateSinebow(i / sortedData.length)),
      borderColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.15)',
      borderWidth: 1,
      borderRadius: 6,
      barThickness: barHeight,
      hoverBorderWidth: 2,
      hoverBorderColor: theme.palette.primary.light,
    }]
  };

  const options = {
    indexAxis: 'y',
    responsive: true,
    maintainAspectRatio: false,
    animation: {
      duration: 500, // Shorter duration
      easing: 'easeOutQuad', // Changed from 'easeOutBounce'
    },
    layout: {
      padding: {
        left: nameAreaWidth + 10,
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
          font: {
            size: isMobile ? 10 : 13,
            weight: 'bold',
            family: "'Montserrat', sans-serif",
          }
        },
        title: {
          display: true,
          text: 'Score (%)',
          font: {
            size: isMobile ? 12 : 15,
            weight: 'bold',
            family: "'Montserrat', sans-serif",
          }
        },
        grid: {
          drawTicks: false,
          drawBorder: false,
        }
      },
      y: {
        display: false,
        grid: {
          display: false,
        },
        afterFit: (scale) => {
          scale.height = (barHeight + barSpacing) * sortedData.length - barSpacing;
        }
      }
    },
    onHover: (event, chartElement) => {
      event.native.target.style.cursor = chartElement.length ? 'pointer' : 'default';
    }
  };

  const externalLabelsPlugin = {
    id: 'externalLabels',
    afterDatasetsDraw(chart) {
      const { ctx, chartArea: { left }, scales: { y } } = chart;
      ctx.save();
      ctx.font = `bold ${isMobile ? 10 : 13}px 'Montserrat', sans-serif`;
      ctx.textBaseline = 'middle';

      chart.data.labels.forEach((label, index) => {
        const yPos = y.getPixelForValue(index);

        ctx.textAlign = 'right';
        ctx.fillStyle = theme.palette.text.primary;
        ctx.fillText(label, left - 10, yPos);

        const score = chart.data.datasets[0].data[index];
        const barEndX = chart.getDatasetMeta(0).data[index].x;
        ctx.textAlign = 'left';
        ctx.fillText(`${score}%`, barEndX + 8, yPos);
      });

      ctx.restore();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <Box
        sx={{
          width: '100%',
          height: {
            xs: '70vh',
            sm: '75vh',
            md: '80vh'
          },
          background: theme.palette.background.default,
          borderRadius: 3,
          boxShadow: theme.shadows[3],
          padding: { xs: 2, sm: 3 },
          overflow: 'hidden',
          border: `1px solid ${theme.palette.divider}`,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <Box
          ref={containerRef}
          sx={{
            flex: 1,
            width: '100%',
            overflow: 'auto',
            '&::-webkit-scrollbar': {
              width: '6px',
              height: '6px',
            },
            '&::-webkit-scrollbar-thumb': {
              backgroundColor: theme.palette.primary.main,
              borderRadius: '4px',
            },
          }}
        >
          <Box
            sx={{
              minHeight: `${chartHeight}px`,
              position: 'relative',
              paddingBottom: '20px'
            }}
          >
            <Bar
              ref={chartRef}
              data={chartData}
              options={options}
              plugins={[externalLabelsPlugin]}
            />
          </Box>
        </Box>
      </Box>
    </motion.div>
  );
};

export default ScoreChart;