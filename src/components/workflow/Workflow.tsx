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

import { useCallback, useEffect, useRef, useState } from "react"
import { useSpring, animated } from 'react-spring';

import Canvas from "../canvas/Canvas"
import WorkflowButtons from "./WorkflowButtons"
import WorkflowJson from "./WorkflowJson";
import WorkflowHistory from "./WorkflowHistory";
import WorkflowTable from "./WorkflowTable";
import { IConnection, INode } from "../../types/canvas.types";
import { convertToJSONFormat } from "../../common/helpers";
import toast from "react-hot-toast";
import client from "../../client";
import { IWorkflow } from "../../types/workflow.types";

const undoSteps = 200

interface WorkflowProps {
  colorIndex: number
}

export default function Workflow(props: WorkflowProps) {
  const { colorIndex } = props
  const [nodes, setNodes] = useState<INode[]>([])
  const [connections, setConnections] = useState<IConnection[]>([])
  const [selectedNodes, setSelectedNodes] = useState<INode[]>([])
  const [workflow, setWorkflow] = useState<string | null>(null)
  const [workflows, setWorkflows] = useState<IWorkflow[] | undefined>()

  const [needLayout, setNeedLayout] = useState(false)

  const [history, setHistory] = useState<{
    nodes: INode[][]
    connections: IConnection[][]
  }>({ nodes: [], connections: [] })
  const [future, setFuture] = useState<{
    nodes: INode[][]
    connections: IConnection[][]
  }>({ nodes: [], connections: [] })

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

  const [progress, setProgress] = useState<number>(0)

  useEffect(() => {
    setWorkflow(convertToJSONFormat(nodes, connections))
  }, [nodes, connections])

  useEffect(() => {
    fetchWorkflows()
  }, [])

  async function saveWorkflow() {
    const workflow = convertToJSONFormat(nodes, connections, true)

    try {
      await saveWorkflowToHistory(workflow)

      fetchWorkflows()

    } catch (err: any) {
      toast.error(err.message)
    }
  }

  async function deleteWorkflow(workflowId: string) {
    try {
      await deleteWorkflowFromHistory(workflowId)

      fetchWorkflows()

    } catch (err: any) {
      toast.error(err.message)
    }
  }

  async function deleteWorkflowFromHistory(workflowId: string) {
    try {
      const response = await client.deleteWorkflow(workflowId)

      if (response) {
        toast.success(response.data.message)
      }
    } catch (err: any) {
      toast.error(err.message)
    }
  }

  async function saveWorkflowToHistory(workflow: string) {
    try {
      const response = await client.saveWorkflow(workflow)

      if (response) {
        toast.success(response.data.message)
      }
    } catch (err: any) {
      toast.error(err.message)
    }
  }

  async function fetchWorkflows() {
    try {
      const response = await client.getWorkflows()

      if (!response || !response.data.workflows || !response.data.message) {
        toast.error("Error while retrieving workflows!")
      }

      setWorkflows(response.data.workflows)
    } catch (err: any) {
      toast.error(err.message)
    }
  }

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

  // Get nodes and connections from local storage
  useEffect(() => {
    const savedNodes = localStorage.getItem("nodes")
    const savedConnections = localStorage.getItem("connections")

    if (savedNodes) {
      setNodes(JSON.parse(savedNodes))
      if (savedConnections) setConnections(JSON.parse(savedConnections))
    }
  }, [setNodes, setConnections])

  // Save nodes and connections to local storage
  useEffect(() => {
    localStorage.setItem("nodes", JSON.stringify(nodes))
    localStorage.setItem("connections", JSON.stringify(connections))
  }, [nodes, connections])

  const updateHistory = () => {
    setHistory((prev) => ({
      nodes: [...prev.nodes, nodes].slice(-undoSteps),
      connections: [...prev.connections, connections].slice(-undoSteps),
    }))
    setFuture({ nodes: [], connections: [] })
  }

  const updateHistoryWithCaution = () => {
    setHistory((prev) => ({
      nodes: [...prev.nodes, nodes].slice(-undoSteps),
      connections: [...prev.connections, connections].slice(-undoSteps),
    }))
  }

  const updateHistoryRevert = () => {
    setHistory((prev) => ({
      nodes: prev.nodes.slice(0, -1),
      connections: prev.connections.slice(0, -1),
    }))
  }

  const updateHistoryComplete = () => {
    setFuture({ nodes: [], connections: [] })
  }

  const handleReset = () => {
    if (!nodes.length) return
    updateHistory()
    setNodes([])
    setConnections([])
  }

  const undo = useCallback(() => {
    if (history.nodes.length) {
      setFuture((prev) => ({
        nodes: [nodes, ...prev.nodes].slice(-undoSteps),
        connections: [connections, ...prev.connections].slice(-undoSteps),
      }))
      setNodes(
        history.nodes[history.nodes.length - 1].map((node) => ({
          ...node,
          isEditing: false,
        }))
      )
      setConnections(history.connections[history.connections.length - 1])
      setHistory((prev) => ({
        nodes: prev.nodes.slice(0, -1),
        connections: prev.connections.slice(0, -1),
      }))
    }
  }, [history, nodes, connections, setNodes, setConnections])

  const redo = useCallback(() => {
    if (future.nodes.length) {
      setHistory((prev) => ({
        nodes: [...prev.nodes, nodes].slice(-undoSteps),
        connections: [...prev.connections, connections].slice(-undoSteps),
      }))
      setNodes(future.nodes[0].map((node) => ({ ...node, isEditing: false })))
      setConnections(future.connections[0])
      setFuture((prev) => ({
        nodes: prev.nodes.slice(1),
        connections: prev.connections.slice(1),
      }))
    }
  }, [future, nodes, connections, setNodes, setConnections])

  return (
    <div className="workflow" ref={workflowWindowRef}>
      <animated.div
        className="workflow-canvas"
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
            setNodes={setNodes}
            setConnections={setConnections}
            selectedNodes={selectedNodes}
            setSelectedNodes={setSelectedNodes}
            saveWorkflow={saveWorkflow}
            updateHistory={updateHistory}
            updateHistoryWithCaution={updateHistoryWithCaution}
            updateHistoryRevert={updateHistoryRevert}
            updateHistoryComplete={updateHistoryComplete}
            handleReset={handleReset}
            undo={undo}
            redo={redo}
            needLayout={needLayout}
            setNeedLayout={setNeedLayout}
            style={{
              position: "relative",
              width: "100%",
              height: "100%",
            }}
            colorIndex={colorIndex}
          />
        }
      />

      <animated.div
        className="workflow-history"
        style={{
          height: springProps.canvasHeight,
          width: springProps.historyViewWidth,
          borderRight: historyView ? "1px solid #333" : "none"
        }}
        children={
          <WorkflowHistory
            workflows={workflows}
            deleteWorkflow={deleteWorkflow}
            setNodes={setNodes}
            setConnections={setConnections}
            setNeedLayout={setNeedLayout}
            canvasWidth={canvasWidth}
            canvasHeight={canvasHeight}
          />
        }
      />

      <animated.div
        className="workflow-json"
        style={{
          height: springProps.canvasHeight,
          width: springProps.jsonViewWidth,
          borderLeft: jsonView ? "1px solid #333" : "none"
        }}
        children={<WorkflowJson workflow={workflow} setWorkflow={setWorkflow} />}
      />

      <animated.div
        className="workflow-table"
        style={{
          height: springProps.tableViewHeight,
          width: "100%",
          borderTop: tableView ? "1px solid #333" : "none"
        }}
      >
        
        <WorkflowTable
          tableView={tableView}
          progress={progress}
          setProgress={setProgress}
          setNodes={setNodes}
          setConnections={setConnections}
          workflow={workflow}
        />
      </animated.div>

      <div className="workflow-btn-wrap">
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
