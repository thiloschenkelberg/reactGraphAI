import React, { useState, useRef, useEffect, useCallback } from "react"
import { Paper, Button } from "@mantine/core"
import { v4 as uuidv4 } from "uuid"
import cytoscape from "cytoscape"
import _ from "lodash"

import { TbBinaryTree } from "react-icons/tb"
import RestartAltIcon from "@mui/icons-material/RestartAlt"
import UndoIcon from '@mui/icons-material/Undo';
import RedoIcon from '@mui/icons-material/Redo';

import Node from "./node.component"
import NavPlanet from "./nav-planet.component"
import Connection, { TempConnection } from "./connection.component"
import {
  Rect,
  INode,
  IConnection,
  Position,
  Vector2D,
} from "./types/canvas.types"
import { graphLayouts } from "./types/graphLayouts"

interface CanvasProps {
  colorIndex: number
  getWorkflow: (workflow: JSON) => void
}

export default function Canvas(props: CanvasProps) {
  const { colorIndex, getWorkflow } = props
  const [nodes, setNodes] = useState<INode[]>([])
  const [selectedNodes, setSelectedNodes] = useState<INode[]>([])
  const [selectedNodeIDs, setSelectedNodeIDs] = useState<Set<string> | null>(
    null
  )
  const [connectingNode, setConnectingNode] = useState<INode | null>(null)
  const [connections, setConnections] = useState<IConnection[]>([])
  const [selectedConnection, setSelectedConnection] =
    useState<IConnection | null>(null)
  const [history, setHistory] = useState<{nodes: INode[][], connections: IConnection[][]}>({nodes:[], connections:[]})
  const [future, setFuture] = useState<{nodes: INode[][], connections: IConnection[][]}>({nodes:[], connections:[]})
  const [navOpen, setNavOpen] = useState(false)
  const [clickPosition, setClickPosition] = useState<Position | null>(null)
  const [selectionRect, setSelectionRect] = useState<Rect | null>(null)
  const [dragging, setDragging] = useState(false)
  const [canvasRect, setCanvasRect] = useState<DOMRect | null>(null)
  const canvasRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const savedNodes = localStorage.getItem("nodes")
    const savedConnections = localStorage.getItem("connections")

    if (savedNodes) {
      setNodes(JSON.parse(savedNodes))
      if (savedConnections) setConnections(JSON.parse(savedConnections))
    }
  }, [])

  useEffect(() => {
    localStorage.setItem("nodes", JSON.stringify(nodes))
    localStorage.setItem("connections", JSON.stringify(connections))
  }, [nodes, connections])

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

  const addNode = (type: INode["type"], position: Position) => {
    const id = uuidv4()
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

  const handleNodeClick = (node: INode) => {
    if (connectingNode) {
      addConnection(connectingNode, node)
      setConnectingNode(null)
    } else if (nodeSelectionStatus(node.id) > 0) {
      setSelectedNodes([])
    } else if (!navOpen) {
      setSelectedNodes([node])
      setSelectedConnection(null)
    } else {
      setNavOpen(false)
    }
  }

  const initNodeMove = (nodeID: INode["id"]) => {
    updateHistory()
    switch (nodeSelectionStatus(nodeID)) {
      case 0:
        setSelectedNodes([])
        setSelectedNodeIDs(null)
        break
      case 1:
        setSelectedNodeIDs(null)
        break
      case 2:
        setSelectedNodeIDs(new Set(selectedNodes.map((n) => n.id)))
        break
      default:
        return
    }
  }

  const handleNodeMove = _.throttle(
    (nodeID: INode["id"], displacement: Vector2D) => {
      if (selectedNodes.length > 1) {
        if (!selectedNodeIDs) return
        setNodes((prevNodes) =>
          prevNodes.map((n) =>
            selectedNodeIDs.has(n.id)
              ? {
                  ...n,
                  position: {
                    x: n.position.x + displacement.x,
                    y: n.position.y + displacement.y,
                  },
                }
              : n
          )
        )
      } else {
        setNodes((prevNodes) =>
          prevNodes.map((n) =>
            n.id === nodeID
              ? {
                  ...n,
                  position: {
                    x: n.position.x + displacement.x,
                    y: n.position.y + displacement.y,
                  },
                }
              : n
          )
        )
      }
    },
    0
  )

  const handleNodeConnect = (node: INode) => {
    setNavOpen(false)
    setClickPosition(null)
    setSelectedNodes([])
    setSelectedConnection(null)
    setConnectingNode(node)
  }

  const initNodeNameChange = (nodeID: INode["id"]) => {
    updateHistory()
    setNodes(prevNodes => 
      prevNodes.map(node => 
        node.id === nodeID ? { ...node, isEditing: true } : node
      )
    )
  }

  const handleNodeNameChange = (nodeID: INode["id"], name?: string) => {
    const newName = name ? name : ""
    setNodes((prevNodes) =>
      prevNodes.map((n) =>
        n.id === nodeID ? { ...n, name: newName, isEditing: false } : n
      )
    )
  }

  const handleNodeLayerChange = (node: INode, up: boolean) => {
    updateHistory()
    setNodes((prevNodes) =>
      prevNodes.map((n) => {
        if (n.id === node.id) {
          return {
            ...n,
            layer: up ? n.layer + 1 : n.layer - 1 > 0 ? n.layer - 1 : 0,
          }
        } else {
          return n
        }
      })
    )
  }

  const handleNodeScale = (nodeID: INode["id"], delta?: number) => {
    if (!delta) return
    updateHistory()
    setNodes((prevNodes) =>
      prevNodes.map((n) => {
        if (n.id === nodeID) {
          return {
            ...n,
            size:
              delta > 0 && n.size < 200
                ? n.size + delta * 5
                : delta < 0 && n.size > 50
                ? n.size + delta * 5
                : n.size,
          }
        } else {
          return n
        }
      })
    )
  }

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

  const handleNodeAction = (node: INode, action: string, delta?: number, name?: string) => {
    switch (action) {
      case "click":
        handleNodeClick(node)
        break
      case "initMove":
        initNodeMove(node.id)
        break
      case "scale":
        handleNodeScale(node.id, delta)
        break
      case "connect":
        handleNodeConnect(node)
        break
      case "rename":
        handleNodeNameChange(node.id, name)
        break
      case "setIsEditing":
        initNodeNameChange(node.id)
        break
      case "delete":
        setSelectedNodes([])
        handleNodeDelete(node.id)
        break
      case "layerUp":
        handleNodeLayerChange(node, true)
        break
      case "layerDown":
        handleNodeLayerChange(node, false)
        break
      default:
        break
    }
  }

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

  const addConnection = (start: INode, end: INode) => {
    updateHistory()
    if (start.id === end.id) return
    const connectionExists = connections.some(
      (connection) =>
        (connection.start.id === start.id && connection.end.id === end.id) ||
        (connection.start.id === end.id && connection.end.id === start.id)
    )
    if (connectionExists) return
    const connectionID = uuidv4()
    setConnections((prevConnections) => [
      ...prevConnections,
      { start: start, end: end, id: connectionID },
    ])
  }

  const handleConnectionClick =
    (connection: IConnection) =>
    (e: React.MouseEvent<SVGPathElement, MouseEvent>) => {
      e.stopPropagation()
      setSelectedConnection(connection)
      setSelectedNodes([])
      if (navOpen) {
        setNavOpen(false)
        setClickPosition(null)
      }
    }

  const handleCanvasMouseDown = (e: React.MouseEvent) => {
    if (!canvasRect || navOpen) return
    setDragging(true)
    setClickPosition({
      x: e.clientX - canvasRect.left,
      y: e.clientY - canvasRect.top,
    })
  }

  const handleCanvasMouseMove = (e: React.MouseEvent) => {
    if (!dragging || !clickPosition || !canvasRect) return

    const mousePos = {
      x: e.clientX - canvasRect.left,
      y: e.clientY - canvasRect.top,
    }

    setSelectionRect({
      left: Math.min(clickPosition.x, mousePos.x),
      top: Math.min(clickPosition.y, mousePos.y),
      width: Math.abs(mousePos.x - clickPosition.x),
      height: Math.abs(mousePos.y - clickPosition.y),
    })
  }

  const handleCanvasMouseUp = (e: React.MouseEvent) => {
    setDragging(false)
    if (selectionRect) {
      const newSelectedNodes = nodes.filter((node) => {
        return (
          node.position.x >= selectionRect.left &&
          node.position.x <= selectionRect.left + selectionRect.width &&
          node.position.y >= selectionRect.top &&
          node.position.y <= selectionRect.top + selectionRect.height
        )
      })
      setSelectedNodes(newSelectedNodes)
      setClickPosition(null)
    }
  }

  const handleCanvasClick = (e: React.MouseEvent) => {
    if (navOpen) {
      setNavOpen(false)
      setConnectingNode(null)
    } else if (connectingNode) {
      if (canvasRect) {
        const canvasClickPosition = {
          x: e.clientX - canvasRect.left,
          y: e.clientY - canvasRect.top,
        }
        setClickPosition(canvasClickPosition)
        setNavOpen(true)
      }
    } else if (selectionRect) {
      setSelectionRect(null)
    } else {
      setSelectedNodes([])
    }
    setSelectedConnection(null)
  }

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault()
    setSelectionRect(null)
    if (canvasRect) {
      const canvasClickPosition = {
        x: e.clientX - canvasRect.left,
        y: e.clientY - canvasRect.top,
      }
      setClickPosition(canvasClickPosition)
      setNavOpen(true)
    }
    setSelectedNodes([])
    setSelectedConnection(null)
    setConnectingNode(null)
  }

  const handleContextSelect = (type?: INode["type"]) => {
    if (type && clickPosition) {
      addNode(type, clickPosition)
    }
    setNavOpen(false)
    setClickPosition(null)
  }

  const handleLayoutNodes = (e: React.MouseEvent) => {
    updateHistory()
    e.stopPropagation()
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

    const layout = cy.layout(graphLayouts[0]) // choose layout
    layout.run()

    const nodePositions = cy.nodes().map((node) => ({
      id: node.id(),
      position: node.position(),
    }))

    if (canvasRect) {
      const updatedNodes = nodes.map((node) => {
        const newNode = { ...node } // Copy node to not mutate the original object
        const foundPosition = nodePositions.find((np) => np.id === node.id)
        if (foundPosition) {
          const xPrime =
            foundPosition.position.x * Math.cos(-Math.PI / 2) -
            foundPosition.position.y * Math.sin(-Math.PI / 2)
          const yPrime =
            foundPosition.position.x * Math.sin(-Math.PI / 2) +
            foundPosition.position.y * Math.cos(-Math.PI / 2)

          newNode.position.x = xPrime + canvasRect.width / 2 - canvasRect.left
          newNode.position.y =
            yPrime + canvasRect.height / 2 - canvasRect.top + 20
        }
        return newNode
      })

      setNodes(updatedNodes)
    }
  }

  const updateHistory = () => {
    setHistory(prev => ({
      nodes: [...prev.nodes, nodes].slice(-20),
      connections: [...prev.connections, connections].slice(-20)
    }))
    setFuture({nodes:[], connections:[]})
  }

  const handleReset = () => {
    if (!nodes.length) return
    updateHistory()
    setNodes([])
    setConnections([])
  }

  const undo = useCallback(() => {
    if (history.nodes.length) {
      setFuture(prev => ({
          nodes: [nodes, ...prev.nodes].slice(-20),
          connections: [connections, ...prev.connections].slice(-20)
      }))
      setNodes(history.nodes[history.nodes.length - 1])
      setConnections(history.connections[history.connections.length - 1])
      setHistory(prev => ({
          nodes: prev.nodes.slice(0,-1),
          connections: prev.connections.slice(0,-1)
      }))
    }
  }, [history, nodes, connections])

  const redo = useCallback(() => {
    if (future.nodes.length) {
      setHistory(prev => ({
        nodes: [...prev.nodes, nodes].slice(-20),
        connections: [...prev.connections, connections].slice(-20)
      }))
      setNodes(future.nodes[0])
      setConnections(future.connections[0])
      setFuture(prev => ({
        nodes: prev.nodes.slice(1),
        connections: prev.connections.slice(1)
      }))
    }
  }, [future, nodes, connections])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey) {
        switch(e.key) {
          case "z":
            undo()
            break
          case "y":
            redo()
            break
          default:
            break
        }
      }
    }

    window.addEventListener("keydown", handleKeyDown)

    return () => {
      document.removeEventListener("keydown", handleKeyDown)
    }
  }, [undo, redo])

  return (
    <div
      className="canvas"
      // Selection rectangle
      onMouseDown={handleCanvasMouseDown}
      onMouseMove={handleCanvasMouseMove}
      onMouseUp={handleCanvasMouseUp}
      // Context menu
      onClick={handleCanvasClick}
      onContextMenu={handleContextMenu}
      ref={canvasRef}
    >
      {/* Connections */}
      {connections.map((connection, i) => {
        const startNode = nodes.find((node) => node.id === connection.start.id)
        const endNode = nodes.find((node) => node.id === connection.end.id)
        if (!startNode || !endNode) return null // Skip rendering if nodes are not found
        return (
          <Connection
            key={i}
            handleConnectionClick={handleConnectionClick}
            connection={{ start: startNode, end: endNode, id: connection.id }}
            isSelected={connection.id === selectedConnection?.id}
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
          key={i}
          node={node}
          isSelected={nodeSelectionStatus(node.id)}
          connecting={Boolean(connectingNode)}
          colorIndex={colorIndex}
          canvasRect={canvasRect}
          handleNodeMove={handleNodeMove}
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
      <div className="canvas-btn-wrap" style={{left: canvasRect ? canvasRect.width/2 : "50%"}}>
      
      {history.nodes.length}
      <div className="canvas-btn-divider" />

        <div className="canvas-btn" onClick={undo}>
          <UndoIcon className="canvas-btn-icon" />
        </div>

        <div className="canvas-btn-divider" />

        <div className="canvas-btn" onClick={handleReset}>
          <RestartAltIcon className="canvas-btn-icon" />
        </div>

        <div className="canvas-btn-divider" />

        <div className="canvas-btn" onClick={redo}>
          <RedoIcon className="canvas-btn-icon" />
        </div>

        <div className="canvas-btn-divider" />

        <div className="canvas-btn" onClick={handleLayoutNodes}>
          <TbBinaryTree
            className="canvas-btn-icon"
            style={{ width: "80%", height: "80%", marginLeft: "3px" }}
          />
        </div>

      </div>
      {/* Canvas Context Menu */}
      {navOpen && clickPosition && (
        <div
          style={{
            position: "absolute",
            left: clickPosition.x,
            top: clickPosition.y,
            transform: "translate(-50%, -50%)",
          }}
        >
          <NavPlanet
            onSelect={handleContextSelect}
            open={navOpen}
            colorIndex={colorIndex}
          />
        </div>
      )}
    </div>
  )
}
