import React, { useState, useRef } from "react"
import { Paper } from "@mantine/core"
import { v4 as uuidv4 } from "uuid"

import Node from "./node.component"
import NavPlanet from "./nav-planet.component"
import Connection from "./connection.component"
import { TempConnection } from "./connection.component"
import { IDConnection } from "./types/connection.type"
import INode from "./types/node.type"

interface CanvasProps {
  colorIndex: number
}

export default function Canvas(props: CanvasProps) {
  const [nodes, setNodes] = useState<INode[]>([])
  const [selectedNode, setSelectedNode] = useState<INode | null>(null)
  const [connectingNode, setConnectingNode] = useState<INode | null>(null)
  const [connections, setConnections] = useState<IDConnection[]>([])
  const [selectedConnection, setSelectedConnection] =
    useState<IDConnection | null>(null)
  const [navOpen, setNavOpen] = useState(false)
  const [navBlocked, setNavBlocked] = useState(false)
  const [clickPosition, setClickPosition] = useState<{
    x: number
    y: number
  } | null>(null)
  const canvasRef = useRef<HTMLDivElement>(null)
  const { colorIndex } = props

  const addNode = (type: INode["type"], position: INode["position"]) => {
    const id = uuidv4()
    const layer = 0
    const newNode = { id, name: "", type, position, layer, isEditing: true }
    setNodes((prevNodes) => [...prevNodes, newNode])
    if (connectingNode) addConnection(connectingNode, newNode)
  }

  const handleNodeClick = (node: INode) => {
    if (connectingNode) {
      addConnection(connectingNode, node)
      setConnectingNode(null)
    } else if (!navOpen) {
      setSelectedNode(node)
      setSelectedConnection(null)
    } else {
      setNavOpen(false)
    }
  }

  const handleNodeMove = (node: INode, position: INode["position"]) => {
    if (connectingNode) {
      setConnectingNode(null)
    }
    setNodes((prevNodes) =>
      prevNodes.map((n) => (n === node ? { ...node, position } : n))
    )
  }

  const handleNodeConnect = (node: INode) => {
    setNavOpen(false)
    setNavBlocked(true)
    setConnectingNode(node)
  }

  const handleNodeNameChange = (
    node: INode,
    newName: string | null,
    byClick: boolean
  ) => {
    if (byClick) setNavBlocked(true)
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
          return { ...n, layer: up ? n.layer + 1 : n.layer - 1 }
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
          connection.start !== node.id && connection.end !== node.id
      )
    )
    setSelectedNode(null)
  }

  const handleNodeNavSelect = (node: INode) => (action: string) => {
    switch (action) {
      case "delete":
        handleNodeDelete(node)
        break
      case "connect":
        setSelectedNode(node)
        setConnectingNode(node)
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

  const addConnection = (start: INode, end: INode) => {
    if (start.id === end.id) return

    const connectionExists = connections.some(
      (connection) =>
        (connection.start === start.id && connection.end === end.id) ||
        (connection.start === end.id && connection.end === start.id)
    )
    if (connectionExists) return
    setConnections((prevConnections) => [
      ...prevConnections,
      { start: start.id, end: end.id },
    ])
  }

  const handleConnectionClick =
    (connection: IDConnection) => (e: React.MouseEvent) => {
      e.stopPropagation()
      setSelectedConnection(connection)
    }

  const handleCanvasClick = (e: React.MouseEvent) => {
    if (navOpen) {
      setNavOpen(false)
      setClickPosition(null)
    } else if (
      canvasRef.current &&
      ((!selectedNode && !selectedConnection && !navBlocked) || connectingNode)
    ) {
      const canvasRect = canvasRef.current.getBoundingClientRect()
      const canvasClickPosition = {
        x: e.clientX - canvasRect.left,
        y: e.clientY - canvasRect.top,
      }
      setClickPosition(canvasClickPosition)
      setNavOpen(true)
    }
    if (!navBlocked) {
      setSelectedNode(null)
      setConnectingNode(null)
      setSelectedConnection(null)
    } else {
      setNavBlocked(false)
    }
  }

  const handleCanvasNavSelect = (type?: INode["type"]) => {
    if (type && clickPosition) {
      addNode(type, clickPosition)
    }
    setNavOpen(false)
    setClickPosition(null)
  }

  return (
    <div>
      <Paper
        onClick={handleCanvasClick}
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
          const startNode = nodes.find((node) => node.id === connection.start)
          const endNode = nodes.find((node) => node.id === connection.end)
          if (!startNode || !endNode) return null // Skip rendering if nodes are not found
          return (
            <Connection
              key={i}
              handleConnectionClick={handleConnectionClick(connection)}
              connection={{ start: startNode, end: endNode }}
              isSelected={connection === selectedConnection}
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

        {nodes.map((node) => (
          <Node
            key={node.id}
            node={node}
            isSelected={node.id === selectedNode?.id}
            connecting={Boolean(connectingNode)}
            colorIndex={colorIndex}
            handleNodeClick={handleNodeClick}
            handleNodeMove={handleNodeMove}
            handleNodeConnect={handleNodeConnect}
            handleNodeNameChange={handleNodeNameChange}
            handleNodeNavSelect={handleNodeNavSelect(node)}
          />
        ))}

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
              onSelect={handleCanvasNavSelect}
              open={navOpen}
              colorIndex={colorIndex}
            />
          </div>
        )}
      </Paper>
    </div>
  )
}
