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
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
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
    {
      title: "Overall Score Distribution",
      component: <ScoreChart data={filteredData} />,
    },
    {
      title: "Self Interested Candidates",
      component: <SelfInterestChart data={filteredData} />,
    },
    {
      title: "Absentee Analysis by Manager",
      component: <AbsenteeHeatmap data={filteredData} />,
    },
    {
      title: "Attendance by Manager",
      component: <AttendanceChart data={filteredData} />,
    },
    {
      title: "Integrity Scores",
      component: <IntegrityTable data={filteredData} />,
    },
  ];

  const handleDownloadPDF = async () => {
    try {
      const element = document.getElementById(`chart-${currentChart}`);
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        scrollY: -window.scrollY,
        scrollX: 0,
      });

      const imgData = canvas.toDataURL("image/png", 1.0);
      const pdf = new jsPDF("landscape", "pt", [canvas.width, canvas.height]);

      pdf.addImage(imgData, "PNG", 0, 0, canvas.width, canvas.height);
      pdf.save(`${charts[currentChart].title}.pdf`);
    } catch (error) {
      console.error("Error generating PDF:", error);
    }
  };

  const navigateChart = (direction) => {
    const newIndex =
      direction === "next"
        ? (currentChart + 1) % charts.length
        : (currentChart - 1 + charts.length) % charts.length;

    setCurrentChart(newIndex);
    chartWrapperRef.current.style.transform = `translateX(-${newIndex * 100}%)`;
  };

  return (
    <Box sx={{ p: 3, height: "100vh", overflow: "hidden" }}>
      {/* Responsive Header Section */}
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
        {/* Title Section */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            width: isMobile ? "100%" : "auto",
            minWidth: isTablet ? "200px" : "300px",
          }}
        >
          <Avatar
            sx={{
              bgcolor: "primary.main",
              width: 48,
              height: 48,
              mr: 2,
            }}
          >
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

        {/* Controls Section */}
        <Box
          sx={{
            display: "flex",
            flexDirection: isMobile ? "column" : "row",
            gap: 2,
            width: isMobile ? "100%" : "auto",
            alignItems: "stretch",
          }}
        >
        

          {/* Manager Filter */}
          <FormControl
            size="small"
            sx={{
              minWidth: isMobile ? "100%" : 180,
              "& .MuiSelect-select": {
                py: "8px",
              },
            }}
          >
            <Select
              value={selectedManager}
              onChange={(e) => setSelectedManager(e.target.value)}
              sx={{
                height: "36px",
                backgroundColor: theme.palette.primary.main,
                color: theme.palette.primary.contrastText,
                "& .MuiOutlinedInput-notchedOutline": {
                  borderColor: theme.palette.primary.main,
                },
                "&:hover .MuiOutlinedInput-notchedOutline": {
                  borderColor: theme.palette.primary.dark,
                },
              }}
            >
              {managers.map((manager) => (
                <MenuItem
                  key={manager}
                  value={manager}
                  sx={{
                    "&.Mui-selected": {
                      backgroundColor: `${theme.palette.primary.light} !important`,
                    },
                  }}
                >
                  {manager}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Buttons Group */}
          <Box
            sx={{
              display: "flex",
              gap: 2,
              flexDirection: isMobile ? "row" : "row",
              width: isMobile ? "100%" : "auto",
            }}
          >
            <Button
              variant="contained"
              startIcon={<FiDownload />}
              onClick={handleDownloadPDF}
              sx={{
                height: "36px",
                minWidth: isMobile ? "50%" : "120px",
                textTransform: "none",
                flex: isMobile ? 1 : "none",
              }}
            >
              Export PDF
            </Button>
          </Box>
          <Button
            variant="outlined"
            onClick={onToggleView}
            sx={{
              height: "36px",
              minWidth: isMobile ? "50%" : "120px",
              textTransform: "none",
              flex: isMobile ? 1 : "none",
              fontWeight: "bold",
              color: "#1976d2",
              borderColor: "#1976d2",
              backgroundColor: "#ffffff",
              transition: "all 0.3s ease",
              "&:hover": {
                backgroundColor: "#1976d2",
                color: "#ffffff",
                borderColor: "#1976d2",
                boxShadow: "0 4px 12px rgba(25, 118, 210, 0.2)",
              },
              "&:active": {
                backgroundColor: "#115293",
                borderColor: "#115293",
                boxShadow: "none",
              },
            }}
          >
            Back to Table
          </Button>
        </Box>
      </Box>

      {/* Chart Container */}
      <Box sx={{ position: "relative" }}>
        <ChartContainer>
          <ChartWrapper ref={chartWrapperRef}>
            {charts.map((chart, index) => (
              <Box
                key={index}
                id={`chart-${index}`}
                sx={{
                  minWidth: "100%",
                  height: "100%",
                  p: 3,
                  boxSizing: "border-box",
                }}
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
            left: 10,
            top: "50%",
            transform: "translateY(-50%)",
            backgroundColor: theme.palette.background.paper,
            boxShadow: theme.shadows[2],
            "&:hover": {
              backgroundColor: theme.palette.grey[200],
            },
          }}
        >
          <FiChevronLeft />
        </IconButton>

        <IconButton
          onClick={() => navigateChart("next")}
          sx={{
            position: "absolute",
            right: 10,
            top: "50%",
            transform: "translateY(-50%)",
            backgroundColor: theme.palette.background.paper,
            boxShadow: theme.shadows[2],
            "&:hover": {
              backgroundColor: theme.palette.grey[200],
            },
          }}
        >
          <FiChevronRight />
        </IconButton>
      </Box>

      {/* Navigation Dots */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          mt: 2,
          gap: 1,
        }}
      >
        {charts.map((_, index) => (
          <Box
            key={index}
            onClick={() => {
              setCurrentChart(index);
              chartWrapperRef.current.style.transform = `translateX(-${
                index * 100
              }%)`;
            }}
            sx={{
              width: 10,
              height: 10,
              borderRadius: "50%",
              backgroundColor:
                currentChart === index
                  ? theme.palette.primary.main
                  : theme.palette.grey[400],
              cursor: "pointer",
              transition: "background-color 0.3s",
            }}
          />
        ))}
      </Box>
    </Box>
  );
};

export default ChartView;
