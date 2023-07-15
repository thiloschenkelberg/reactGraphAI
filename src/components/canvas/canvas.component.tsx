import React, { useState, useRef } from "react"
import { Paper } from "@mantine/core"

import Node from "./node.component"
import NavPlanet from "./nav-planet.component"
import Connection from "./connection.component"

import INode from "./types/node.type"
type IDConnection = {
  start: number,
  end: number
}

export default function Canvas() {
  const [nodes, setNodes] = useState<INode[]>([])
  const [selectedNode, setSelectedNode] = useState<INode | null>(null)
  // const [nodeClicked, setNodeClicked] = useState(false)
  const [connections, setConnections] = useState<IDConnection[]>([])
  const [dialogOpen, setDialogOpen] = useState(false)
  const [clickPosition, setClickPosition] = useState<{
    x: number
    y: number
  } | null>(null)
  const canvasRef = useRef<HTMLDivElement>(null)

  const addNode = (name: string | null, type: INode["type"], position: INode["position"]) => {
    const id = nodes.length
    setNodes((prevNodes) => [...prevNodes, { id, name, type, position }])
  }

  const addConnection = (start: INode, end: INode) => {
    if (start.id === end.id) return

    const connectionExists = connections.some(
      connection => 
        (connection.start === start.id && connection.end === end.id) ||
        (connection.start === end.id && connection.end === start.id)
    )
    if (connectionExists) return
    setConnections((prevConnections) => [...prevConnections, { start: start.id, end: end.id }])
  }

  const handleNodeClick = (node: INode) => (e: React.MouseEvent) => {
    e.stopPropagation()
    if (selectedNode) {
      addConnection(selectedNode, node)
      setSelectedNode(null)
    } else {
      setSelectedNode(node)
    }
  }

  const handleNodeMove = (node: INode, position: INode["position"]) => {
    setSelectedNode(null)
    setNodes(prevNodes => prevNodes.map(n => n === node ? { ...node, position } : n))
  }

  const handleCanvasClick = (e: React.MouseEvent) => {
    if (dialogOpen) {
      setDialogOpen(false)
      setClickPosition(null)
    } else if (canvasRef.current) {
      const canvasRect = canvasRef.current.getBoundingClientRect()
      const canvasClickPosition = {
        x: e.clientX - canvasRect.left,
        y: e.clientY - canvasRect.top
      }
      setClickPosition(canvasClickPosition)
      setDialogOpen(true)
      setSelectedNode(null)
    }
  }

  const handleCanvasDialogClose = (type?: INode["type"]) => {
    if (type && clickPosition) {
      const name = prompt("Enter name: ")
      addNode(name, type, clickPosition)
    }
    setDialogOpen(false)
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
        }}
        ref={canvasRef}
      >
        {connections.map((connection, i) => {
          const startNode = nodes.find(node => node.id === connection.start);
          const endNode = nodes.find(node => node.id === connection.end);
          if (!startNode || !endNode) return null; // Skip rendering if nodes are not found
          return (
            <Connection
              key={i}
              connection={{ start: startNode, end: endNode }}
            />
          );
        })}

        {nodes.map((node) => (
          <Node
            key={node.id}
            node={node}
            // setNodeClicked={setNodeClicked}
            handleNodeClick={handleNodeClick}
            handleNodeMove={handleNodeMove}
          />
        ))}

        {dialogOpen && clickPosition && (
          <div
            style={{
              position: "absolute",
              left: clickPosition.x,
              top: clickPosition.y,
              transform: "translate(-50%, -50%)",
            }}
          >
            <NavPlanet onSelect={handleCanvasDialogClose} open={dialogOpen} />
          </div>
        )}
      </Paper>
    </div>
  )
}
