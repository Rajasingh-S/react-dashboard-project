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
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { getRandomColorFromScheme } from './chartUtils';

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
        backgroundColor: interestedData.map((_, index) => getRandomColorFromScheme(index + 5)),
        borderColor: theme.palette.mode === 'dark'
          ? 'rgba(255, 255, 255, 0.1)'
          : 'rgba(0, 0, 0, 0.1)',
        borderWidth: 1,
        borderRadius: 6,
        barThickness: 32,
        clip: false,  // 💥 This allows labels to go beyond chart area
        datalabels: {
          anchor: 'end',
          align: 'end',
          color: theme.palette.text.primary,
          font: {
            weight: 'bold',
            size: 12,
          },
          formatter: (value) => `${value}%`
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
        right: 40,  // 💥 Extra right padding so labels don't get cut
      },
    },
    animation: {
      duration: 1200,
      easing: 'easeOutBounce'
    },
    plugins: {
      legend: {
        display: false,
      },
      datalabels: {
        display: true,
      },
      tooltip: {
        backgroundColor: theme.palette.background.paper,
        titleColor: theme.palette.text.primary,
        bodyColor: theme.palette.text.secondary,
        borderColor: theme.palette.divider,
        borderWidth: 1,
        padding: 12,
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
            size: 13,
            weight: 'bold'
          }
        }
      },
      y: {
        beginAtZero: true,
        max: 110,  // 💥 Max Y extended slightly so that 100% labels don't get stuck
        grid: {
          color: theme.palette.divider,
          drawBorder: false
        },
        ticks: {
          color: theme.palette.text.primary,
          font: {
            size: 12,
            weight: 'bold'
          }
        },
        title: {
          display: true,
          text: 'Score (%)',
          color: theme.palette.text.primary,
          font: {
            size: 14,
            weight: 'bold'
          }
        }
      }
    }
  };

  return (
    <Box 
      sx={{ 
        height: '100%',
        width: '100%',
        position: 'relative',
        overflow: 'auto',
        padding: 2,
        '& canvas': {
          minHeight: '400px',
          maxHeight: '800px',
          minWidth: '600px'
        }
      }}
    >
      <Bar data={chartData} options={options} />
      <Box sx={{
        mt: 2,
        textAlign: 'right',
        fontWeight: 'bold',
        fontSize: '14px',
        color: theme.palette.text.secondary
      }}>
        Total Combined Score: {totalScore.toFixed(2)}%
      </Box>
    </Box>
  );
};

export default SelfInterestChart;
