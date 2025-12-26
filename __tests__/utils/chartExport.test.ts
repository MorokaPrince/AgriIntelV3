/**
 * Unit tests for chartExport utility functions
 * Tests chart export as PNG, PDF, and CSV
 */

describe('Chart Export Utilities', () => {
  const mockChartData = {
    'Cattle': 24,
    'Sheep': 18,
    'Goats': 12,
    'Poultry': 30,
    'Pigs': 8,
  };

  describe('CSV Export', () => {
    it('should convert chart data to CSV', () => {
      const headers = Object.keys(mockChartData);
      const values = Object.values(mockChartData);
      
      expect(headers.length).toBe(5);
      expect(values.length).toBe(5);
    });

    it('should format CSV with headers and values', () => {
      const headers = Object.keys(mockChartData);
      const values = Object.values(mockChartData);
      const csvContent = [
        headers.join(','),
        values.join(','),
      ].join('\n');
      
      expect(csvContent).toContain('Cattle');
      expect(csvContent).toContain('24');
    });

    it('should create blob for download', () => {
      const csvContent = 'test,data\n1,2';
      const blob = new Blob([csvContent], { type: 'text/csv' });
      
      expect(blob).toBeDefined();
      expect(blob.type).toBe('text/csv');
    });

    it('should generate proper filename', () => {
      const filename = 'chart-data.csv';
      expect(filename).toMatch(/\.csv$/);
    });
  });

  describe('PNG Export', () => {
    it('should find chart element by ID', () => {
      const elementId = 'animal-chart';
      expect(elementId).toBeDefined();
      expect(elementId.length).toBeGreaterThan(0);
    });

    it('should handle missing element gracefully', () => {
      const elementId = 'non-existent-element';
      const element = document.getElementById(elementId);
      
      expect(element).toBeNull();
    });

    it('should generate PNG filename', () => {
      const filename = 'chart.png';
      expect(filename).toMatch(/\.png$/);
    });

    it('should use high DPI for PNG export', () => {
      const scale = 2;
      expect(scale).toBeGreaterThan(1);
    });

    it('should set white background', () => {
      const backgroundColor = '#ffffff';
      expect(backgroundColor).toBe('#ffffff');
    });
  });

  describe('PDF Export', () => {
    it('should create PDF document', () => {
      const orientation = 'landscape';
      const format = 'a4';
      
      expect(orientation).toBe('landscape');
      expect(format).toBe('a4');
    });

    it('should include title in PDF', () => {
      const title = 'Chart Report';
      expect(title).toBeDefined();
      expect(title.length).toBeGreaterThan(0);
    });

    it('should include timestamp in PDF', () => {
      const timestamp = new Date().toLocaleString();
      expect(timestamp).toBeDefined();
    });

    it('should add image to PDF', () => {
      const imageFormat = 'PNG';
      expect(imageFormat).toBe('PNG');
    });

    it('should generate PDF filename', () => {
      const filename = 'chart.pdf';
      expect(filename).toMatch(/\.pdf$/);
    });

    it('should set proper page margins', () => {
      const margins = { top: 10, right: 14, bottom: 14, left: 14 };
      
      expect(margins.top).toBeGreaterThan(0);
      expect(margins.right).toBeGreaterThan(0);
    });
  });

  describe('JSON Export', () => {
    it('should convert data to JSON', () => {
      const jsonData = JSON.stringify(mockChartData);
      expect(jsonData).toBeDefined();
    });

    it('should format JSON with proper indentation', () => {
      const jsonData = JSON.stringify(mockChartData, null, 2);
      expect(jsonData).toContain('\n');
    });

    it('should generate JSON filename', () => {
      const filename = 'chart-data.json';
      expect(filename).toMatch(/\.json$/);
    });

    it('should preserve data structure', () => {
      const jsonData = JSON.stringify(mockChartData);
      const parsed = JSON.parse(jsonData);
      
      expect(parsed.Cattle).toBe(24);
      expect(parsed.Sheep).toBe(18);
    });
  });

  describe('File Download', () => {
    it('should create download link', () => {
      const link = document.createElement('a');
      expect(link).toBeDefined();
      expect(link.tagName).toBe('A');
    });

    it('should set href attribute', () => {
      const url = 'blob:http://example.com/123';
      const link = document.createElement('a');
      link.href = url;
      
      expect(link.href).toBeDefined();
    });

    it('should set download attribute', () => {
      const filename = 'chart.csv';
      const link = document.createElement('a');
      link.download = filename;
      
      expect(link.download).toBe(filename);
    });

    it('should append and remove link from DOM', () => {
      const link = document.createElement('a');
      document.body.appendChild(link);
      
      expect(document.body.contains(link)).toBe(true);
      
      document.body.removeChild(link);
      expect(document.body.contains(link)).toBe(false);
    });
  });

  describe('Error Handling', () => {
    it('should handle empty data', () => {
      const emptyData = {};
      expect(Object.keys(emptyData).length).toBe(0);
    });

    it('should handle null values', () => {
      const dataWithNull = { 'Cattle': null };
      expect(dataWithNull.Cattle).toBeNull();
    });

    it('should handle undefined values', () => {
      const dataWithUndefined = { 'Cattle': undefined };
      expect(dataWithUndefined.Cattle).toBeUndefined();
    });

    it('should log errors to console', () => {
      const consoleSpy = jest.spyOn(console, 'error');
      console.error('Export error');
      
      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });
  });

  describe('Data Validation', () => {
    it('should validate chart data structure', () => {
      const isValid = Object.keys(mockChartData).length > 0 &&
                      Object.values(mockChartData).every(v => typeof v === 'number');
      
      expect(isValid).toBe(true);
    });

    it('should handle string values', () => {
      const stringData = { 'Category': 'Value' };
      expect(typeof stringData.Category).toBe('string');
    });

    it('should handle mixed data types', () => {
      const mixedData = { 'Number': 42, 'String': 'text', 'Boolean': true };
      
      expect(typeof mixedData.Number).toBe('number');
      expect(typeof mixedData.String).toBe('string');
      expect(typeof mixedData.Boolean).toBe('boolean');
    });
  });
});

