// D:\ICANIO intern\React\dashboard-project\src\utils\pdfExport.js
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

export const PDFExportManager = {
  async captureFullContent(element) {
    const originalStyles = {
      overflow: element.style.overflow,
      height: element.style.height,
      width: element.style.width,
      position: element.style.position,
      top: element.style.top,
      left: element.style.left,
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
    return canvas;
  },

  async generatePDF(canvas, title, isLandscape) {
    const pdf = new jsPDF({
      orientation: isLandscape ? 'l' : 'p',
      unit: 'px',
      format: [canvas.width, canvas.height],
      hotfixes: ['px_scaling']
    });

    const imgProps = pdf.getImageProperties(canvas);
    pdf.addImage(canvas, 'PNG', 0, 0, imgProps.width, imgProps.height);
    pdf.setProperties({ title });
    return pdf;
  },

  handleMobileViewport() {
    const viewportMeta = document.querySelector('meta[name="viewport"]');
    const originalViewport = viewportMeta?.content || '';
    viewportMeta?.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0');
    return () => viewportMeta?.setAttribute('content', originalViewport);
  }
};