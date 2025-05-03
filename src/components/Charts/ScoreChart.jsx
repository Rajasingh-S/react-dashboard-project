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

const ScoreChart = ({ data }) => {
  // Process data for chart
  const employees = data.filter(item => item['Employee or Intern'] === 'Employee');
  const interns = data.filter(item => item['Employee or Intern'] === 'Intern');

  // Sort data by score (highest first)
  const sortedEmployees = [...employees].sort((a, b) => b['Overall Percentage'] - a['Overall Percentage']);
  const sortedInterns = [...interns].sort((a, b) => b['Overall Percentage'] - a['Overall Percentage']);

  const chartData = {
    labels: [...sortedEmployees, ...sortedInterns].map(item => item.Name),
    datasets: [
      {
        label: 'Employees',
        data: sortedEmployees.map(item => item['Overall Percentage']),
        backgroundColor: '#3f51b5',
        borderColor: '#303f9f',
        borderWidth: 1,
        borderRadius: 4,
        barThickness: 20
      },
      {
        label: 'Interns',
        data: sortedInterns.map(item => item['Overall Percentage']),
        backgroundColor: '#ff9800',
        borderColor: '#f57c00',
        borderWidth: 1,
        borderRadius: 4,
        barThickness: 20
      }
    ]
  };

  const options = {
    indexAxis: 'y',
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          boxWidth: 20,
          padding: 20,
          font: {
            size: 14
          }
        }
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const label = context.dataset.label || '';
            const value = context.raw;
            const person = data.find(item => item.Name === context.label);
            return [
              `${label}: ${value}%`,
              `Course: ${person?.Course || 'N/A'}`,
              `Manager: ${person?.Manager || 'N/A'}`,
              `Status: ${person?.Status || 'N/A'}`
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
      x: {
        max: 100,
        grid: {
          display: false
        },
        ticks: {
          stepSize: 20,
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
      y: {
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

export default ScoreChart;