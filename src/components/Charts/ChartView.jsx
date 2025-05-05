import { useState, useRef } from 'react';
import { 
  Box, 
  Typography,
  Paper,
  Avatar,
  Button,
  useTheme,
  IconButton,
  styled
} from '@mui/material';
import { 
  FiDownload, 
  FiPieChart,
  FiChevronLeft,
  FiChevronRight
} from 'react-icons/fi';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import ScoreChart from './ScoreChart';
import SelfInterestChart from './SelfInterestChart';
import AbsenteeHeatmap from './AbsenteeHeatmap';
import AttendanceChart from './AttendanceChart';
import IntegrityTable from './IntegrityTable';

const ChartContainer = styled(Paper)(({ theme }) => ({
  width: '100%',
  height: 'calc(100vh - 180px)',
  overflow: 'hidden',
  position: 'relative',
  borderRadius: theme.shape.borderRadius,
  boxShadow: theme.shadows[2],
  backgroundColor: theme.palette.background.paper
}));

const ChartWrapper = styled(Box)({
  width: '100%',
  height: '100%',
  display: 'flex',
  transition: 'transform 0.3s ease'
});

const ChartView = ({ data, onToggleView }) => {
  const theme = useTheme();
  const [currentChart, setCurrentChart] = useState(0);
  const chartWrapperRef = useRef(null);

  const charts = [
    { title: 'Overall Score Distribution', component: <ScoreChart data={data} /> },
    { title: 'Self Interested Candidates', component: <SelfInterestChart data={data} /> },
    { title: 'Absentee Analysis by Manager', component: <AbsenteeHeatmap data={data} /> },
    { title: 'Attendance by Manager', component: <AttendanceChart data={data} /> },
    { title: 'Integrity Scores', component: <IntegrityTable data={data} /> }
  ];

  const handleDownloadPDF = async () => {
    try {
      const element = document.getElementById(`chart-${currentChart}`);
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        scrollY: -window.scrollY,
        scrollX: 0
      });
      
      const imgData = canvas.toDataURL('image/png', 1.0);
      const pdf = new jsPDF('landscape', 'pt', [canvas.width, canvas.height]);
      
      pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
      pdf.save(`${charts[currentChart].title}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
    }
  };

  const navigateChart = (direction) => {
    const newIndex = direction === 'next' 
      ? (currentChart + 1) % charts.length 
      : (currentChart - 1 + charts.length) % charts.length;
    
    setCurrentChart(newIndex);
    chartWrapperRef.current.style.transform = `translateX(-${newIndex * 100}%)`;
  };

  return (
    <Box sx={{ p: 3, height: '100vh', overflow: 'hidden' }}>
      <Box sx={{ 
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        mb: 3
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Avatar sx={{ 
            bgcolor: 'primary.main', 
            width: 48, 
            height: 48, 
            mr: 2 
          }}>
            <FiPieChart />
          </Avatar>
          <Typography variant="h4" sx={{ fontWeight: 700 }}>
            {charts[currentChart].title}
          </Typography>
        </Box>
        
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            onClick={onToggleView}
            sx={{ fontWeight: 600 }}
          >
            Back to Table
          </Button>
          <Button
            variant="contained"
            startIcon={<FiDownload />}
            onClick={handleDownloadPDF}
            sx={{ fontWeight: 600 }}
          >
            Export PDF
          </Button>
        </Box>
      </Box>

      <Box sx={{ position: 'relative' }}>
        <ChartContainer>
          <ChartWrapper ref={chartWrapperRef}>
            {charts.map((chart, index) => (
              <Box 
                key={index}
                id={`chart-${index}`}
                sx={{ 
                  minWidth: '100%', 
                  height: '100%',
                  p: 3,
                  boxSizing: 'border-box'
                }}
              >
                {chart.component}
              </Box>
            ))}
          </ChartWrapper>
        </ChartContainer>

        <IconButton
          onClick={() => navigateChart('prev')}
          sx={{
            position: 'absolute',
            left: 10,
            top: '50%',
            transform: 'translateY(-50%)',
            backgroundColor: theme.palette.background.paper,
            boxShadow: theme.shadows[2],
            '&:hover': {
              backgroundColor: theme.palette.grey[200]
            }
          }}
        >
          <FiChevronLeft />
        </IconButton>

        <IconButton
          onClick={() => navigateChart('next')}
          sx={{
            position: 'absolute',
            right: 10,
            top: '50%',
            transform: 'translateY(-50%)',
            backgroundColor: theme.palette.background.paper,
            boxShadow: theme.shadows[2],
            '&:hover': {
              backgroundColor: theme.palette.grey[200]
            }
          }}
        >
          <FiChevronRight />
        </IconButton>
      </Box>

      <Box sx={{ 
        display: 'flex',
        justifyContent: 'center',
        mt: 2,
        gap: 1
      }}>
        {charts.map((_, index) => (
          <Box
            key={index}
            onClick={() => {
              setCurrentChart(index);
              chartWrapperRef.current.style.transform = `translateX(-${index * 100}%)`;
            }}
            sx={{
              width: 10,
              height: 10,
              borderRadius: '50%',
              backgroundColor: currentChart === index 
                ? theme.palette.primary.main 
                : theme.palette.grey[400],
              cursor: 'pointer',
              transition: 'background-color 0.3s'
            }}
          />
        ))}
      </Box>
    </Box>
  );
};

export default ChartView;