import React, { memo, useCallback, useMemo, useRef, useState, useEffect } from 'react'; // ^18.2.0
import {
  TableContainer,
  StyledTable,
  TableHeader,
  TableBody,
  TableRow,
  TableCell,
  TableHeaderCell,
  VirtualScroll
} from './Table.styles';
import { TableColumn, SortDirection, TableProps, RowSelectionState } from '../../../types/common.types';

// Debounce helper for sort operations
const debounce = <T extends (...args: any[]) => void>(fn: T, delay: number) => {
  let timeoutId: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
};

export const Table = memo<TableProps>(({
  columns,
  data,
  onSort,
  emptyMessage = 'No data available',
  enableVirtualization = false,
  onRowSelect,
  selectedRows,
  rowHeight = 48,
  virtualizationThreshold = 100,
  ariaLabel = 'Data Table'
}) => {
  const [sortState, setSortState] = useState<{ column: string; direction: SortDirection }[]>([]);
  const [focusedCell, setFocusedCell] = useState<{ rowIndex: number; colIndex: number } | null>(null);
  const tableRef = useRef<HTMLTableElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Memoized sort handler with debouncing
  const handleSort = useCallback(
    debounce((columnId: string, multiSort: boolean) => {
      const column = columns.find(col => col.id === columnId);
      if (!column?.sortable) return;

      setSortState(prevSort => {
        let newSort = [...prevSort];
        const existingSort = newSort.find(sort => sort.column === columnId);

        if (existingSort) {
          if (existingSort.direction === SortDirection.ASC) {
            existingSort.direction = SortDirection.DESC;
          } else {
            newSort = newSort.filter(sort => sort.column !== columnId);
          }
        } else {
          if (multiSort) {
            newSort.push({ column: columnId, direction: SortDirection.ASC });
          } else {
            newSort = [{ column: columnId, direction: SortDirection.ASC }];
          }
        }

        onSort?.(newSort);
        return newSort;
      });
    }, 150),
    [columns, onSort]
  );

  // Keyboard navigation handler
  const handleKeyboardNavigation = useCallback((event: React.KeyboardEvent) => {
    if (!focusedCell) return;

    const { rowIndex, colIndex } = focusedCell;
    const maxRow = data.length - 1;
    const maxCol = columns.length - 1;

    switch (event.key) {
      case 'ArrowUp':
        if (rowIndex > 0) {
          setFocusedCell({ rowIndex: rowIndex - 1, colIndex });
          event.preventDefault();
        }
        break;
      case 'ArrowDown':
        if (rowIndex < maxRow) {
          setFocusedCell({ rowIndex: rowIndex + 1, colIndex });
          event.preventDefault();
        }
        break;
      case 'ArrowLeft':
        if (colIndex > 0) {
          setFocusedCell({ rowIndex, colIndex: colIndex - 1 });
          event.preventDefault();
        }
        break;
      case 'ArrowRight':
        if (colIndex < maxCol) {
          setFocusedCell({ rowIndex, colIndex: colIndex + 1 });
          event.preventDefault();
        }
        break;
      case 'Space':
        if (onRowSelect) {
          onRowSelect(data[rowIndex].id, !selectedRows?.includes(data[rowIndex].id));
          event.preventDefault();
        }
        break;
    }
  }, [focusedCell, data, columns, onRowSelect, selectedRows]);

  // Virtualized row rendering
  const renderVirtualizedRows = useMemo(() => {
    return (startIndex: number, endIndex: number) => {
      return data.slice(startIndex, endIndex).map((row, virtualIndex) => {
        const rowIndex = startIndex + virtualIndex;
        const isSelected = selectedRows?.includes(row.id);

        return (
          <TableRow
            key={row.id}
            isSelected={isSelected}
            onClick={() => onRowSelect?.(row.id, !isSelected)}
            role="row"
            aria-selected={isSelected}
            style={{ height: `${rowHeight}px` }}
          >
            {columns.map((column, colIndex) => (
              <TableCell
                key={column.id}
                align={column.align}
                width={column.width}
                role="cell"
                tabIndex={focusedCell?.rowIndex === rowIndex && focusedCell?.colIndex === colIndex ? 0 : -1}
                onFocus={() => setFocusedCell({ rowIndex, colIndex })}
                aria-label={`${column.header}: ${row[column.id]}`}
              >
                {column.render ? column.render(row[column.id], row) : row[column.id]}
              </TableCell>
            ))}
          </TableRow>
        );
      });
    };
  }, [columns, data, focusedCell, onRowSelect, selectedRows, rowHeight]);

  // Effect for keyboard focus management
  useEffect(() => {
    if (focusedCell) {
      const cell = tableRef.current?.querySelector(
        `tr:nth-child(${focusedCell.rowIndex + 1}) td:nth-child(${focusedCell.colIndex + 1})`
      );
      (cell as HTMLElement)?.focus();
    }
  }, [focusedCell]);

  return (
    <TableContainer
      ref={containerRef}
      role="region"
      aria-label={ariaLabel}
      onKeyDown={handleKeyboardNavigation}
    >
      <StyledTable ref={tableRef} role="table">
        <TableHeader role="rowgroup">
          <TableRow role="row">
            {columns.map(column => {
              const sortItem = sortState.find(sort => sort.column === column.id);
              return (
                <TableHeaderCell
                  key={column.id}
                  align={column.align}
                  width={column.width}
                  sortable={column.sortable}
                  sortDirection={sortItem?.direction}
                  onClick={() => column.sortable && handleSort(column.id, event?.shiftKey)}
                  role="columnheader"
                  aria-sort={sortItem ? (sortItem.direction === SortDirection.ASC ? 'ascending' : 'descending') : 'none'}
                  tabIndex={0}
                >
                  {column.header}
                </TableHeaderCell>
              );
            })}
          </TableRow>
        </TableHeader>

        <TableBody role="rowgroup">
          {data.length === 0 ? (
            <TableRow role="row">
              <TableCell
                colSpan={columns.length}
                align="center"
                role="cell"
                aria-label={emptyMessage}
              >
                {emptyMessage}
              </TableCell>
            </TableRow>
          ) : enableVirtualization && data.length > virtualizationThreshold ? (
            <VirtualScroll
              totalItems={data.length}
              itemHeight={rowHeight}
              containerRef={containerRef}
              renderItems={renderVirtualizedRows}
            />
          ) : (
            renderVirtualizedRows(0, data.length)
          )}
        </TableBody>
      </StyledTable>
    </TableContainer>
  );
});

Table.displayName = 'Table';

export default Table;