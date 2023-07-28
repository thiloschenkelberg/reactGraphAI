import React, { useState, useRef, useEffect, useCallback } from "react"
import { Paper } from "@mantine/core"
import chroma from "chroma-js"

import NodePlanet from "./node-planet.component"
import { INode, Position, Vector2D } from "./types/canvas.types"
import { colorPalette } from "./types/colorPalette"

interface NodeProps {
  node: INode
  isSelected: number
  connecting: boolean
  colorIndex: number
  canvasRect: DOMRect | null
  handleNodeMove: (nodeID: INode["id"], displacement: Vector2D) => void
  handleNodeAction: (node: INode, action: string, delta?: number, name?: string) => void
}

export default React.memo(function Node(props: NodeProps) {
  const {
    node,
    isSelected,
    connecting,
    colorIndex,
    canvasRect,
    handleNodeMove,
    handleNodeAction,
  } = props
  const [nodeName, setNodeName] = useState<string | undefined>(node.name)
  const [dragging, setDragging] = useState(false)
  const [dragStartPos, setDragStartPos] = useState<Position | null>(
    null
  )
  const [dragCurrentPos, setDragCurrentPos] = useState<Position | null>(
    null
  )
  const [dragOffset, setDragOffset] = useState<Vector2D | null>(null)
  const [nodeHovered, setNodeHovered] = useState(false)
  const [connectorPos, setConnectorPos] = useState<Position>({
    x: 0,
    y: 0,
  })
  const [connectorActive, setConnectorActive] = useState(false)
  const [mouseDist, setMouseDist] = useState(0)
  const [colors, setColors] = useState<string[]>([])
  const nodeRef = useRef<HTMLDivElement>(null)
  const borderRef = useRef<HTMLDivElement>(null)

  // scale node by mouse wheel
  useEffect(() => {
    const nodeCpy = nodeRef.current
    if (!nodeCpy) return

    const scaleNode = (e: WheelEvent) => {
      e.preventDefault()
      const delta = Math.sign(e.deltaY)
      handleNodeAction(node, "scale", delta)
    }

    nodeCpy.addEventListener("wheel", scaleNode, { passive: false })
    return () => {
      nodeCpy.removeEventListener("wheel", scaleNode)
    }
  }, [node, handleNodeAction])

  useEffect(() => {
    const paletteColors = colorPalette[colorIndex]

    setColors([
      paletteColors[node.type],
      chroma(paletteColors[node.type]).brighten().hex(),
      chroma(paletteColors[node.type]).brighten(0.75).hex(),
      chroma(paletteColors[node.type]).darken(0.75).hex(),
    ])
  }, [node.type, colorIndex])

  // calculate connector stats (position, and active status)
  // is called when mousePos is inside node bounding box
  const calculateConnector = useCallback(
    (dx: number, dy: number) => {
      const angle = Math.atan2(dy, dx)
      const radius = isSelected > 0 ? node.size / 2 + 5 : node.size / 2 + 2

      const connectorPosition = {
        x: node.size / 2 + radius * Math.cos(angle) + 10,
        y: node.size / 2 + radius * Math.sin(angle) + 10,
      }
      setConnectorPos(connectorPosition)

      if (
        (isSelected !== 0 && mouseDist > node.size / 2 - 1 && nodeHovered) ||
        (isSelected === 0 && mouseDist > node.size / 2 - 5 && nodeHovered)
      ) {
        setConnectorActive(true)
      } else {
        setConnectorActive(false)
      }
    },
    [isSelected, nodeHovered, node.size, mouseDist]
  )

  // handle node movement and check if mousePos is inside node
  // bounding box. if it is, setMouseDist and call calculateConnector
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!canvasRect) return
      if (dragging && dragCurrentPos && dragOffset) {
        const displacement = {
          x: e.clientX - dragCurrentPos.x - dragOffset.x - canvasRect.x,
          y: e.clientY - dragCurrentPos.y - dragOffset.y - canvasRect.y
        }
        handleNodeMove(node.id, displacement)
        setDragCurrentPos({
          x: node.position.x + displacement.x,
          y: node.position.y + displacement.y
        })
      } else if (canvasRect && !connecting) {
        const mousePos = {
          x: e.clientX - canvasRect.left,
          y: e.clientY - canvasRect.top,
        }
        const detectionRadius = 31
        if (
          mousePos.x >= node.position.x - (node.size / 2 + detectionRadius) &&
          mousePos.x <= node.position.x + (node.size / 2 + detectionRadius) &&
          mousePos.y >= node.position.y - (node.size / 2 + detectionRadius) &&
          mousePos.y <= node.position.y + (node.size / 2 + detectionRadius)
        ) {
          const dx = mousePos.x - node.position.x
          const dy = mousePos.y - node.position.y
          const dist = Math.sqrt(dx * dx + dy * dy)
          setMouseDist(dist)
          calculateConnector(dx, dy)
          return // from here
        }
      }
      setMouseDist(1000)
      setConnectorActive(false)
    }
    // to here

    document.addEventListener("mousemove", handleMouseMove)
    return () => {
      document.removeEventListener("mousemove", handleMouseMove)
    }
  }, [node, canvasRect, connecting, dragging, dragCurrentPos, dragOffset, handleNodeMove, calculateConnector])

  // initiate node movement
  const handleMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (connectorActive) {
      handleNodeAction(node, "connect")
    } else {
      if (!canvasRect) return
      setDragging(true)
      setDragStartPos({x: node.position.x, y: node.position.y})
      setDragCurrentPos({x: node.position.x, y: node.position.y})
      setDragOffset({
        x: e.clientX - node.position.x - canvasRect.left,
        y: e.clientY - node.position.y - canvasRect.top,
      })
      handleNodeAction(node, "initMove")
    }
  }

  // either complete connection between 2 nodes or
  // open node nav menu (if node hasnt been moved significantly)
  const handleMouseUp = (e: React.MouseEvent) => {
    //e.stopPropagation()
    if (connecting) {
      // always carry out node click if a node is trying to connect (favour connection)
      handleNodeAction(node, "click")
    } else if (
      // carry out node click if node is not trying to connect
      // only when node has not been moved significantly (prevent click after drag)
      dragStartPos && canvasRect &&
      Math.abs(dragStartPos.x - node.position.x) < 15 &&
      Math.abs(dragStartPos.y - node.position.y) < 15
    ) {
      handleNodeAction(node, "click")
    }
    cleanupDrag()
  }

  const handleNodeConnectLocal = (e: React.MouseEvent) => {
    console.log("here")
    e.stopPropagation()
    if (connectorActive) handleNodeAction(node, "connect")
  }

  // prevent event propagation (prevent canvas.tsx onClick)
  const handleClickLocal = (e: React.MouseEvent) => {
    e.stopPropagation()
  }

  // confirm node name
  const handleNameInputBlur = () => {
    handleNodeAction(node, "rename", undefined, nodeName)
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
    if (e.key === "Delete" && isSelected > 0) {
      e.preventDefault()
      handleNodeAction(node, "delete")
    }
  }

  const handleNodeActionLocal = (action: string) => {
    handleNodeAction(node, action)
  }

  const handleNameMouseUp = (e: React.MouseEvent) => {
    if (isSelected === 1 && 
        dragStartPos && canvasRect &&
        Math.abs(dragStartPos.x - node.position.x) < 15 &&
        Math.abs(dragStartPos.y - node.position.y) < 15
    ) {
      e.stopPropagation()
      handleNodeAction(node, "setIsEditing")
      cleanupDrag()
    }
  }

  const cleanupDrag = () => {
    setDragging(false)
    setDragStartPos(null)
    setDragCurrentPos(null)
    setDragOffset(null)
  }

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
        <NodePlanet
          onSelect={handleNodeActionLocal}
          isOpen={isSelected === 1}
          nodeSize={node.size}
        />
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
        <div // actual node
          className="node"
          style={{
            width: node.size,
            height: node.size,
            zIndex: node.layer,
            backgroundColor: colors[0],
            outline:
              isSelected > 0
                ? `4px solid ${colors[1]}`
                : nodeHovered
                ? `4px solid ${colors[2]}`
                : `4px solid ${colors[3]}`,
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
              defaultValue={nodeName}
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
              onMouseUp={handleNameMouseUp}
              // onDoubleClick={() => handleNodeAction(node, "setIsEditing")}
              style={{
                userSelect: "none",
                color:
                  node.type === "matter" || node.type === "measurement"
                    ? "#1a1b1e"
                    : "#ececec",
                zIndex: node.layer + 1,
              }}
            >
              {nodeName ? node.name : `${node.id.substring(0,6)}...`}
            </span>
          )}
        </div>
        {mouseDist < node.size / 2 + 30 && mouseDist > 25 &&( // draw node connector circle
          <div
            className="node-border-circle"
            style={{
              border: `1px solid ${colors[1]}`,
              backgroundColor: connectorActive
                ? colors[1]
                : "transparent",
              top: connectorPos.y,
              left: connectorPos.x,
              pointerEvents: "none",
              zIndex: node.layer + 1,
            }}
          />
        )}
      </div>
    </div>
  )
})
