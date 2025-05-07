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
import { interpolateTurbo } from 'd3-scale-chromatic';

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
  
  const interestedData = data
    .filter(item => item['Self-Interested Candidate']?.toString().toLowerCase() === 'yes')
    .sort((a, b) => b['Overall Percentage'] - a['Overall Percentage']);

  const totalScore = interestedData.reduce((sum, item) => sum + (item['Overall Percentage'] || 0), 0);

  const chartData = {
    labels: interestedData.map(item => item.Name),
    datasets: [
      {
        label: 'Score (%)',
        data: interestedData.map(item => item['Overall Percentage']),
        backgroundColor: interestedData.map((_, i) => interpolateTurbo(i / interestedData.length)),
        borderColor: theme.palette.mode === 'dark'
          ? 'rgba(255, 255, 255, 0.2)'
          : 'rgba(0, 0, 0, 0.1)',
        borderWidth: 1,
        borderRadius: 10,
        barThickness: 40,
        hoverBorderWidth: 3,
        hoverBorderColor: theme.palette.warning.light,
        datalabels: {
          anchor: 'end',
          align: 'end',
          color: theme.palette.text.primary,
          font: {
            weight: 'bold',
            size: 14,
            family: "'Montserrat', sans-serif"
          },
          formatter: (value) => `${value}%`,
          shadowBlur: 8,
          shadowColor: 'rgba(0,0,0,0.3)',
          shadowOffsetX: 2,
          shadowOffsetY: 2
        }
      }
    ]
  };

  const options = {
    indexAxis: 'x',
    responsive: true,
    maintainAspectRatio: false,
    layout: {
      padding: {
        top: 30,
        right: 60,
        bottom: 40,
        left: 30
      },
    },
    animation: {
      duration: 1500,
      easing: 'backOut'
    },
    plugins: {
      legend: {
        display: false,
      },
      datalabels: {
        display: true,
      },
      tooltip: {
        backgroundColor: theme.palette.background.default,
        titleColor: theme.palette.warning.light,
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
        callbacks: {
          label: (context) => {
            const dataItem = interestedData[context.dataIndex];
            return [
              `Score: ${context.raw}%`,
              `Status: ${dataItem.Status}`,
              `Course: ${dataItem.Course}`,
              `Manager: ${dataItem.Manager || 'N/A'}`,
              `Self-Interested: Yes`
            ];
          }
        }
      }
    },
    scales: {
      x: {
        grid: {
          display: false,
          drawBorder: false
        },
        ticks: {
          color: theme.palette.text.primary,
          font: {
            size: 14,
            weight: 'bold',
            family: "'Montserrat', sans-serif"
          },
          padding: 10
        },
        title: {
          display: true,
          text: 'Candidates',
          color: theme.palette.primary.light,
          font: {
            size: 16,
            weight: 'bold',
            family: "'Montserrat', sans-serif"
          },
          padding: { top: 20 }
        }
      },
      y: {
        beginAtZero: true,
        max: 110,
        grid: {
          color: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
          drawBorder: false,
          lineWidth: 0.8
        },
        ticks: {
          color: theme.palette.text.secondary,
          font: {
            size: 14,
            weight: 'bold',
            family: "'Montserrat', sans-serif"
          },
          padding: 10
        },
        title: {
          display: true,
          text: 'Score (%)',
          color: theme.palette.primary.light,
          font: {
            size: 16,
            weight: 'bold',
            family: "'Montserrat', sans-serif"
          },
          padding: { bottom: 20 }
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
          },
          '& canvas': {
            minHeight: '500px'
          }
        }}>
          <Bar data={chartData} options={options} />
        </Box>
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <Box sx={{
            mt: 3,
            textAlign: 'right',
            fontWeight: 'bold',
            fontSize: '16px',
            fontFamily: "'Montserrat', sans-serif",
            background: theme.palette.mode === 'dark' 
              ? 'linear-gradient(90deg, #ff6b6b, #feca57)' 
              : 'linear-gradient(90deg, #5f27cd, #1dd1a1)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            Total Combined Score: {totalScore.toFixed(2)}%
          </Box>
        </motion.div>
      </Box>
    </motion.div>
  );
};

export default SelfInterestChart;