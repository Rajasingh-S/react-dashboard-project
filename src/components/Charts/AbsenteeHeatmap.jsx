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
import { interpolateCool } from 'd3-scale-chromatic';
import { motion } from 'framer-motion';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const AbsenteeHeatmap = ({ data }) => {
  const theme = useTheme();

  // Calculate absentee counts by manager
  const absenteeData = data.reduce((acc, item) => {
    const manager = item.Manager || 'Unknown';
    const isAbsent = item['Attendance Status (Present?)']?.toString().toLowerCase() === 'no';
    
    if (!acc[manager]) {
      acc[manager] = 0;
    }
    if (isAbsent) {
      acc[manager]++;
    }
    return acc;
  }, {});

  // Sort managers by absentee count (descending)
  const sortedManagers = Object.keys(absenteeData).sort(
    (a, b) => absenteeData[b] - absenteeData[a]
  );

  // Enhanced tooltip data
  const getTooltipData = (manager) => {
    const managerData = data.filter(item => (item.Manager || 'Unknown') === manager);
    const presentCount = managerData.filter(item => 
      item['Attendance Status (Present?)']?.toString().toLowerCase() === 'yes'
    ).length;
    
    return {
      total: managerData.length,
      present: presentCount,
      rate: Math.round((absenteeData[manager] / managerData.length) * 100)
    };
  };

  // Prepare chart data
  const chartData = {
    labels: sortedManagers,
    datasets: [{
      label: 'Number of Absentees',
      data: sortedManagers.map(manager => absenteeData[manager]),
      backgroundColor: sortedManagers.map((_, index) => 
        interpolateCool(index / (sortedManagers.length * 1.2))
      ),
      borderColor: theme.palette.mode === 'dark' 
        ? 'rgba(255, 255, 255, 0.15)' 
        : 'rgba(0, 0, 0, 0.1)',
      borderWidth: 1.5,
      borderRadius: 6,
      hoverBorderWidth: 2,
      hoverBorderColor: theme.palette.error.main,
      hoverBackgroundColor: sortedManagers.map((_, index) => 
        interpolateCool(index / (sortedManagers.length * 1.2))
      )
    }]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    indexAxis: 'x',
    animation: {
      duration: 1000,
      easing: 'easeOutBack',
      delay: (context) => context.dataIndex * 60
    },
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        enabled: true,
        position: 'nearest',
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
        callbacks: {
          title: (context) => {
            return [`${context[0].label}`];
          },
          label: (context) => {
            const tooltipData = getTooltipData(context[0].label);
            return [
              `Absent: ${context.raw}`,
              `Present: ${tooltipData.present}`,
              `Total: ${tooltipData.total}`,
              `Absentee Rate: ${tooltipData.rate}%`
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
          color: theme.palette.text.secondary,
          font: {
            family: theme.typography.fontFamily
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
        grid: {
          color: theme.palette.divider,
          drawBorder: false,
          lineWidth: 0.5
        },
        ticks: {
          color: theme.palette.text.secondary,
          precision: 0,
          font: {
            family: theme.typography.fontFamily
          }
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
          padding: { bottom: 15 }
        }
      }
    },
    onHover: (event, chartElement) => {
      if (chartElement.length) {
        event.native.target.style.cursor = 'pointer';
      } else {
        event.native.target.style.cursor = 'default';
      }
    }
  };

  // Custom plugin for value labels
  const valueLabelPlugin = {
    id: 'valueLabels',
    afterDatasetsDraw(chart) {
      const { ctx, data, chartArea: { top, bottom, left, right } } = chart;
      
      ctx.save();
      ctx.font = `bold 12px ${theme.typography.fontFamily}`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'bottom';

      chart.getDatasetMeta(0).data.forEach((bar, index) => {
        const value = data.datasets[0].data[index];
        const xPos = bar.x;
        const yPos = bar.y - 8;
        
        // Text shadow for better visibility
        ctx.shadowColor = theme.palette.background.paper;
        ctx.shadowBlur = 8;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;
        
        ctx.fillStyle = theme.palette.text.primary;
        ctx.fillText(value, xPos, yPos);
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
        height: '500px',
        position: 'relative',
        padding: '15px',
        background: theme.palette.background.paper,
        borderRadius: '12px',
        boxShadow: theme.shadows[2]
      }}>
        <Bar 
          data={chartData} 
          options={options}
          plugins={[valueLabelPlugin]}
        />
      </Box>
    </motion.div>
  );
};

export default AbsenteeHeatmap;