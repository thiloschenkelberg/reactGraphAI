import React, { useState, useRef, useEffect } from "react"
import { Paper } from "@mantine/core"
import chroma from "chroma-js"
import NodePlanet from "./node-planet.component"


import INode from "./types/node.type"
import { colorPalette } from "./types/colorPalette"

interface NodeProps {
  node: INode
  isSelected: number
  connecting: boolean
  colorIndex: number
  mousePos: {x: number, y: number} | null
  handleNodeClick: (node: INode) => void
  handleNodeMove: (node: INode, position: INode["position"]) => void
  handleNodeConnect: (node: INode) => void
  handleNodeScale: (node: INode, delta: number) => void
  handleNodeNameChange: (
    node: INode,
    newName: string | null
  ) => void
  handleNodeNavSelect: (node: INode, action: string) => void
}

export default function Node(props: NodeProps) {
  const {
    node,
    isSelected,
    connecting,
    colorIndex,
    mousePos,
    handleNodeClick,
    handleNodeMove,
    handleNodeConnect,
    handleNodeScale,
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
  const [connectorActive, setConnectorActive] = useState(false)
  const [mouseDist, setMouseDist] = useState(0)
  const nodeRef = useRef<HTMLDivElement>(null)
  const borderRef = useRef<HTMLDivElement>(null)

  // move node
  useEffect(() => {
    if (!nodeRef.current) return
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

  useEffect(() => {
    const nodeCpy = nodeRef.current
    if (!nodeCpy) return

    const scaleNode = (e: WheelEvent) => {
      e.preventDefault()
      const delta = Math.sign(e.deltaY)
      handleNodeScale(node, delta)
    }

    nodeCpy.addEventListener("wheel", scaleNode, { passive: false })
    return () => {
      nodeCpy.removeEventListener('wheel', scaleNode)
    }
  }, [node, handleNodeScale])

  useEffect(() => {
    if (!mousePos) return

    if (mousePos.x >= node.position.x - (node.size / 2 + 32) &&
        mousePos.x <= node.position.x + (node.size / 2 + 32) &&
        mousePos.y >= node.position.y - (node.size / 2 + 32) &&
        mousePos.y <= node.position.y + (node.size / 2 + 32))
    {
      const dx = mousePos.x - node.position.x
      const dy = mousePos.y - node.position.y
      const dist = Math.sqrt(dx*dx + dy*dy)
  
      setMouseDist(dist)
      
      if (mouseDist < node.size / 2 + 30) {
        
        const angle = Math.atan2(dy, dx)
        const radius = isSelected === 1 ? node.size / 2 + 5 : node.size / 2 + 2
  
        const connectorPosition = {
          x: (node.size / 2) + radius * Math.cos(angle) + 10,
          y: (node.size / 2) + radius * Math.sin(angle) + 10
        }
  
        setConnectorPos(connectorPosition)
        
        if (
          (isSelected !== 0 &&
            mouseDist > node.size / 2 - 1 &&
            nodeHovered)
          ||
          (isSelected === 0 &&
            mouseDist > node.size / 2 - 5 &&
            nodeHovered)
        ) {
          setConnectorActive(true)
        } else {
          setConnectorActive(false)
        }
      }
    } else {
      setMouseDist(1000)
      setConnectorActive(false)
    }
  }, [mousePos, node, mouseDist, isSelected, nodeHovered])

  // initiate node movement
  const handleMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (connectorActive) {
      handleNodeConnect(node)
      return
    }
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

  const handleNodeConnectLocal = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (connectorActive) handleNodeConnect(node)
  }

  // prevent event propagation (prevent canvas.tsx onClick)
  const handleClickLocal = (e: React.MouseEvent) => {
    e.stopPropagation()
  }

  // confirm node name
  const handleNameInputBlur = () => {
    handleNodeNameChange(node, nodeName)
  }

  // update local node name
  const handleNameChangeLocal = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNodeName(e.target.value)
  }

  // confirm node name with "Enter"
  const handleInputKeyUp = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault()
      handleNameInputBlur()
    }
  }

  // delete node on "Delete" key
  const handleNodeKeyUp = (e: React.KeyboardEvent<HTMLElement>) => {
    if (e.key === "Delete" && isSelected) {
      e.preventDefault()
      handleNodeNavSelect(node, "delete")
    }
  }

  const handleNodeNavSelectLocal = (action: string) => {
    handleNodeNavSelect(node, action)
  }

  const colors = colorPalette[colorIndex]

  return (
    <div
      style={{
        position: "absolute",
        zIndex: isSelected === 1 ? 1000 : node.layer,
      }}
    >
      <div
        style={{
          position: "relative",
          left: node.position.x,
          top: node.position.y,
        }}
      >
        <NodePlanet onSelect={handleNodeNavSelectLocal} isOpen={ isSelected === 1 } nodeSize={node.size}/>
      </div>
      <div // draggable node border to create connections
        className="node-border"
        style={{
          width: node.size + 20,
          height: node.size + 20,
          top: node.position.y,
          left: node.position.x,
          transform: "translate(-50%, -50%)",
        }}
        onClick={handleClickLocal} // prevent propagation to canvas onClick
        onMouseDown={handleNodeConnectLocal} // init connection
        onMouseUp={handleMouseUp} // handleNodeClick (complete connection || open node nav)
        onMouseEnter={() => setNodeHovered(true)}
        onMouseLeave={() => setNodeHovered(false)}
        // onMouseMove={handleMouseMove} // calculate position of connector circle
        ref={borderRef}
      >
        <Paper // actual node
          className="node"
          style={{
            width: node.size,
            height: node.size,
            zIndex: node.layer,
            backgroundColor: colors[node.type],
            outline: isSelected > 0
              ? `4px solid ${chroma(colors[node.type]).brighten().hex()}`
              : nodeHovered
              ? `4px solid ${chroma(colors[node.type]).brighten(0.75).hex()}`
              : `4px solid ${chroma(colors[node.type]).darken(0.75).hex()}`,
            outlineOffset: isSelected > 0 ? "3px" : "0px",
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
              onBlur={handleNameInputBlur}
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
        {mouseDist < node.size / 2 + 30 && // draw node connector circle
          <div
            className="node-border-circle"
            style={{
              border: `1px solid ${chroma(colors[node.type]).brighten().hex()}`,
              backgroundColor: connectorActive ? chroma(colors[node.type]).brighten().hex() : "transparent",
              top: connectorPos.y,
              left: connectorPos.x,
              pointerEvents: "none",
              zIndex: node.layer + 1
            }}
          />
        }
      </div>
    </div>
  )
}