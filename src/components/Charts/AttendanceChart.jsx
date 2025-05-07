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
import { interpolatePlasma } from 'd3-scale-chromatic';

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
      backgroundColor: sortedManagers.map((_, i) => interpolatePlasma(i / sortedManagers.length)),
      borderColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)',
      borderWidth: 1,
      borderRadius: 8,
      barThickness: 40,
      hoverBorderWidth: 3,
      hoverBorderColor: theme.palette.success.light,
      hoverBackgroundColor: sortedManagers.map((_, i) => interpolatePlasma(i / sortedManagers.length)),
    }]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    indexAxis: 'x',
    animation: {
      duration: 1500,
      easing: 'backOut',
      delay: (context) => context.dataIndex * 70
    },
    layout: {
      padding: {
        top: 30,
        right: 40,
        bottom: 50,
        left: 30
      }
    },
    plugins: {
      legend: { display: false },
      tooltip: {
        enabled: true,
        backgroundColor: theme.palette.background.default,
        titleColor: theme.palette.success.light,
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
        footerFont: {
          size: 12,
          style: 'italic',
          family: "'Montserrat', sans-serif"
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
        grid: { 
          display: false, 
          drawBorder: false 
        },
        ticks: {
          color: theme.palette.text.primary,
          font: {
            family: "'Montserrat', sans-serif",
            size: 13,
            weight: 'bold'
          },
          padding: 10
        },
        title: {
          display: true,
          text: 'Managers',
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
        max: Math.ceil(maxCount * 1.2),
        grid: {
          color: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
          drawBorder: false,
          lineWidth: 0.8
        },
        ticks: {
          color: theme.palette.text.secondary,
          precision: 0,
          font: {
            family: "'Montserrat', sans-serif",
            size: 13
          },
          padding: 10
        },
        title: {
          display: true,
          text: 'Number of Present Employees',
          color: theme.palette.primary.light,
          font: {
            size: 16,
            weight: 'bold',
            family: "'Montserrat', sans-serif"
          },
          padding: { bottom: 20 }
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
      ctx.font = `bold 14px 'Montserrat', sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'bottom';

      chart.getDatasetMeta(0).data.forEach((bar, index) => {
        const value = data.datasets[0].data[index];
        const x = bar.x;
        const y = bar.y - 12;

        ctx.fillStyle = theme.palette.background.paper;
        ctx.shadowColor = 'rgba(0,0,0,0.2)';
        ctx.shadowBlur = 8;
        ctx.shadowOffsetX = 2;
        ctx.shadowOffsetY = 2;
        ctx.fillRect(x - 22, y - 24, 44, 24);

        ctx.shadowColor = 'transparent';
        ctx.fillStyle = theme.palette.text.primary;
        ctx.fillText(value, x, y);
      });

      ctx.restore();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6, delay: 0.2 }}
    >
      <Box sx={{
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
      }}>
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
          }
        }}>
          <Bar 
            data={chartData} 
            options={options} 
            plugins={[valueLabelPlugin]} 
          />
        </Box>
      </Box>
    </motion.div>
  );
};

export default AttendanceChart;