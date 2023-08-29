import React, { useState, useRef, useEffect, useCallback } from "react"
import chroma from "chroma-js"

import NodeContext from "./ctxt/node-ctxt.component"
import NodeInput from "./node-input.component"
import NodeLabel from "./node-label.component"
import NodeWarning from "./node-warning.component"
import { NodeLabelOutline } from "./node-label.component"
import NodeConnector from "./node-connector.component"
import { INode, Position, Vector2D } from "./types/canvas.types"
import { colorPalette } from "./types/colorPalette"

interface NodeProps {
  node: INode
  isSelected: number
  connecting: boolean
  colorIndex: number
  canvasRect: DOMRect | null
  handleNodeMove: (nodeID: INode["id"], displacement: Vector2D) => void
  handleNodeAction: (
    node: INode,
    action: string,
    name?: string,
    value?: number,
    operator?: INode["operator"],
    condition?: boolean
  ) => void
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
  const [fieldsMissing, setFieldsMissing] = useState(true)
  const [dragging, setDragging] = useState(false)
  const [dragStartPos, setDragStartPos] = useState<Position | null>(null)
  const [dragCurrentPos, setDragCurrentPos] = useState<Position | null>(null)
  const [dragOffset, setDragOffset] = useState<Vector2D | null>(null)
  const [nodeHovered, setNodeHovered] = useState(false)
  const [connectorPos, setConnectorPos] = useState<Position>({ x: 0, y: 0 })
  const [connectorActive, setConnectorActive] = useState(false)
  const [mouseDist, setMouseDist] = useState(0)
  const [colors, setColors] = useState<string[]>([])
  const [hasLabelOverflow, setHasLabelOverflow] = useState(false)
  const [isValueNode, setIsValueNode] = useState(false)
  const nodeRef = useRef<HTMLDivElement>(null)
  const nodeLabelRef = useRef<HTMLDivElement>(null)
  // const shouldFocusNameInput = !nodeName || !isValueNode

  // scale node by mouse wheel
  useEffect(() => {
    const nodeCpy = nodeRef.current
    if (!nodeCpy) return

    const scaleNode = (e: WheelEvent) => {
      e.preventDefault()
      if (node.isEditing) return
      const delta = Math.sign(e.deltaY)
      handleNodeAction(node, "scale", undefined, delta)
    }

    nodeCpy.addEventListener("wheel", scaleNode, { passive: false })
    return () => {
      nodeCpy.removeEventListener("wheel", scaleNode)
    }
  }, [node, handleNodeAction])

  useEffect(() => {
    setIsValueNode(["property", "parameter"].includes(node.type))
  }, [node.type])

  // update missing fields
  useEffect(() => {
    if (isValueNode) {
      setFieldsMissing(!node.name || node.value === undefined || !node.operator)
    } else {
      setFieldsMissing(!node.name)
    }
  }, [isValueNode, node.name, node.value, node.operator])

  /* set label overflow 
   * based on labelwidth */

  // useEffect(() => {
  //   if (!nodeLabelRef.current) return
  //   setHasLabelOverflow(nodeLabelRef.current.offsetWidth > node.size + 5)
  // }, [nodeLabelRef.current?.offsetWidth, node.size, isSelected])

  /* based on characters */

  useEffect(() => {
    if (!node.name || !node.value) return
    const nameOverflow = node.name.length > node.size / 9.65
    const valueOverflow = node.value.toString().length > (node.size - 20) / 8.2
    setHasLabelOverflow(nameOverflow || valueOverflow)
  }, [node.name, node.value, node.size])

  // setup color array
  useEffect(() => {
    const paletteColors = colorPalette[colorIndex]

    setColors([
      paletteColors[node.type],
      chroma(paletteColors[node.type]).brighten(1).hex(),
      chroma(paletteColors[node.type]).darken(0.5).hex(),
    ])
  }, [node.type, colorIndex])

  // calculate connector stats (position, and active status)
  // is called when mousePos is inside node bounding box
  const calculateConnector = useCallback(
    (dx: number, dy: number) => {
      const angle = Math.atan2(dy, dx)
      const radius = node.size / 2 + 2

      const connectorPosition = {
        x: node.size / 2 + radius * Math.cos(angle),
        y: node.size / 2 + radius * Math.sin(angle),
      }
      setConnectorPos(connectorPosition)

      if (mouseDist > node.size / 2 - 5 && nodeHovered) {
        setConnectorActive(true)
      } else {
        setConnectorActive(false)
      }
    },
    [nodeHovered, node.size, mouseDist]
  )

  // handle node movement and check if mousePos is inside node
  // bounding box. if it is, setMouseDist and call calculateConnector
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!canvasRect) return
      if (dragging && dragCurrentPos && dragOffset) {
        const displacement = {
          x: e.clientX - dragCurrentPos.x - dragOffset.x - canvasRect.x,
          y: e.clientY - dragCurrentPos.y - dragOffset.y - canvasRect.y,
        }
        handleNodeMove(node.id, displacement)
        setDragCurrentPos({
          x: node.position.x + displacement.x,
          y: node.position.y + displacement.y,
        })
      } else if (!connecting) {
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
    if (e.button === 2) return
    e.stopPropagation()
    if (connectorActive && !node.isEditing) {
      handleNodeAction(node, "connect")
    } else {
      if (!canvasRect || node.isEditing) return
      setDragging(true)
      setDragStartPos({ x: node.position.x, y: node.position.y })
      setDragCurrentPos({ x: node.position.x, y: node.position.y })
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
    e.stopPropagation()
    if (connecting) {
      // always carry out node click if a node is trying to connect (favour connection)
      handleNodeAction(node, "click")
    } else if (
      // carry out node click if node is not trying to connect
      // only when node has not been moved significantly (prevent click after drag)
      dragStartPos &&
      Math.abs(dragStartPos.x - node.position.x) < 5 &&
      Math.abs(dragStartPos.y - node.position.y) < 5
    ) {
      handleNodeAction(node, "click")
      if (fieldsMissing) handleNodeAction(node, "setIsEditing")
    } else {
      handleNodeAction(node, "completeMove")
    }
    cleanupDrag()
  }

  // prevent event propagation (prevent canvas.tsx onClick)
  const handleClickLocal = (e: React.MouseEvent) => {
    // e.preventDefault()
    // e.stopPropagation()
  }

  const handleContextActionLocal = (ctxtAction: string) => {
    handleNodeAction(node, ctxtAction)
  }

  const handleNodeRename = (
    name?: string, value?: number, operator?: INode["operator"]
  ) => {
    handleNodeAction(node, "rename", name, value, operator)
  }

  const handleNameMouseUp = (e: React.MouseEvent) => {
    if (
      isSelected === 1 &&
      dragStartPos &&
      Math.abs(dragStartPos.x - node.position.x) < 15 &&
      Math.abs(dragStartPos.y - node.position.y) < 15
    ) {
      e.stopPropagation()
      handleNodeAction(
        node,
        "setIsEditing",
        undefined,
        undefined,
        undefined,
        true
      )
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
        width: node.size + 20,
        height: node.size + 20,
        top: node.position.y,
        left: node.position.x,
        transform: "translate(-50%, -50%)",
        zIndex: isSelected === 1 ? 1000 : node.layer,
      }}
    >
      {/* node context menu */}
      {isSelected === 1 && (
        <div
          style={{
            position: "absolute",
            top: node.size / 2 + 10,
            left: node.size / 2 + 10,
          }}
        >
          <NodeContext
            onSelect={handleContextActionLocal}
            isOpen={isSelected === 1}
            nodeSize={node.size}
          />
        </div>
      )}
      {/* clickable node (larger than actual node but not visible) */}
      <div
        className="node-clickable"
        onClick={handleClickLocal} // prevent propagation to canvas onClick\
        onContextMenu={handleClickLocal}
        onMouseDown={handleMouseDown} // init connection
        onMouseUp={handleMouseUp} // handleNodeClick (complete connection || open node nav)
        onMouseEnter={() => setNodeHovered(true)}
        onMouseLeave={() => setNodeHovered(false)}
        tabIndex={0}
        ref={nodeRef}
      >
        {/* visible node */}
        <div
          className="node"
          tabIndex={0}
          style={{
            width: node.size,
            height: node.size,
            backgroundColor: colors[0],
            opacity: !fieldsMissing ? 1 : 0.7,
            outlineColor: isSelected > 0 || nodeHovered ? colors[1] : colors[2],
            outlineStyle: "solid",
            outlineWidth: "4px",
            outlineOffset: "-1px",
            zIndex: node.layer,
          }}
        >
          {/* node labels */}
          {!node.isEditing && (
            <NodeLabel
              isSelected={isSelected}
              isValueNode={isValueNode}
              fieldsMissing={fieldsMissing}
              labelRef={nodeLabelRef}
              hovered={nodeHovered}
              size={node.size}
              name={node.name}
              value={node.value}
              operator={node.operator}
              type={node.type}
              layer={node.layer}
              hasLabelOverflow={hasLabelOverflow}
              color={colors[0]}
              onMouseUp={handleNameMouseUp}
            />
          )}
          {/* node connector */}
          {mouseDist < node.size / 2 + 30 &&
            mouseDist > 30 &&
            !node.isEditing && (
              <NodeConnector
                nodeSize={node.size}
                color={colors[1]}
                active={connectorActive}
                position={connectorPos}
                layer={node.layer}
              />
            )}
        </div>
        {/* node label overflow outline */}
        {hasLabelOverflow &&
          (nodeHovered || isSelected === 1) &&
          !fieldsMissing && (
            <NodeLabelOutline
              width={nodeLabelRef.current?.offsetWidth}
              height={nodeLabelRef.current?.offsetHeight}
              color={colors[1]}
              layer={node.layer}
            />
          )}
        {/* end of visible */}

        {/* node input fields
          * outside of visible node to not be
          * affected by opacity changes */}
        {node.isEditing && (
          <NodeInput
            isValueNode={isValueNode}
            nodeLayer={node.layer}
            nodeType={node.type}
            nodeDotName={node.name}
            nodeDotValue={node.value}
            nodeDotOperator={node.operator}
            handleNodeRename={handleNodeRename}
          />
        )}
        {/* node warning */}
        {fieldsMissing &&
          !isSelected &&
          !node.isEditing && ( // warning: !nodeName
            <NodeWarning
              size={node.size}
              hovered={nodeHovered}
              color={colors[0]}
              layer={node.layer}
            />
          )}
      </div>
      {/* end of clickable */}
    </div> // top
  )
})
