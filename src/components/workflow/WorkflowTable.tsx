import { useEffect, useRef, useState } from "react"
import toast from "react-hot-toast"
import client from "../../client"
import Papa from "papaparse"
import { MultiGrid, GridCellProps, Index } from "react-virtualized"
import "react-virtualized/styles.css"
import WorkflowTableDropzone from "./WorkflowTableDropzone"
import { IconUpload } from "@tabler/icons-react"
import { Button } from "@mantine/core"
import { IDictionary, IWorkflow } from "../../types/workflow.types"
import { IConnection, INode } from "../../types/canvas.types"
import {
  convertFromJSONFormat,
  convertToJSONFormat,
} from "../../common/helpers"

interface WorkflowTableProps {
  tableView: boolean
  progress: number
  setProgress: React.Dispatch<React.SetStateAction<number>>
  setNodes: React.Dispatch<React.SetStateAction<INode[]>>
  setConnections: React.Dispatch<React.SetStateAction<IConnection[]>>
  setNeedLayout: React.Dispatch<React.SetStateAction<boolean>>
  workflow: string | null
  workflows: IWorkflow[] | undefined
}

const exampleLabelDict: IDictionary = {
  "Header1": "Label1",
  "Header2": "Label2",
  "Header3": "Label3",
  // Add more key-value pairs as needed
}

const exampleAttrDict: IDictionary = {
  "Header1": ["Label1", "Attribute1"],
  "Header2": ["Label2", "Attribute2"],
  "Header3": ["Label3", "Attribute3"],
  // Add more key-value pairs as needed
}

export default function WorkflowTable(props: WorkflowTableProps) {
  const {
    tableView,
    progress,
    setProgress,
    setNodes,
    setConnections,
    setNeedLayout,
    workflow,
    workflows,
  } = props
  const tableViewRef = useRef<HTMLDivElement>(null)
  const [tableViewRect, setTableViewRect] = useState<DOMRect | null>(null)
  const [hovered, setHovered] = useState(false)

  const [file, setFile] = useState<File | undefined>()
  const [fileLink, setFileLink] = useState<string>("Link")
  const [fileName, setFileName] = useState<string>("Name")
  const [context, setContext] = useState<string>("")
  const [csvTable, setCsvTable] = useState<any[] | null>(null)
  const [labelTable, setLabelTable] = useState<any[] | null>(null)
  const [attributeTable, setAttributeTable] = useState<any[] | null>(null)

  const multiGridRef = useRef<any>(null)
  // if (multiGridRef.current) {
  //   multiGridRef.current.recomputeGridSize()
  // }

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

  const handleContextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const contextString = e.target.value
    setContext(contextString)
  }

  const handleFileView = (file: File) => {
    if (file) {
      setFile(file)
      Papa.parse(file, {
        header: true,
        complete: (result) => {
          setCsvTable(result.data)
        },
      })
    }
    setProgress(1)
  }

  // (file,context) => label_dict, file_link, file_name
  async function requestExtractLabels() {
    if (!file) return

    try {
      const data = await client.requestExtractLabels(file, context)

      if (data.graph_json) {
        const { nodes, connections } = convertFromJSONFormat(data.graph_json)
        setNodes(nodes)
        setConnections(connections)
        setNeedLayout(true)
        setProgress(5)
        return
      }

      if (!data || !data.label_dict || !data.file_link || !data.file_name) {
        throw new Error("Error while extracting labels!")
      }

      const dictArray = dictToArray(data.label_dict)
      setLabelTable(dictArray)
      setFileLink(data.file_link)
      setFileName(data.file_name)

      // const dictArray = dictToArray(exampleLabelDict)
      // setLabelTable(dictArray)

      setProgress(2)
    } catch (err: any) {
      toast.error(err.message)
    }
  }

  // (label_dict, context, file_link, file_name) => attribute_dict
  async function requestExtractAttributes() {
    try {
      const dict = arrayToDict(labelTable)

      if (!dict) return

      const data = await client.requestExtractAttributes(
        dict,
        context,
        fileLink,
        fileName
      )

      if (!data || !data.attribute_dict) {
        throw new Error("Error while extracting attributes!")
      }

      const dictArray = dictToArray(data.attribute_dict)

      // const dictArray = dictToArray(exampleAttrDict)

      setAttributeTable(dictArray)
      setProgress(3)
    } catch (err: any) {
      toast.error(err.message)
    }
  }

  // (attribute_dict, context, file_link, file_name) => node_json
  async function requestExtractNodes() {
    try {
      const dict = arrayToDict(attributeTable)

      if (!dict) return

      const data = await client.requestExtractNodes(
        dict,
        context,
        fileLink,
        fileName
      )

      if (!data || !data.node_json) {
        throw new Error("Error while extracting nodes!")
      }

      const { nodes, connections } = convertFromJSONFormat(data.node_json)
      // if (!workflows || !workflows[1]) {
      //   console.log("workflow not found")
      //   return
      // }
      // const { nodes, connections } = convertFromJSONFormat(
      //   workflows[1].workflow
      // )

      setConnections([])
      setNodes(nodes)
      setNeedLayout(true)

      setProgress(4)
    } catch (err: any) {
      toast.error(err.message)
    }
  }

  // (node_json, context, file_link, file_name) => graph_json
  async function requestExtractGraph() {
    try {
      const nodeJson = workflow

      if (!nodeJson) return

      const data = await client.requestExtractGraph(
        nodeJson,
        context,
        fileLink,
        fileName
      )

      if (!data || !data.graph_json) {
        throw new Error("Error while extracting graph!")
      }

      const { nodes, connections } = convertFromJSONFormat(data.graph_json)

      // if (!workflows || !workflows[2]) {
      //   console.log("workflow not found")
      //   return
      // }
      // const { nodes, connections } = convertFromJSONFormat(
      //   workflows[2].workflow
      // )

      setNodes(nodes)
      setConnections(connections)
      setNeedLayout(true)

      setProgress(5)
    } catch (err: any) {
      toast.error(err.message)
    }
  }

  function dictToArray(dict: IDictionary): string[][] {
    // Get headers (keys of the dictionary)
    const headers = Object.keys(dict)

    

    // Get values as an array of arrays
    const values = Object.values(dict).map((value) =>
      Array.isArray(value) ? value : [value]
    )

    // Determine the maximum number of rows based on the maximum value array length
    const maxRows = Math.max(...values.map((value) => value.length))

    // Create the rows with headers as the first row
    const rows: string[][] = [headers]
    for (let i = 0; i < maxRows; i++) {
      const row = values.map((value) => value[i] || "")
      rows.push(row)
    }

    // console.log(rows)
    return rows
  }

  function arrayToDict(array: any[] | null): IDictionary | null {
    if (!array || array.length === 0 || !Array.isArray(array[0])) {
      return null // Return null if input is null, empty, or not structured properly
    }

    const dict: IDictionary = {}
    const headers = array[0]

    if (headers.every((header) => typeof header === "string")) {
      headers.forEach((header, columnIndex) => {
        const columnValues = array
          .slice(1)
          .map((row) => row[columnIndex])
          .filter((v) => v !== "" && v != null)
          .map((v) => String(v)) // Ensuring values are strings

        // If there's more than one value, store it as an array, otherwise store the single value
        dict[header] =
          columnValues.length > 1 ? columnValues : columnValues[0] || ""
      })
    } else {
      return null // Return null if headers are not all strings
    }

    return dict
  }

  const cellRenderer: React.FC<GridCellProps> = ({
    columnIndex,
    key,
    rowIndex,
    style,
  }) => {
    let content: string | string[] = ""

    if (progress === 1 && csvTable) {
      content =
        rowIndex === 0
          ? Object.keys(csvTable[0])[columnIndex]
          : csvTable[rowIndex - 1][Object.keys(csvTable[0])[columnIndex]]
    } else if (progress === 2 && labelTable) {
      content = labelTable[rowIndex][columnIndex] || ""
    } else if (progress === 3 && attributeTable) {
      content = attributeTable[rowIndex][columnIndex] || ""
    }

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

  const getColumnCount = (): number => {
    if (progress === 1 && csvTable) {
      return csvTable[0] ? Object.keys(csvTable[0]).length : 0
    } else if (progress === 2 && labelTable) {
      return labelTable[0] ? Object.keys(labelTable[0]).length : 0
    } else if (progress === 3 && attributeTable) {
      return attributeTable[0] ? Object.keys(attributeTable[0]).length : 0
    }
    return 0
  }

  const getRowCount = (): number => {
    if (progress === 1 && csvTable) {
      return csvTable.length + 1
    } else if (progress === 2 && labelTable) {
      return labelTable.length
    } else if (progress === 3 && attributeTable) {
      return attributeTable.length
    }
    return 0
  }

  const getColumnWidth = ( {index} : Index): number => {
    if (progress === 1 && csvTable) {
      const headerText = csvTable[0] ? Object.keys(csvTable[0])[index] : ""
      return Math.max(headerText.length * 15, 90)
    } else if (progress === 2 && labelTable) {
      const headerText = labelTable[0] ? labelTable[0][index] : ""
      return Math.max(headerText.length * 15, 90)
    } else if (progress === 3 && attributeTable) {
      const headerText = attributeTable[0] ? attributeTable[0][index] : ""
      return Math.max(headerText.length * 15, 90)
    }
    return 0
  }

  return (
    <>
      {progress === 0 && (
        <WorkflowTableDropzone handleFileView={handleFileView} />
      )}
      {progress > 0 && (
        <div
          className="workflow-table-upload"
          style={{
            position: "relative",
            width: "100%",
            height: "100%",
            display: "flex",
            flexDirection: "row",
          }}
        >
          {progress > 0 && csvTable && (
            <div
              className="workflow-table-specs"
              style={{
                position: "relative",
                width: "18%",
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
                  {progress === 1 ? (
                    <IconUpload
                      size="3rem"
                      stroke={1.5}
                      onClick={requestExtractLabels}
                    />
                  ) : progress === 2 ? (
                    <IconUpload
                      size="3rem"
                      stroke={1.5}
                      onClick={requestExtractAttributes}
                    />
                  ) : progress === 3 ? (
                    <IconUpload
                      size="3rem"
                      stroke={1.5}
                      onClick={requestExtractNodes}
                    />
                  ) : (
                    <IconUpload
                      size="3rem"
                      stroke={1.5}
                      onClick={requestExtractGraph}
                    />
                  )}
                  {/* Upload */}
                </div>
              </div>
            </div>
          )}
          <div
            ref={tableViewRef}
            className="workflow-table-grid"
            style={{
              position: "relative",
              height: `calc(100%)`,
              overflow: "hidden",
              width: "100%",
            }}
          >
            <MultiGrid
              ref={multiGridRef}
              columnWidth={getColumnWidth} // Adjust as needed
              columnCount={getColumnCount()}
              fixedColumnCount={progress === 1 ? 1 : 0}
              fixedRowCount={1} // One fixed row for headers
              height={tableViewRect ? tableViewRect.height - 5 : 0} // Adjust as needed
              rowHeight={30} // Adjust as needed
              rowCount={getRowCount()} // One header row and one data row
              cellRenderer={cellRenderer}
              width={tableViewRect ? tableViewRect.width - 5 : 0} // Adjust as needed
              // style={{ border: "1px solid #333" }}
            />
          </div>
        </div>
      )}
    </>
  )
}
