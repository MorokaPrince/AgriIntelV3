import jsPDF from 'jspdf';
import 'jspdf-autotable';

/**
 * Export data as CSV
 */
export function exportAsCSV(
  data: Record<string, unknown>[],
  filename: string = 'export.csv'
): void {
  try {
    if (!data || data.length === 0) {
      console.warn('[DataExport] No data to export');
      return;
    }

    // Get headers from first object
    const headers = Object.keys(data[0]);

    // Create CSV content
    const csvContent = [
      headers.join(','),
      ...data.map((row) =>
        headers
          .map((header) => {
            const value = row[header];
            // Escape quotes and wrap in quotes if contains comma
            if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
              return `"${value.replace(/"/g, '""')}"`;
            }
            return value;
          })
          .join(',')
      ),
    ].join('\n');

    // Create blob and download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    downloadFile(blob, filename);

    console.log('[DataExport] CSV exported successfully');
  } catch (error) {
    console.error('[DataExport] Error exporting CSV:', error);
    throw error;
  }
}

/**
 * Export data as Excel (using CSV format for simplicity)
 */
export function exportAsExcel(
  data: Record<string, unknown>[],
  filename: string = 'export.xlsx'
): void {
  try {
    if (!data || data.length === 0) {
      console.warn('[DataExport] No data to export');
      return;
    }

    // For now, export as CSV with .xlsx extension
    // In production, use a library like xlsx for true Excel support
    const headers = Object.keys(data[0]);

    const csvContent = [
      headers.join('\t'),
      ...data.map((row) =>
        headers.map((header) => row[header]).join('\t')
      ),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'application/vnd.ms-excel;charset=utf-8;' });
    downloadFile(blob, filename);

    console.log('[DataExport] Excel exported successfully');
  } catch (error) {
    console.error('[DataExport] Error exporting Excel:', error);
    throw error;
  }
}

/**
 * Export data as PDF
 */
export function exportAsPDF(
  data: Record<string, unknown>[],
  filename: string = 'export.pdf',
  title: string = 'Data Export'
): void {
  try {
    if (!data || data.length === 0) {
      console.warn('[DataExport] No data to export');
      return;
    }

    const doc = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4',
    });

    // Add title
    doc.setFontSize(16);
    doc.text(title, 14, 22);

    // Add timestamp
    doc.setFontSize(10);
    doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 32);

    // Get headers
    const headers = Object.keys(data[0]);

    // Prepare table data
    const tableData = data.map((row) =>
      headers.map((header) => {
        const value = row[header];
        if (value === null || value === undefined) return '';
        if (typeof value === 'object') return JSON.stringify(value);
        return String(value);
      })
    );

    // Add table
    const docWithTable = doc as unknown as {
      autoTable: (options: Record<string, unknown>) => void;
    };
    docWithTable.autoTable({
      head: [headers],
      body: tableData,
      startY: 40,
      margin: { top: 40, right: 14, bottom: 14, left: 14 },
      styles: {
        fontSize: 9,
        cellPadding: 3,
      },
      headStyles: {
        fillColor: [16, 185, 129],
        textColor: 255,
        fontStyle: 'bold',
      },
      alternateRowStyles: {
        fillColor: [245, 245, 245],
      },
    });

    doc.save(filename);

    console.log('[DataExport] PDF exported successfully');
  } catch (error) {
    console.error('[DataExport] Error exporting PDF:', error);
    throw error;
  }
}

/**
 * Helper function to download file
 */
function downloadFile(blob: Blob, filename: string): void {
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  // Clean up
  URL.revokeObjectURL(url);
}

/**
 * Export data with filters applied
 */
export function exportFilteredData(
  data: Record<string, unknown>[],
  filters: Record<string, unknown>,
  format: 'csv' | 'excel' | 'pdf' = 'csv',
  filename: string = 'export'
): void {
  try {
    // Apply filters
    let filteredData = data;

    Object.entries(filters).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== '') {
        filteredData = filteredData.filter((row) => {
          const rowValue = String(row[key]).toLowerCase();
          const filterValue = String(value).toLowerCase();
          return rowValue.includes(filterValue);
        });
      }
    });

    // Export based on format
    const ext = format === 'excel' ? '.xlsx' : `.${format}`;
    const fullFilename = `${filename}${ext}`;

    if (format === 'csv') {
      exportAsCSV(filteredData, fullFilename);
    } else if (format === 'excel') {
      exportAsExcel(filteredData, fullFilename);
    } else if (format === 'pdf') {
      exportAsPDF(filteredData, fullFilename, filename);
    }
  } catch (error) {
    console.error('[DataExport] Error exporting filtered data:', error);
    throw error;
  }
}

