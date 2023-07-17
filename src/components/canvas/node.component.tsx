import React, { useState, useRef, useEffect } from "react"
import { Paper } from "@mantine/core"
import chroma from "chroma-js"
import { Planet } from "react-planet"

import CloseIcon from '@mui/icons-material/Close'
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import SyncAltIcon from '@mui/icons-material/SyncAlt';
import StraightIcon from '@mui/icons-material/Straight';

import INode from "./types/node.type"
import { colorPalette } from "./types/color.palette"

interface NodeProps {
  node: INode
  isSelected: boolean
  connecting: boolean
  colorIndex: number
  handleNodeClick: (node: INode) => void
  handleNodeMove: (node: INode, position: INode["position"]) => void
  handleNodeNameChange: (node: INode, newName: string | null, byClick: boolean) => void
  handleNodeNavSelect: (action: string) => void
}

interface NodeButtonProps {
  onSelect: (action: string) => void
  children: React.ReactNode
  action: string
}

function NodeButton(props: NodeButtonProps) {
  const { onSelect, children, action } = props

  const handleClick = () => {
    onSelect(action)
  }

  return (
    <div
      onClick={handleClick}
      className="node-button"
    >
      {children}
    </div>
  )
}

export default function Node(props: NodeProps) {
  const {
    node,
    isSelected,
    connecting,
    colorIndex,
    handleNodeClick,
    handleNodeMove,
    handleNodeNameChange,
    handleNodeNavSelect,
  } = props
  const [dragging, setDragging] = useState(false)
  const [nodeName, setNodeName] = useState(node.name)
  const [dragStartPos, setDragStartPos] = useState<INode["position"] | null>(
    null
  )
  const [dragOffset, setDragOffset] = useState<INode["position"] | null>(null)
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
  }, [dragging, node, handleNodeMove])

  const handleNameInputBlur = (byClick: boolean) => {
    handleNodeNameChange(node, nodeName, byClick)
  }

  const handleMouseDown = (e: React.MouseEvent) => {
    setDragging(true)
    setDragStartPos({ x: e.clientX, y: e.clientY })
    setDragOffset({
      x: e.clientX - node.position.x,
      y: e.clientY - node.position.y,
    })
  }

  const handleMouseUp = (e: React.MouseEvent) => {
    if (connecting) { // always carry out node click if a node is trying to connect
      handleNodeClick(node) 
    } else if ( // carry out node click if node is not trying to connect when node has not been moved
      dragStartPos &&
      Math.abs(dragStartPos.x - e.clientX) < 1 &&
      Math.abs(dragStartPos.y - e.clientY) < 1
    ) {
      handleNodeClick(node)
    }

    setDragging(false)
    setDragStartPos(null)
    setDragOffset(null)
  }

  const handleNodeClickLocal = (e: React.MouseEvent) => {
    e.stopPropagation()
  }

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNodeName(e.target.value)
  }

  const handleKeyUp = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault()
      handleNameInputBlur(false)
    }
  }

  const colors = colorPalette[colorIndex]

  return (
    <div
      style={{
        position: "absolute",
        zIndex: isSelected ? 1000 : 0
      }}
    >
      {isSelected && !connecting && (
        <div
          style={{
            position: "absolute",
            left: node.position.x,
            top: node.position.y,
            transform: "translate(-50%, -50%)",
          }}
        >
          <Planet
            centerContent={<div className="node-planet"/>}
            open={isSelected}
            hideOrbit
            orbitRadius={100}
            rotation={-90}
          >
            <NodeButton
              onSelect={handleNodeNavSelect}
              children={<CloseIcon style={{color: "red"}} />}
              action="delete"
            />
            <NodeButton
              onSelect={handleNodeNavSelect}
              children={<StraightIcon style={{color: "#1a1b1e"}} />}
              action="connect"
            />
          </Planet>
        </div>
      )}
      <Paper
        className="node"
        style={{
          top: node.position.y - 50,
          left: node.position.x - 50,
          backgroundColor: colors[node.type],
          outline: isSelected
            ? `4px solid ${chroma(colors[node.type]).brighten().hex()}`
            : `4px solid ${chroma(colors[node.type]).darken(0.75).hex()}`,
          outlineOffset: isSelected ? "1px" : "-3px",
        }}
        onClick={handleNodeClickLocal}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        ref={nodeRef}
      >
        {node.isEditing ? (
          <input
            type="text"
            onChange={handleNameChange}
            onBlur={() => handleNameInputBlur(true)}
            onKeyUp={handleKeyUp}
            autoFocus
            style={{
              zIndex: 10,
            }}
          />
        ) : (
          <span
            style={{
              userSelect: "none",
              color:
                node.type === "matter" || node.type === "measurement"
                  ? "#1a1b1e"
                  : "#ececec",
              zIndex: 10,
            }}
          >
            {node.name}
          </span>
        )}
      </Paper>
    </div>
  )
}
