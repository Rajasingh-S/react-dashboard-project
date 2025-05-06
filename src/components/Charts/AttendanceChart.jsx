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
import { interpolateViridis } from 'd3-scale-chromatic';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const AttendanceChart = ({ data }) => {
  const theme = useTheme();

  const attendanceData = data.reduce((acc, item) => {
    const manager = item.Manager?.trim() || 'Unknown';
    const isPresent = item['Attendance Status (Present?)']?.toString().toLowerCase() === 'yes';
    if (!acc[manager]) acc[manager] = { present: 0, total: 0 };
    acc[manager].total++;
    if (isPresent) acc[manager].present++;
    return acc;
  }, {});

  const sortedManagers = Object.keys(attendanceData).sort(
    (a, b) => attendanceData[b].present - attendanceData[a].present
  );

  const maxCount = Math.max(...Object.values(attendanceData).map(item => item.present));

  const chartData = {
    labels: sortedManagers,
    datasets: [{
      label: 'Number of Present Employees',
      data: sortedManagers.map(manager => attendanceData[manager].present),
      backgroundColor: sortedManagers.map((_, index) => interpolateViridis(index / sortedManagers.length)),
      borderColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
      borderWidth: 1.5,
      borderRadius: 6,
      hoverBorderWidth: 2,
      hoverBorderColor: theme.palette.success.main,
      hoverBackgroundColor: sortedManagers.map((_, index) => interpolateViridis(index / sortedManagers.length))
    }]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    indexAxis: 'x',
    animation: {
      duration: 1000,
      easing: 'easeOutQuart',
      delay: (context) => context.dataIndex * 60
    },
    plugins: {
      legend: { display: false },
      tooltip: {
        enabled: true,
        backgroundColor: theme.palette.background.paper,
        titleColor: theme.palette.success.main,
        bodyColor: theme.palette.text.primary,
        borderColor: theme.palette.divider,
        borderWidth: 1,
        padding: 16,
        cornerRadius: 8,
        titleFont: {
          size: 14,
          weight: 'bold',
          family: theme.typography.fontFamily
        },
        bodyFont: {
          size: 12,
          family: theme.typography.fontFamily
        },
        footerFont: {
          size: 10,
          style: 'italic',
          family: theme.typography.fontFamily
        },
        callbacks: {
          title: (context) => [`Manager: ${context[0].label}`],
          label: (context) => {
            const mgrData = attendanceData[context.label];
            const percentage = Math.round((mgrData.present / mgrData.total) * 100);
            return [
              `Present: ${context.raw}`,
              `Absent: ${mgrData.total - mgrData.present}`,
              `Total: ${mgrData.total}`,
              `Attendance Rate: ${percentage}%`
            ];
          },
          footer: () => ['Click for employee details']
        },
        displayColors: false
      }
    },
    scales: {
      x: {
        grid: { display: false, drawBorder: false },
        ticks: {
          color: theme.palette.text.secondary,
          font: {
            family: theme.typography.fontFamily,
            size: 12,
            weight: 'bold'
          }
        },
        title: {
          display: true,
          text: 'Managers',
          color: theme.palette.text.primary,
          font: {
            size: 13,
            weight: 'bold',
            family: theme.typography.fontFamily
          },
          padding: { top: 15, bottom: 10 }
        }
      },
      y: {
        beginAtZero: true,
        max: Math.ceil(maxCount * 1.1),
        grid: {
          color: theme.palette.divider,
          drawBorder: false,
          lineWidth: 0.5
        },
        ticks: {
          color: theme.palette.text.secondary,
          precision: 0,
          font: {
            family: theme.typography.fontFamily,
            size: 12
          }
        },
        title: {
          display: true,
          text: 'Number of Present Employees',
          color: theme.palette.text.primary,
          font: {
            size: 13,
            weight: 'bold',
            family: theme.typography.fontFamily
          },
          padding: { bottom: 15 }
        }
      }
    },
    onHover: (event, chartElement) => {
      event.native.target.style.cursor = chartElement.length ? 'pointer' : 'default';
    }
  };

  const valueLabelPlugin = {
    id: 'valueLabels',
    afterDatasetsDraw(chart) {
      const { ctx, data } = chart;
      ctx.save();
      ctx.font = `bold 12px ${theme.typography.fontFamily}`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'bottom';

      chart.getDatasetMeta(0).data.forEach((bar, index) => {
        const value = data.datasets[0].data[index];
        const x = bar.x;
        const y = bar.y - 8;

        ctx.fillStyle = theme.palette.background.paper;
        ctx.fillRect(x - 15, y - 20, 30, 20);

        ctx.fillStyle = theme.palette.text.primary;
        ctx.fillText(value, x, y);
      });

      ctx.restore();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
    >
      <Box sx={{
        width: '100%',
        height: 'calc(100vh - 200px)',
        position: 'relative',
        padding: '15px',
        background: theme.palette.background.paper,
        borderRadius: '12px',
        boxShadow: theme.shadows[2],
        overflowY: 'auto',
        '&::-webkit-scrollbar': {
          width: '8px'
        },
        '&::-webkit-scrollbar-thumb': {
          backgroundColor: theme.palette.mode === 'dark' ? theme.palette.grey[700] : theme.palette.grey[400],
          borderRadius: '4px'
        },
        '&::-webkit-scrollbar-track': {
          backgroundColor: theme.palette.mode === 'dark' ? theme.palette.grey[900] : theme.palette.grey[100]
        }
      }}>
        <Box sx={{ width: '100%', minHeight: '500px', position: 'relative' }}>
          <Bar data={chartData} options={options} plugins={[valueLabelPlugin]} />
        </Box>
      </Box>
    </motion.div>
  );
};

export default AttendanceChart;
