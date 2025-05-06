import { Bar } from 'react-chartjs-2';
import { Box, Typography, useTheme } from '@mui/material';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { motion } from 'framer-motion';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const AbsenteeHeatmap = ({ data }) => {
  const theme = useTheme();

  const absenteeData = data.reduce((acc, item) => {
    const manager = item.Manager?.trim() || 'Unknown';
    const isAbsent = item['Attendance Status (Present?)']?.toString().toLowerCase() === 'no';

    if (!acc[manager]) acc[manager] = { count: 0, total: 0 };
    acc[manager].total++;
    if (isAbsent) acc[manager].count++;
    return acc;
  }, {});

  const sortedManagers = Object.keys(absenteeData).sort(
    (a, b) => absenteeData[b].count - absenteeData[a].count
  );

  const maxCount = Math.max(...Object.values(absenteeData).map(item => item.count));

  const getColor = (index) => {
    const hue = (index * 137.5) % 360;
    return `hsl(${hue}, 50%, 60%)`;
  };

  const chartData = {
    labels: sortedManagers,
    datasets: [{
      label: 'Number of Absentees',
      data: sortedManagers.map(manager => absenteeData[manager].count),
      backgroundColor: sortedManagers.map((_, index) => getColor(index)),
      borderColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.1)',
      borderWidth: 1.5,
      borderRadius: 6,
      barThickness: 35,
      hoverBorderWidth: 2,
      hoverBorderColor: theme.palette.error.main,
      hoverBackgroundColor: sortedManagers.map((_, index) => getColor(index)),
    }]
  };

  const tooltipCallbacks = {
    title: (context) => [`Manager: ${context[0].label}`],
    label: (context) => {
      const mgrData = absenteeData[context.label];
      const percentage = Math.round((mgrData.count / mgrData.total) * 100);
      return [
        `Absent: ${context.raw}`,
        `Present: ${mgrData.total - mgrData.count}`,
        `Total: ${mgrData.total}`,
        `Absentee Rate: ${percentage}%`
      ];
    },
    footer: () => ['Click for employee details']
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
    layout: {
      padding: {
        top: 20,
        right: 30,
        bottom: 40,
        left: 20
      }
    },
    plugins: {
      legend: { display: false },
      tooltip: {
        enabled: true,
        backgroundColor: theme.palette.background.paper,
        titleColor: theme.palette.error.main,
        bodyColor: theme.palette.text.primary,
        borderColor: theme.palette.divider,
        borderWidth: 1,
        padding: 16,
        cornerRadius: 8,
        boxShadow: theme.shadows[4],
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
        callbacks: tooltipCallbacks,
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
          color: theme.palette.text.secondary,
          font: {
            family: theme.typography.fontFamily,
            size: 12,
            weight: 'bold'
          },
          padding: 8
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
          padding: { top: 15 }
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
          },
          padding: 6
        },
        title: {
          display: true,
          text: 'Number of Absentees',
          color: theme.palette.text.primary,
          font: {
            size: 13,
            weight: 'bold',
            family: theme.typography.fontFamily
          },
          padding: { bottom: 10 }
        }
      }
    },
    onHover: (event, chartElement) => {
      event.native.target.style.cursor = chartElement.length ? 'pointer' : 'default';
    }
  };

  const valueLabelsPlugin = {
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
        const y = bar.y - 10;

        // Background box for better readability
        ctx.fillStyle = theme.palette.background.paper;
        ctx.fillRect(x - 18, y - 20, 36, 18);

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
      transition={{ duration: 0.5 }}
    >
      <Box sx={{
        width: '100%',
        overflow: 'auto',
        maxHeight: '80vh',
        '&::-webkit-scrollbar': { height: '8px', width: '8px' },
        '&::-webkit-scrollbar-thumb': {
          backgroundColor: theme.palette.mode === 'dark' ? theme.palette.grey[700] : theme.palette.grey[400],
          borderRadius: '4px'
        },
        '&::-webkit-scrollbar-track': {
          backgroundColor: theme.palette.mode === 'dark' ? theme.palette.grey[900] : theme.palette.grey[100]
        }
      }}>
        <Box
          sx={{
            minWidth: '800px',
            padding: '25px 20px 40px 10px',
            background: theme.palette.background.paper,
            borderRadius: '14px',
            boxShadow: theme.shadows[2],
            position: 'relative'
          }}
          style={{ height: 'calc(100vh - 200px)' }}
        >
          <Bar data={chartData} options={options} plugins={[valueLabelsPlugin]} />
        </Box>
        <Box sx={{ p: 2 }}>
          <Typography variant="body2" align="right" fontWeight="bold" color="text.secondary">
            Total Managers: {sortedManagers.length}
          </Typography>
        </Box>
      </Box>
    </motion.div>
  );
};

export default AbsenteeHeatmap;
