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
import { interpolateSinebow } from 'd3-scale-chromatic';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const ScoreChart = ({ data }) => {
  const theme = useTheme();
  const sortedData = [...data].sort((a, b) => b['Overall Percentage'] - a['Overall Percentage']);

  const barHeight = 36;
  const barSpacing = 20;
  const chartHeight = Math.max(500, sortedData.length * (barHeight + barSpacing));
  const maxNameLength = Math.max(...sortedData.map(item => item.Name.length));
  const nameAreaWidth = Math.min(300, maxNameLength * 10);

  const chartData = {
    labels: sortedData.map(item => item.Name),
    datasets: [{
      label: 'Score',
      data: sortedData.map(item => item['Overall Percentage']),
      backgroundColor: sortedData.map((_, i) => interpolateSinebow(i / sortedData.length)),
      borderColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.15)',
      borderWidth: 1,
      borderRadius: 10,
      barThickness: barHeight,
      hoverBorderWidth: 3,
      hoverBorderColor: theme.palette.primary.light,
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
      duration: 1500,
      easing: 'elasticOut',
      delay: (context) => context.dataIndex * 50,
    },
    layout: {
      padding: {
        left: nameAreaWidth,
        right: 80,
        top: 30,
        bottom: 30
      }
    },
    plugins: {
      legend: { display: false },
      tooltip: {
        enabled: true,
        backgroundColor: theme.palette.background.default,
        titleColor: theme.palette.primary.light,
        bodyColor: theme.palette.text.primary,
        borderColor: theme.palette.divider,
        borderWidth: 2,
        padding: 16,
        cornerRadius: 12,
        boxShadow: theme.shadows[10],
        titleFont: {
          size: 16,
          weight: 'bold',
          family: "'Montserrat', sans-serif"
        },
        bodyFont: {
          size: 14,
          family: "'Montserrat', sans-serif"
        },
        callbacks: tooltipCallbacks,
        displayColors: false,
      }
    },
    scales: {
      x: {
        max: 100,
        min: 0,
        grid: {
          color: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
          drawBorder: false,
          drawTicks: false,
          lineWidth: 0.8,
        },
        ticks: {
          color: theme.palette.text.secondary,
          stepSize: 20,
          callback: (value) => `${value}%`,
          padding: 10,
          font: {
            size: 14,
            weight: 'bold',
            family: "'Montserrat', sans-serif",
          }
        },
        title: {
          display: true,
          text: 'Score Percentage',
          color: theme.palette.primary.light,
          font: {
            size: 16,
            weight: 'bold',
            family: "'Montserrat', sans-serif",
          },
          padding: { top: 20, bottom: 20 },
        }
      },
      y: { 
        display: false,
        grid: {
          display: false
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
      ctx.font = `bold 14px 'Montserrat', sans-serif`;
      ctx.textBaseline = 'middle';

      chart.data.labels.forEach((label, index) => {
        const yPos = y.getPixelForValue(index);

        // Left: Candidate name
        ctx.textAlign = 'right';
        ctx.fillStyle = theme.palette.text.primary;
        ctx.shadowColor = 'rgba(0,0,0,0.3)';
        ctx.shadowBlur = 4;
        ctx.fillText(label, left - 20, yPos);

        // Right: Score percentage
        const score = chart.data.datasets[0].data[index];
        const barEndX = chart.getDatasetMeta(0).data[index].x;
        ctx.textAlign = 'left';
        ctx.fillStyle = theme.palette.text.primary;
        ctx.shadowColor = 'rgba(0,0,0,0.3)';
        ctx.shadowBlur = 4;
        ctx.fillText(`${score}%`, barEndX + 12, yPos);
      });

      ctx.restore();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6, delay: 0.2 }}
    >
      <Box
        sx={{
          width: '100%',
          height: 'calc(100vh - 180px)',
          background: theme.palette.mode === 'dark' 
            ? 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)' 
            : 'linear-gradient(135deg, #f5f7fa 0%, #e4e8f0 100%)',
          borderRadius: '18px',
          boxShadow: theme.shadows[10],
          padding: '30px',
          overflow: 'hidden',
          border: theme.palette.mode === 'dark' 
            ? '1px solid rgba(255,255,255,0.1)' 
            : '1px solid rgba(0,0,0,0.1)'
        }}
      >
        <Box sx={{
          height: '100%',
          width: '100%',
          position: 'relative',
          overflow: 'auto',
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
        }}>
          <Box sx={{ 
            minWidth: '800px',
            minHeight: `${chartHeight}px`,
            position: 'relative'
          }}>
            <Bar 
              data={chartData} 
              options={options} 
              plugins={[externalLabelsPlugin]} 
            />
          </Box>
        </Box>
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <Typography 
            variant="subtitle1" 
            align="right" 
            sx={{ 
              mt: 2,
              fontWeight: 'bold',
              background: theme.palette.mode === 'dark' 
                ? 'linear-gradient(90deg, #ff6b6b, #feca57)' 
                : 'linear-gradient(90deg, #5f27cd, #1dd1a1)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              fontSize: '16px',
              fontFamily: "'Montserrat', sans-serif"
            }}
          >
            Total Candidates: {sortedData.length}
          </Typography>
        </motion.div>
      </Box>
    </motion.div>
  );
};

export default ScoreChart;