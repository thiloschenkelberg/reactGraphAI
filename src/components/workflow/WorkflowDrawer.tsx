import { useEffect, useRef, useState, useMemo } from "react"
import toast from "react-hot-toast"
import client from "../../client"
import Papa from "papaparse"
import { MultiGrid, GridCellProps, Index } from "react-virtualized"
import "react-virtualized/styles.css"
import WorkflowTableDropzone from "./WorkflowTableDropzone"
import WorkflowPipeline from "./WorkflowPipeline"
import { IconUpload } from "@tabler/icons-react"
import { Button } from "@mantine/core"
import { CsvTableRow, IDictionary, IWorkflow } from "../../types/workflow.types"
import { IRelationship, INode } from "../../types/canvas.types"
import {
  convertFromJsonFormat,
  convertToJSONFormat,
} from "../../common/helpers"
import WorkflowTable from "./WorkflowTable"

interface WorkflowDrawerProps {
  tableView: boolean
  progress: number
  setProgress: React.Dispatch<React.SetStateAction<number>>
  setNodes: React.Dispatch<React.SetStateAction<INode[]>>
  setRelationships: React.Dispatch<React.SetStateAction<IRelationship[]>>
  setNeedLayout: React.Dispatch<React.SetStateAction<boolean>>
  workflow: string | null
  workflows: IWorkflow[] | undefined
}

const exampleLabelDict: IDictionary = {
  Header1: { Label: "Label1" },
  Header2: { Label: "Label2" },
  Header3: { Label: "Label3" },
  // Add more key-value pairs as needed
}

const exampleAttrDict: IDictionary = {
  Header1: { Label: "Label1", Attribute: "Attribute1" },
  Header2: { Label: "Label2", Attribute: "Attribute2" },
  Header3: { Label: "Label3", Attribute: "Attribute3" },
  // Add more key-value pairs as needed
}

export default function WorkflowDrawer(props: WorkflowDrawerProps) {
  const {
    tableView,
    progress,
    setProgress,
    setNodes,
    setRelationships,
    setNeedLayout,
    workflow,
    workflows,
  } = props
  const tableViewRef = useRef<HTMLDivElement>(null)
  const [tableViewRect, setTableViewRect] = useState<DOMRect | null>(null)

  const [file, setFile] = useState<File | undefined>()
  const [fileLink, setFileLink] = useState<string>("Link")
  const [fileName, setFileName] = useState<string>("Name")
  const [context, setContext] = useState<string>("")
  const [csvTable, setCsvTable] = useState<CsvTableRow[]>([])
  const [labelTable, setLabelTable] = useState<any[] | null>(null)
  const [attributeTable, setAttributeTable] = useState<any[] | null>(null)

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
        dynamicTyping: true,
        complete: (result) => {
          const safeData = result.data as { [key: string]: unknown}[]
          const typedData: CsvTableRow[] = safeData.map(row => {
            const typedRow: CsvTableRow = {}
            Object.entries(row).forEach(([key, value]) => {
              if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
                typedRow[key] = value
              } else {
                console.warn(`Unexpected value type for key "${key}":`, value);
                typedRow[key] = String(value)
              }
            })
            return typedRow
          })
          setCsvTable(typedData)
        },
        skipEmptyLines: true,
      })
    }
    setProgress(1)
  }

  // (file,context) => label_dict, file_link, file_name
  async function requestExtractLabels() {
    if (!file) {
      toast.error("File not found!")
      return
    }
    if (!(context && context.length > 0)) {
      toast.error("Pls enter context!")
      return
    }

    try {
      const data = await client.requestExtractLabels(file, context)

      if (data.graph_json) {
        const { nodes, relationships } = convertFromJsonFormat(data.graph_json)
        setNodes(nodes)
        setRelationships(relationships)
        setNeedLayout(true)
        setProgress(5)
        return
      }

      if (!(data && data.label_dict && data.file_link && data.file_name)) {
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

      if (!(data && data.attribute_dict)) {
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

      if (!(data && data.node_json)) {
        throw new Error("Error while extracting nodes!")
      }

      const { nodes, relationships } = convertFromJsonFormat(data.node_json)
      // if (!workflows || !workflows[1]) {
      //   console.log("workflow not found")
      //   return
      // }
      // const { nodes, relationships } = convertFromJSONFormat(
      //   workflows[1].workflow
      // )

      setRelationships([])
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

      if (!(data && data.graph_json)) {
        throw new Error("Error while extracting graph!")
      }

      const { nodes, relationships } = convertFromJsonFormat(data.graph_json)

      // if (!workflows || !workflows[2]) {
      //   console.log("workflow not found")
      //   return
      // }
      // const { nodes, relationships } = convertFromJSONFormat(
      //   workflows[2].workflow
      // )

      setNodes(nodes)
      setRelationships(relationships)
      setNeedLayout(true)

      setProgress(5)
    } catch (err: any) {
      toast.error(err.message)
    }
  }

  // (graph_json, context, fileLink, fileName) => success
  async function requestImportGraph() {
    try {
      const graphJson = workflow

      if (!graphJson) return

      const data = await client.requestImportGraph(
        graphJson,
        context, // Pass context parameter
        fileLink, // Pass fileLink parameter
        fileName // Pass fileName parameter
      )

      if (!(data && data.success)) {
        throw new Error("Error while extracting graph!")
      }

      toast.success(data.success)
    } catch (err: any) {
      toast.error(err.message)
    }
  }

  function dictToArray(dict: IDictionary): string[][] {
    if (!dict || Object.keys(dict).length === 0) {
      return []
    }

    // Extract headers from the outer dictionary keys
    const headers = Object.keys(dict)

    // Prepare the first row of the table with these headers
    const table: string[][] = [headers]

    // Determine the maximum number of rows needed by finding the longest inner dictionary
    const maxRows = Math.max(
      ...Object.values(dict).map((innerDict) => Object.keys(innerDict).length)
    )

    // Initialize each row with empty strings to accommodate all headers
    for (let i = 0; i < maxRows; i++) {
      table.push(new Array(headers.length).fill(""))
    }

    // Populate the table rows with values from each inner dictionary
    headers.forEach((header, headerIndex) => {
      const innerDict = dict[header]
      const keys = Object.keys(innerDict)
      keys.forEach((key, rowIndex) => {
        table[rowIndex + 1][headerIndex] = innerDict[key] // rowIndex + 1 to skip header row
      })
    })

    // Clean up any rows at the end that contain only undefined values
    return table.filter((row) =>
      row.some((cell) => cell !== undefined && cell !== "")
    )
  }

  function arrayToDict(array: string[][] | null): IDictionary | null {
    // Validate the input array
    if (!array || array.length < 2 || !Array.isArray(array[0])) {
      return null // Return null if input is null, has less than 2 rows, or if the first row is not an array
    }

    const dict: IDictionary = {}
    const headers = array[0] // The first row contains headers

    // Initialize dict with headers
    headers.forEach((header) => {
      if (typeof header === "string") {
        dict[header] = {} // Each header becomes a key to an empty inner dictionary
      } else {
        return null // Return null if any header is not a string
      }
    })

    // Iterate over each row starting from the second row
    array.slice(1).forEach((row, rowIndex) => {
      headers.forEach((header, columnIndex) => {
        const value = row[columnIndex]
        if (
          typeof header === "string" &&
          value !== undefined &&
          value !== null
        ) {
          // Determine the appropriate key based on rowIndex
          let key
          if (rowIndex === 0) {
            key = "Label"
          } else if (rowIndex === 1) {
            key = "Attribute"
          } else {
            key = `Row${rowIndex}`
          }

          // Assign or update the value in the inner dictionary
          dict[header][key] = value
        }
      })
    })

    return dict
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
            flexDirection: "column",
          }}
        >
          {progress > 0 && csvTable && (
            <WorkflowPipeline 
              handleContextChange={handleContextChange}
              requestExtractLabels={requestExtractLabels}
              requestExtractAttributes={requestExtractAttributes}
              requestExtractNodes={requestExtractNodes}
              requestExtractGraph={requestExtractGraph}
              requestImportGraph={requestImportGraph}
              progress={progress}
            />
          )}
          <WorkflowTable
            csvTable={csvTable}
          />
        </div>
      )}
    </>
  )
}
