import { Bar } from 'react-chartjs-2';
import { Box, useTheme } from '@mui/material';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { interpolatePlasma } from 'd3-scale-chromatic';
import { motion } from 'framer-motion';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const ScoreChart = ({ data }) => {
  const theme = useTheme();
  
  // Process and sort data
  const sortedData = [...data].sort((a, b) => b['Overall Percentage'] - a['Overall Percentage']);

  // Calculate dimensions
  const barHeight = 30;
  const chartHeight = Math.max(500, sortedData.length * (barHeight + 10));
  const maxNameLength = Math.max(...sortedData.map(item => item.Name.length));
  const nameAreaWidth = Math.min(220, maxNameLength * 9);

  // Color generator
  const getColor = (index, total) => {
    return interpolatePlasma(index / (total * 1.3));
  };

  // Chart data configuration
  const chartData = {
    labels: sortedData.map(item => item.Name),
    datasets: [{
      label: 'Score',
      data: sortedData.map(item => item['Overall Percentage']),
      backgroundColor: sortedData.map((_, index) => getColor(index, sortedData.length)),
      borderColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.1)',
      borderWidth: 1.5,
      borderRadius: 6,
      barThickness: barHeight,
      hoverBorderWidth: 2,
      hoverBorderColor: theme.palette.primary.main,
      hoverBackgroundColor: sortedData.map((_, index) => getColor(index, sortedData.length))
    }]
  };

  // Enhanced tooltip callback
  const tooltipCallbacks = {
    title: (context) => {
      const person = sortedData[context[0].dataIndex];
      return [`${person.Name}`];
    },
    label: (context) => {
      const person = sortedData[context.dataIndex];
      return [
        `Score: ${context.raw}%`,
        `Status: ${person.Status}`,
        `Type: ${person['Employee or Intern']}`,
        `Course: ${person.Course || 'N/A'}`,
        `Manager: ${person.Manager || 'N/A'}`
      ];
    },
    footer: (context) => {
      return ['Click bar for details'];
    }
  };

  const options = {
    indexAxis: 'y',
    responsive: true,
    maintainAspectRatio: false,
    animation: {
      duration: 1000,
      easing: 'easeOutQuart',
      delay: (context) => context.dataIndex * 50
    },
    layout: {
      padding: {
        left: nameAreaWidth,
        right: 60
      }
    },
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        enabled: true,
        position: 'nearest',
        backgroundColor: theme.palette.background.paper,
        titleColor: theme.palette.primary.main,
        bodyColor: theme.palette.text.primary,
        borderColor: theme.palette.divider,
        borderWidth: 1,
        padding: 16,
        cornerRadius: 8,
        boxShadow: theme.shadows[4],
        titleFont: {
          size: 14,
          weight: 'bold',
          family: theme.typography.fontFamily
        },
        bodyFont: {
          size: 12,
          family: theme.typography.fontFamily
        },
        footerFont: {
          size: 10,
          style: 'italic',
          family: theme.typography.fontFamily
        },
        callbacks: tooltipCallbacks,
        displayColors: false
      }
    },
    scales: {
      x: {
        max: 100,
        min: 0,
        grid: {
          color: theme.palette.divider,
          drawBorder: false,
          drawTicks: false,
          lineWidth: 0.5
        },
        ticks: {
          color: theme.palette.text.secondary,
          stepSize: 20,
          callback: (value) => `${value}%`,
          padding: 8,
          font: {
            family: theme.typography.fontFamily
          }
        },
        title: {
          display: true,
          text: 'Score Percentage',
          color: theme.palette.text.primary,
          font: {
            size: 13,
            weight: 'bold',
            family: theme.typography.fontFamily
          },
          padding: { top: 20, bottom: 15 }
        }
      },
      y: {
        display: false
      }
    },
    onHover: (event, chartElement) => {
      if (chartElement.length) {
        event.native.target.style.cursor = 'pointer';
      } else {
        event.native.target.style.cursor = 'default';
      }
    }
  };

  // Custom plugins
  const externalLabelsPlugin = {
    id: 'externalLabels',
    afterDatasetsDraw(chart) {
      const { ctx, chartArea: { left, right }, scales: { y } } = chart;
      
      ctx.save();
      ctx.font = `500 12px ${theme.typography.fontFamily}`;
      ctx.textBaseline = 'middle';

      // Left aligned names with fade effect
      ctx.textAlign = 'right';
      chart.data.labels.forEach((label, index) => {
        const yPos = y.getPixelForValue(index);
        const gradient = ctx.createLinearGradient(left - nameAreaWidth, yPos, left - 10, yPos);
        gradient.addColorStop(0, 'transparent');
        gradient.addColorStop(0.8, theme.palette.text.primary);
        
        ctx.fillStyle = gradient;
        ctx.fillText(label, left - 12, yPos);
      });

      // Right aligned percentages
      ctx.textAlign = 'left';
      ctx.font = `bold 12px ${theme.typography.fontFamily}`;
      chart.data.datasets[0].data.forEach((value, index) => {
        const yPos = y.getPixelForValue(index);
        ctx.fillStyle = theme.palette.text.primary;
        ctx.fillText(`${value}%`, right + 12, yPos);
      });
      ctx.restore();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Box sx={{ 
        width: '100%',
        height: `${chartHeight}px`,
        position: 'relative',
        overflowY: 'auto',
        '&::-webkit-scrollbar': {
          width: '8px'
        },
        '&::-webkit-scrollbar-thumb': {
          backgroundColor: theme.palette.mode === 'dark' ? theme.palette.grey[700] : theme.palette.grey[400],
          borderRadius: '4px'
        },
        '&::-webkit-scrollbar-track': {
          backgroundColor: theme.palette.mode === 'dark' ? theme.palette.grey[900] : theme.palette.grey[100]
        }
      }}>
        <Box sx={{
          width: '100%',
          minHeight: `${chartHeight}px`,
          padding: '25px 15px 25px 5px',
          background: theme.palette.background.paper,
          borderRadius: '12px',
          boxShadow: theme.shadows[2]
        }}>
          <Bar 
            data={chartData} 
            options={options}
            plugins={[externalLabelsPlugin]}
            height={chartHeight}
          />
        </Box>
      </Box>
    </motion.div>
  );
};

export default ScoreChart;