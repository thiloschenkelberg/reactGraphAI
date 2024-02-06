import React, { useRef, useMemo } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { useReactTable, ColumnDef, getCoreRowModel } from '@tanstack/react-table';
import { CsvTableRow } from '../../types/workflow.types';

interface WorkflowTableProps {
  csvTable: CsvTableRow[];
}

const WorkflowTable: React.FC<WorkflowTableProps> = ({ csvTable }) => {
  const parentRef = useRef<HTMLDivElement>(null);

  // Define columns
  const columns: ColumnDef<CsvTableRow>[] = useMemo(() => {
    // Dynamically create columns based on the keys of the first row in the data
    if (csvTable.length === 0) {
      return [];
    }
    return Object.keys(csvTable[0]).map(key => ({
      accessorFn: row => row[key], // Correctly using accessorFn
      id: key,
      header: () => key,
    }));
  }, [csvTable]);
  

  const tableInstance = useReactTable({
    data: csvTable,
    columns,
    state: {
      // Your state here if needed
    },
    onStateChange: () => {
      // Handle state changes if needed
    },
    getCoreRowModel: getCoreRowModel(), // Adjusted usage
  });
  

  // Setup virtualizers for both rows and columns
  const rowVirtualizer = useVirtualizer({
    count: csvTable.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 35, // Adjust based on your row height
    overscan: 5,
  });

  const columnVirtualizer = useVirtualizer({
    horizontal: true,
    count: columns.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 150, // Adjust based on your column width
    overscan: 1,
  });

  // Render your table
  return (
    <div ref={parentRef} style={{ overflow: 'auto', height: '100%', width: '100%' }}>
      <div style={{ height: `${rowVirtualizer.getTotalSize()}px`, width: `${columnVirtualizer.getTotalSize()}px` }}>
        {rowVirtualizer.getVirtualItems().map(rowVirtual => (
          <div key={rowVirtual.key} style={{ position: 'absolute', top: `${rowVirtual.start}px`, height: `${rowVirtual.size}px`, width: '100%' }}>
            {columnVirtualizer.getVirtualItems().map(columnVirtual => {
              // Accessing cell data directly might require adjustments based on your data structure
              const cellData = csvTable[rowVirtual.index][columns[columnVirtual.index].accessorKey];
              return (
                <div key={columnVirtual.key} style={{ display: 'inline-block', position: 'absolute', left: `${columnVirtual.start}px`, width: `${columnVirtual.size}px`, height: '100%' }}>
                  {cellData}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
};

export default WorkflowTable;
