import { useState, useEffect } from "react"
import { IConnection } from "./types/connection.type"

interface ConnectionProps {
  connection: IConnection
  isSelected: boolean
  handleConnectionClick: (
    e: React.MouseEvent<HTMLAnchorElement, MouseEvent>
  ) => void
}

interface TempConnectionProps {
  start: { x: number; y: number }
  clickPosition: { x: number; y: number } | null
  canvasRef: React.RefObject<HTMLDivElement>
}

export function TempConnection(props: TempConnectionProps) {
  const { start, clickPosition, canvasRef } = props
  const [end, setEnd] = useState({ x: start.x, y: start.y })

  useEffect(() => {
    if (clickPosition) {
      setEnd(clickPosition)
      return
    }
    const moveHandler = (e: MouseEvent) => {
      const canvasRect = canvasRef.current?.getBoundingClientRect()
      if (!canvasRect) return
      const x = e.clientX - canvasRect.left
      const y = e.clientY - canvasRect.top
      setEnd({ x, y })
    }

    document.addEventListener("mousemove", moveHandler)
    return () => {
      document.removeEventListener("mousemove", moveHandler)
    }
  }, [clickPosition])

  return (
    <svg
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
      }}
    >
      <defs>
        <marker
          id="arrow"
          viewBox="0 0 10 10"
          refX="9"
          refY="5"
          fill="#555"
          markerWidth="8"
          markerHeight="8"
          orient="auto-start-reverse"
        >
          <path d="M 0 0 L 10 5 L 0 10 z" />
        </marker>
      </defs>
      <path // temporary connection
        d={`M ${start.x},${start.y} L ${end.x},${end.y}`}
        stroke="#555"
        strokeWidth="2"
        fill="none"
        markerEnd="url(#arrow)"
        pointerEvents="none"
      />
    </svg>
  )
}

export default function Connection(props: ConnectionProps) {
  const { connection, isSelected, handleConnectionClick } = props
  const start = connection.start.position
  const end = connection.end.position

  const dx = end.x - start.x
  const dy = end.y - start.y
  const len = Math.sqrt(dx * dx + dy * dy)
  const normX = dx / len
  const normY = dy / len

  const endX = end.x - normX * 55
  const endY = end.y - normY * 55

  return (
    <svg
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
      }}
    >
      <defs>
        <marker
          id="arrowSelect"
          viewBox="0 0 10 10"
          refX="7"
          refY="5"
          fill="#6f6f6f"
          markerWidth="4"
          markerHeight="8"
          orient="auto-start-reverse"
        >
          <path d="M 0 0 L 10 5 L 0 10 z" />
        </marker>
        <marker
          id="arrow"
          viewBox="0 0 10 10"
          refX="9"
          refY="5"
          fill="#555"
          markerWidth="8"
          markerHeight="8"
          orient="auto-start-reverse"
        >
          <path d="M 0 0 L 10 5 L 0 10 z" />
        </marker>
      </defs>
      {isSelected && (
        <path // connection outline
          d={`M ${start.x},${start.y} L ${endX},${endY}`}
          stroke="#6f6f6f"
          strokeWidth="6"
          fill="none"
          markerEnd="url(#arrowSelect)"
          pointerEvents="none"
        />
      )}
      <path // actual connection
        d={`M ${start.x},${start.y} L ${endX},${endY}`}
        stroke="#555"
        strokeWidth="2"
        fill="none"
        markerEnd="url(#arrow)"
        pointerEvents="none"
      />
      <a 
        // onClick={handleConnectionClick}
      >
        <path // connection clickable area
          d={`M ${start.x},${start.y} L ${endX},${endY}`}
          fill="none"
          strokeWidth="20"
          stroke="transparent"
          pointerEvents="auto"
        />
      </a>
    </svg>
  )
}
