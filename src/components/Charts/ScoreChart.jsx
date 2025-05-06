import { Bar } from 'react-chartjs-2';
import { Box, Typography, useTheme } from '@mui/material';
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
  const sortedData = [...data].sort((a, b) => b['Overall Percentage'] - a['Overall Percentage']);

  const barHeight = 30;
  const chartHeight = Math.max(500, sortedData.length * (barHeight + 15));
  const maxNameLength = Math.max(...sortedData.map(item => item.Name.length));
  const nameAreaWidth = Math.min(250, maxNameLength * 9);

  const getColor = (index, total) => {
    const hue = (index * 137.5) % 360;
    return `hsl(${hue}, 55%, 58%)`; // slight tuning for better visual difference
  };

  const chartData = {
    labels: sortedData.map(item => item.Name),
    datasets: [{
      label: 'Score',
      data: sortedData.map(item => item['Overall Percentage']),
      backgroundColor: sortedData.map((_, index) => getColor(index, sortedData.length)),
      borderColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.15)',
      borderWidth: 1.5,
      borderRadius: 8,
      barThickness: barHeight,
      hoverBorderWidth: 2,
      hoverBorderColor: theme.palette.primary.main,
    }]
  };

  const tooltipCallbacks = {
    title: (context) => [`${sortedData[context[0].dataIndex].Name}`],
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
    footer: () => ['Click bar for details']
  };

  const options = {
    indexAxis: 'y',
    responsive: true,
    maintainAspectRatio: false,
    animation: {
      duration: 1200,
      easing: 'easeOutElastic',
      delay: (context) => context.dataIndex * 40,
    },
    layout: {
      padding: {
        left: nameAreaWidth,
        right: 60,
      }
    },
    plugins: {
      legend: { display: false },
      tooltip: {
        enabled: true,
        backgroundColor: theme.palette.background.paper,
        titleColor: theme.palette.primary.main,
        bodyColor: theme.palette.text.primary,
        borderColor: theme.palette.divider,
        borderWidth: 1,
        padding: 14,
        cornerRadius: 8,
        callbacks: tooltipCallbacks,
        displayColors: false,
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
          lineWidth: 0.5,
        },
        ticks: {
          color: theme.palette.text.secondary,
          stepSize: 20,
          callback: (value) => `${value}%`,
          padding: 10,
          font: {
            size: 12,
            weight: 'bold',
            family: theme.typography.fontFamily,
          }
        },
        title: {
          display: true,
          text: 'Score Percentage',
          color: theme.palette.text.primary,
          font: {
            size: 14,
            weight: 'bold',
            family: theme.typography.fontFamily,
          },
          padding: { top: 20, bottom: 10 },
        }
      },
      y: { display: false }
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
      ctx.font = `bold 13px ${theme.typography.fontFamily}`;
      ctx.textBaseline = 'middle';

      chart.data.labels.forEach((label, index) => {
        const yPos = y.getPixelForValue(index);

        // Left: Candidate name
        ctx.textAlign = 'right';
        ctx.fillStyle = theme.palette.text.primary;
        ctx.fillText(label, left - 14, yPos);

        // Right: Score percentage
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
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Box
        sx={{
          width: '100%',
          overflow: 'auto',
          maxHeight: '80vh',
          '&::-webkit-scrollbar': { height: '8px', width: '8px' },
          '&::-webkit-scrollbar-thumb': {
            backgroundColor: theme.palette.mode === 'dark'
              ? theme.palette.grey[700]
              : theme.palette.grey[400],
            borderRadius: '4px'
          },
          '&::-webkit-scrollbar-track': {
            backgroundColor: theme.palette.mode === 'dark'
              ? theme.palette.grey[900]
              : theme.palette.grey[100]
          }
        }}
      >
        <Box
          sx={{
            minWidth: '800px',
            padding: '25px 20px 40px 10px',
            background: theme.palette.background.paper,
            borderRadius: '14px',
            boxShadow: theme.shadows[2],
            position: 'relative'
          }}
          style={{ height: `${chartHeight}px` }}
        >
          <Bar data={chartData} options={options} plugins={[externalLabelsPlugin]} />
        </Box>

        <Box sx={{ p: 2 }}>
          <Typography variant="body2" align="right" fontWeight="bold" color="text.secondary">
            Total Candidates: {sortedData.length}
          </Typography>
        </Box>
      </Box>
    </motion.div>
  );
};

export default ScoreChart;
