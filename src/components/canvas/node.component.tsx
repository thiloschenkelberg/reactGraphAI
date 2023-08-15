import React, { useState, useRef, useEffect, useCallback } from "react"
import { useSpring, animated } from "react-spring"
import chroma from "chroma-js"
import { Select, Code } from "@mantine/core"

import WarningAmberIcon from "@mui/icons-material/WarningAmber"
import WarningIcon from "@mui/icons-material/Warning"

import NodeContext from "./ctxt/node-ctxt.component"
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
    operator?: INode["operator"]
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
  const [nodeName, setNodeName] = useState<string | undefined>(node.name)
  const [nodeValue, setNodeValue] = useState<number | undefined>(node.value)
  const [nodeOperator, setNodeOperator] = useState<
    INode["operator"] | undefined
  >(node.operator)
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
  const nodeRef = useRef<HTMLDivElement>(null)
  const nameInputRef = useRef<HTMLInputElement>(null)
  const valueInputRef = useRef<HTMLInputElement>(null)
  const operatorInputRef = useRef<HTMLInputElement>(null)
  const isValueNode = ["property", "parameter"].includes(node.type)
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

  const updateMissingFields = useCallback(() => {
    if (isValueNode) {
      setFieldsMissing(!nodeName || nodeValue === undefined || !nodeOperator)
    } else {
      setFieldsMissing(!nodeName)
    }
  }, [isValueNode, nodeName, nodeOperator, nodeValue])

  useEffect(() => {
    updateMissingFields()
  }, [updateMissingFields])

  useEffect(() => {
    const paletteColors = colorPalette[colorIndex]

    setColors([
      paletteColors[node.type],
      chroma(paletteColors[node.type]).brighten().hex(),
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
        x: node.size / 2 + radius * Math.cos(angle),
        y: node.size / 2 + radius * Math.sin(angle),
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
          y: e.clientY - dragCurrentPos.y - dragOffset.y - canvasRect.y,
        }
        handleNodeMove(node.id, displacement)
        setDragCurrentPos({
          x: node.position.x + displacement.x,
          y: node.position.y + displacement.y,
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

  const handleContextActionLocal = (ctxtAction: string) => {
    handleNodeAction(node, ctxtAction)
  }

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
  const handleMouseUp = () => {
    if (connecting) {
      // always carry out node click if a node is trying to connect (favour connection)
      handleNodeAction(node, "click")
    } else if (
      // carry out node click if node is not trying to connect
      // only when node has not been moved significantly (prevent click after drag)
      dragStartPos &&
      canvasRect &&
      Math.abs(dragStartPos.x - node.position.x) < 15 &&
      Math.abs(dragStartPos.y - node.position.y) < 15
    ) {
      handleNodeAction(node, "click")
      if (fieldsMissing) handleNodeAction(node, "setIsEditing")
    }
    cleanupDrag()
  }

  // prevent event propagation (prevent canvas.tsx onClick)
  const handleClickLocal = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleInputBlur = () => {
    setTimeout(() => {
      if (
        document.activeElement === nameInputRef.current ||
        document.activeElement === valueInputRef.current ||
        document.activeElement === operatorInputRef.current
      ) return
      console.log(nodeValue)
      handleNodeAction(node, "rename", nodeName, nodeValue, nodeOperator)
      updateMissingFields()
    }, 100)
  }

  // confirm node name with "Enter"
  const handleInputKeyUp = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault()
      handleNodeAction(node, "rename", nodeName, nodeValue, nodeOperator)
      updateMissingFields()
    }
  }

  // update local node name
  const handleNameChangeLocal = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNodeName(e.target.value)
  }

  const handleValueChangeLocal = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNodeValue(e.target.value !== "" ? Number(e.target.value) : undefined)
  }

  const handleOperatorChangeLocal = (value: string | null) => {
    setNodeOperator(value as INode["operator"])
  }

  const handleNameMouseUp = (e: React.MouseEvent) => {
    if (
      isSelected === 1 &&
      dragStartPos &&
      canvasRect &&
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

  const mapOperatorSign = () => {
    let operatorCode: string | undefined
    switch (node.operator) {
      case "<=":
        operatorCode = "\u2264"
        break
      case ">=":
        operatorCode = "\u2265"
        break
      case "!=":
        operatorCode = "\u2260"
        break
      default:
        operatorCode = node.operator
        break
    }
    return (operatorCode)
  }

  const iconAnimProps = useSpring({
    color: nodeHovered ? "#E15554" : colors[0],
    config: {
      tension: nodeHovered ? 170 : 150,
      friction: nodeHovered ? 26 : 170,
    },
  })

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
            outlineOffset: isSelected > 0 ? "3px" : "0px",
          }}
        >
          {/* node labels */}
          {!node.isEditing && (
            <div className="node-label-wrap">
              <span // name
                onMouseUp={handleNameMouseUp}
                className="node-label"
                style={{
                  marginTop: (isValueNode && nodeValue !== undefined) ? 3 : 0,
                  marginBottom: (isValueNode && nodeValue !== undefined) ? -3 : 0,
                  color:
                    ["matter", "measurement"].includes(node.type)
                      ? "#1a1b1e"
                      : "#ececec",
                  zIndex: node.layer + 1,
                }}
              >
                {/* {nodeName
                  ? node.name
                  : `id: ${node.id.substring(0, node.size / 4 - 8)}...`} */}
                {nodeName ? node.name : ""}
              </span>
              {nodeValue !== undefined &&
                <span
                  onMouseUp={handleNameMouseUp}
                  className="node-label node-label-value"
                  style={{
                    whiteSpace: "nowrap",
                    maxWidth: "none",
                    position: nodeName ? "static" : "static",
                    top: nodeName && "calc(50% + 5px)",
                    color:
                      ["matter", "measurement"].includes(node.type)
                        ? "#1a1b1e"
                        : "#ececec",
                    zIndex: node.layer + 1,
                  }}
                >
                  {(nodeOperator ? mapOperatorSign() : "") + " " + node.value}
                </span>}
            </div>
          )}
          {/* node connector */}
          {mouseDist < node.size / 2 + 30 &&
            mouseDist > 30 &&
            !node.isEditing && (
              <div
                className="node-connector"
                style={{
                  border: `1px solid ${colors[1]}`,
                  backgroundColor: connectorActive ? colors[1] : "transparent",
                  top: connectorPos.y,
                  left: connectorPos.x,
                  pointerEvents: "none",
                  zIndex: node.layer + 1,
                }}
              />
            )}
        </div>
        {/* /visible */}
        {/* node input fields
         /  outside of visible node to not be
         /  affected by opacity changes */}
        {node.isEditing && (
          <div
            className="node-input"
            style={{
              // border: "1px solid #333333",
              borderRadius: 3,
              backgroundColor: "#1a1b1e",
              zIndex: node.layer + 1,
              // padding: 3,
            }}
          >
            <input
              ref={nameInputRef}
              type="text"
              placeholder="Name"
              defaultValue={nodeName}
              onChange={handleNameChangeLocal} // write nodeName state
              onKeyUp={handleInputKeyUp} // confirm name with enter
              onBlur={handleInputBlur}
              autoFocus={!nodeName || !isValueNode}
              style={{
                // borderColor: colors[1],
                zIndex: node.layer + 1,
              }}
            />
            {["parameter", "property"].includes(node.type) && (
              <div
                style={{
                  display: "flex",
                  flexDirection: "row",
                  marginTop: 8,
                }}
              >
                <Select
                  ref={operatorInputRef}
                  onChange={handleOperatorChangeLocal}
                  onKeyUp={handleInputKeyUp}
                  onBlur={handleInputBlur}
                  placeholder="---"
                  defaultValue={node.operator}
                  data={[
                    { value: "<", label: "<" },
                    { value: "<=", label: "\u2264" },
                    { value: "=", label: "=" },
                    { value: "!=", label: "\u2260"},
                    { value: ">=", label: "\u2265" },
                    { value: ">", label: ">" },
                  ]}
                  style={{
                    width: "25%",
                    borderRight: "none",
                    zIndex: node.layer + 1,
                    filter: "drop-shadow(1px 1px 1px #111",
                  }}
                />
                <input
                  ref={valueInputRef}
                  type="number"
                  inputMode="decimal"
                  placeholder="Value"
                  defaultValue={nodeValue}
                  onChange={handleValueChangeLocal}
                  onKeyUp={handleInputKeyUp}
                  onBlur={handleInputBlur}
                  autoFocus={!(!nodeName || !isValueNode)}
                  style={{
                    width: "calc(75% - 8px)",
                    // borderLeft: "none",
                    marginLeft: 8,
                    zIndex: node.layer + 1,
                  }}
                />
              </div>
            )}
          </div>
        )}
        {/* node warning */}
        {fieldsMissing &&
          !isSelected &&
          !node.isEditing && ( // warning: !nodeName
            <div
              className="node-warning"
              style={{
                width: node.size,
                height: node.size,
                left: node.size / 2 + 10,
                top: node.size / 2 + 10,
                pointerEvents: "none",
              }}
            >
              <animated.div style={iconAnimProps}>
                <WarningIcon
                  style={{
                    position: "relative",
                    fontSize: "30px",
                    transform: `translate(
                        ${nodeHovered ? -58 : 0}px,
                        ${nodeHovered ? -1 : -4}px
                      )`,
                    transition: "transform 0.1s ease-in-out",
                    zIndex: node.layer + 1,
                  }}
                />
              </animated.div>
              {nodeHovered && (
                <div className="node-warning-label">Fields missing!</div>
              )}
            </div>
          )}
      </div>
      {/* /clickable */}
    </div> // top
  )
})
