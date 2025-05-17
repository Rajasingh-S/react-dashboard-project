import { useState, useRef, useMemo } from "react";
import {
  Box,
  Typography,
  Paper,
  Avatar,
  Button,
  useTheme,
  IconButton,
  styled,
  FormControl,
  Select,
  MenuItem,
  useMediaQuery,
} from "@mui/material";
import {
  FiDownload,
  FiPieChart,
  FiChevronLeft,
  FiChevronRight,
} from "react-icons/fi";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import ScoreChart from "./ScoreChart";
import SelfInterestChart from "./SelfInterestChart";
import AbsenteeHeatmap from "./AbsenteeHeatmap";
import AttendanceChart from "./AttendanceChart";
import IntegrityTable from "./IntegrityTable";

const ChartContainer = styled(Paper)(({ theme }) => ({
  width: "100%",
  height: "calc(100vh - 180px)",
  overflow: "hidden",
  position: "relative",
  borderRadius: theme.shape.borderRadius,
  boxShadow: theme.shadows[2],
  backgroundColor: theme.palette.background.paper,
}));

const ChartWrapper = styled(Box)({
  width: "100%",
  height: "100%",
  display: "flex",
  transition: "transform 0.3s ease",
});

const ChartView = ({ data, onToggleView }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery("(max-width:600px)");
  const isTablet = useMediaQuery("(max-width:900px)");
  const [currentChart, setCurrentChart] = useState(0);
  const [selectedManager, setSelectedManager] = useState("All Managers");
  const chartWrapperRef = useRef(null);
  const chartRefs = useRef([]);

  const managers = useMemo(() => {
    const managerSet = new Set();
    data.forEach((item) => {
      const manager = item.Manager?.trim() || "Unknown";
      managerSet.add(manager);
    });
    return ["All Managers", ...Array.from(managerSet).sort()];
  }, [data]);

  const filteredData = useMemo(() => {
    if (selectedManager === "All Managers") return data;
    return data.filter((item) => {
      const manager = item.Manager?.trim() || "Unknown";
      return manager === selectedManager;
    });
  }, [data, selectedManager]);

  const charts = [
    { title: "Overall Score Distribution", component: <ScoreChart data={filteredData} /> },
    { title: "Self Interested Candidates", component: <SelfInterestChart data={filteredData} /> },
    { title: "Absentee Analysis by Manager", component: <AbsenteeHeatmap data={filteredData} /> },
    { title: "Attendance by Manager", component: <AttendanceChart data={filteredData} /> },
    { title: "Integrity Scores", component: <IntegrityTable data={filteredData} /> },
  ];

  const handleDownloadPDF = async () => {
    try {
      const chartWrapper = chartRefs.current[currentChart];
      if (!chartWrapper) return console.error("Chart wrapper not found.");

      // Special handling for IntegrityTable (index 4)
      if (currentChart === 4) {
        const container = chartWrapper.querySelector('[data-export-container]');
        if (!container) return;

        const originalStyles = {
          overflow: container.style.overflow,
          height: container.style.height,
          position: container.style.position
        };

        // Force show all content
        container.style.overflow = 'visible';
        container.style.height = 'auto';
        container.style.position = 'relative';

        await new Promise(resolve => setTimeout(resolve, 500));

        const canvas = await html2canvas(container, {
          scrollY: -window.scrollY,
          useCORS: true,
          scale: 2,
          logging: false,
          allowTaint: true,
          width: container.scrollWidth,
          height: container.scrollHeight,
          windowWidth: container.scrollWidth,
          windowHeight: container.scrollHeight
        });

        const pdf = new jsPDF('l', 'mm', [
          canvas.width * 0.264583, 
          canvas.height * 0.264583
        ]);

        pdf.addImage(canvas, 'PNG', 0, 0, 
          pdf.internal.pageSize.getWidth(), 
          pdf.internal.pageSize.getHeight()
        );

        // Restore original styles
        container.style.overflow = originalStyles.overflow;
        container.style.height = originalStyles.height;
        container.style.position = originalStyles.position;

        pdf.save('Integrity-Table.pdf');
        return;
      }

      // Default handling for other charts
      const scrollContainer = chartWrapper.querySelector('[data-export-container]') || chartWrapper;
      
      const originalOverflow = scrollContainer.style.overflow;
      const originalHeight = scrollContainer.style.height;
      
      scrollContainer.style.overflow = 'visible';
      scrollContainer.style.height = 'auto';

      await new Promise(resolve => setTimeout(resolve, 300));

      const canvas = await html2canvas(scrollContainer, {
        scrollX: -window.scrollX,
        scrollY: -window.scrollY,
        useCORS: true,
        scale: 2,
        logging: false,
        allowTaint: true
      });

      const imgData = canvas.toDataURL('image/png', 1.0);
      const pdf = new jsPDF({
        orientation: currentChart === 0 ? 'portrait' : 'landscape',
        unit: 'mm'
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      pdf.setFontSize(16);
      pdf.setTextColor(40);
      pdf.text(charts[currentChart].title, pdfWidth / 2, 15, { align: "center" });

      pdf.addImage(imgData, 'PNG', 0, 20, pdfWidth, pdfHeight - 20);

      const dateStr = new Date().toLocaleDateString();
      pdf.setFontSize(10);
      pdf.setTextColor(150);
      pdf.text(`Exported on ${dateStr}`, pdfWidth - 15, pdf.internal.pageSize.getHeight() - 10, {
        align: "right"
      });

      const filename = charts[currentChart].title.replace(/[/\\?%*:|"<>]/g, "-");
      pdf.save(`${filename}.pdf`);

      scrollContainer.style.overflow = originalOverflow;
      scrollContainer.style.height = originalHeight;
    } catch (err) {
      console.error("PDF export failed:", err);
    }
  };

  const navigateChart = (direction) => {
    const newIndex =
      direction === "next"
        ? (currentChart + 1) % charts.length
        : (currentChart - 1 + charts.length) % charts.length;
    setCurrentChart(newIndex);
    if (chartWrapperRef.current) {
      chartWrapperRef.current.style.transform = `translateX(-${newIndex * 100}%)`;
    }
  };

  return (
    <Box sx={{ p: 3, height: "100vh", overflow: "hidden" }}>
      <Box
        sx={{
          display: "flex",
          flexDirection: isMobile ? "column" : "row",
          justifyContent: "space-between",
          alignItems: isMobile ? "flex-start" : "center",
          mb: 3,
          gap: 2,
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            width: isMobile ? "100%" : "auto",
            minWidth: isTablet ? "200px" : "300px",
          }}
        >
          <Avatar sx={{ bgcolor: "primary.main", width: 48, height: 48, mr: 2 }}>
            <FiPieChart />
          </Avatar>
          <Typography
            variant={isMobile ? "h6" : "h5"}
            sx={{
              fontWeight: 700,
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {charts[currentChart].title}
          </Typography>
        </Box>

        <Box
          sx={{
            display: "flex",
            flexDirection: isMobile ? "column" : "row",
            gap: 2,
            width: isMobile ? "100%" : "auto",
          }}
        >
          <Button
            variant="outlined"
            onClick={onToggleView}
            sx={{
              height: 36,
              minWidth: isMobile ? "50%" : 120,
              textTransform: "none",
              fontWeight: "bold",
              color: "#1976d2",
              borderColor: "#1976d2",
              backgroundColor: "#ffffff",
              '&:hover': {
                backgroundColor: "#1976d2",
                color: "#ffffff",
                boxShadow: "0 4px 12px rgba(25, 118, 210, 0.2)",
              },
            }}
          >
            Back to Table
          </Button>
          <FormControl size="small" sx={{ minWidth: isMobile ? "100%" : 180 }}>
            <Select
              value={selectedManager}
              onChange={(e) => setSelectedManager(e.target.value)}
              sx={{
                height: 36,
                backgroundColor: theme.palette.primary.main,
                color: theme.palette.primary.contrastText,
              }}
            >
              {managers.map((manager) => (
                <MenuItem key={manager} value={manager}>
                  {manager}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <Button
            variant="contained"
            startIcon={<FiDownload />}
            onClick={handleDownloadPDF}
            sx={{ height: 36, minWidth: isMobile ? "50%" : 120, textTransform: "none" }}
          >
            Export PDF
          </Button>
        </Box>
      </Box>

      <Box sx={{ position: "relative" }}>
        <ChartContainer>
          <ChartWrapper ref={chartWrapperRef}>
            {charts.map((chart, index) => (
              <Box
                key={index}
                ref={(el) => (chartRefs.current[index] = el)}
                sx={{ minWidth: "100%", height: "100%", p: 2 }}
              >
                {chart.component}
              </Box>
            ))}
          </ChartWrapper>
        </ChartContainer>

        <IconButton
          onClick={() => navigateChart("prev")}
          sx={{
            position: "absolute",
            top: "50%",
            left: 10,
            transform: "translateY(-50%)",
          }}
        >
          <FiChevronLeft />
        </IconButton>
        <IconButton
          onClick={() => navigateChart("next")}
          sx={{
            position: "absolute",
            top: "50%",
            right: 10,
            transform: "translateY(-50%)",
          }}
        >
          <FiChevronRight />
        </IconButton>
      </Box>
    </Box>
  );
};

export default ChartView;