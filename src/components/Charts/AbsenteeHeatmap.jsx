import { Box } from '@mui/material';
import {
  Chart as ChartJS,
  LinearScale,
  CategoryScale,
  BarElement,
  Legend,
  Tooltip,
  Title
} from 'chart.js';
import { Chart } from 'react-chartjs-2';

ChartJS.register(
  LinearScale,
  CategoryScale,
  BarElement,
  Legend,
  Tooltip,
  Title
);

const AbsenteeHeatmap = ({ data }) => {
  // Process data for heatmap
  const managers = [...new Set(data.map(item => item.Manager))].filter(Boolean);
  const employees = [...new Set(data.map(item => item.Name))].filter(Boolean);

  // Create matrix: rows = employees, columns = managers
  const heatmapData = employees.map(employee => {
    return managers.map(manager => {
      const records = data.filter(
        item => item.Name === employee && item.Manager === manager
      );
      return records.reduce(
        (count, item) => count + (item['Attendance Status (Present?)'] === 'No' ? 1 : 0),
        0
      );
    });
  });

  // Find max value for color scaling
  const maxValue = Math.max(...heatmapData.flat());

  const chartData = {
    labels: employees,
    datasets: managers.map((manager, managerIndex) => ({
      label: manager,
      data: employees.map((_, empIndex) => heatmapData[empIndex][managerIndex]),
      backgroundColor: (ctx) => {
        const value = ctx.raw;
        const alpha = value === 0 ? 0 : 0.2 + (0.8 * (value / maxValue));
        return `rgba(12, 160, 44, ${alpha})`;
      },
      borderColor: (ctx) => {
        const value = ctx.raw;
        const alpha = value === 0 ? 0 : 0.4 + (0.6 * (value / maxValue));
        return `rgba(12, 100, 44, ${alpha})`;
      },
      borderWidth: 1
    }))
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right',
      },
      tooltip: {
        callbacks: {
          title: (context) => {
            return `Employee: ${context.label}`;
          },
          label: (context) => {
            return `Manager: ${context.dataset.label}, Absences: ${context.raw}`;
          }
        }
      },
      title: {
        display: false
      }
    },
    scales: {
      x: {
        stacked: true,
        grid: {
          display: false
        }
      },
      y: {
        stacked: true,
        grid: {
          display: false
        }
      }
    }
  };

  return (
    <Box sx={{ height: '100%', width: '100%', overflow: 'auto' }}>
      <Chart type='bar' data={chartData} options={options} />
    </Box>
  );
};

export default AbsenteeHeatmap;