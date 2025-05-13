import { Bar } from 'react-chartjs-2';
import { Box, useTheme } from '@mui/material';
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
import { useMemo } from 'react';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ChartDataLabels
);

const SelfInterestChart = ({ data }) => {
  const theme = useTheme();

  const generateTealColors = (count) => {
    return Array.from({ length: count }, (_, i) => 
      `hsl(${180 + (i * 25) % 90}, 75%, ${50 + (i % 4) * 8}%)`
    );
  };

  const { chartData, options, totalScore } = useMemo(() => {
    const interestedData = data
      .filter(item => item['Self-Interested Candidate']?.toString().toLowerCase() === 'yes')
      .sort((a, b) => b['Overall Percentage'] - a['Overall Percentage']);

    const totalScore = interestedData.reduce((sum, item) => sum + (item['Overall Percentage'] || 0), 0);

    const dataLength = interestedData.length;
    const isFewData = dataLength <= 5;
    const barThickness = isFewData ? 30 : 'flex';

    const chartData = {
      labels: interestedData.map(item => item.Name),
      datasets: [
        {
          label: 'Score (%)',
          data: interestedData.map(item => item['Overall Percentage']),
          backgroundColor: generateTealColors(interestedData.length),
          borderColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)',
          borderWidth: 1,
          borderRadius: 12,
          barThickness,
          hoverBorderWidth: 2,
          hoverBorderColor: theme.palette.warning.light,
        }
      ]
    };

    const options = {
      indexAxis: 'x',
      responsive: true,
      maintainAspectRatio: false,
      layout: {
        padding: { top: 20, right: 20, bottom: 20, left: 20 }
      },
      animation: {
        duration: 1200,
        easing: 'easeOutBack'
      },
      plugins: {
        legend: { display: false },
        datalabels: {
          anchor: 'end',
          align: 'end',
          color: theme.palette.text.primary,
          font: {
            size: 12,
            weight: 'bold',
            family: "'Montserrat', sans-serif"
          },
          formatter: value => `${value}%`,
        },
        tooltip: {
          backgroundColor: theme.palette.background.paper,
          titleColor: theme.palette.warning.main,
          bodyColor: theme.palette.text.primary,
          borderColor: theme.palette.divider,
          borderWidth: 1,
          padding: 12,
          cornerRadius: 10,
          titleFont: { size: 14, weight: 'bold', family: "'Montserrat', sans-serif" },
          bodyFont: { size: 12, family: "'Montserrat', sans-serif" },
          callbacks: {
            label: context => {
              const item = interestedData[context.dataIndex];
              return [
                `Score: ${context.raw}%`,
                `Status: ${item.Status}`,
                `Course: ${item.Course}`,
                `Manager: ${item.Manager || 'N/A'}`,
                `Self-Interested: Yes`
              ];
            }
          }
        }
      },
      scales: {
        x: {
          grid: { display: false },
          ticks: {
            color: theme.palette.text.primary,
            font: { size: 12, weight: 'bold', family: "'Montserrat', sans-serif" }
          },
          title: {
            display: true,
            text: 'Candidates',
            color: theme.palette.primary.main,
            font: { size: 14, weight: 'bold', family: "'Montserrat', sans-serif" }
          }
        },
        y: {
          beginAtZero: true,
          suggestedMax: 100,
          grid: {
            color: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
            drawBorder: false
          },
          ticks: {
            color: theme.palette.text.secondary,
            font: { size: 12, weight: 'bold', family: "'Montserrat', sans-serif" }
          },
          title: {
            display: true,
            text: 'Score (%)',
            color: theme.palette.primary.main,
            font: { size: 14, weight: 'bold', family: "'Montserrat', sans-serif" }
          }
        }
      }
    };

    return { chartData, options, totalScore };
  }, [data, theme]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6, delay: 0.2 }}
    >
      <Box
        sx={{
          width: '100%',
          height: { xs: '500px', md: 'calc(100vh - 180px)' },
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
        }}
      >
        <Box
          sx={{
            height: '100%',
            width: '100%',
            position: 'relative',
            overflow: 'auto',
            '& canvas': { minHeight: { xs: '300px', md: '500px' } },
            '&::-webkit-scrollbar': {
              width: 6,
              height: 6
            },
            '&::-webkit-scrollbar-thumb': {
              background: theme.palette.mode === 'dark'
                ? 'linear-gradient(135deg, #4a6fa5, #166d67)'
                : 'linear-gradient(135deg, #1976d2, #0288d1)',
              borderRadius: 6
            }
          }}
        >
          <Bar data={chartData} options={options} />
        </Box>
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <Box
            sx={{
              mt: 3,
              textAlign: 'right',
              fontWeight: 'bold',
              fontSize: { xs: '14px', md: '16px' },
              fontFamily: "'Montserrat', sans-serif",
              background: theme.palette.mode === 'dark'
                ? 'linear-gradient(90deg, #4a6fa5, #166d67)'
                : 'linear-gradient(90deg, #1976d2, #0288d1)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}
          >
            Total Combined Score: {totalScore.toFixed(2)}%
          </Box>
        </motion.div>
      </Box>
    </motion.div>
  );
};

export default SelfInterestChart;