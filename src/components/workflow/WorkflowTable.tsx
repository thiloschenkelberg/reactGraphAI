import { useEffect, useRef, useState } from "react"
import toast from "react-hot-toast"
import client from "../../client"
import Papa from 'papaparse'
import { MultiGrid, GridCellProps, Index } from 'react-virtualized';
import 'react-virtualized/styles.css';
import WorkflowTableDropzone from "./WorkflowTableDropzone";

interface WorkflowTableProps {
  tableView: boolean
  table: any[] | null
  setTable: React.Dispatch<React.SetStateAction<any[] | null>>
}

export default function WorkflowTable(props: WorkflowTableProps) {
  const {
    tableView,
    table,
    setTable,
  } = props
  const tableViewRef = useRef<HTMLDivElement>(null)
  const [tableViewRect, setTableViewRect] = useState<DOMRect | null>(null)

  useEffect(() => {
    const resizeObserver = new ResizeObserver(() => {
      if (tableViewRef.current) {
        setTableViewRect(tableViewRef.current.getBoundingClientRect())
      }
    })

    const currentView = tableViewRef.current
    if (currentView) {
      resizeObserver.observe(currentView)
    }

    return () => {
      if (currentView) {
        resizeObserver.unobserve(currentView)
      }
    }
  })

  const handleFileUpload = (file: File) => {
    if (file) {
      Papa.parse(file, {
        header: true,
        complete: (result) => {
          setTable(result.data);
        }
      })
    }
  };

  const cellRenderer: React.FC<GridCellProps> = ({ columnIndex, key, rowIndex, style }) => {
    if (table) {
      const content = rowIndex === 0 
        ? Object.keys(table[0])[columnIndex] 
        : table[rowIndex - 1][Object.keys(table[0])[columnIndex]];

      const newStyle = {
        ...style,
        border: "1px solid #373A40",
        padding: "2px"
      };

      return (
        <div key={key} style={newStyle}>
          {content}
        </div>
      );
    }
    return null;
  };

  const getColumnWidth = ({ index}: Index): number => {
    if (table) {
      const headerText = table[0] ? Object.keys(table[0])[index] : ''
      return Math.max(headerText.length * 10, 80)
    }
    return 100
    
  }

  return (
    <>
      {!table && (
        <WorkflowTableDropzone
          handleFileUpload={handleFileUpload}
        />
      )}
      <div
        ref={tableViewRef}
        className="workflow-window-table-grid"
        style={{
          position: "relative",
          width: "100%",
          height: "100%",
          paddingLeft: 20,
          paddingTop: 50,
        }}
      >
        {table && tableView && (
          <MultiGrid
            columnWidth={getColumnWidth} // Adjust as needed
            columnCount={table[0] ? Object.keys(table[0]).length : 0}
            fixedColumnCount={1}
            fixedRowCount={1}
            height={tableViewRect ? tableViewRect.height - 50 : 0} // Adjust as needed
            rowHeight={50} // Adjust as needed
            rowCount={table.length + 1} // +1 for header row
            width={tableViewRect ? tableViewRect.width - 40 : 0} // Adjust as needed
            cellRenderer={cellRenderer}
          />
        )}
      </div>
    </>
  )
}