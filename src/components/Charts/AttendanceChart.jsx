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

const AttendanceChart = ({ data }) => {
  // Count attendance by manager
  const attendanceByManager = {};
  data.forEach(item => {
    const manager = item.Manager;
    if (!attendanceByManager[manager]) {
      attendanceByManager[manager] = { present: 0, total: 0 };
    }
    attendanceByManager[manager].total++;
    if (item['Attendance Status (Present?)']?.toString().toLowerCase() === 'yes') {
      attendanceByManager[manager].present++;
    }
  });

  const managers = Object.keys(attendanceByManager).sort((a, b) => 
    attendanceByManager[b].present - attendanceByManager[a].present
  );
  const presentData = managers.map(manager => attendanceByManager[manager].present);
  const absentData = managers.map(manager => 
    attendanceByManager[manager].total - attendanceByManager[manager].present
  );

  const chartData = {
    labels: managers,
    datasets: [
      {
        label: 'Present',
        data: presentData,
        backgroundColor: 'rgba(75, 192, 192, 0.8)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1,
        borderRadius: 4
      },
      {
        label: 'Absent',
        data: absentData,
        backgroundColor: 'rgba(255, 99, 132, 0.8)',
        borderColor: 'rgba(255, 99, 132, 1)',
        borderWidth: 1,
        borderRadius: 4
      }
    ]
  };

  const options = {
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
            const manager = managers[context.dataIndex];
            const percentage = Math.round(
              (value / attendanceByManager[manager].total) * 100
            );
            return [
              `${label}: ${value}`,
              `Total: ${attendanceByManager[manager].total}`,
              `Percentage: ${percentage}%`
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
        grid: {
          display: false
        },
        ticks: {
          font: {
            size: 12
          }
        }
      },
      y: {
        beginAtZero: true,
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
          text: 'Number of Employees',
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

export default AttendanceChart;