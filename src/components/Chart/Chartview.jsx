import React, {useMemo, useEffect, useState } from 'react';
import { Bar, Pie, Line, Doughnut } from 'react-chartjs-2';
import './chart.css';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
  Filler
} from 'chart.js';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { FiDownload, FiChevronLeft, FiChevronRight, FiPrinter } from 'react-icons/fi';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
  Filler
);

const Chartview = () => {
  const blue = '#3b82f6';

  const charts = [
    {
      title: 'Qualification Status',
      type: 'pie',
      data: {
        labels: ['Qualified', 'Not Qualified'],
        datasets: [{
          data: [19, 41],
          backgroundColor: ['#10b981', '#3b82f6'],
          borderColor: 'white',
          borderWidth: 2
        }]
      },
      options: {
        responsive: true,
        plugins: {
          title: {
            display: true,
            text: 'Qualification Status'
          },
          legend: {
            position: 'right',
            labels: {
              usePointStyle: true,
              color: '#374151'
            }
          }
        }
      }
    },
    {
      title: 'Score Category Overview',
      type: 'bar',
      data: {
        labels: ['1-50', '51-70', '71-100'],
        datasets: [{
          label: 'Student Count',
          data: [39, 4, 15],
          backgroundColor: [blue, blue, blue],
          borderRadius: 6,
          borderColor: 'white',
          borderWidth: 2
        }]
      },
      options: {
        responsive: true,
        plugins: {
          title: {
            display: true,
            text: 'Score Category Overview'
          },
          legend: { display: false }
        },
        scales: {
          y: { beginAtZero: true },
          x: {}
        }
      }
    },
    {
      title: 'Department-Wise Average Score',
      type: 'bar',
      data: {
        labels: ['CSE', 'Mechanical', 'ECE'],
        datasets: [{
          data: [46, 33, 15],
          backgroundColor: [blue, blue, blue],
          borderColor: 'white',
          borderWidth: 2
        }]
      },
      options: {
        responsive: true,
        plugins: {
          title: {
            display: true,
            text: 'Department-Wise Average Score'
          },
          legend: {
            position: 'bottom',
            labels: {
              usePointStyle: true,
              color: '#374151'
            }
          }
        }
      }
    },
    {
      title: 'Integrity Score Distribution',
      type: 'bar',
      data: {
        labels: ['5', '6', '7', '8', '9', '10'],
        datasets: [{
          label: 'No. of Students',
          data: [1, 6, 2, 6, 0, 51],
          backgroundColor: blue,
          borderColor: blue,
          fill: true,
          tension: 0.4
        }]
      },
      options: {
        responsive: true,
        plugins: {
          title: {
            display: true,
            text: 'Integrity Score Distribution'
          },
          legend: { display: false }
        },
        scales: {
          y: { beginAtZero: true },
          x: {}
        }
      }
    }
  ];

  // State for filter text input
  const [filterText, setFilterText] = useState('');
  // Filtered charts based on filterText matching title (case insensitive)
  const filteredCharts = charts.filter(chart =>
    chart.title.toLowerCase().includes(filterText.toLowerCase())
  );

  // Refs for filtered charts
  const chartRefs = useMemo(() => filteredCharts.map(() => React.createRef()), [filteredCharts.length]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [chartsReady, setChartsReady] = useState(false);

  // Reset currentSlide to 0 if filter changes and currentSlide is out of range
  useEffect(() => {
    if (currentSlide >= filteredCharts.length) {
      setCurrentSlide(0);
    }
  }, [filteredCharts.length, currentSlide]);

  useEffect(() => {
    const interval = setInterval(() => {
      const allLoaded = chartRefs.every(ref => ref.current && ref.current.canvas);
      if (allLoaded) {
        clearInterval(interval);
        setChartsReady(true);
      }
    }, 500);
    return () => clearInterval(interval);
  }, [chartRefs]);

  const downloadChartAsImage = () => {
    const canvas = chartRefs[currentSlide]?.current?.canvas;
    if (!canvas) return;
    const image = canvas.toDataURL('image/png', 1.0);
    const link = document.createElement('a');
    link.download = `${filteredCharts[currentSlide].title.replace(/\s+/g, '_')}.png`;
    link.href = image;
    link.click();
  };

  const downloadAllAsPDF = () => {
    const doc = new jsPDF('landscape');
    filteredCharts.forEach((chart, i) => {
      const chartRef = chartRefs[i]?.current;
      if (!chartRef || !chartRef.canvas) return;
      if (i > 0) doc.addPage('landscape');
      doc.setFontSize(16);
      doc.text(chart.title, 148, 20, { align: 'center' });
      const canvas = chartRef.canvas;
      const imgData = canvas.toDataURL('image/png', 1.0);
      doc.addImage(imgData, 'PNG', 20, 30, 250, 120);
    });
    doc.save('Assessment_Report.pdf');
  };

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % filteredCharts.length);
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + filteredCharts.length) % filteredCharts.length);

  const renderChart = (index) => {
    const chart = filteredCharts[index];
    if (!chart) return null;
    switch (chart.type) {
      case 'bar': return <Bar ref={chartRefs[index]} data={chart.data} options={chart.options} />;
      case 'pie': return <Pie ref={chartRefs[index]} data={chart.data} options={chart.options} />;
      case 'doughnut': return <Doughnut ref={chartRefs[index]} data={chart.data} options={chart.options} />;
      case 'line': return <Line ref={chartRefs[index]} data={chart.data} options={chart.options} />;
      default: return null;
    }
  };

  return (
    <div className="chart-view-container">
      <div className="chart-header">
        <div className="header-text">
          <h2>Assessment Chart View</h2>
          <input
            type="text"
            placeholder="Filter charts by title..."
            value={filterText}
            onChange={(e) => setFilterText(e.target.value)}
            style={{
              marginTop: '0.5rem',
              height:'50px',
              padding: '0.4rem 0.6rem',
              borderRadius: '14px',
              border: '1px solid #ccc',
              fontSize: '1rem',
              width: '300px',
            }}
          />
        </div>
        <div className="header-actions">
          <button onClick={downloadChartAsImage} className="action-btn" disabled={filteredCharts.length === 0}>
            <FiDownload /> Export Chart
          </button>
          <button onClick={downloadAllAsPDF} className="action-btn primary" disabled={!chartsReady || filteredCharts.length === 0}>
            <FiPrinter /> Generate Report
          </button>
        </div>
      </div>

      <div className="chart-display-area">
        <button
          onClick={prevSlide}
          className="nav-btn prev"
          disabled={filteredCharts.length === 0}
          aria-label="Previous Chart"
        >
          <FiChevronLeft />
        </button>

        <div className="chart-slide">
          <div className="chart-content">
            {filteredCharts.length > 0 ? renderChart(currentSlide) : <p>No charts match the filter.</p>}
          </div>
          <div className="slide-counter">
            {filteredCharts.length > 0 ? `${currentSlide + 1} of ${filteredCharts.length}` : '0 of 0'}
          </div>
        </div>

        <button
          onClick={nextSlide}
          className="nav-btn next"
          disabled={filteredCharts.length === 0}
          aria-label="Next Chart"
        >
          <FiChevronRight />
        </button>
      </div>

      <div className="chart-navigation">
        {filteredCharts.map((_, index) => (
          <button
            key={index}
            className={`nav-dot ${index === currentSlide ? 'active' : ''}`}
            onClick={() => setCurrentSlide(index)}
          />
        ))}
      </div>

      {/* Hidden charts for PDF generation */}
      <div style={{ position: 'absolute', top: '-9999px', left: '-9999px' }}>
        {filteredCharts.map((chart, index) => (
          <div key={index}>
            {(() => {
              switch (chart.type) {
                case 'bar': return <Bar ref={chartRefs[index]} data={chart.data} options={chart.options} />;
                case 'pie': return <Pie ref={chartRefs[index]} data={chart.data} options={chart.options} />;
                case 'doughnut': return <Doughnut ref={chartRefs[index]} data={chart.data} options={chart.options} />;
                case 'line': return <Line ref={chartRefs[index]} data={chart.data} options={chart.options} />;
                default: return null;
              }
            })()}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Chartview;
