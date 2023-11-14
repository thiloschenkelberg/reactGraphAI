// TODO: copy - paste?

import React, { useState, useRef, useEffect, useCallback } from "react"
import { v4 as uuidv4 } from "uuid"
import cytoscape from "cytoscape"
import fcose from "cytoscape-fcose"
import _ from "lodash"
import { toast } from "react-hot-toast"

import ContextCanvas from "./CanvasContext"
import Node from "./node/Node"
import Connection, { TempConnection } from "./connection/Connection"
import {
  Rect,
  INode,
  IConnection,
  Position,
  Vector2D,
  ICanvasButton,
} from "./types/canvas.types"
import { graphLayouts } from "./types/canvas.graphLayouts"
import {
  isConnectableNode,
  isConnectionLegitimate,
  convertToJSONFormat,
  saveWorkflow,
  clamp,
} from "../../common/helpers"
import CanvasButtonGroup from "./CanvasButtons"

interface CanvasProps {
  colorIndex: number
  setWorkflow: React.Dispatch<React.SetStateAction<string | null>>
  splitView: boolean
  style?: React.CSSProperties
}

export default function Canvas(props: CanvasProps) {
  const { colorIndex, setWorkflow, splitView, style } = props
  const [nodes, setNodes] = useState<INode[]>([])
  const [selectedNodes, setSelectedNodes] = useState<INode[]>([])
  const [movingNodeIDs, setMovingNodeIDs] = useState<Set<string> | null>(null)
  const [connectingNode, setConnectingNode] = useState<INode | null>(null)
  const [connections, setConnections] = useState<IConnection[]>([])
  const [selectedConnectionID, setSelectedConnectionID] = useState<
    IConnection["id"] | null
  >(null)
  const [history, setHistory] = useState<{
    nodes: INode[][]
    connections: IConnection[][]
  }>({ nodes: [], connections: [] })
  const [future, setFuture] = useState<{
    nodes: INode[][]
    connections: IConnection[][]
  }>({ nodes: [], connections: [] })
  const [mousePosition, setMousePosition] = useState<Position>({ x: 0, y: 0 })
  const [navOpen, setNavOpen] = useState(false)
  const [clickPosition, setClickPosition] = useState<Position | null>(null)
  const [selectionRect, setSelectionRect] = useState<Rect | null>(null)
  const [dragging, setDragging] = useState(false)
  const [dragCurrentPos, setDragCurrentPos] = useState<Position | null>(null)
  const [altPressed, setAltPressed] = useState(false)
  const [ctrlPressed, setCtrlPressed] = useState(false)
  const [canvasRect, setCanvasRect] = useState<DOMRect | null>(null)
  const canvasRef = useRef<HTMLDivElement>(null)
  const undoSteps = 200

  // Get nodes and connections from local storage
  useEffect(() => {
    const savedNodes = localStorage.getItem("nodes")
    const savedConnections = localStorage.getItem("connections")

    if (savedNodes) {
      setNodes(JSON.parse(savedNodes))
      if (savedConnections) setConnections(JSON.parse(savedConnections))
    }
  }, [])

  // Save nodes and connections to local storage
  useEffect(() => {
    localStorage.setItem("nodes", JSON.stringify(nodes))
    localStorage.setItem("connections", JSON.stringify(connections))
  }, [nodes, connections])

  // Resize Observer to get correct canvas bounds and
  // successively correct mouse positions
  useEffect(() => {
    const resizeObserver = new ResizeObserver(() => {
      if (canvasRef.current) {
        setCanvasRect(canvasRef.current.getBoundingClientRect())
      }
    })

    const currentCanvas = canvasRef.current
    if (currentCanvas) {
      resizeObserver.observe(currentCanvas)
    }

    return () => {
      if (currentCanvas) {
        resizeObserver.unobserve(currentCanvas)
      }
    }
  }, [canvasRef])

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!canvasRect) return
      setMousePosition({
        x: e.clientX - canvasRect.left,
        y: e.clientY - canvasRect.top,
      })
    }

    window.addEventListener("mousemove", handleMouseMove)
    return () => {
      window.removeEventListener("mousemove", handleMouseMove)
    }
  })

  // pass workflow to parent (search component)
  useEffect(() => {
    setWorkflow(convertToJSONFormat(nodes, connections))
  }, [nodes, connections, setWorkflow])

  // addNode from canvas context menu
  // if created from connector, automatically
  // add connection between nodes
  const addNode = (type: INode["type"], position: Position) => {
    const id = uuidv4().replaceAll("-", "")
    const layer = 0
    const size = 100
    const newNode = {
      id,
      name: "",
      type,
      position,
      size,
      layer,
      isEditing: true,
    }
    if (connectingNode) {
      addConnection(connectingNode, newNode)
    } else {
      updateHistory()
    }
    setNodes((prevNodes) => [...prevNodes, newNode])
  }

  // handle click (release) on node
  // adds connection if connecting from other node
  // selects node (will also open node context)
  const handleNodeClick = (node: INode) => {
    cleanupDrag()
    if (selectionRect) {
      selectNodesBySelectionRect(node)
    } else if (connectingNode) {
      addConnection(connectingNode, node)
      setConnectingNode(null)
    } else {
      updateHistoryRevert()
      switch (nodeSelectionStatus(node.id)) {
        case 0:
          if (!navOpen) {
            setSelectedConnectionID(null)
            if (ctrlPressed) {
              setSelectedNodes((selectedNodes) => [...selectedNodes, node])
              return
            }
            setSelectedNodes([node])
          } else {
            setNavOpen(false)
          }
          break
        case 1:
          setSelectedNodes([])
          break
        case 2:
          if (ctrlPressed) {
            setSelectedNodes(
              selectedNodes.filter(
                (selectedNode) => selectedNode.id !== node.id
              )
            )
            return
          }
          setSelectedNodes([node])
          break
        default:
          return
      }
    }
  }

  // initialize node movement
  // mainly prevents unwanted actions
  // like moving nodes that are not involved
  const initNodeMove = (nodeID: INode["id"]) => {
    updateHistoryWithCaution()
    setConnectingNode(null)
    setNavOpen(false)
    setClickPosition(null)
    setDragging(true)
    setDragCurrentPos(mousePosition)
    if (altPressed) {
      setMovingNodeIDs(new Set(nodes.map((n) => n.id)))
    } else {
      switch (nodeSelectionStatus(nodeID)) {
        case 0:
          if (ctrlPressed) {
            setMovingNodeIDs(new Set(selectedNodes.map((n) => n.id)))
            return
          }
          setSelectedNodes([])
          setMovingNodeIDs(new Set([nodeID]))
          break
        case 1:
          setMovingNodeIDs(new Set([nodeID]))
          break
        case 2:
          setMovingNodeIDs(new Set(selectedNodes.map((n) => n.id)))
          break
        default:
          return
      }
    }
  }

  // finalize node movement
  // saves movement to history
  // -> action can be undone and redone properly
  const completeNodeMove = () => {
    cleanupDrag()
    updateHistoryComplete()
  }

  const cleanupDrag = () => {
    setClickPosition(null)
    setDragging(false)
    setDragCurrentPos(null)
  }

  // actual node movement
  // TODO: change method of moving nodes
  // from mapping whole node array for
  // each movement step, to splitting array
  // into static and dynamic nodes and
  // moving whole array more efficiently
  const handleNodeMove = _.throttle((displacement: Vector2D) => {
    if (!movingNodeIDs) return
    setNodes((prevNodes) =>
      prevNodes.map((n) =>
        movingNodeIDs.has(n.id)
          ? {
              ...n,
              position: {
                // x: clamp(n.position.x + displacement.x, n.size/2 + 10, window.innerWidth - (n.size/2)),
                // y: clamp(n.position.y + displacement.y, n.size/2, window.innerHeight - (n.size/2)),
                x: n.position.x + displacement.x,
                y: n.position.y + displacement.y,
              },
            }
          : n
      )
    )
  })

  // move all nodes
  const handleCanvasGrab = (displacement: Vector2D) => {
    setNodes((prevNodes) =>
      prevNodes.map((n) => ({
        ...n,
        position: {
          // x: clamp(n.position.x + displacement.x, n.size / 2 + 10, window.innerWidth - (n.size / 2)),
          // y: clamp(n.position.y + displacement.y, n.size / 2, window.innerHeight - (n.size / 2)),
          x: n.position.x + displacement.x,
          y: n.position.y + displacement.y,
        },
      }))
    )
  }

  // initialize node connection
  // -> mouse needs to be released on another node
  //    to create a connection
  const handleNodeConnect = (node: INode) => {
    setNavOpen(false)
    setClickPosition(null)
    setSelectedNodes([])
    setSelectedConnectionID(null)
    setConnectingNode(node)
  }

  // sets node isEditing field
  // so input field will show
  const initNodeNameChange = (nodeID: INode["id"], undoHistory?: boolean) => {
    cleanupDrag()
    if (undoHistory) updateHistoryRevert()
    if (ctrlPressed) {
      const node = nodes.find((node) => node.id === nodeID)
      if (node) {
        handleNodeClick(node)
        return
      }
    } else {
      setSelectedNodes([])
    }
    setNodes((prevNodes) =>
      prevNodes.map((node) =>
        node.id === nodeID ? { ...node, isEditing: true } : node
      )
    )
  }

  // rename node -> resetting isEditing to false
  const handleNodeNameChange = (
    nodeID: INode["id"],
    name?: string,
    value?: number,
    operator?: INode["operator"]
  ) => {
    const newName = name ? name : ""
    setNodes((prevNodes) =>
      prevNodes.map((n) => {
        if (n.id === nodeID) {
          const updatedNode: INode = {
            ...n,
            name: newName,
            value: value,
            operator: operator,
            isEditing: false,
          }
          // Check if any fields have changed
          if (
            newName !== n.name ||
            value !== n.value ||
            operator !== n.operator
          ) {
            updateHistory() // Call updateHistory only if a change has occurred
          }
          return updatedNode
        }
        return n
      })
    )
    setSelectedNodes([])
  }

  // deprecated
  const handleNodeLayerChange = (node: INode, up?: boolean) => {
    updateHistory()
    setNodes((prevNodes) =>
      prevNodes.map((n) => {
        if (n.id === node.id) {
          return {
            ...n,
            layer:
              up === true ? n.layer + 1 : n.layer - 1 > 0 ? n.layer - 1 : 0,
          }
        } else {
          return n
        }
      })
    )
  }

  // scale node
  // TODO: enable scaling of nodes when
  //       when autoscaling is disabled
  const handleNodeScale = (nodeID: INode["id"], delta?: number) => {
    if (!delta) return
    updateHistory()
    setNodes((prevNodes) =>
      prevNodes.map((n) => {
        if (n.id === nodeID) {
          return {
            ...n,
            size:
              // 100
              delta < 0 && n.size < 350
                ? n.size - delta * 5
                : delta > 0 && n.size > 75
                ? n.size - delta * 5
                : n.size,
          }
        } else {
          return n
        }
      })
    )
  }

  // delete node
  const handleNodeDelete = (nodeID: INode["id"]) => {
    updateHistory()
    setNodes((prevNodes) => prevNodes.filter((n) => n.id !== nodeID))
    setConnections((prevConnections) =>
      prevConnections.filter(
        (connection) =>
          connection.start.id !== nodeID && connection.end.id !== nodeID
      )
    )
    setSelectedNodes([])
  }

  const selectNodesBySelectionRect = (node?: INode) => {
    if (!selectionRect) return

    let rectSelectedNodes = nodes.filter((node) => {
      return (
        node.position.x >= selectionRect.left &&
        node.position.x <= selectionRect.left + selectionRect.width &&
        node.position.y >= selectionRect.top &&
        node.position.y <= selectionRect.top + selectionRect.height
      )
    })

    if (node) {
      const alreadySelected = rectSelectedNodes.some(
        (selectedNode) => selectedNode.id === node.id
      )
      if (!alreadySelected) {
        rectSelectedNodes.push(node)
      }
    }

    setSelectedNodes(rectSelectedNodes)
    setSelectionRect(null)
  }

  const copyNodes = () => {
    if (selectedNodes.length > 0) {
    }
  }

  const pasteNodes = () => {}

  // switch node action
  // prevents the need for passing
  // too many functions as props
  const handleNodeAction = (
    node: INode,
    action: string,
    name?: string,
    value?: number,
    operator?: INode["operator"],
    conditional?: boolean
  ) => {
    switch (action) {
      case "click":
        handleNodeClick(node)
        break
      case "initMove":
        initNodeMove(node.id)
        break
      case "completeMove":
        completeNodeMove()
        break
      case "scale":
        handleNodeScale(node.id, value)
        break
      case "connect":
        handleNodeConnect(node)
        break
      case "rename":
        handleNodeNameChange(node.id, name, value, operator)
        break
      case "setIsEditing":
        initNodeNameChange(node.id, conditional)
        break
      case "delete":
        setSelectedNodes([])
        handleNodeDelete(node.id)
        break
      case "changeLayer":
        handleNodeLayerChange(node, conditional)
        break
      default:
        break
    }
  }

  // set node selection status
  // 0 = node is not selected
  // 1 = node is selected
  // 2 = node is selected among others
  const nodeSelectionStatus = (nodeID: string) => {
    const isSelected = selectedNodes.some(
      (selectedNode) => selectedNode.id === nodeID
    )
    if (isSelected) {
      if (selectedNodes.length > 1) return 2
      return 1
    }
    return 0
  }

  // add connection between two nodes
  // checks for already existing connections
  // checks for legitimate connections
  const addConnection = (start: INode, end: INode) => {
    if (start.id === end.id) return
    const connectionExists = connections.some(
      (connection) =>
        (connection.start.id === start.id && connection.end.id === end.id) ||
        (connection.start.id === end.id && connection.end.id === start.id)
    )
    if (connectionExists || !isConnectionLegitimate(start, end)) {
      toast.error("Connection invalid!")
      return
    }
    updateHistory()
    const connectionID = uuidv4().replaceAll("-", "")
    setConnections((prevConnections) => [
      ...prevConnections,
      { start: start, end: end, id: connectionID },
    ])
  }

  // selects a connection
  // (will also open connection context menu)
  const handleConnectionClick = (connectionID: IConnection["id"]) => {
    setSelectedConnectionID(connectionID)
    setSelectedNodes([])
    if (navOpen) {
      setNavOpen(false)
      setClickPosition(null)
    }
  }

  // deletes connection
  const handleConnectionDelete = (connectionID: IConnection["id"]) => {
    updateHistory()
    setConnections((prevConnections) =>
      prevConnections.filter((connection) => connection.id !== connectionID)
    )
  }

  // reverses connection direction if possible
  const handleConnectionReverse = (connectionID: IConnection["id"]) => {
    setConnections((prevConnections) =>
      prevConnections.map((c) => {
        if (c.id === connectionID) {
          if (isConnectionLegitimate(c.end, c.start)) {
            updateHistory()
            return { ...c, start: c.end, end: c.start }
          } else {
            toast.error("Connection cannot be reversed!")
            return c
          }
        } else {
          return c
        }
      })
    )
  }

  // connection action switch
  const handleConnectionAction = (
    connectionID: IConnection["id"],
    action: string
  ) => {
    switch (action) {
      case "click":
        handleConnectionClick(connectionID)
        break
      case "reverse":
        handleConnectionReverse(connectionID)
        break
      case "delete":
        handleConnectionDelete(connectionID)
        break
      default:
        break
    }
  }

  const handleLayoutNodes = (iteration = 0, maxIterations = 10) => {
    if (iteration >= maxIterations) {
      // do some warning and stop layout
      return
    }

    cytoscape.use(fcose)
    const cy = cytoscape({
      elements: {
        nodes: nodes.map((node) => ({ data: { id: node.id } })),
        edges: connections.map((connection) => ({
          data: {
            id: connection.id,
            source: connection.start.id,
            target: connection.end.id,
          },
        })), // Transform connections to Cytoscape format
      },
      headless: true,
    })

    const layout = cy.layout(graphLayouts[3]) // choose layout
    layout.run()

    const nodePositions = cy.nodes().map((node) => ({
      id: node.id(),
      position: node.position(),
    }))

    let bounds = {
      minX: Infinity,
      maxX: -Infinity,
      minY: Infinity,
      maxY: -Infinity,
    }

    nodePositions.forEach((node) => {
      if (node.position.x < bounds.minX) bounds.minX = node.position.x
      if (node.position.x > bounds.maxX) bounds.maxX = node.position.x
      if (node.position.y < bounds.minY) bounds.minY = node.position.y
      if (node.position.y > bounds.maxY) bounds.maxY = node.position.y
    })

    const width = bounds.maxX - bounds.minX
    const height = bounds.maxY - bounds.minY

    let rotate = false
    if (height > width) rotate = true

    if (canvasRect) {
      // ############# handle nodes out of bounds
      // let nodeOutOfBounds = false
      const updatedNodes = nodes.map((node) => {
        const newNode = { ...node } // Copy node to not mutate the original object
        const foundPosition = nodePositions.find((np) => np.id === node.id)
        if (foundPosition) {
          let xPrime, yPrime

          if (rotate) {
            xPrime = -foundPosition.position.y
            yPrime = foundPosition.position.x
          } else {
            xPrime = foundPosition.position.x
            yPrime = foundPosition.position.y
          }

          newNode.position = {
            x:
              xPrime -
              (rotate ? bounds.minY : bounds.minX) +
              canvasRect.width / 2 -
              (rotate ? height / 2 : width / 2),
            y:
              yPrime -
              (rotate ? bounds.minX : bounds.minY) +
              canvasRect.height / 2 -
              (rotate ? width / 2 : height / 2) -
              40,
          }

          // ############# handle nodes out of bounds
          // if (
          //   newNode.position.x < newNode.size / 2 + 10 || newNode.position.x > window.innerWidth - (newNode.size / 2) ||
          //   newNode.position.y < newNode.size / 2 || newNode.position.y > window.innerHeight - (newNode.size / 2)
          // ) {
          //   nodeOutOfBounds = true
          // }
        }
        return newNode
      })
      setNodes(updatedNodes)
    }
  }

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

  // const logHistory = () => {
  //   history.nodes.forEach((nodesArray, index) => {
  //     console.log(`History entry ${index}:`)

  //     nodesArray.forEach((node, index) => {
  //       console.log(
  //         `Node ${index}: x = ${node.position.x}, y = ${node.position.y}`
  //       )
  //     })
  //   })
  // }

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
  }, [history, nodes, connections])

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
  }, [future, nodes, connections])

  useEffect(() => {
    const handleCanvasKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === "Z") {
        e.preventDefault()
        redo()
      } else if (e.ctrlKey) {
        setCtrlPressed(true)
        switch (e.key) {
          case "a":
            e.preventDefault()
            setSelectedNodes(nodes)
            break
          case "c":
            e.preventDefault()
            break
          case "d":
            e.preventDefault()
            setSelectedNodes([])
            break
          case "v":
            e.preventDefault()
            break
          case "y":
            e.preventDefault()
            redo()
            break
          case "z":
            e.preventDefault()
            undo()
            break
          default:
            break
        }
      } else if (e.altKey) {
        setAltPressed(true)
      }
    }

    window.addEventListener("keydown", handleCanvasKeyDown)

    return () => {
      window.removeEventListener("keydown", handleCanvasKeyDown)
    }
  }, [undo, redo, nodes])

  const handleCanvasKeyUp = (e: React.KeyboardEvent) => {
    if (e.key === "Alt") {
      e.preventDefault()
      setAltPressed(false)
    }
    if (e.key === "Control") {
      setCtrlPressed(false)
    }
    if (e.key !== "Delete" || (!selectedNodes && !selectedConnectionID)) return
    updateHistory()
    if (selectedNodes.length > 0) {
      const nodeIDs = new Set(selectedNodes.map((n) => n.id))
      if (!nodeIDs) return
      setNodes((prevNodes) => prevNodes.filter((n) => !nodeIDs.has(n.id)))
      setConnections((prevConnections) =>
        prevConnections.filter(
          (connection) =>
            !nodeIDs.has(connection.start.id) && !nodeIDs.has(connection.end.id)
        )
      )
    } else if (selectedConnectionID) {
      setConnections((prevConnections) =>
        prevConnections.filter(
          (connection) => connection.id !== selectedConnectionID
        )
      )
      // setConnections((prevConnections) =>
      //   prevConnections.filter((connection) => connection.id !== connectionID)
      // )
    }
  }

  const handleCanvasMouseDown = (e: React.MouseEvent) => {
    if (!canvasRect || navOpen || e.button === 2) return

    setDragging(true)

    if (e.button === 1 || altPressed) {
      setMovingNodeIDs(new Set(nodes.map((n) => n.id)))
      setDragCurrentPos(mousePosition)
      // initNodeMove()
      return
    }

    setClickPosition(mousePosition)
  }

  const handleCanvasMouseMove = (e: React.MouseEvent) => {
    if (!dragging || !canvasRect) return

    if (dragCurrentPos) {
      const displacement: Vector2D = {
        x: mousePosition.x - dragCurrentPos.x,
        y: mousePosition.y - dragCurrentPos.y,
      }
      if (movingNodeIDs?.size === nodes.length) {
        handleCanvasGrab(displacement)
      } else {
        handleNodeMove(displacement)
      }

      setDragCurrentPos({
        x: mousePosition.x,
        y: mousePosition.y,
      })
    }

    if (!clickPosition) return

    setSelectionRect({
      left: Math.min(clickPosition.x, mousePosition.x),
      top: Math.min(clickPosition.y, mousePosition.y),
      width: Math.abs(mousePosition.x - clickPosition.x),
      height: Math.abs(mousePosition.y - clickPosition.y),
    })
  }

  const handleCanvasMouseUp = (e: React.MouseEvent) => {
    if (e.button === 2) return
    if (e.button !== 1 && !altPressed) setSelectedNodes([])

    setClickPosition(null)
    setMovingNodeIDs(null)
    setSelectedConnectionID(null)
    cleanupDrag()

    if (selectionRect) {
      selectNodesBySelectionRect()
    } else if (navOpen) {
      setNavOpen(false)
      setConnectingNode(null)
    } else if (connectingNode) {
      if (isConnectableNode(connectingNode.type) && canvasRect) {
        const canvasClickPosition = mousePosition
        setClickPosition(canvasClickPosition)
        setNavOpen(true)
      } else {
        setConnectingNode(null)
        toast.error("No possible connection!")
      }
    }
  }

  const canvasZoom = useCallback(
    (delta: number, mousePos: Position) => {
      const updatedNodes = nodes.map((node) => {
        const zoomFactor = 1 - 0.1 * delta

        const dx = node.position.x - mousePos.x
        const dy = node.position.y - mousePos.y

        const newNodePosition: Position = {
          x: mousePos.x + dx * zoomFactor,
          y: mousePos.y + dy * zoomFactor,
        }
        return {
          ...node,
          position: newNodePosition,
        }
      })

      setNodes(updatedNodes)
    },
    [nodes]
  )

  useEffect(() => {
    const handleCanvasWheel = (e: WheelEvent) => {
      e.preventDefault()
      if (!canvasRect) return

      const delta = Math.sign(e.deltaY)

      canvasZoom(delta, mousePosition)
    }

    window.addEventListener("wheel", handleCanvasWheel, { passive: false })
    return () => {
      window.removeEventListener("wheel", handleCanvasWheel)
    }
  }, [canvasRect, canvasZoom, mousePosition])

  const handleDefaultContextMenu = (e: React.MouseEvent) => {
    e.preventDefault()
    setSelectionRect(null)
    if (canvasRect) {
      const canvasClickPosition = mousePosition
      setClickPosition(canvasClickPosition)
      setNavOpen(true)
    }
    setSelectedNodes([])
    setSelectedConnectionID(null)
    setConnectingNode(null)
  }

  const handleContextSelect = (type?: INode["type"]) => {
    if (type && clickPosition) {
      addNode(type, clickPosition)
    }
    setNavOpen(false)
    setClickPosition(null)
  }

  const handleButtonSelect = (buttonType: ICanvasButton["type"]) => {
    switch (buttonType) {
      case "undo":
        undo()
        break
      case "redo":
        redo()
        break
      case "reset":
        handleReset()
        break
      case "layout":
        updateHistory()
        handleLayoutNodes()
        break
      case "saveToFile":
        saveWorkflow(nodes, connections)
        break
    }
  }

  return (
    <div
      className="canvas"
      style={{
        ...style,
        cursor: (dragging && dragCurrentPos) ? "grabbing" : "default",
      }}
      // Selection rectangle
      onMouseDown={handleCanvasMouseDown}
      onMouseMove={handleCanvasMouseMove}
      onMouseUp={handleCanvasMouseUp}
      // Context menu
      onContextMenu={handleDefaultContextMenu}
      // Delete stuff
      onKeyUp={handleCanvasKeyUp}
      ref={canvasRef}
      tabIndex={0}
    >
      {/* Connections */}
      {connections.map((connection, i) => {
        const startNode = nodes.find((node) => node.id === connection.start.id)
        const endNode = nodes.find((node) => node.id === connection.end.id)
        if (!startNode || !endNode) return null // Skip rendering if nodes are not found
        return (
          <Connection
            key={i}
            handleConnectionAction={handleConnectionAction}
            connection={{ start: startNode, end: endNode, id: connection.id }}
            isSelected={connection.id === selectedConnectionID}
          />
        )
      })}
      {/* Temp Connection */}
      {connectingNode && (
        <TempConnection
          startPosition={connectingNode.position}
          endPosition={clickPosition}
          canvasRect={canvasRect}
        />
      )}
      {/* Nodes */}
      {nodes.map((node, i) => (
        <Node
          key={node.id}
          node={node}
          isSelected={nodeSelectionStatus(node.id)}
          connecting={Boolean(connectingNode)}
          colorIndex={colorIndex}
          canvasRect={canvasRect}
          mousePosition={mousePosition}
          // handleNodeMove={handleNodeMove}
          handleNodeAction={handleNodeAction}
        />
      ))}
      {/* Selection rectangle */}
      {selectionRect && (
        <div
          className="selection-rect"
          style={{
            top: selectionRect.top,
            left: selectionRect.left,
            width: selectionRect.width,
            height: selectionRect.height,
          }}
        />
      )}
      {/* Canvas Buttons */}
      <CanvasButtonGroup
        canvasRect={canvasRect}
        splitView={splitView}
        onSelect={handleButtonSelect}
      />
      {/* Canvas Context Menu */}
      {navOpen && clickPosition && (
        <div
          style={{
            position: "absolute",
            left: clickPosition.x,
            top: clickPosition.y,
            transform: "translate(-50%, -50%)",
            zIndex: 3,
          }}
        >
          <ContextCanvas
            onSelect={handleContextSelect}
            open={navOpen}
            colorIndex={colorIndex}
            contextRestrict={connectingNode?.type}
            position={clickPosition}
          />
        </div>
      )}
    </div>
  )
}
