 React, { useRef, useMemo, useEffect, useState } from 'react';
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
import { FiDownload, FiChevronLeft, FiChevronRight, FiPrinter } from 'react-icons/fi'
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

  const [filterText, setFilterText] = useState('');
  const filteredCharts = charts.filter(chart =>
    chart.title.toLowerCase().includes(filterText.toLowerCase())
  );

  const chartRefs = useMemo(() => filteredCharts.map(() => React.createRef()), [filteredCharts.length]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [chartsReady, setChartsReady] = useState(false);

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
    const padding = 10;
    
    // Add cover page
    doc.setFontSize(24);
    doc.text('Assessment Report', doc.internal.pageSize.getWidth() / 2, 50, { align: 'center' });
    doc.setFontSize(16);
    doc.text(`Generated on ${new Date().toLocaleDateString()}`, doc.internal.pageSize.getWidth() / 2, 70, { align: 'center' });
    doc.addPage('landscape');
    
    filteredCharts.forEach((chart, i) => {
      const chartRef = chartRefs[i]?.current;
      if (!chartRef || !chartRef.canvas) return;
      
      if (i > 0) doc.addPage('landscape');
      
      // Set title
      doc.setFontSize(16);
      doc.setTextColor(40);
      doc.text(chart.title, doc.internal.pageSize.getWidth() / 2, 20, { align: 'center' });
      
      // Get canvas and create image
      const canvas = chartRef.canvas;
      
      // Create a temporary canvas with higher resolution
      const tempCanvas = document.createElement('canvas');
      const scale = 2; // Increase for higher quality (but larger file size)
      tempCanvas.width = canvas.width * scale;
      tempCanvas.height = canvas.height * scale;
      
      const tempCtx = tempCanvas.getContext('2d');
      tempCtx.scale(scale, scale);
      tempCtx.drawImage(canvas, 0, 0);
      
      const imgData = tempCanvas.toDataURL('image/png', 1.0);
      
      // Calculate dimensions to maintain aspect ratio
      const maxWidth = doc.internal.pageSize.getWidth() - (padding * 2);
      const maxHeight = doc.internal.pageSize.getHeight() - 40; // Leave space for title
      
      const ratio = Math.min(
        maxWidth / tempCanvas.width,
        maxHeight / tempCanvas.height
      );
      
      const width = tempCanvas.width * ratio;
      const height = tempCanvas.height * ratio;
      
      // Center the image
      const x = (doc.internal.pageSize.getWidth() - width) / 2;
      const y = 30; // Below title
      
      doc.addImage(imgData, 'PNG', x, y, width, height);
      
      // Add table data
      if (chart.data && chart.data.labels && chart.data.datasets) {
        const headers = ['Label', ...chart.data.datasets.map(ds => ds.label || 'Value')];
        const data = chart.data.labels.map((label, i) => {
          const values = chart.data.datasets.map(ds => ds.data[i]);
          return [label, ...values];
        });
        
        doc.autoTable({
          head: [headers],
          body: data,
          startY: y + height + 10,
          margin: { left: padding, right: padding },
          styles: { fontSize: 10 },
          headStyles: { fillColor: [59, 130, 246] } // Blue color
        });
      }
    });
    
    // Add page numbers
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(10);
      doc.text(`Page ${i} of ${pageCount}`, doc.internal.pageSize.getWidth() - 20, doc.internal.pageSize.getHeight() - 10);
    }
    
    // Set PDF metadata
    doc.setProperties({
      title: 'Assessment Report',
      subject: 'Student assessment data visualization',
      author: 'Your Application Name',
      keywords: 'assessment, charts, report',
      creator: 'Your Application Name'
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

  const renderTable = () => {
    const chart = filteredCharts[currentSlide];
    if (!chart || !chart.data || !chart.data.labels || !chart.data.datasets) return null;

    const headers = ['Label', ...chart.data.datasets.map(ds => ds.label || 'Value')];
    const rows = chart.data.labels.map((label, i) => {
      const values = chart.data.datasets.map(ds => ds.data[i]);
      return [label, ...values];
    });

    return (
      <div className="chart-table-view">
        <h3>{chart.title} - Table View</h3>
        <table className="chart-table">
          <thead>
            <tr>{headers.map((header, i) => <th key={i}>{header}</th>)}</tr>
          </thead>
          <tbody>
            {rows.map((row, rowIndex) => (
              <tr key={rowIndex}>
                {row.map((cell, i) => <td key={i}>{cell}</td>)}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
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
        <button onClick={prevSlide} className="nav-btn prev" disabled={filteredCharts.length === 0} aria-label="Previous Chart">
          <FiChevronLeft />
        </button>

        <div className="chart-slide">
          <div className="chart-content">
            {filteredCharts.length > 0 ? renderChart(currentSlide) : <p>No charts match the filter.</p>}
          </div>
          <div className="slide-counter">
            {filteredCharts.length > 0 ? `${currentSlide + 1} of ${filteredCharts.length}` : '0 of 0'}
          </div>

          {/* Table View Below Chart */}
          {filteredCharts.length > 0 && renderTable()}
        </div>

        <button onClick={nextSlide} className="nav-btn next" disabled={filteredCharts.length === 0} aria-label="Next Chart">
          <FiChevronRight />
        </button>
      </div>

      <div className="chart-navigation">
        {filteredCharts.map((_, index) => (
          <button key={index} className={`nav-dot ${index === currentSlide ? 'active' : ''}`} onClick={() => setCurrentSlide(index)} />
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