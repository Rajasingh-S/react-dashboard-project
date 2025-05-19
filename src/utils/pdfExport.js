// D:\ICANIO intern\React\dashboard-project\src\utils\pdfExport.js
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

export const PDFExportManager = {
  async captureFullContent(element, title) {
    const originalStyles = {
      overflow: element.style.overflow,
      height: element.style.height,
      width: element.style.width,
      position: element.style.position,
    };

    Object.assign(element.style, {
      overflow: 'visible',
      height: 'auto',
      width: 'auto',
      position: 'absolute',
      top: '0',
      left: '0',
    });

    await new Promise(resolve => requestAnimationFrame(resolve));
    
    const canvas = await html2canvas(element, {
      scrollX: -window.scrollX,
      scrollY: -window.scrollY,
      useCORS: true,
      scale: 3,
      logging: false,
      allowTaint: true,
    });

    Object.assign(element.style, originalStyles);
    return { canvas, title };
  },

  async generatePDF({ canvas, title }, isLandscape = true) {
    const pdf = new jsPDF({
      orientation: isLandscape ? 'l' : 'p',
      unit: 'mm',
      format: 'a4'
    });

    // Calculate dimensions to fit A4
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const ratio = Math.min(
      (pageWidth - 20) / canvas.width,
      (pageHeight - 40) / canvas.height
    );
    const imgWidth = canvas.width * ratio;
    const imgHeight = canvas.height * ratio;
    const x = (pageWidth - imgWidth) / 2;
    const y = 15; // Top margin

    // Add title
    pdf.setFontSize(16);
    pdf.setTextColor(40);
    pdf.text(title, pageWidth / 2, 10, { align: 'center' });

    // Add content
    pdf.addImage(canvas, 'PNG', x, y, imgWidth, imgHeight);

    // Add footer
    const date = new Date().toLocaleDateString();
    pdf.setFontSize(10);
    pdf.setTextColor(150);
    pdf.text(`Exported on ${date}`, pageWidth - 15, pageHeight - 10, {
      align: 'right'
    });

    return pdf;
  },

  handleMobileViewport() {
    const viewportMeta = document.querySelector('meta[name="viewport"]');
    const originalViewport = viewportMeta?.content || '';
    viewportMeta?.setAttribute('content', 'width=1200, initial-scale=1.0');
    return () => viewportMeta?.setAttribute('content', originalViewport);
  }
};