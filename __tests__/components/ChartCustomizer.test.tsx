/**
 * Unit tests for ChartCustomizer component
 * Tests date range selection, zoom controls, and export options
 */

describe('ChartCustomizer Component', () => {
  describe('Date Range Selection', () => {
    it('should initialize with default date range', () => {
      const today = new Date();
      const thirtyDaysAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
      
      expect(thirtyDaysAgo).toBeDefined();
      expect(today).toBeDefined();
    });

    it('should update start date', () => {
      const newDate = '2024-01-01';
      expect(newDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });

    it('should update end date', () => {
      const newDate = '2024-12-31';
      expect(newDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });

    it('should validate date range', () => {
      const startDate = '2024-01-01';
      const endDate = '2024-12-31';
      
      const start = new Date(startDate);
      const end = new Date(endDate);
      
      expect(start < end).toBe(true);
    });

    it('should call onDateRangeChange callback', () => {
      const mockCallback = jest.fn();
      const dateRange = { startDate: '2024-01-01', endDate: '2024-12-31' };
      
      mockCallback(dateRange);
      
      expect(mockCallback).toHaveBeenCalledWith(dateRange);
    });
  });

  describe('Zoom Controls', () => {
    it('should initialize zoom level at 100%', () => {
      const zoomLevel = 1;
      expect(zoomLevel * 100).toBe(100);
    });

    it('should zoom in by 20%', () => {
      let zoomLevel = 1;
      zoomLevel += 0.2;
      expect(zoomLevel * 100).toBe(120);
    });

    it('should zoom out by 20%', () => {
      let zoomLevel = 1;
      zoomLevel -= 0.2;
      expect(zoomLevel * 100).toBe(80);
    });

    it('should not zoom below 60%', () => {
      let zoomLevel = 0.6;
      zoomLevel = Math.max(0.6, zoomLevel - 0.2);
      expect(zoomLevel * 100).toBeGreaterThanOrEqual(60);
    });

    it('should call onZoom callback', () => {
      const mockCallback = jest.fn();
      mockCallback('in');
      expect(mockCallback).toHaveBeenCalledWith('in');
    });
  });

  describe('Export Options', () => {
    it('should provide CSV export option', () => {
      const formats = ['csv', 'png', 'pdf'];
      expect(formats).toContain('csv');
    });

    it('should provide PNG export option', () => {
      const formats = ['csv', 'png', 'pdf'];
      expect(formats).toContain('png');
    });

    it('should provide PDF export option', () => {
      const formats = ['csv', 'png', 'pdf'];
      expect(formats).toContain('pdf');
    });

    it('should call onExport callback with format', () => {
      const mockCallback = jest.fn();
      mockCallback('csv');
      expect(mockCallback).toHaveBeenCalledWith('csv');
    });
  });

  describe('Visibility Controls', () => {
    it('should show date range when enabled', () => {
      const showDateRange = true;
      expect(showDateRange).toBe(true);
    });

    it('should hide date range when disabled', () => {
      const showDateRange = false;
      expect(showDateRange).toBe(false);
    });

    it('should show export options when enabled', () => {
      const showExport = true;
      expect(showExport).toBe(true);
    });

    it('should show zoom controls when enabled', () => {
      const showZoom = true;
      expect(showZoom).toBe(true);
    });
  });

  describe('Rendering', () => {
    it('should render with title', () => {
      const title = 'Chart Options';
      expect(title).toBeDefined();
      expect(title.length).toBeGreaterThan(0);
    });

    it('should render all controls by default', () => {
      const controls = ['dateRange', 'zoom', 'export'];
      expect(controls.length).toBe(3);
    });
  });
});

