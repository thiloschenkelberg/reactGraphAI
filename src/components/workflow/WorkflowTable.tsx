import React, { useRef, useMemo, useEffect, useState } from "react"
import { useVirtualizer } from "@tanstack/react-virtual"
import {
  useReactTable,
  ColumnDef,
  getCoreRowModel,
} from "@tanstack/react-table"
import { TableRow } from "../../types/workflow.types"
import { Label } from "../../types/workflow.types"
import { Select } from "@mantine/core"

interface WorkflowTableProps {
  tableRows: TableRow[]
  progress: number
  drawerRect: DOMRect | null
}

const labelOptions = [
  {value: "matter", label: "Matter"},
  {value: "manufacturing", label: "Manufacturing"},
  {value: "measurement", label: "Measurement"},
  {value: "parameter", label: "Parameter"},
  {value: "property", label: "Property"},
  {value: "metadata", label: "Metadata"},
]

export default function WorkflowTable(props: WorkflowTableProps) {
  const { tableRows, progress, drawerRect } = props
  const [select, setSelect] = useState<{ row: number; column: string } | null>(
    null
  )

  const tableRef = useRef<HTMLDivElement>(null)
  const [tableRect, setTableRect] = useState<DOMRect | null>(null)
  const [tableDivHeight, setTableDivHeight] = useState<number | null>(null)

  useEffect(() => {
    if (tableRef.current && typeof ResizeObserver === "function") {
      const observer = new ResizeObserver((entries) => {
        const [entry] = entries
        setTableRect(entry.contentRect)
      })

      observer.observe(tableRef.current)

      return () => observer.disconnect()
    }
  }, [tableRef, tableRows])

  useEffect(() => {
    // 50 + 45 * tableRows
    if (drawerRect) {
      const rowHeight = 50 + 46 * tableRows.length
      const divHeight = drawerRect.height - 90
      setTableDivHeight(Math.min(rowHeight, divHeight))
      return
    }
    setTableDivHeight(null)
  }, [tableRows, drawerRect])

  const handleCellClick = (
    cellData: string | number | boolean,
    row: number,
    columnId: string
  ): void => {
    if (
      typeof cellData === "string" &&
      labelOptions.some(option => option.value === cellData as Label)
    ) {
      setSelect({ row: row, column: columnId })
    }
  }

  // Define columns
  const columns: ColumnDef<TableRow>[] = useMemo(() => {
    if (tableRows.length === 0) {
      return []
    }
    return Object.keys(tableRows[0]).map((key) => ({
      // Directly use a string or JSX for headers that don't need context
      header: String(key),
      accessorFn: (row) => row[key],
      id: key,
    }))
  }, [tableRows])

  const tableInstance = useReactTable({
    data: tableRows,
    columns,
    state: {
      // Your state here if needed
    },
    onStateChange: () => {
      // Handle state changes if needed
    },
    getCoreRowModel: getCoreRowModel(), // Adjusted usage
  })

  // Setup virtualizers for both rows and columns
  const rowVirtualizer = useVirtualizer({
    count: tableRows.length,
    getScrollElement: () => tableRef.current,
    estimateSize: () => 45, // Adjust based on your row height
    overscan: 5,
  })

  const columnVirtualizer = useVirtualizer({
    horizontal: true,
    count: columns.length,
    getScrollElement: () => tableRef.current,
    estimateSize: (index) => {
      const key = columns[index].id
      if (key) {
        return Math.max(key.length * 10, 150)
      }
      return 150
    },
    overscan: 1,
  })

  // Render your table
  return (
    <div
      key={tableRows.length}
      ref={tableRef}
      className="workflow-table"
      style={{
        position: "relative",
        display: "flex",
        flexDirection: "column",
        // justifyContent: "center",
        height: tableDivHeight ? tableDivHeight : `calc(100% - 90px)`,
        width: `calc(100% - 20px)`,
        left: 10,
        overflow: "auto",
        // paddingLeft: 10,
        // paddingRight: 10,
        border: "1px solid #333",
        backgroundColor: "#212226",
      }}
    >
      {/* Header */}
      <div
        style={{
          position: "sticky",
          // height: 10,
          width: `${columnVirtualizer.getTotalSize()}px`,
          top: 0,
          zIndex: 2,
        }}
      >
        {columnVirtualizer.getVirtualItems().map((columnVirtual) => {
          // Access the header as a direct value
          const header = String(columns[columnVirtual.index].header)
          return (
            <div
              key={columnVirtual.key}
              style={{
                display: "inline-block",
                position: "absolute",
                left: `${columnVirtual.start}px`,
                width: `${columnVirtual.size}px`,
                height: "50px",
                borderBottom: "1px solid #333",
                textAlign: "left",
                lineHeight: "50px",
                backgroundColor: "#212226",
                color: "#a6a7ab",
                // borderRight: columnVirtual.index + 1 === Object.keys(tableRows[0]).length ? "none" : "1px solid #333",
                borderRight: "1px solid #333",
                paddingLeft: ".5rem",
              }}
            >
              {header}
            </div>
          )
        })}
      </div>

      {/* Rows */}
      <div
        style={{
          position: "relative",
          height: `${rowVirtualizer.getTotalSize()}px`,
          width: `${columnVirtualizer.getTotalSize()}px`,
          top: 50,
          zIndex: 1,
        }}
      >
        {rowVirtualizer.getVirtualItems().map((rowVirtual) => (
          <div
            key={rowVirtual.key}
            style={{
              position: "absolute",
              top: `${rowVirtual.start}px`,
              height: `${rowVirtual.size}px`,
              width: "100%",
            }}
          >
            {columnVirtualizer.getVirtualItems().map((columnVirtual) => {
              const column = columns[columnVirtual.index]
              const columnId = column.id // Assuming columnId is always defined based on your column setup
              if (typeof columnId !== "undefined") {
                const cellData = tableRows[rowVirtual.index][columnId] // Safely access cell data using columnId
                return (
                  <div
                    key={columnVirtual.key}
                    style={{
                      display: "inline-block",
                      position: "absolute",
                      left: `${columnVirtual.start}px`,
                      width: `${columnVirtual.size}px`,
                      height: "100%",
                      backgroundColor: "#212226",
                      color: "#a6a7ab",
                      // borderRight: columnVirtual.index + 1 === Object.keys(tableRows[0]).length ? "none" : "1px solid #333",
                      borderRight: "1px solid #333",
                      borderBottom:
                        rowVirtual.index + 1 === tableRows.length
                          ? "none"
                          : "1px solid #333",
                      // borderBottom: "1px solid #333",
                      paddingTop: 10,
                      paddingLeft: ".5rem",
                    }}
                  >
                    <div
                      onClick={
                        progress > 1
                          ? () =>
                              handleCellClick(
                                cellData,
                                rowVirtual.index,
                                columnId
                              )
                          : undefined
                      }
                      style={{
                        position: "relative",
                      }}
                    >
                      {select?.row === rowVirtual.index &&
                      select?.column === columnId ? (
                        <Select 
                          defaultValue={cellData as Label}
                          data={labelOptions}
                        />
                      ) : (
                        cellData
                      )}
                    </div>
                  </div>
                )
              }
              return null // Or handle the undefined case appropriately
            })}
          </div>
        ))}
      </div>

      {/* Shadow */}
      <div
        style={{
          position: "fixed",
          width: `calc(100% - 22px)`,
          height: tableRect ? `${tableRect.height}px` : "100%",
          boxShadow: "inset 0px 0px 3px rgba(0, 0, 0, 0.3)",
          zIndex: 3,
          pointerEvents: "none",
          // backgroundColor: "rgba(240,100,0,0.5)",
        }}
      />
    </div>
  )
}
