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
import { getRandomColorFromScheme } from './chartUtils';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const SelfInterestChart = ({ data }) => {
  const theme = useTheme();
  const interestedData = data.filter(item => 
    item['Self-Interested Candidate']?.toString().toLowerCase() === 'yes'
  ).sort((a, b) => b['Overall Percentage'] - a['Overall Percentage']);

  const chartData = {
    labels: interestedData.map(item => item.Name),
    datasets: [
      {
        label: 'Score',
        data: interestedData.map(item => item['Overall Percentage']),
        backgroundColor: interestedData.map((_, index) => 
          getRandomColorFromScheme(index)
        ),
        borderColor: interestedData.map((_, index) => 
          theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'
        ),
        borderWidth: 1,
        borderRadius: 4,
        barThickness: 30
      }
    ]
  };

  const options = {
    indexAxis: 'x',
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
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
      y: {
        beginAtZero: true,
        max: 100,
        grid: {
          color: theme.palette.divider,
          drawBorder: false
        },
        ticks: {
          color: theme.palette.text.secondary
        },
        title: {
          display: true,
          text: 'Score (%)',
          color: theme.palette.text.primary,
          font: {
            family: theme.typography.fontFamily,
            size: 12,
            weight: 'bold'
          }
        }
      },
      x: {
        grid: {
          display: false,
          drawBorder: false
        },
        ticks: {
          color: theme.palette.text.secondary,
          font: {
            family: theme.typography.fontFamily,
            size: 11
          }
        }
      }
    }
  };

  return (
    <Box sx={{ 
      height: '100%',
      width: '100%',
      position: 'relative',
      padding: 2,
      '& canvas': {
        maxHeight: '100%'
      }
    }}>
      <Bar 
        data={chartData} 
        options={options} 
        style={{ 
          width: '100%',
          height: '100%',
          minHeight: '400px'
        }}
      />
    </Box>
  );
};

export default SelfInterestChart;