import { useEffect, useRef, useState } from "react"
import toast from "react-hot-toast"
import client from "../../client"
import Papa from "papaparse"
import { MultiGrid, GridCellProps, Index } from "react-virtualized"
import "react-virtualized/styles.css"
import WorkflowTableDropzone from "./WorkflowTableDropzone"
import { IconUpload } from "@tabler/icons-react"
import { Button } from "@mantine/core"

interface WorkflowTableProps {
  tableView: boolean
  table: any[] | null
  setTable: React.Dispatch<React.SetStateAction<any[] | null>>
}

export default function WorkflowTable(props: WorkflowTableProps) {
  const { tableView, table, setTable } = props
  const tableViewRef = useRef<HTMLDivElement>(null)
  const [tableViewRect, setTableViewRect] = useState<DOMRect | null>(null)
  const [tableContext, setTableContext] = useState<string>("")
  const [hovered, setHovered] = useState(false)

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
          setTable(result.data)
        },
      })
    }
  }

  const handleContextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const contextString = e.target.value

    setTableContext(contextString)
  }

  const cellRenderer: React.FC<GridCellProps> = ({
    columnIndex,
    key,
    rowIndex,
    style,
  }) => {
    if (table) {
      const content =
        rowIndex === 0
          ? Object.keys(table[0])[columnIndex]
          : table[rowIndex - 1][Object.keys(table[0])[columnIndex]]

      const newStyle = {
        ...style,
        border: "1px solid #333",
        padding: "2px",
      }

      return (
        <div key={key} style={newStyle}>
          {content}
        </div>
      )
    }
    return null
  }

  const getColumnWidth = ({ index }: Index): number => {
    if (table) {
      const headerText = table[0] ? Object.keys(table[0])[index] : ""
      return Math.max(headerText.length * 10, 80)
    }
    return 100
  }

  return (
    <>
      {!table && <WorkflowTableDropzone handleFileUpload={handleFileUpload} />}
      {table && tableView && (
        <div
          className="workflow-window-table-upload"
          style={{

            position: "relative",
            width: "100%",
            height: "100%",
            display: "flex",
            flexDirection: "row",
          }}
        >
          <div
            className="workflow-window-table-specs"
            style={{
              position: "relative",
              width: "15%",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              transform: "translate(0,-20px)",
            }}
          >
            <div
              style={{
                width: "75%",
              }}
            >
              <label
                htmlFor="contextInput"
                style={{
                  alignSelf: "flex-start",
                  marginTop: "15%",
                  marginBottom: 2,
                }}
              >
                Context:
              </label>
              <input
                type="text"
                id="contextInput"
                placeholder={"Enter table context..."}
                defaultValue={undefined}
                onChange={handleContextChange} // write nodeName state
                autoFocus={true}
              />
              {/* <Button type="submit" radius="xl">
                Upload
              </Button> */}
              <div
                style={{
                  backgroundColor: hovered ? "#1864ab" : "#1971c2",
                  height: "55%",
                  borderRadius: "5px",
                  border: "2px solid #333",
                  marginTop: 20,
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                }}
                onMouseEnter={() => setHovered(true)}
                onMouseLeave={() => setHovered(false)}
              >
                <IconUpload size="3rem" stroke={1.5} />
                {/* Upload */}
              </div>
            </div>
          </div>
          <div
            ref={tableViewRef}
            className="workflow-window-table-grid"
            style={{
              position: "relative",
              width: "85%",
              height: `calc(100% - 30px)`,
              paddingTop: 50,
            }}
          >
            <MultiGrid
              columnWidth={getColumnWidth} // Adjust as needed
              columnCount={table[0] ? Object.keys(table[0]).length : 0}
              fixedColumnCount={1}
              fixedRowCount={1}
              height={tableViewRect ? tableViewRect.height - 50 : 0} // Adjust as needed
              rowHeight={50} // Adjust as needed
              rowCount={table.length + 1} // +1 for header row
              width={tableViewRect ? tableViewRect.width - 30 : 0} // Adjust as needed
              cellRenderer={cellRenderer}
              style={{
                border: "1px solid #333",
              }}
            />
          </div>
        </div>
      )}
    </>
  )
}