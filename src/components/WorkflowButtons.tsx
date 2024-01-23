import { useState, CSSProperties } from "react"
import { TbMinusVertical } from "react-icons/tb"
import { FiChevronLeft, FiChevronRight } from "react-icons/fi"

interface WorkflowButtonProps {
  jsonView: boolean
  historyView: boolean
  tableView: boolean
  onSelect: (view: string) => void
}

export default function WorkflowButtons({
  jsonView,
  historyView,
  tableView,
  onSelect,
}: WorkflowButtonProps) {
  const [hovered, setHovered] = useState("none")

  const rightIconStyle: CSSProperties = {
    pointerEvents: "all",
    position: "absolute",
    top: "49%",
    right: "5px",
    color: "#909296",
    width: "35px",
    height: "auto",
  }

  const leftIconStyle: CSSProperties = {
    ...rightIconStyle,
    right: "unset",
    left: "5px",
  }

  const handleMouseLeave = () => {
    setHovered("null")
  }

  const handleMouseUpLocal = (e: React.MouseEvent) => {
    console.log("test")
    if (e.button === 2) return
    onSelect(hovered)
  }

  const renderRightIcon = () => {
    return jsonView ? (
      hovered === "json" ? (
        <FiChevronRight
          style={rightIconStyle}
          onClick={handleMouseUpLocal}
          onMouseEnter={() => setHovered("json")}
          onMouseLeave={handleMouseLeave}
        />
      ) : (
        <TbMinusVertical
          style={rightIconStyle}
          onClick={handleMouseUpLocal}
          onMouseEnter={() => setHovered("json")}
          onMouseLeave={handleMouseLeave}
        />
      )
    ) : (
      <FiChevronLeft
        style={rightIconStyle}
        onClick={handleMouseUpLocal}
        onMouseEnter={() => setHovered("json")}
        onMouseLeave={handleMouseLeave}
      />
    )
  }

  const renderLeftIcon = () => {
    return historyView ? (
      hovered === "history" ? (
        <FiChevronLeft
          style={leftIconStyle}
          onClick={handleMouseUpLocal}
          onMouseEnter={() => setHovered("history")}
          onMouseLeave={handleMouseLeave}
        />
      ) : (
        <TbMinusVertical
          style={leftIconStyle}
          onClick={handleMouseUpLocal}
          onMouseEnter={() => setHovered("history")}
          onMouseLeave={handleMouseLeave}
        />
      )
    ) : (
      <FiChevronRight
        style={leftIconStyle}
        onClick={handleMouseUpLocal}
        onMouseEnter={() => setHovered("history")}
        onMouseLeave={handleMouseLeave}
      />
    )
  }

  return (
    <>
      {renderRightIcon()}
      {renderLeftIcon()}
    </>
  )
}
