import React, { useState, useRef, useEffect } from "react"
import { Paper } from "@mantine/core"

import Node from "./node.component"
import NavPlanet from "./nav-planet.component"
import Connection from "./connection.component"

import INode from "./types/node.type"
import IConnection from "./types/connection.type"

export default function Canvas() {
  const [nodes, setNodes] = useState<INode[]>([])
  const [selectedNode, setSelectedNode] = useState<INode | null>(null)
  // const [nodeClicked, setNodeClicked] = useState(false)
  const [connections, setConnections] = useState<IConnection[]>([])
  const [dialogOpen, setDialogOpen] = useState(false)
  const [clickPosition, setClickPosition] = useState<{
    x: number
    y: number
  } | null>(null)
  const canvasRef = useRef<HTMLDivElement>(null)

  // useEffect(() => {
  //   const handleClick = (e: MouseEvent) => {
  //     const clickP
  //   }
  // })

  const addNode = (type: INode["type"], position: INode["position"]) => {
    setNodes((prevNodes) => [...prevNodes, { type, position }])
  }

  const addConnection = (start: INode, end: INode) => {
    setConnections((prevConnections) => [...prevConnections, { start, end }])
  }

  const handleNodeClick = (node: INode) => (e: React.MouseEvent) => {
    e.stopPropagation()
    // setNodeClicked(true)
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
      // setSelectedNode(null)
    }
  }

  const handleCanvasDialogClose = (type?: INode["type"]) => {
    if (type && clickPosition) {
      addNode(type, clickPosition)
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
        {connections.map((connection, f) => (
          <Connection key={f} connection={connection} />
        ))}

        {nodes.map((node, i) => (
          <Node
            key={i}
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
