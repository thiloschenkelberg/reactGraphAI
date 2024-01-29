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

import { useEffect, useRef, useState } from "react"
import { useSpring, animated } from 'react-spring';

import Canvas from "./canvas/Canvas"
import WorkflowButtons from "./WorkflowButtons"
import WorkflowJson from "./WorkflowJson";
import WorkflowHistory from "./WorkflowHistory";
import WorkflowTable from "./WorkflowTable";
import { IConnection, INode } from "../types/canvas.types";

interface WorkflowProps {
  colorIndex: number
}

export default function Workflow(props: WorkflowProps) {
  const { colorIndex } = props
  const [nodes, setNodes] = useState<INode[]>([])
  const [connections, setConnections] = useState<IConnection[]>([])
  const [workflow, setWorkflow] = useState<string | null>(null)

  const [canvasWidth, setCanvasWidth] = useState(0)
  const [canvasHeight, setCanvasHeight] = useState(0)
  const workflowWindowRef = useRef<HTMLDivElement>(null)
  const [workflowWindowRect, setWorkflowWindowRect] = useState<DOMRect | null>(null)

  const [jsonView, setJsonView] = useState(false)
  const [jsonViewWidth, setJsonViewWidth] = useState(0)
  const [historyView, setHistoryView] = useState(false)
  const [historyViewWidth, setHistoryViewWidth] = useState(0)
  const [tableView, setTableView] = useState(false)
  const [tableViewHeight, setTableViewHeight] = useState(0)

  const springProps = useSpring({
    jsonViewWidth:
      jsonView ? jsonViewWidth : 0,
    historyViewWidth:
      historyView ? historyViewWidth : 0,
    tableViewHeight:
      tableView ? tableViewHeight : 0,
    canvasWidth:
      canvasWidth,
    canvasHeight:
      canvasHeight,
    config: {
      tension: 1000,
      friction: 100,
    }
  })

  useEffect(() => {
    if (workflowWindowRect) {
      const width = workflowWindowRect.width - jsonViewWidth - historyViewWidth
      const height = workflowWindowRect.height - tableViewHeight

      setCanvasWidth(width)
      setCanvasHeight(height)
    }  
  }, [workflowWindowRect, jsonViewWidth, historyViewWidth, tableViewHeight])

  // Resize Observer for workflow window
  useEffect(() => {
    const resizeObserver = new ResizeObserver(() => {
      if (workflowWindowRef.current) {
        setWorkflowWindowRect(workflowWindowRef.current.getBoundingClientRect())
      }
    })

    const currentWorkflow = workflowWindowRef.current
    if (currentWorkflow) {
      resizeObserver.observe(currentWorkflow)
    }

    return () => {
      if (currentWorkflow) {
        resizeObserver.unobserve(currentWorkflow)
      }
    }
  }, [workflowWindowRef])

  const handleSplitView = (view: String) => {
    switch (view) {
      case "json":
        if (jsonView) {
          setJsonViewWidth(0)
        } else {
          setJsonViewWidth(450)
        }
        setJsonView(!jsonView);
        break;
      case "history":
        if (historyView) {
          setHistoryViewWidth(0)
        } else {
          setHistoryViewWidth(300)
        }
        setHistoryView(!historyView);
        break;
      case "table":
        if (tableView) {
          setTableViewHeight(0)
        } else {
          setTableViewHeight(400)
        }
        setTableView(!tableView);
        break;
      default:
        break;
    }
  }

  return (
    <div className="workflow-window" ref={workflowWindowRef}>
      <animated.div
        className="workflow-window-canvas"
        style={{
          overflow: "hidden",
          position: "absolute",
          left: springProps.historyViewWidth,
          width: springProps.canvasWidth,
          height: springProps.canvasHeight,
        }}
        children={
          <Canvas
            nodes={nodes}
            connections={connections}
            colorIndex={colorIndex}
            setWorkflow={setWorkflow}
            setNodes={setNodes}
            setConnections={setConnections}
            style={{
              position: "relative",
              width: "100%",
              height: "100%",
            }}
          />
        }
      />

      <animated.div
        className="workflow-window-history"
        style={{
          height: springProps.canvasHeight,
          width: springProps.historyViewWidth,
          borderRight: historyView ? "1px solid #333" : "none"
        }}
        children={
          <WorkflowHistory
            setNodes={setNodes}
            setConnections={setConnections}
          />
        }
      />

      <animated.div
        className="workflow-window-json"
        style={{
          height: springProps.canvasHeight,
          width: springProps.jsonViewWidth,
          borderLeft: jsonView ? "1px solid #333" : "none"
        }}
        children={<WorkflowJson workflow={workflow}/>}
      />

      <animated.div
        className="workflow-window-table"
        style={{
          height: springProps.tableViewHeight,
          width: "100%",
          borderTop: tableView ? "1px solid #333" : "none"
        }}
        children={<WorkflowTable/>}
      />

      <div className="workflow-window-btn-wrap">
        <WorkflowButtons
          jsonView={jsonView}
          jsonViewWidth={jsonViewWidth}
          historyView={historyView}
          historyViewWidth={historyViewWidth}
          tableView={tableView}
          tableViewHeight={tableViewHeight}
          onSelect={handleSplitView}
        />
      </div>
    </div>
  )
}
