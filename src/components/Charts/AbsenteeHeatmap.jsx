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
    const manager = item.Manager?.trim() || 'Unknown';
    const isAbsent = item['Attendance Status (Present?)']?.toString().toLowerCase() === 'no';
    
    if (!acc[manager]) {
      acc[manager] = { count: 0, total: 0 };
    }
    acc[manager].total++;
    if (isAbsent) {
      acc[manager].count++;
    }
    return acc;
  }, {});

  // Sort managers by absentee count (descending)
  const sortedManagers = Object.keys(absenteeData).sort(
    (a, b) => absenteeData[b].count - absenteeData[a].count
  );

  // Get max count for scaling
  const maxCount = Math.max(...Object.values(absenteeData).map(item => item.count));

  // Prepare chart data
  const chartData = {
    labels: sortedManagers,
    datasets: [{
      label: 'Number of Absentees',
      data: sortedManagers.map(manager => absenteeData[manager].count),
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
            return [`Manager: ${context[0].label}`];
          },
          label: (context) => {
            const managerData = absenteeData[context[0].label];
            const percentage = Math.round((managerData.count / managerData.total) * 100);
            return [
              `Absent: ${context.raw}`,
              `Present: ${managerData.total - managerData.count}`,
              `Total: ${managerData.total}`,
              `Absentee Rate: ${percentage}%`
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
            family: theme.typography.fontFamily,
            size: 12
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
        max: Math.ceil(maxCount * 1.1), // Add 10% padding to max value
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
          callback: (value) => {
            if (value === 0) return '0';
            if (value === Math.ceil(maxCount)) return maxCount;
            return value;
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
        
        // Draw text background for better visibility
        ctx.fillStyle = theme.palette.background.paper;
        ctx.fillRect(xPos - 15, yPos - 20, 30, 20);
        
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
          backgroundColor: theme.palette.mode === 'dark' 
            ? theme.palette.grey[700] 
            : theme.palette.grey[400],
          borderRadius: '4px'
        },
        '&::-webkit-scrollbar-track': {
          backgroundColor: theme.palette.mode === 'dark' 
            ? theme.palette.grey[900] 
            : theme.palette.grey[100]
        }
      }}>
        <Box sx={{
          width: '100%',
          minHeight: '500px',
          position: 'relative'
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

export default AbsenteeHeatmap;