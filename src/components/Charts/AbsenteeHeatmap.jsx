import { Bar } from 'react-chartjs-2';
import { Box, Typography, useTheme } from '@mui/material';
import { motion } from 'framer-motion';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { interpolateRainbow } from 'd3-scale-chromatic';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ChartDataLabels);

const AbsenteeHeatmap = ({ data }) => {
  const theme = useTheme();

  const absenteeData = data.reduce((acc, item) => {
    const manager = item.Manager?.trim() || 'Unknown';
    const isAbsent = item['Attendance Status (Present?)']?.toString().toLowerCase() === 'no';

    if (!acc[manager]) acc[manager] = { count: 0, total: 0 };
    acc[manager].total++;
    if (isAbsent) acc[manager].count++;
    return acc;
  }, {});

  const sortedManagers = Object.keys(absenteeData).sort(
    (a, b) => absenteeData[b].count - absenteeData[a].count
  );

  const chartData = {
    labels: sortedManagers,
    datasets: [{
      label: 'Absentees',
      data: sortedManagers.map(manager => absenteeData[manager].count),
      backgroundColor: sortedManagers.map((_, i) => interpolateRainbow(i / sortedManagers.length)),
      borderRadius: 10,
      barThickness: 40,
      hoverBorderWidth: 3,
      hoverBorderColor: theme.palette.error.light,
    }]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    indexAxis: 'x',
    animation: {
      duration: 1500,
      easing: 'easeOutElastic'
    },
    layout: {
      padding: { top: 30, right: 30, bottom: 40, left: 20 }
    },
    plugins: {
      legend: { display: false },
      datalabels: {
        color: theme.palette.text.primary,
        font: {
          weight: 'bold',
          size: 14,
          family: "'Montserrat', sans-serif",
        },
        anchor: 'end',
        align: 'end',
        formatter: (value) => `${value}`,
      },
      tooltip: {
        backgroundColor: theme.palette.background.default,
        titleColor: theme.palette.error.light,
        bodyColor: theme.palette.text.primary,
        borderColor: theme.palette.divider,
        borderWidth: 1,
        cornerRadius: 12,
        titleFont: { size: 16, weight: 'bold', family: "'Montserrat', sans-serif" },
        bodyFont: { size: 14, family: "'Montserrat', sans-serif" },
        callbacks: {
          title: (context) => `Manager: ${context[0].label}`,
          label: (context) => {
            const mgr = absenteeData[context.label];
            const absent = mgr.count;
            const present = mgr.total - absent;
            const percentage = Math.round((absent / mgr.total) * 100);
            return [
              `Absent: ${absent}`,
              `Present: ${present}`,
              `Total: ${mgr.total}`,
              `Absentee Rate: ${percentage}%`
            ];
          },
        },
        displayColors: false,
      }
    },
    scales: {
      x: {
        grid: { display: false, drawBorder: false },
        ticks: {
          color: theme.palette.text.primary,
          font: { size: 13, weight: 'bold', family: "'Montserrat', sans-serif" },
          padding: 10,
        },
        title: {
          display: true,
          text: 'Managers',
          color: theme.palette.primary.main,
          font: { size: 16, weight: 'bold', family: "'Montserrat', sans-serif" },
          padding: { top: 20 },
        }
      },
      y: {
        beginAtZero: true,
        grid: {
          color: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
          drawBorder: false
        },
        ticks: {
          color: theme.palette.text.secondary,
          font: { size: 13, family: "'Montserrat', sans-serif" },
          precision: 0,
          padding: 10,
        },
        title: {
          display: true,
          text: 'Number of Absentees',
          color: theme.palette.primary.main,
          font: { size: 16, weight: 'bold', family: "'Montserrat', sans-serif" },
          padding: { bottom: 20 },
        }
      }
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6, delay: 0.2 }}
    >
      <Box sx={{
        width: '100%',
        height: 'calc(100vh - 180px)',
        background: theme.palette.mode === 'dark'
          ? 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)'
          : 'linear-gradient(135deg, #f5f7fa 0%, #e4e8f0 100%)',
        borderRadius: 3,
        boxShadow: theme.shadows[10],
        p: 3,
        overflow: 'hidden',
        border: theme.palette.mode === 'dark'
          ? '1px solid rgba(255,255,255,0.1)'
          : '1px solid rgba(0,0,0,0.1)'
      }}>
        <Box sx={{
          height: '100%',
          overflow: 'auto',
          '&::-webkit-scrollbar': { height: 8 },
          '&::-webkit-scrollbar-thumb': {
            background: theme.palette.mode === 'dark'
              ? 'linear-gradient(135deg, #ff6b6b, #feca57)'
              : 'linear-gradient(135deg, #5f27cd, #1dd1a1)',
            borderRadius: 4
          },
          '&::-webkit-scrollbar-track': {
            background: theme.palette.mode === 'dark'
              ? 'rgba(255,255,255,0.05)'
              : 'rgba(0,0,0,0.05)'
          }
        }}>
          <Bar data={chartData} options={options} />
        </Box>
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <Typography
            align="right"
            sx={{
              mt: 2,
              fontWeight: 'bold',
              background: theme.palette.mode === 'dark'
                ? 'linear-gradient(90deg, #ff6b6b, #feca57)'
                : 'linear-gradient(90deg, #5f27cd, #1dd1a1)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              fontSize: 16
            }}
          >
            Total Managers: {sortedManagers.length}
          </Typography>
        </motion.div>
      </Box>
    </motion.div>
  );
};

export default AbsenteeHeatmap;