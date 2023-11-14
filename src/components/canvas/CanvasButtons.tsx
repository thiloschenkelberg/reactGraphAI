import React, { useEffect, useRef, useState } from "react"

import { TbBinaryTree as GraphIcon } from "react-icons/tb"
import { PiGraph as GraphIcon2 } from "react-icons/pi"
import ResetIcon from "@mui/icons-material/RestartAlt"
import { MdUndo as UndoIcon } from "react-icons/md"
import { MdRedo as RedoIcon } from "react-icons/md"
import { LuFileJson as JsonFileIcon } from "react-icons/lu"
import { MdRestartAlt as ResetIcon2 } from "react-icons/md"
import { PiDotsSixVertical as HandleIcon } from "react-icons/pi"

import { ICanvasButton, Position } from "./types/canvas.types"
import { clamp } from "../../common/helpers"
import { verify } from "crypto"

interface CanvasButtonGroupProps {
  canvasRect: DOMRect | null
  splitView: boolean
  onSelect: (buttonType: ICanvasButton["type"]) => void
}

interface CanvasButtonProps {
  onSelect: (buttonType: ICanvasButton["type"]) => void
  buttonType: ICanvasButton["type"]
  children: React.ReactNode
  vertical: boolean
}

function CanvasButton(props: CanvasButtonProps) {
  const { onSelect, buttonType, children, vertical } = props
  const [buttonHovered, setButtonHovered] = useState<
    ICanvasButton["type"] | null
  >(null)
  const [buttonDown, setButtonDown] = useState<ICanvasButton["type"] | null>(
    null
  )

  const handleMouseUpLocal = (e: React.MouseEvent) => {
    if (e.button === 2) return
    onSelect(buttonType)
  }

  const handleMouseLeave = () => {
    setButtonHovered(null)
    setButtonDown(null)
  }

  return (
    <div
      className="canvas-btn2"
      onClick={handleMouseUpLocal}
      onMouseEnter={() => setButtonHovered(buttonType)}
      onMouseLeave={handleMouseLeave}
      onMouseDown={() => setButtonDown(buttonType)}
      onMouseUp={() => setButtonDown(null)}
      children={children}
      style={{
        width: vertical ? 45 : 60,
        height: vertical ? 60 : 40,
        backgroundColor:
          buttonDown === buttonType
            ? "#1a1b1e"
            : buttonHovered === buttonType
            ? "#2c2e33"
            : "#25262b",
        // transform: buttonHovered === buttonType ? "scale(1.05)" : "none",
        zIndex: buttonHovered === buttonType ? 10 : 1,
        cursor: buttonHovered === buttonType ? "pointer" : "default",
      }}
    />
  )
}

export default function CanvasButtonGroup(props: CanvasButtonGroupProps) {
  const { canvasRect, splitView, onSelect } = props
  const [initialized, setInitialized] = useState(false)
  const [positioned, setPositioned] = useState(false)
  const [position, setPosition] = useState<Position>({ x: 0, y: 15 })
  const [vertical, setVertical] = useState(false)
  const [moveable, setMoveable] = useState(false)
  const [handleHovered, setHandleHovered] = useState(false)
  const buttonsRef = useRef<HTMLDivElement>(null)

  // if not positioned manually
  useEffect(() => {
    if (!canvasRect || !buttonsRef.current || positioned) return

    if (splitView) {
      setPosition({
        x: 0,
        y: 15,
      })
      setVertical(true)
    } else {
      setPosition({
        x: canvasRect.width / 2 - buttonsRef.current.offsetWidth / 2 - 22,
        y: 15,
      })
      setVertical(false)
    }
    setInitialized(true)
  }, [positioned, canvasRect, splitView])

  // load position from local storage
  useEffect(() => {
    const positioned = localStorage.getItem("canvasBtnPositioned")
    const position = localStorage.getItem("canvasBtnPosition")
    const vertical = localStorage.getItem("canvasBtnVertical")

    if (!position || !vertical || !positioned) return

    setPositioned(JSON.parse(positioned))
    setPosition(JSON.parse(position))
    setVertical(JSON.parse(vertical))

    setInitialized(true)
  }, [])

  // save position to local storage
  useEffect(() => {
    localStorage.setItem("canvasBtnPositioned", JSON.stringify(positioned))
    localStorage.setItem("canvasBtnPosition", JSON.stringify(position))
    localStorage.setItem("canvasBtnVertical", JSON.stringify(vertical))
  }, [positioned, position, vertical])

  // move buttons (and enable manual positioning)
  const moveButtons = (e: React.MouseEvent) => {
    if (!moveable || !canvasRect) return

    const mouseX = e.clientX - canvasRect.left
    const mouseY = e.clientY - canvasRect.top

    let btnX, btnY

    if (mouseX > 90) {
      setVertical(false)
      btnX = mouseX - 29
      btnY = 15
    } else {
      setVertical(true)
      btnX = 0
      btnY = clamp(mouseY - 19, 15, Infinity)
    }

    setPositioned(true)
    setPosition({ x: btnX, y: btnY })
  }

  // reset button positioning (and disable manual positioning)
  const resetButtons = () => {
    if (!canvasRect || !buttonsRef.current) return

    let width
    if (vertical) {
      width = buttonsRef.current.offsetHeight / 2
    } else {
      width = buttonsRef.current.offsetWidth / 2
    }
    setPositioned(false)

    if (splitView) {
      setPosition({
        x: 0,
        y:
          canvasRect.height / 2 -
          canvasRect.top -
          buttonsRef.current.offsetHeight / 2,
      })
      setVertical(true)
    } else {
      setPosition({
        x: canvasRect.width / 2 - width - 22,
        y: 15,
      })
      setVertical(false)
    }
  }

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        cursor: moveable ? "grabbing" : handleHovered ? "grab" : "inherit"
      }}
      onMouseMove={moveButtons}
      // onMouseLeave={() => setMoveable(false)}
      onMouseUp={(e: React.MouseEvent) => {
        if (moveable) e.stopPropagation()
        setMoveable(false)
      }}
    >
      {initialized && (
        <div
          className="canvas-btn-wrap"
          style={{
            left: 10,
            transform: `translate(${position.x}px,${position.y}px)`,
            flexDirection: vertical ? "column" : "row",
          }}
          ref={buttonsRef}
        >
          <div
            className="canvas-btn-handle"
            style={{
              margin: vertical ? "-5px 0 0 0" : "0 0 0 -5px",
            }}
            onMouseEnter={() => setHandleHovered(true)}
            onMouseLeave={() => setHandleHovered(false)}
            onMouseUp={(e: React.MouseEvent) => {
              e.stopPropagation()
              setMoveable(false)
            }}
            onMouseDown={(e: React.MouseEvent) => {
              e.stopPropagation()
              setMoveable(true)
            }}
            onDoubleClick={resetButtons}
            children={
              <HandleIcon
                className="canvas-btn-handle-icon"
                style={{
                  transform: vertical ? "rotate(90deg)" : "none",
                }}
              />
            }
          />
          <div
            className="canvas-btn-divider"
            style={{
              margin: vertical ? "0 -5px 5px -5px" : "-5px 5px -5px 0",
              width: vertical ? 55 : 1,
              height: vertical ? 1 : 50,
            }}
          />
          {BUTTON_TYPES.map((button) => (
            <CanvasButton
              key={button.type}
              onSelect={onSelect}
              buttonType={button.type}
              children={button.icon}
              vertical={vertical}
            />
          ))}
        </div>
      )}
    </div>
  )
}

const BUTTON_TYPES: { type: ICanvasButton["type"]; icon: JSX.Element }[] = [
  { type: "layout", icon: <GraphIcon2 className="canvas-btn-icon" /> },
  { type: "undo", icon: <UndoIcon className="canvas-btn-icon" /> },
  { type: "reset", icon: <ResetIcon2 className="canvas-btn-icon" /> },
  { type: "redo", icon: <RedoIcon className="canvas-btn-icon" /> },

  { type: "saveToFile", icon: <JsonFileIcon className="canvas-btn-icon" /> },
]
