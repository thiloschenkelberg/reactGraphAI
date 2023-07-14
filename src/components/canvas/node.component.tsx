import React, { useState, useRef, useEffect } from "react"
import { Paper } from "@mantine/core"

import INode from "./types/node.type"

import nodeGreen from "../../img/node_green.png"
import nodeRed from "../../img/node_red.png"
import nodeBlue from "../../img/node_blue.png"
import nodeGrey from "../../img/node_grey3.png"
import nodeYellow from "../../img/node_yellow.png"

interface NodeProps {
  node: INode,
  // setNodeClicked: React.Dispatch<React.SetStateAction<boolean>>,
  handleNodeClick: (node: INode) => (e: React.MouseEvent) => void
  handleNodeMove: (node: INode, position: INode["position"]) => void
}

export default function Node(props: NodeProps) {
  const { node, handleNodeClick, handleNodeMove} = props
  const [dragging, setDragging] = useState(false)
  const [dragStartPos, setDragStartPos] = useState<INode["position"] | null>(null)
  const nodeRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const moveNode = (e: MouseEvent) => {
      if (dragging && nodeRef.current) {
        const canvas = nodeRef.current.parentElement
        if(!canvas) return
        const canvasRect = canvas.getBoundingClientRect()
        const newNodePosition = {
          x: e.clientX - canvasRect.left,
          y: e.clientY - canvasRect.top
        }
        handleNodeMove(node, newNodePosition)
      }
    }

    document.addEventListener('mousemove', moveNode)
    return() => {
      document.removeEventListener('mousemove', moveNode)
    }
  }, [dragging, node, handleNodeMove])

  const handleMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation()
    setDragging(true)
    setDragStartPos({ x: e.clientX, y: e.clientY })
  }

  const handleMouseUp = (e: React.MouseEvent) => {
    e.stopPropagation()

    if (dragStartPos && Math.abs(dragStartPos.x - e.clientX) < 10 && Math.abs(dragStartPos.y - e.clientY) < 10) {
      handleNodeClick(node)(e)
    }

    setDragging(false)
    setDragStartPos(null)

  }

  const handleNodeClickLocal = (e: React.MouseEvent) => {
    e.stopPropagation()
  }

  return (
    <Paper
      className="node"
      style={{
        position: "absolute",
        top: node.position.y - 50,
        left: node.position.x - 50,
        backgroundImage:
          node.type === "matter"
            ? `url(${nodeGreen})`
            : node.type === "process"
            ? `url(${nodeRed})`
            : node.type === "parameter"
            ? `url(${nodeBlue})`
            : node.type === "measurement"
            ? `url(${nodeYellow})`
            : `url(${nodeGrey})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
      onClick={handleNodeClickLocal}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      ref={nodeRef}
    />
  )
}
