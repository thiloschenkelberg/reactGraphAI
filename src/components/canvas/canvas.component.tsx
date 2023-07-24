import React, { useState, useRef, useEffect } from "react"
import { Paper, Button } from "@mantine/core"
import { v4 as uuidv4 } from "uuid"
import cytoscape from "cytoscape"

import Node from "./node.component"
import NavPlanet from "./nav-planet.component"
import Connection from "./connection.component"
import { TempConnection } from "./connection.component"
import { IConnection } from "./types/connection.type"
import INode from "./types/node.type"
import { graphLayouts } from "./types/graphLayouts"

interface CanvasProps {
  colorIndex: number
}

export default function Canvas(props: CanvasProps) {
  const { colorIndex } = props
  const [nodes, setNodes] = useState<INode[]>([])
  const [selectedNodes, setSelectedNodes] = useState<INode[]>([])
  const [connectingNode, setConnectingNode] = useState<INode | null>(null)
  const [connections, setConnections] = useState<IConnection[]>([])
  const [selectedConnection, setSelectedConnection] =
    useState<IConnection | null>(null)
  const [navOpen, setNavOpen] = useState(false)
  const [clickPosition, setClickPosition] = useState<{
    x: number
    y: number
  } | null>(null)
  const [canvasRect, setCanvasRect] = useState<DOMRect | null>(null)
  const [mousePos, setMousePos] = useState<{ x: number; y: number } | null>(
    null
  )
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
    if (canvasRef.current) {
      setCanvasRect(canvasRef.current.getBoundingClientRect())
    } else {
      setCanvasRect(null)
    }
  }, [canvasRef])

  const addNode = (type: INode["type"], position: INode["position"]) => {
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
    setNodes((prevNodes) => [...prevNodes, newNode])
    if (connectingNode) addConnection(connectingNode, newNode)
  }

  const handleNodeClick = (node: INode) => {
    if (connectingNode) {
      addConnection(connectingNode, node)
      setConnectingNode(null)
    } else if (selectedNodes.length > 0 && nodeSelectionStatus(node.id) > 0) {
      setSelectedNodes([])
    } else if (!navOpen) {
      setSelectedNodes([node])
      setSelectedConnection(null)
    } else {
      setNavOpen(false)
    }
  }

  const handleNodeMove = (node: INode, position: INode["position"]) => {
    // if (connectingNode) {
    //   setConnectingNode(null);
    // }
    setNodes((prevNodes) =>
      prevNodes.map((n) => (n === node ? { ...node, position } : n))
    )
  }

  const handleNodeConnect = (node: INode) => {
    setNavOpen(false)
    setClickPosition(null)
    setSelectedNodes([])
    setSelectedConnection(null)
    setConnectingNode(node)
  }

  const handleNodeNameChange = (node: INode, newName: string | null) => {
    setNodes((prevNodes) =>
      prevNodes.map((n) =>
        n.id === node.id ? { ...n, name: newName, isEditing: false } : n
      )
    )
  }

  const handleNodeLayerChange = (node: INode, up: boolean) => {
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

  const handleNodeScale = (node: INode, delta: number) => {
    setNodes((prevNodes) =>
      prevNodes.map((n) => {
        if (n.id === node.id) {
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

  const handleNodeDelete = (node: INode) => {
    setNodes((prevNodes) => prevNodes.filter((n) => n.id !== node.id))
    setConnections((prevConnections) =>
      prevConnections.filter(
        (connection) =>
          connection.start.id !== node.id && connection.end.id !== node.id
      )
    )
    setSelectedNodes([])
  }

  const handleNodeNavSelect = (node: INode, action: string) => {
    switch (action) {
      case "delete":
        handleNodeDelete(node)
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
    } else {
      setSelectedConnection(null)
      setSelectedNodes([])
    }
  }

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault()
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
    e.stopPropagation()

    const cy = cytoscape({
      elements: {
        nodes: nodes.map((node) => ({ data: { id: node.id } })), // transforms your nodes to the format Cytoscape requires
        edges: connections.map((connection) => ({
          data: {
            id: connection.id,
            source: connection.start.id,
            target: connection.end.id,
          },
        })), // transforms your connections to the format Cytoscape requires
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
          newNode.position.x = foundPosition.position.x + canvasRect.width / 2
          newNode.position.y = foundPosition.position.y + canvasRect.height / 2
        }
        return newNode
      })

      setNodes(updatedNodes)
    }
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    setMousePos(
      canvasRect
        ? {
            x: e.clientX - canvasRect.left,
            y: e.clientY - canvasRect.top,
          }
        : null
    )
  }

  return (
    <div>
      <Paper
        onClick={handleCanvasClick}
        onContextMenu={handleContextMenu}
        onMouseMove={handleMouseMove}
        style={{
          height: "100vh",
          width: "100vw",
          backgroundColor: "#1a1b1e",
          position: "relative",
          transition: "filter 0.3s ease",
        }}
        ref={canvasRef}
      >
        {connections.map((connection, i) => {
          const startNode = nodes.find(
            (node) => node.id === connection.start.id
          )
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
        {connectingNode && (
          <TempConnection
            start={connectingNode.position}
            clickPosition={clickPosition}
            canvasRef={canvasRef}
          />
        )}
        {nodes.map((node, i) => (
          <Node
            key={i}
            node={node}
            isSelected={nodeSelectionStatus(node.id)}
            connecting={Boolean(connectingNode)}
            colorIndex={colorIndex}
            mousePos={mousePos}
            handleNodeClick={handleNodeClick}
            handleNodeMove={handleNodeMove}
            handleNodeConnect={handleNodeConnect}
            handleNodeScale={handleNodeScale}
            handleNodeNameChange={handleNodeNameChange}
            handleNodeNavSelect={handleNodeNavSelect}
          />
        ))}
        <div
          style={{
            position: "absolute",
            top: 20,
            left: 20,
            // transform: "translateX(-50%)",
            display: "flex",
            justifyContent: "left",
            width: "100%",
          }}
        >
          <Button onClick={handleLayoutNodes}>Layout Nodes</Button>
        </div>
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
      </Paper>
    </div>
  )
}
