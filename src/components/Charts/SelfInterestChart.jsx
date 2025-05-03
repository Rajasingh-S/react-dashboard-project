import { Bar } from 'react-chartjs-2';
import { Box } from '@mui/material';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const SelfInterestChart = ({ data }) => {
  const interestedData = data.filter(item => 
    item['Self-Interested Candidate']?.toString().toLowerCase() === 'yes'
  ).sort((a, b) => b['Overall Percentage'] - a['Overall Percentage']);

  const chartData = {
    labels: interestedData.map(item => item.Name),
    datasets: [
      {
        label: 'Score',
        data: interestedData.map(item => item['Overall Percentage']),
        backgroundColor: interestedData.map(item => 
          item.Status?.toLowerCase().includes('qualif') && !item.Status?.toLowerCase().includes('not') 
            ? 'rgba(75, 192, 192, 0.8)' 
            : 'rgba(255, 99, 132, 0.8)'
        ),
        borderColor: interestedData.map(item => 
          item.Status?.toLowerCase().includes('qualif') && !item.Status?.toLowerCase().includes('not') 
            ? 'rgba(75, 192, 192, 1)' 
            : 'rgba(255, 99, 132, 1)'
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
        },
        bodyFont: {
          size: 14
        },
        titleFont: {
          size: 16,
          weight: 'bold'
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
        grid: {
          display: false
        },
        ticks: {
          font: {
            size: 12
          }
        },
        title: {
          display: true,
          text: 'Score (%)',
          font: {
            size: 14,
            weight: 'bold'
          }
        }
      },
      x: {
        grid: {
          display: false
        },
        ticks: {
          font: {
            size: 12
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
      '& canvas': {
        maxHeight: '100%'
      }
    }}>
      <Bar data={chartData} options={options} />
    </Box>
  );
};

export default SelfInterestChart;