import React, { useState, useRef, useEffect } from "react"
import { Paper } from "@mantine/core"
import chroma from "chroma-js"
import NodePlanet from "./node-planet.component"


import INode from "./types/node.type"
import { colorPalette } from "./types/color.palette"

interface NodeProps {
  node: INode
  isSelected: boolean
  connecting: boolean
  colorIndex: number
  handleNodeClick: (node: INode) => void
  handleNodeMove: (node: INode, position: INode["position"]) => void
  handleNodeConnect: (node: INode) => void
  handleNodeNameChange: (
    node: INode,
    newName: string | null,
    byClick: boolean
  ) => void
  handleNodeNavSelect: (action: string) => void
}

export default function Node(props: NodeProps) {
  const {
    node,
    isSelected,
    connecting,
    colorIndex,
    handleNodeClick,
    handleNodeMove,
    handleNodeConnect,
    handleNodeNameChange,
    handleNodeNavSelect,
  } = props
  const [nodeName, setNodeName] = useState(node.name)
  const [dragging, setDragging] = useState(false)
  const [dragStartPos, setDragStartPos] = useState<INode["position"] | null>(
    null
  )
  const [dragOffset, setDragOffset] = useState<INode["position"] | null>(null)
  const [nodeHovered, setNodeHovered] = useState(false)
  const nodeRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const moveNode = (e: MouseEvent) => {
      if (dragging && dragOffset) {
        const newNodePosition = {
          x: e.clientX - dragOffset.x,
          y: e.clientY - dragOffset.y,
        }
        handleNodeMove(node, newNodePosition)
      }
    }

    document.addEventListener("mousemove", moveNode)
    return () => {
      document.removeEventListener("mousemove", moveNode)
    }
  }, [node, dragging, dragOffset, handleNodeMove])

  const handleMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation()
    setDragging(true)
    setDragStartPos({ x: e.clientX, y: e.clientY })
    setDragOffset({
      x: e.clientX - node.position.x,
      y: e.clientY - node.position.y,
    })
  }

  const handleMouseUp = (e: React.MouseEvent) => {
    //e.stopPropagation()

    if (connecting) {
      // always carry out node click if a node is trying to connect (favour connection)
      handleNodeClick(node)
    } else if (
      // carry out node click if node is not trying to connect
      // only when node has not been moved significantly (prevent click after drag)
      dragStartPos &&
      Math.abs(dragStartPos.x - e.clientX) < 15 &&
      Math.abs(dragStartPos.y - e.clientY) < 15
    ) {
      handleNodeClick(node)
    }

    setDragging(false)
    setDragStartPos(null)
    setDragOffset(null)
  }

  const handleClickLocal = (e: React.MouseEvent) => {
    console.log("test")
    e.stopPropagation()
  }

  const handleNameInputBlur = (byClick: boolean) => {
    handleNodeNameChange(node, nodeName, byClick)
  }

  const handleNameChangeLocal = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNodeName(e.target.value)
  }

  const handleInputKeyUp = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault()
      handleNameInputBlur(false)
    }
  }

  const handleNodeKeyUp = (e: React.KeyboardEvent<HTMLElement>) => {
    if (e.key === "Delete") {
      e.preventDefault()
      handleNodeNavSelect("delete")
    }
  }

  const colors = colorPalette[colorIndex]

  return (
    <div
      style={{
        position: "absolute",
        zIndex: isSelected ? 1000 : node.layer,
      }}
    >
      {isSelected && !connecting && ( // node nav menu
        <div
          style={{
            position: "absolute",
            left: node.position.x,
            top: node.position.y,
            transform: "translate(-50%, -50%)",
          }}
        >
          <NodePlanet onSelect={handleNodeNavSelect} />
        </div>
      )}
      <div // draggable node border to create connections
        className="node-border"
        style={{
          width: "130px",
          height: "130px",
          top: node.position.y,
          left: node.position.x,
          transform: "translate(-50%, -50%)",
        }}
        onClick={handleClickLocal}
        onMouseDown={() => handleNodeConnect(node)}
        onMouseUp={handleMouseUp}
        onMouseEnter={() => setNodeHovered(true)}
        onMouseLeave={() => setNodeHovered(false)}
      >
        <Paper // actual node
          className="node"
          style={{
            width: "100px",
            height: "100px",
            backgroundColor: colors[node.type],
            outline: isSelected || nodeHovered
              ? `4px solid ${chroma(colors[node.type]).brighten().hex()}`
              : `4px solid ${chroma(colors[node.type]).darken(0.75).hex()}`,
            outlineOffset: isSelected ? "3px" : "0px",
          }}
          onClick={handleClickLocal}
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
          onKeyUp={handleNodeKeyUp}
          ref={nodeRef}
          tabIndex={0}
        >
          {node.isEditing ? ( // node name input field
            <input
              type="text"
              onChange={handleNameChangeLocal}
              onBlur={() => handleNameInputBlur(true)}
              onKeyUp={handleInputKeyUp}
              autoFocus
              style={{
                zIndex: node.layer + 1,
              }}
            />
          ) : (
            <span // node name tag
              style={{
                userSelect: "none",
                color:
                  node.type === "matter" || node.type === "measurement"
                    ? "#1a1b1e"
                    : "#ececec",
                zIndex: node.layer + 1,
              }}
            >
              {node.name}
            </span>
          )}
        </Paper>
      </div>
    </div>
  )
}
