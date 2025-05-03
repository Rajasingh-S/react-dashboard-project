import { 
  Box, 
  Grid, 
  Typography,
  IconButton,
  Toolbar,
  AppBar,
  useTheme,
  Paper,
  Tooltip,
  Button,
  Avatar
} from '@mui/material';
import { FiDownload, FiX, FiPieChart } from 'react-icons/fi';
import { motion } from 'framer-motion';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import ScoreChart from './ScoreChart';
import SelfInterestChart from './SelfInterestChart';
import AbsenteeHeatmap from './AbsenteeHeatmap';
import AttendanceChart from './AttendanceChart';
import IntegrityTable from './IntegrityTable';

const ChartView = ({ data, onToggleView, fullscreen, onToggleFullscreen }) => {
  const theme = useTheme();

  const handleDownloadPDF = async () => {
    try {
      const element = document.getElementById('chart-dashboard');
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        scrollY: -window.scrollY,
        scrollX: 0,
        windowWidth: element.scrollWidth,
        windowHeight: element.scrollHeight,
        logging: true,
        useCORS: true
      });
      
      const imgData = canvas.toDataURL('image/png', 1.0);
      const pdf = new jsPDF('landscape', 'pt', [canvas.width, canvas.height]);
      
      pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
      pdf.save('assessment-analytics.pdf');
    } catch (error) {
      console.error('Error generating PDF:', error);
    }
  };

  return (
    <Box
      id="chart-dashboard"
      sx={{
        bgcolor: fullscreen ? theme.palette.background.default : 'transparent',
        height: fullscreen ? '100vh' : 'auto',
        overflow: fullscreen ? 'auto' : 'visible',
        position: 'relative',
        p: fullscreen ? 0 : 3
      }}
    >
      {fullscreen && (
        <AppBar position="fixed" color="inherit" elevation={1}>
          <Toolbar>
            <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 700 }}>
              Assessment Analytics Dashboard
            </Typography>
            <Tooltip title="Download PDF">
              <IconButton onClick={handleDownloadPDF} color="inherit">
                <FiDownload />
              </IconButton>
            </Tooltip>
            <Tooltip title="Exit Fullscreen">
              <IconButton onClick={onToggleFullscreen} color="inherit">
                <FiX />
              </IconButton>
            </Tooltip>
          </Toolbar>
        </AppBar>
      )}

      <Box sx={{ 
        pt: fullscreen ? '64px' : 0,
        pb: fullscreen ? 0 : 3,
        height: fullscreen ? 'calc(100vh - 64px)' : 'auto',
        overflow: 'auto'
      }}>
        {!fullscreen && (
          <Box sx={{ 
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: 4,
            p: 3,
            bgcolor: 'background.paper',
            borderRadius: 2,
            boxShadow: theme.shadows[1]
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
                Assessment Analytics
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button
                variant="contained"
                startIcon={<FiDownload />}
                onClick={handleDownloadPDF}
                sx={{ fontWeight: 600 }}
              >
                Export PDF
              </Button>
              <Button
                variant="outlined"
                onClick={onToggleView}
                sx={{ fontWeight: 600 }}
              >
                Back to Table
              </Button>
            </Box>
          </Box>
        )}

        <Grid container spacing={3} sx={{ p: fullscreen ? 3 : 0 }}>
          {/* Row 1 - Split into 2 columns */}
          <Grid item container spacing={3} xs={12}>
            {/* Overall Score Chart */}
            <Grid item xs={12} md={6}>
              <Paper elevation={3} sx={{ 
                p: 2, 
                height: '100%', 
                minHeight: 400,
                display: 'flex',
                flexDirection: 'column'
              }}>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                  Overall Score
                </Typography>
                <Box sx={{ 
                  flex: 1,
                  position: 'relative',
                  minHeight: '300px'
                }}>
                  <ScoreChart data={data} />
                </Box>
              </Paper>
            </Grid>

            {/* Self Interested Candidates */}
            <Grid item xs={12} md={6}>
              <Paper elevation={3} sx={{ 
                p: 2, 
                height: '100%', 
                minHeight: 400,
                display: 'flex',
                flexDirection: 'column'
              }}>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                  Self Interested Candidates
                </Typography>
                <Box sx={{ 
                  flex: 1,
                  position: 'relative',
                  minHeight: '300px'
                }}>
                  <SelfInterestChart data={data} />
                </Box>
              </Paper>
            </Grid>
          </Grid>

          {/* Row 2 - Full width Absentee Chart */}
          <Grid item xs={12}>
            <Paper elevation={3} sx={{ 
              p: 2, 
              minHeight: 400,
              display: 'flex',
              flexDirection: 'column'
            }}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                Absentees Based on Manager
              </Typography>
              <Box sx={{ 
                flex: 1,
                position: 'relative',
                minHeight: '300px',
                overflow: 'auto'
              }}>
                <AbsenteeHeatmap data={data} />
              </Box>
            </Paper>
          </Grid>

          {/* Row 3 - Split into 2 columns */}
          <Grid item container spacing={3} xs={12}>
            {/* Employee Attended by Manager */}
            <Grid item xs={12} md={6}>
              <Paper elevation={3} sx={{ 
                p: 2, 
                height: '100%', 
                minHeight: 400,
                display: 'flex',
                flexDirection: 'column'
              }}>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                  Employee Attended by Manager
                </Typography>
                <Box sx={{ 
                  flex: 1,
                  position: 'relative',
                  minHeight: '300px'
                }}>
                  <AttendanceChart data={data} />
                </Box>
              </Paper>
            </Grid>

            {/* Integrity Score */}
            <Grid item xs={12} md={6}>
              <Paper elevation={3} sx={{ 
                p: 2, 
                height: '100%', 
                minHeight: 400,
                display: 'flex',
                flexDirection: 'column'
              }}>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                  Integrity Score Out of 10
                </Typography>
                <Box sx={{ 
                  flex: 1,
                  position: 'relative',
                  minHeight: '300px',
                  overflow: 'auto'
                }}>
                  <IntegrityTable data={data} />
                </Box>
              </Paper>
            </Grid>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
};

export default ChartView;