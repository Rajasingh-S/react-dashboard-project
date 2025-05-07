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
import { interpolateRainbow } from 'd3-scale-chromatic';

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

  const chartData = {
    labels: sortedManagers,
    datasets: [{
      label: 'Number of Absentees',
      data: sortedManagers.map(manager => absenteeData[manager].count),
      backgroundColor: sortedManagers.map((_, i) => interpolateRainbow(i / sortedManagers.length)),
      borderColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.1)',
      borderWidth: 1,
      borderRadius: 8,
      barThickness: 40,
      hoverBorderWidth: 3,
      hoverBorderColor: theme.palette.error.light,
      hoverBackgroundColor: sortedManagers.map((_, i) => interpolateRainbow(i / sortedManagers.length)),
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
      duration: 1500,
      easing: 'elasticOut',
      delay: (context) => context.dataIndex * 80
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
      legend: { 
        display: false 
      },
      tooltip: {
        enabled: true,
        backgroundColor: theme.palette.background.default,
        titleColor: theme.palette.error.light,
        bodyColor: theme.palette.text.primary,
        borderColor: theme.palette.divider,
        borderWidth: 2,
        padding: 16,
        cornerRadius: 12,
        boxShadow: theme.shadows[10],
        titleFont: {
          size: 16,
          weight: 'bold',
          family: theme.typography.fontFamily
        },
        bodyFont: {
          size: 14,
          family: theme.typography.fontFamily
        },
        footerFont: {
          size: 12,
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
          text: 'Number of Absentees',
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

  const valueLabelsPlugin = {
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
            plugins={[valueLabelsPlugin]} 
          />
        </Box>
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <Typography 
            variant="subtitle1" 
            align="right" 
            sx={{ 
              mt: 2,
              fontWeight: 'bold',
              background: theme.palette.mode === 'dark' 
                ? 'linear-gradient(90deg, #ff6b6b, #feca57)' 
                : 'linear-gradient(90deg, #5f27cd, #1dd1a1)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              fontSize: '16px'
            }}
          >
            Total Managers: {sortedManagers.length}
          </Typography>
        </motion.div>
      </Box>
    </motion.div>
  );
};

export default AbsenteeHeatmap;