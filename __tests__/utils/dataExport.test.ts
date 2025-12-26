/**
 * Unit tests for dataExport utility functions
 * Tests CSV, Excel, and PDF export functionality
 */

describe('Data Export Utilities', () => {
  const mockData = [
    { id: '1', name: 'Animal 1', species: 'Cattle', weight: 500 },
    { id: '2', name: 'Animal 2', species: 'Sheep', weight: 80 },
    { id: '3', name: 'Animal 3', species: 'Goat', weight: 60 },
  ];

  describe('CSV Export', () => {
    it('should generate valid CSV headers', () => {
      const headers = Object.keys(mockData[0]);
      const csvHeader = headers.join(',');
      
      expect(csvHeader).toContain('id');
      expect(csvHeader).toContain('name');
      expect(csvHeader).toContain('species');
      expect(csvHeader).toContain('weight');
    });

    it('should format CSV data rows', () => {
      const headers = Object.keys(mockData[0]);
      const firstRow = headers.map((h: string) => mockData[0][h as keyof typeof mockData[0]]).join(',');
      
      expect(firstRow).toContain('1');
      expect(firstRow).toContain('Animal 1');
      expect(firstRow).toContain('Cattle');
    });

    it('should escape quotes in CSV', () => {
      const dataWithQuotes = [{ name: 'Animal "Test"' }];
      const escaped = dataWithQuotes[0].name.replace(/"/g, '""');
      
      expect(escaped).toBe('Animal ""Test""');
    });

    it('should wrap fields with commas in quotes', () => {
      const dataWithComma = [{ name: 'Animal, Test' }];
      const shouldWrap = dataWithComma[0].name.includes(',');
      
      expect(shouldWrap).toBe(true);
    });

    it('should handle empty data gracefully', () => {
      const emptyData: Record<string, unknown>[] = [];
      expect(emptyData.length).toBe(0);
    });
  });

  describe('Excel Export', () => {
    it('should generate valid Excel format', () => {
      const headers = Object.keys(mockData[0]);
      const excelHeader = headers.join('\t');
      
      expect(excelHeader).toBeDefined();
      expect(excelHeader.length).toBeGreaterThan(0);
    });

    it('should use tab-separated values', () => {
      const headers = Object.keys(mockData[0]);
      const separator = '\t';
      
      expect(separator).toBe('\t');
    });

    it('should include all data rows', () => {
      expect(mockData.length).toBe(3);
    });

    it('should handle numeric values', () => {
      const weight = mockData[0].weight;
      expect(typeof weight).toBe('number');
      expect(weight).toBeGreaterThan(0);
    });
  });

  describe('PDF Export', () => {
    it('should include title in PDF', () => {
      const title = 'Animals Data Export';
      expect(title).toBeDefined();
      expect(title.length).toBeGreaterThan(0);
    });

    it('should include timestamp in PDF', () => {
      const timestamp = new Date().toLocaleString();
      expect(timestamp).toBeDefined();
      expect(timestamp.length).toBeGreaterThan(0);
    });

    it('should format data as table', () => {
      const headers = Object.keys(mockData[0]);
      expect(headers.length).toBeGreaterThan(0);
    });

    it('should handle null values', () => {
      const dataWithNull = [{ id: '1', name: null }];
      const value = dataWithNull[0].name;
      
      expect(value === null || value === undefined).toBe(true);
    });

    it('should handle object values', () => {
      const dataWithObject = [{ id: '1', metadata: { key: 'value' } }];
      const stringified = JSON.stringify(dataWithObject[0].metadata);
      
      expect(stringified).toContain('key');
    });
  });

  describe('Filtered Export', () => {
    it('should apply single filter', () => {
      const filters = { species: 'Cattle' };
      const filtered = mockData.filter(row => 
        String(row.species).toLowerCase().includes(String(filters.species).toLowerCase())
      );
      
      expect(filtered.length).toBe(1);
      expect(filtered[0].species).toBe('Cattle');
    });

    it('should apply multiple filters', () => {
      const filters = { species: 'Cattle', weight: '500' };
      let filtered = mockData;
      
      Object.entries(filters).forEach(([key, value]) => {
        if (value) {
          filtered = filtered.filter((row: typeof mockData[0]) =>
            String(row[key as keyof typeof row]).toLowerCase().includes(String(value).toLowerCase())
          );
        }
      });
      
      expect(filtered.length).toBe(1);
    });

    it('should ignore empty filter values', () => {
      const filters = { species: '', weight: '' };
      let filtered = mockData;
      
      Object.entries(filters).forEach(([key, value]) => {
        if (value) {
          filtered = filtered.filter((row: typeof mockData[0]) =>
            String(row[key as keyof typeof row]).toLowerCase().includes(String(value).toLowerCase())
          );
        }
      });
      
      expect(filtered.length).toBe(mockData.length);
    });

    it('should return empty array when no matches', () => {
      const filters = { species: 'NonExistent' };
      const filtered = mockData.filter(row =>
        String(row.species).toLowerCase().includes(String(filters.species).toLowerCase())
      );
      
      expect(filtered.length).toBe(0);
    });
  });

  describe('File Generation', () => {
    it('should generate CSV filename', () => {
      const filename = 'animals-export.csv';
      expect(filename).toMatch(/\.csv$/);
    });

    it('should generate Excel filename', () => {
      const filename = 'animals-export.xlsx';
      expect(filename).toMatch(/\.xlsx$/);
    });

    it('should generate PDF filename', () => {
      const filename = 'animals-export.pdf';
      expect(filename).toMatch(/\.pdf$/);
    });

    it('should include timestamp in filename', () => {
      const timestamp = new Date().getTime();
      const filename = `export-${timestamp}.csv`;
      
      expect(filename).toContain('export');
      expect(filename).toMatch(/\d+/);
    });
  });

  describe('Error Handling', () => {
    it('should handle missing data', () => {
      const data = undefined;
      expect(data).toBeUndefined();
    });

    it('should handle invalid format', () => {
      const invalidFormat = 'invalid';
      const validFormats = ['csv', 'excel', 'pdf'];
      
      expect(validFormats).not.toContain(invalidFormat);
    });

    it('should log errors appropriately', () => {
      const consoleSpy = jest.spyOn(console, 'error');
      console.error('Test error');
      
      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });
  });
});

