import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

/**
 * Export chart as CSV
 */
export async function exportChartAsCSV(
  data: Record<string, number | string>,
  filename: string = 'chart-data.csv'
): Promise<void> {
  try {
    // Convert data to CSV format
    const headers = Object.keys(data);
    const values = Object.values(data);

    const csvContent = [
      headers.join(','),
      values.join(','),
    ].join('\n');

    // Create blob and download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    console.log('[ChartExport] CSV exported successfully');
  } catch (error) {
    console.error('[ChartExport] Error exporting CSV:', error);
    throw error;
  }
}

/**
 * Export chart as PNG
 */
export async function exportChartAsPNG(
  elementId: string,
  filename: string = 'chart.png'
): Promise<void> {
  try {
    const element = document.getElementById(elementId);
    if (!element) {
      throw new Error(`Element with id "${elementId}" not found`);
    }

    const canvas = await html2canvas(element, {
      backgroundColor: '#ffffff',
      scale: 2,
    });

    const link = document.createElement('a');
    link.href = canvas.toDataURL('image/png');
    link.download = filename;
    link.style.visibility = 'hidden';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    console.log('[ChartExport] PNG exported successfully');
  } catch (error) {
    console.error('[ChartExport] Error exporting PNG:', error);
    throw error;
  }
}

/**
 * Export chart as PDF
 */
export async function exportChartAsPDF(
  elementId: string,
  filename: string = 'chart.pdf',
  title: string = 'Chart Report'
): Promise<void> {
  try {
    const element = document.getElementById(elementId);
    if (!element) {
      throw new Error(`Element with id "${elementId}" not found`);
    }

    const canvas = await html2canvas(element, {
      backgroundColor: '#ffffff',
      scale: 2,
    });

    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4',
    });

    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const imgWidth = pageWidth - 20;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    // Add title
    pdf.setFontSize(16);
    pdf.text(title, 10, 15);

    // Add timestamp
    pdf.setFontSize(10);
    pdf.text(`Generated: ${new Date().toLocaleString()}`, 10, 25);

    // Add image
    pdf.addImage(imgData, 'PNG', 10, 35, imgWidth, imgHeight);

    pdf.save(filename);

    console.log('[ChartExport] PDF exported successfully');
  } catch (error) {
    console.error('[ChartExport] Error exporting PDF:', error);
    throw error;
  }
}

/**
 * Export chart data as JSON
 */
export async function exportChartAsJSON(
  data: Record<string, unknown>,
  filename: string = 'chart-data.json'
): Promise<void> {
  try {
    const jsonContent = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    console.log('[ChartExport] JSON exported successfully');
  } catch (error) {
    console.error('[ChartExport] Error exporting JSON:', error);
    throw error;
  }
}

