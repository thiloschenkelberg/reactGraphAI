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
  const [connectorPos, setConnectorPos] = useState<{x: number, y: number}>({x:0,y:0})
  const [connectorVisible, setConnectorVisible] = useState(false)
  const nodeRef = useRef<HTMLDivElement>(null)
  const borderRef = useRef<HTMLDivElement>(null)

  // move node
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

  // initiate node movement
  const handleMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation()
    setDragging(true)
    setDragStartPos({ x: e.clientX, y: e.clientY })
    setDragOffset({
      x: e.clientX - node.position.x,
      y: e.clientY - node.position.y,
    })
  }

  // either complete connection between 2 nodes or
  // open node nav menu (if node hasnt been moved significantly)
  const handleMouseUp = (e: React.MouseEvent) => {
    //e.stopPropagation()
    console.log("etets")
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

  // calculate connector circle position and visibility
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!borderRef.current) return
    // reference of .node-border div
    const borderRect = borderRef.current.getBoundingClientRect()
    // relative mousePos to center of .node-border
    const relativeX = e.clientX - (borderRect.left + borderRect.width / 2)
    const relativeY = e.clientY - (borderRect.top + borderRect.height / 2)
    // calculate angle
    const angle = Math.atan2(relativeY, relativeX)
    // replace with node size / 2 later on
    const radius = 55 
    const connectorPosition = {
      x: (borderRect.width / 2) + radius * Math.cos(angle),
      y: (borderRect.height / 2) + radius * Math.sin(angle)
    }
    setConnectorPos(connectorPosition)
    // calculate dist from cursor to .node-border
    const dist = Math.sqrt(relativeX * relativeX + relativeY * relativeY)
    setConnectorVisible(dist > 35)
  }

  // prevent event propagation (prevent canvas.tsx onClick)
  const handleClickLocal = (e: React.MouseEvent) => {
    e.stopPropagation()
  }

  // confirm node name
  const handleNameInputBlur = (byClick: boolean) => {
    handleNodeNameChange(node, nodeName, byClick)
  }

  // update local node name
  const handleNameChangeLocal = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNodeName(e.target.value)
  }

  // confirm node name with "Enter"
  const handleInputKeyUp = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault()
      handleNameInputBlur(false)
    }
  }

  // delete node on "Delete" key
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
        onClick={handleClickLocal} // prevent propagation to canvas onClick
        onMouseDown={() => handleNodeConnect(node)} // init connection
        onMouseUp={handleMouseUp} // handleNodeClick (complete connection || open node nav)
        onMouseEnter={() => setNodeHovered(true)}
        onMouseLeave={() => setNodeHovered(false)}
        onMouseMove={handleMouseMove} // calculate position of connector circle
        ref={borderRef}
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
          onMouseDown={handleMouseDown} // init moving node
          onKeyUp={handleNodeKeyUp} // listen to key input (eg. del to delete node)
          ref={nodeRef}
          tabIndex={0} // needed for element focusing
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
        {nodeHovered && connectorVisible &&
          <div
            className="node-border-circle"
            style={{
              backgroundColor: chroma(colors[node.type]).brighten().hex(),
              top: connectorPos.y,
              left: connectorPos.x,
              pointerEvents: "none"
            }}
          />
        }
      </div>
    </div>
  )
}