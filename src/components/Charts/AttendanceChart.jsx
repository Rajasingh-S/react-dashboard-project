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
import { useMemo } from 'react';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const AttendanceChart = ({ data = [] }) => {
  const theme = useTheme();

  const { chartData, chartOptions, maxPresent, attendanceSummary } = useMemo(() => {
    const summary = data.reduce((acc, { Manager = 'Unknown', 'Attendance Status (Present?)': status }) => {
      const manager = Manager.trim() || 'Unknown';
      const isPresent = status?.toString().toLowerCase() === 'yes';
      if (!acc[manager]) acc[manager] = { present: 0, total: 0 };
      acc[manager].total++;
      if (isPresent) acc[manager].present++;
      return acc;
    }, {});

    const sortedManagers = Object.keys(summary).sort(
      (a, b) => summary[b].present - summary[a].present
    );

    const maxPresent = Math.max(...sortedManagers.map(mgr => summary[mgr].present));

    const generateBlueColors = (count) => {
      return Array.from({ length: count }, (_, i) => 
        `hsl(${200 + (i * 20) % 80}, 80%, ${50 + (i % 4) * 7}%)`
      );
    };

    const chartData = {
      labels: sortedManagers,
      datasets: [{
        label: 'Number of Present Employees',
        data: sortedManagers.map(mgr => summary[mgr].present),
        backgroundColor: generateBlueColors(sortedManagers.length),
        borderColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)',
        borderWidth: 1,
        borderRadius: 8,
        barThickness: 40,
        hoverBorderWidth: 3,
        hoverBorderColor: theme.palette.success.light,
      }]
    };

    const chartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      indexAxis: 'x',
      layout: {
        padding: { top: 30, right: 40, bottom: 50, left: 30 }
      },
      animation: {
        duration: 1500,
        easing: 'backOut',
        delay: ctx => ctx.dataIndex * 70
      },
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: theme.palette.background.default,
          titleColor: theme.palette.success.light,
          bodyColor: theme.palette.text.primary,
          borderColor: theme.palette.divider,
          borderWidth: 2,
          padding: 16,
          cornerRadius: 12,
          callbacks: {
            title: (context) => [`Manager: ${context[0].label}`],
            label: (context) => {
              const mgrData = summary[context.label];
              const percent = Math.round((mgrData.present / mgrData.total) * 100);
              return [
                `Present: ${context.raw}`,
                `Absent: ${mgrData.total - mgrData.present}`,
                `Total: ${mgrData.total}`,
                `Attendance Rate: ${percent}%`
              ];
            },
            footer: () => ['Click for employee details']
          },
          displayColors: false,
        },
      },
      scales: {
        x: {
          grid: { display: false },
          ticks: {
            color: theme.palette.text.primary,
            font: { family: "'Montserrat', sans-serif", size: 13, weight: 'bold' },
            padding: 10
          },
          title: {
            display: true,
            text: 'Managers',
            font: { size: 16, weight: 'bold', family: "'Montserrat', sans-serif" },
            color: theme.palette.primary.light,
            padding: { top: 20 }
          }
        },
        y: {
          beginAtZero: true,
          max: Math.ceil(maxPresent * 1.2),
          grid: {
            color: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
          },
          ticks: {
            color: theme.palette.text.secondary,
            font: { family: "'Montserrat', sans-serif", size: 13 },
            padding: 10
          },
          title: {
            display: true,
            text: 'No. of Employees Present',
            font: { size: 16, weight: 'bold', family: "'Montserrat', sans-serif" },
            color: theme.palette.primary.light,
            padding: { bottom: 20 }
          }
        }
      },
      onHover: (event, chartElement) => {
        event.native.target.style.cursor = chartElement.length ? 'pointer' : 'default';
      }
    };

    return { chartData, chartOptions, maxPresent, attendanceSummary: summary };
  }, [data, theme]);

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
        const { x, y } = bar.tooltipPosition();
        ctx.fillStyle = theme.palette.background.paper;
        ctx.shadowColor = 'rgba(0,0,0,0.2)';
        ctx.shadowBlur = 8;
        ctx.fillRect(x - 22, y - 24, 44, 24);

        ctx.shadowColor = 'transparent';
        ctx.fillStyle = theme.palette.text.primary;
        ctx.fillText(value, x, y - 6);
      });

      ctx.restore();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6 }}
    >
      <Box
        sx={{
          width: '100%',
          height: 'calc(100vh - 180px)',
          borderRadius: '18px',
          background: theme.palette.mode === 'dark'
            ? 'linear-gradient(135deg, #1a1a2e, #16213e)'
            : 'linear-gradient(135deg, #f5f7fa, #e4e8f0)',
          boxShadow: theme.shadows[10],
          p: 4,
          overflow: 'hidden',
          border: theme.palette.mode === 'dark'
            ? '1px solid rgba(255,255,255,0.1)'
            : '1px solid rgba(0,0,0,0.1)'
        }}
      >
        <Box
          sx={{
            width: '100%',
            height: '100%',
            overflow: 'auto',
            '&::-webkit-scrollbar': { width: '8px' },
            '&::-webkit-scrollbar-thumb': {
              background: theme.palette.mode === 'dark'
                ? 'linear-gradient(135deg, #4a6fa5, #166d67)'
                : 'linear-gradient(135deg, #1976d2, #0288d1)',
              borderRadius: 10,
            }
          }}
        >
          <Bar data={chartData} options={chartOptions} plugins={[valueLabelPlugin]} />
        </Box>
      </Box>
    </motion.div>
  );
};

export default AttendanceChart;