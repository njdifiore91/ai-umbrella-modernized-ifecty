import React from 'react';
import { render, screen, fireEvent, within, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe, toHaveNoViolations } from 'jest-axe';
import { performance } from 'perf_hooks';
import Table from './Table';
import { TableColumn, SortDirection } from '../../../types/common.types';
import { ThemeProvider } from 'styled-components';
import { lightTheme } from '../../../styles/theme';

// Add jest-axe matchers
expect.extend(toHaveNoViolations);

// Mock performance monitoring
jest.mock('perf_hooks', () => ({
  performance: {
    now: jest.fn(),
    mark: jest.fn(),
    measure: jest.fn()
  }
}));

describe('Table Component', () => {
  // Test data setup
  const mockColumns: TableColumn[] = [
    {
      id: 'name',
      header: 'Name',
      sortable: true,
      accessor: 'name',
      ariaLabel: 'Sort by name'
    },
    {
      id: 'age',
      header: 'Age',
      sortable: true,
      accessor: 'age',
      ariaLabel: 'Sort by age'
    }
  ];

  const mockData = [
    { id: 1, name: 'John Doe', age: 30 },
    { id: 2, name: 'Jane Smith', age: 25 }
  ];

  // Performance thresholds
  const PERFORMANCE_THRESHOLDS = {
    renderTime: 100, // ms
    sortTime: 50, // ms
    scrollTime: 16 // ms (60fps)
  };

  // Helper function to render table with theme
  const renderTable = (props = {}) => {
    return render(
      <ThemeProvider theme={lightTheme}>
        <Table
          columns={mockColumns}
          data={mockData}
          ariaLabel="Test Table"
          {...props}
        />
      </ThemeProvider>
    );
  };

  beforeEach(() => {
    // Reset performance mocks
    jest.clearAllMocks();
    (performance.now as jest.Mock).mockImplementation(() => Date.now());
  });

  it('renders empty message with proper accessibility', async () => {
    const emptyMessage = 'No data available';
    const { container } = renderTable({ data: [], emptyMessage });

    // Check empty message rendering
    expect(screen.getByText(emptyMessage)).toBeInTheDocument();
    
    // Verify accessibility attributes
    const table = container.querySelector('table');
    expect(table).toHaveAttribute('role', 'table');
    
    // Run accessibility tests
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('renders table headers with proper accessibility', () => {
    const { container } = renderTable();

    // Check header rendering
    mockColumns.forEach(column => {
      const header = screen.getByRole('columnheader', { name: column.header });
      expect(header).toBeInTheDocument();
      expect(header).toHaveAttribute('aria-sort', 'none');
      if (column.sortable) {
        expect(header).toHaveAttribute('tabindex', '0');
      }
    });

    // Verify table structure
    expect(container.querySelector('thead')).toHaveAttribute('role', 'rowgroup');
    expect(container.querySelector('tbody')).toHaveAttribute('role', 'rowgroup');
  });

  it('handles keyboard navigation and sorting', async () => {
    const onSort = jest.fn();
    const { container } = renderTable({ onSort });

    // Get first sortable header
    const nameHeader = screen.getByRole('columnheader', { name: /name/i });

    // Test keyboard sort trigger
    await act(async () => {
      fireEvent.keyDown(nameHeader, { key: 'Enter' });
    });

    expect(onSort).toHaveBeenCalledWith([
      { column: 'name', direction: SortDirection.ASC }
    ]);

    // Test keyboard navigation
    const firstCell = container.querySelector('td');
    await act(async () => {
      fireEvent.keyDown(firstCell!, { key: 'ArrowRight' });
    });

    expect(document.activeElement).toBe(
      container.querySelector('td:nth-child(2)')
    );
  });

  it('maintains performance under load', async () => {
    // Generate large dataset
    const largeData = Array.from({ length: 1000 }, (_, i) => ({
      id: i,
      name: `User ${i}`,
      age: 20 + (i % 50)
    }));

    // Measure render time
    const startRender = performance.now();
    const { container } = renderTable({
      data: largeData,
      enableVirtualization: true,
      virtualizationThreshold: 100
    });
    const renderTime = performance.now() - startRender;

    expect(renderTime).toBeLessThan(PERFORMANCE_THRESHOLDS.renderTime);

    // Test sorting performance
    const startSort = performance.now();
    const nameHeader = screen.getByRole('columnheader', { name: /name/i });
    await act(async () => {
      fireEvent.click(nameHeader);
    });
    const sortTime = performance.now() - startSort;

    expect(sortTime).toBeLessThan(PERFORMANCE_THRESHOLDS.sortTime);

    // Test scroll performance
    const tableBody = container.querySelector('tbody');
    const startScroll = performance.now();
    await act(async () => {
      fireEvent.scroll(tableBody!, { target: { scrollTop: 500 } });
    });
    const scrollTime = performance.now() - startScroll;

    expect(scrollTime).toBeLessThan(PERFORMANCE_THRESHOLDS.scrollTime);
  });

  it('supports row selection with proper accessibility', async () => {
    const onRowSelect = jest.fn();
    const selectedRows = [1];
    
    renderTable({ onRowSelect, selectedRows });

    // Test row selection
    const firstRow = screen.getByRole('row', { name: /john doe/i });
    expect(firstRow).toHaveAttribute('aria-selected', 'true');

    // Test keyboard selection
    await act(async () => {
      fireEvent.keyDown(firstRow, { key: 'Space' });
    });

    expect(onRowSelect).toHaveBeenCalledWith(1, false);
  });

  it('handles column resizing and alignment', () => {
    const columns = [
      { ...mockColumns[0], width: '200px', align: 'left' as const },
      { ...mockColumns[1], width: '100px', align: 'right' as const }
    ];

    const { container } = renderTable({ columns });

    // Check column widths and alignment
    const cells = container.querySelectorAll('td');
    expect(cells[0]).toHaveStyle({ width: '200px', textAlign: 'left' });
    expect(cells[1]).toHaveStyle({ width: '100px', textAlign: 'right' });
  });

  it('supports custom cell rendering', () => {
    const columns = [
      {
        ...mockColumns[0],
        render: (value: string) => <span data-testid="custom">{value.toUpperCase()}</span>
      }
    ];

    renderTable({ columns });

    // Verify custom rendering
    const customCell = screen.getByTestId('custom');
    expect(customCell).toHaveTextContent('JOHN DOE');
  });

  it('handles multi-sort functionality', async () => {
    const onSort = jest.fn();
    renderTable({ onSort });

    // Trigger multi-sort with shift key
    const nameHeader = screen.getByRole('columnheader', { name: /name/i });
    const ageHeader = screen.getByRole('columnheader', { name: /age/i });

    await act(async () => {
      fireEvent.click(nameHeader, { shiftKey: true });
      fireEvent.click(ageHeader, { shiftKey: true });
    });

    expect(onSort).toHaveBeenLastCalledWith([
      { column: 'name', direction: SortDirection.ASC },
      { column: 'age', direction: SortDirection.ASC }
    ]);
  });
});