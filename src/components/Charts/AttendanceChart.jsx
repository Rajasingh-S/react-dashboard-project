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
import { interpolateViridis } from 'd3-scale-chromatic';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const AttendanceChart = ({ data }) => {
  const theme = useTheme();

  // Calculate present counts by manager
  const attendanceData = data.reduce((acc, item) => {
    const manager = item.Manager || 'Unknown';
    const isPresent = item['Attendance Status (Present?)']?.toString().toLowerCase() === 'yes';
    
    if (!acc[manager]) {
      acc[manager] = 0;
    }
    if (isPresent) {
      acc[manager]++;
    }
    return acc;
  }, {});

  // Sort managers by present count (descending)
  const sortedManagers = Object.keys(attendanceData).sort(
    (a, b) => attendanceData[b] - attendanceData[a]
  );

  // Prepare chart data
  const chartData = {
    labels: sortedManagers,
    datasets: [{
      label: 'Number of Present Employees',
      data: sortedManagers.map(manager => attendanceData[manager]),
      backgroundColor: sortedManagers.map((_, index) => 
        interpolateViridis(index / sortedManagers.length)
      ),
      borderColor: theme.palette.mode === 'dark' 
        ? 'rgba(255, 255, 255, 0.1)' 
        : 'rgba(0, 0, 0, 0.1)',
      borderWidth: 1,
      borderRadius: 4
    }]
  };

  // Custom plugin for value labels
  const valueLabelPlugin = {
    id: 'valueLabels',
    afterDatasetsDraw(chart) {
      const { ctx, data, chartArea: { top, bottom, left, right } } = chart;
      
      ctx.font = 'bold 12px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'bottom';

      chart.getDatasetMeta(0).data.forEach((bar, index) => {
        const value = data.datasets[0].data[index];
        const xPos = bar.x;
        const yPos = bar.y - 5;
        
        ctx.fillStyle = theme.palette.text.primary;
        ctx.fillText(value, xPos, yPos);
      });
    }
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    indexAxis: 'x',
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        callbacks: {
          title: (context) => {
            return `Manager: ${context[0].label}`;
          },
          label: (context) => {
            const totalEmployees = data.filter(item => 
              (item.Manager || 'Unknown') === context[0].label
            ).length;
            const percentage = Math.round((context.raw / totalEmployees) * 100);
            return [
              `Present: ${context.raw}`,
              `Total Employees: ${totalEmployees}`,
              `Attendance Rate: ${percentage}%`
            ];
          }
        },
        backgroundColor: theme.palette.background.paper,
        titleColor: theme.palette.text.primary,
        bodyColor: theme.palette.text.secondary,
        borderColor: theme.palette.divider,
        borderWidth: 1,
        padding: 12
      },
      title: {
        display: true,
        text: 'Number of Present Employees by Manager',
        color: theme.palette.text.primary,
        font: {
          size: 16,
          weight: 'bold'
        },
        padding: {
          top: 10,
          bottom: 20
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
          color: theme.palette.text.secondary
        },
        title: {
          display: true,
          text: 'Managers',
          color: theme.palette.text.primary,
          font: {
            size: 14,
            weight: 'bold'
          }
        }
      },
      y: {
        beginAtZero: true,
        grid: {
          color: theme.palette.divider,
          drawBorder: false
        },
        ticks: {
          color: theme.palette.text.secondary,
          precision: 0
        },
        title: {
          display: true,
          text: 'Number of Present Employees',
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
    <Box sx={{ 
      width: '100%',
      height: '100%',
      position: 'relative',
      padding: 2
    }}>
      <Bar
        data={chartData}
        options={options}
        plugins={[valueLabelPlugin]}
      />
    </Box>
  );
};

export default AttendanceChart;