import { useState, CSSProperties, useEffect } from "react"
import { TbMinusVertical, TbMinus } from "react-icons/tb"
import { FiChevronLeft, FiChevronRight, FiChevronDown, FiChevronUp } from "react-icons/fi"
import { useSpring, animated } from "react-spring"

interface WorkflowButtonProps {
  jsonView: boolean
  jsonViewWidth: number
  historyView: boolean
  historyViewWidth: number
  tableView: boolean
  tableViewHeight: number
  onSelect: (view: string) => void
}

export default function WorkflowButtons(props: WorkflowButtonProps) {
  const {
    jsonView,
    jsonViewWidth,
    historyView,
    historyViewWidth,
    tableView,
    tableViewHeight,
    onSelect,
  } = props
  const [hovered, setHovered] = useState("none")

  useEffect(() => {
    setHovered("none")
  }, [jsonView, historyView, tableView])

  const springProps = useSpring({
    jsonIconRight:
      jsonView ? jsonViewWidth : 0,
    historyIconLeft:
      historyView ? historyViewWidth : 0,
    tableIconBottom:
      tableView ? tableViewHeight + 5 : 0,
    config: {
      tension: 1000,
      friction: 100,
    }
  })

  const iconStyle: CSSProperties = {
    pointerEvents: "all",
    position: "absolute",
    color: "#909296",
    width: "35px",
    height: "auto",
  }

  const handleMouseLeave = () => {
    setHovered("null")
  }

  const handleMouseUpLocal = (e: React.MouseEvent) => {
    if (e.button === 2) return
    onSelect(hovered)
  }

  const renderJsonIcon = () => {
    return (
      <animated.div
        className="workflow-window-btn"
        style={{
          top: "49%",
          right: 0,
        }}
      >
        {hovered === "json" ? (
          jsonView ? (
            <FiChevronRight
              style={iconStyle}
              onClick={handleMouseUpLocal}
              onMouseEnter={() => setHovered("json")}
              onMouseLeave={handleMouseLeave}
            />
          ) : (
            <FiChevronLeft
              style={iconStyle}
              onClick={handleMouseUpLocal}
              onMouseEnter={() => setHovered("json")}
              onMouseLeave={handleMouseLeave}
            />
          )
        ) : (
          <TbMinusVertical
            style={iconStyle}
            onClick={handleMouseUpLocal}
            onMouseEnter={() => setHovered("json")}
            onMouseLeave={handleMouseLeave}
          />
        )}
      </animated.div>
    )
  }

  const renderHistoryIcon = () => {
    return (
      <animated.div
        className="workflow-window-btn"
        style={{
          left: 0,
          top: "49%"
        }}
      >
        {hovered === "history" ? (
          historyView ? (
            <FiChevronLeft
              style={iconStyle}
              onClick={handleMouseUpLocal}
              onMouseEnter={() => setHovered("history")}
              onMouseLeave={handleMouseLeave}
            />
          ) : (
            <FiChevronRight
              style={iconStyle}
              onClick={handleMouseUpLocal}
              onMouseEnter={() => setHovered("history")}
              onMouseLeave={handleMouseLeave}
            />
          )
        ) : (
          <TbMinusVertical
            style={iconStyle}
            onClick={handleMouseUpLocal}
            onMouseEnter={() => setHovered("history")}
            onMouseLeave={handleMouseLeave}
          />
        )}
      </animated.div>
    )
  }

  const renderTableIcon = () => {
    return (
      <animated.div
        className="workflow-window-btn"
        style={{
          bottom: 5,
          left: "50%"
        }}
      >
        {hovered === "table" ? (
          tableView ? (
            <FiChevronDown
              style={iconStyle}
              onClick={handleMouseUpLocal}
              onMouseEnter={() => setHovered("table")}
              onMouseLeave={handleMouseLeave}
            />
          ) : (
            <FiChevronUp
              style={iconStyle}
              onClick={handleMouseUpLocal}
              onMouseEnter={() => setHovered("table")}
              onMouseLeave={handleMouseLeave}
            />
          )
        ) : (
          <TbMinus
            style={iconStyle}
            onClick={handleMouseUpLocal}
            onMouseEnter={() => setHovered("table")}
            onMouseLeave={handleMouseLeave}
          />
        )}
      </animated.div>
    )
  }

  return (
    <>
      {renderHistoryIcon()}
      {renderJsonIcon()}
      {renderTableIcon()}
    </>
  )
}
