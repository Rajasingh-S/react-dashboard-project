import { useRef, useImperativeHandle, forwardRef, useMemo } from 'react';
import { Bar } from 'react-chartjs-2';
import { Box, useTheme } from '@mui/material';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ChartDataLabels
);

const SelfInterestChart = forwardRef(({ data }, ref) => {
  const theme = useTheme();
  const chartRef = useRef();

  useImperativeHandle(ref, () => ({
    downloadPDF: async () => {
      const canvasContainer = chartRef.current;
      const originalOverflow = canvasContainer.style.overflow;
      const originalHeight = canvasContainer.style.height;

      canvasContainer.style.overflow = 'visible';
      canvasContainer.style.height = 'auto';

      await new Promise(resolve => setTimeout(resolve, 500));

      const canvas = await html2canvas(canvasContainer, {
        scrollY: -window.scrollY,
        useCORS: true,
        scale: 2,
        logging: false,
        allowTaint: true
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('l', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      pdf.setFontSize(16);
      pdf.setTextColor(40);
      pdf.text('Self Interested Candidates', pdfWidth / 2, 15, { align: "center" });

      pdf.addImage(imgData, 'PNG', 0, 20, pdfWidth, pdfHeight - 20);

      const dateStr = new Date().toLocaleDateString();
      pdf.setFontSize(10);
      pdf.setTextColor(150);
      pdf.text(`Exported on ${dateStr}`, pdfWidth - 15, pdf.internal.pageSize.getHeight() - 10, {
        align: "right"
      });

      pdf.save('SelfInterestChart.pdf');

      canvasContainer.style.overflow = originalOverflow;
      canvasContainer.style.height = originalHeight;
    }
  }));

  const generateTealColors = (count) => {
    return Array.from({ length: count }, (_, i) =>
      `hsl(${180 + (i * 25) % 90}, 75%, ${50 + (i % 4) * 8}%)`
    );
  };

  const { chartData, options, totalScore } = useMemo(() => {
    const interestedData = data
      .filter(item => item['Self-Interested Candidate']?.toString().toLowerCase() === 'yes')
      .sort((a, b) => b['Overall Percentage'] - a['Overall Percentage']);

    const totalScore = interestedData.reduce((sum, item) => sum + (item['Overall Percentage'] || 0), 0);

    const isFewData = interestedData.length <= 5;
    const barThickness = isFewData ? 30 : 'flex';

    const chartData = {
      labels: interestedData.map(item => item.Name),
      datasets: [
        {
          label: 'Score (%)',
          data: interestedData.map(item => item['Overall Percentage']),
          backgroundColor: generateTealColors(interestedData.length),
          borderColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)',
          borderWidth: 1,
          borderRadius: 12,
          barThickness,
          hoverBorderWidth: 2,
          hoverBorderColor: theme.palette.warning.light,
        }
      ]
    };

    const options = {
      indexAxis: 'x',
      responsive: true,
      maintainAspectRatio: false,
      layout: { padding: 20 },
      animation: { duration: 1200, easing: 'easeOutBack' },
      plugins: {
        legend: { display: false },
        datalabels: {
          anchor: 'end',
          align: 'end',
          color: theme.palette.text.primary,
          font: { size: 12, weight: 'bold', family: "'Montserrat', sans-serif" },
          formatter: value => `${value}%`,
        },
        tooltip: {
          backgroundColor: theme.palette.background.paper,
          titleColor: theme.palette.warning.main,
          bodyColor: theme.palette.text.primary,
          borderColor: theme.palette.divider,
          borderWidth: 1,
          padding: 12,
          cornerRadius: 10,
          titleFont: { size: 14, weight: 'bold' },
          bodyFont: { size: 12 },
          callbacks: {
            label: context => {
              const item = interestedData[context.dataIndex];
              return [
                `Score: ${context.raw}%`,
                `Status: ${item.Status}`,
                `Course: ${item.Course}`,
                `Manager: ${item.Manager || 'N/A'}`,
                `Self-Interested: Yes`
              ];
            }
          }
        }
      },
      scales: {
        x: {
          grid: { display: false },
          ticks: {
            color: theme.palette.text.primary,
            font: { size: 12, weight: 'bold', family: "'Montserrat', sans-serif" }
          },
          title: {
            display: true,
            text: 'Candidates',
            color: theme.palette.primary.main,
            font: { size: 14, weight: 'bold' }
          }
        },
        y: {
          beginAtZero: true,
          suggestedMax: 100,
          grid: {
            color: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
            drawBorder: false
          },
          ticks: {
            color: theme.palette.text.secondary,
            font: { size: 12, weight: 'bold' }
          },
          title: {
            display: true,
            text: 'Score (%)',
            color: theme.palette.primary.main,
            font: { size: 14, weight: 'bold' }
          }
        }
      }
    };

    return { chartData, options, totalScore };
  }, [data, theme]);

  return (
    <Box 
      ref={chartRef} 
      data-pdf-export
      sx={{ 
        width: '100%',
        height: 'calc(100vh - 180px)',
        p: 2,
        background: theme.palette.mode === 'dark'
          ? 'linear-gradient(135deg, #1a1a2e, #16213e)'
          : 'linear-gradient(135deg, #f5f7fa, #e4e8f0)',
        borderRadius: 3,
        boxShadow: theme.shadows[3],
        overflow: 'hidden'
      }}
    >
      <Box sx={{ 
        width: '100%',
        height: '100%',
        overflow: 'auto',
        '&::-webkit-scrollbar': {
          width: 10,
          height: 10
        },
        '&::-webkit-scrollbar-thumb': {
          background: theme.palette.mode === 'dark'
            ? 'linear-gradient(135deg, #4a6fa5, #166d67)'
            : 'linear-gradient(135deg, #1976d2, #0288d1)',
          borderRadius: 10,
          border: theme.palette.mode === 'dark'
            ? '1px solid rgba(255,255,255,0.1)'
            : '1px solid rgba(255,255,255,0.3)'
        },
        '&::-webkit-scrollbar-track': {
          background: theme.palette.mode === 'dark'
            ? 'rgba(255,255,255,0.05)'
            : 'rgba(0,0,0,0.05)',
          borderRadius: 10
        },
        '&::-webkit-scrollbar-corner': {
          background: 'transparent'
        }
      }}>
        <Box sx={{ 
          minWidth: 'fit-content',
          minHeight: 'fit-content',
          padding: 1
        }}>
          <Bar 
            data={chartData} 
            options={options} 
            style={{ 
              minWidth: Math.max(chartData.labels.length * 100, 800),
              minHeight: 500 
            }}
          />
        </Box>
      </Box>
      <Box sx={{ 
        mt: 2, 
        textAlign: 'right', 
        fontWeight: 'bold',
        color: theme.palette.text.primary,
        fontFamily: "'Montserrat', sans-serif"
      }}>
        Total Combined Score: {totalScore.toFixed(2)}%
      </Box>
    </Box>
  );
});

export default SelfInterestChart;