import { useEffect, useRef, useState } from "react"

import SearchIcon from "@mui/icons-material/Search"

import Canvas from "./canvas/Canvas"
import WorkflowButtons from "./WorkflowButtons"
import client from "../client"
import { saveBlobAsFile } from "../common/helpers"

interface WorkflowProps {
  colorIndex: number
}

export default function Workflow(props: WorkflowProps) {
  const { colorIndex } = props
  const [workflow, setWorkflow] = useState<string | null>(null)

  const [canvasWidth, setCanvasWidth] = useState(0)
  const [canvasHeight, setCanvasHeight] = useState(0)
  const workflowWindowRef = useRef<HTMLDivElement>(null)

  const [jsonView, setJsonView] = useState(true)
  const [jsonViewWidth, setJsonViewWidth] = useState(450)
  const [historyView, setHistoryView] = useState(false)
  const [historyViewWidth, setHistoryViewWidth] = useState(0)
  const [tableView, setTableView] = useState(false)
  const [tableViewHeight, setTableViewHeight] = useState(0)

  useEffect(() => {
    // Function to handle window resize and update dimensions
    const handleResize = () => {
      if (workflowWindowRef.current) {
        const rect = workflowWindowRef.current.getBoundingClientRect()
        const width = rect.width - jsonViewWidth - historyViewWidth
        const height = rect.height - tableViewHeight

        setCanvasWidth(width)
        setCanvasHeight(height)
      }
    }

    // Call once to set initial size
    handleResize()

    // Add event listener for window resize
    window.addEventListener("resize", handleResize)

    // Cleanup function to remove event listener
    return () => {
      window.removeEventListener("resize", handleResize)
    }
  }, [jsonViewWidth, historyViewWidth, tableViewHeight, workflowWindowRef])

  // useEffect(() => {
  //   const splitView = localStorage.getItem("viewSplitView")
  //   const splitViewWidth = localStorage.getItem("viewSplitViewWidth")

  //   if (!splitView || !splitViewWidth) return

  //   setSplitView(JSON.parse(splitView))
  //   setSplitViewWidth(JSON.parse(splitViewWidth))
  // }, [])

  // useEffect(() => {
  //   localStorage.setItem("viewSplitView", JSON.stringify(splitView))
  //   localStorage.setItem("viewSplitViewWidth", JSON.stringify(splitViewWidth))
  // }, [splitView, splitViewWidth])

  async function workflowSearch() {
    try {
      const response = await client.workflowSearch(workflow)
      if (response) {
        saveBlobAsFile(response.data, "workflows.csv")
      }
    } catch (err: any) {
      throw new Error("Search failed: " + err.message)
    }
  }

  const handleSplitView = (view: String) => {
    switch (view) {
      case "json":
        if (jsonView) {
          setJsonViewWidth(0)
        } else {
          setJsonViewWidth(450)
        }
        setJsonView(!jsonView)
        break
      case "history":
        if (historyView) {
          setHistoryViewWidth(0)
        } else {
          setHistoryViewWidth(450)
        }
        setHistoryView(!historyView)
        break
      case "table":
        if (tableView) {
          setTableViewHeight(0)
        } else {
          setTableViewHeight(450)
        }
        setTableView(!tableView)
        break
      default:
        break
    }
  }

  return (
    <div className="workflow-window" ref={workflowWindowRef}>
      <Canvas
        colorIndex={colorIndex}
        setWorkflow={setWorkflow}
        style={{
          position: "relative",
          left: historyViewWidth,
          width: canvasWidth,
          height: canvasHeight,
        }}
      />
      {jsonView && (
        <div
          className="workflow-window-json"
          style={{
            display: "flex",
            flexDirection: "column",
            position: "absolute",
            left: `calc(100% - ${jsonViewWidth}px)`,
            height: `100%`,
            top: 0,
          }}
        >
          <div className="workflow-window-json-btn-group">
            <SearchIcon onClick={workflowSearch} />
          </div>
          <div className="workflow-window-json-textarea">
            <textarea
              readOnly
              value={workflow ? workflow : "asd"}
              style={{
                width: jsonViewWidth,
                height: `calc(100vh - 115px)`,
                resize: "none",
              }}
            />
          </div>
        </div>
      )}
      <div
        className="workflow-window-btn-wrap"
        style={{
          pointerEvents: "none",
          position: "absolute",
          width: canvasWidth,
          height: canvasHeight,
        }}
      >
        <WorkflowButtons
          jsonView={jsonView}
          historyView={historyView}
          tableView={tableView}
          onSelect={handleSplitView}
        />
      </div>
    </div>
  )
}
