import { TbBinaryTree as GraphIcon } from "react-icons/tb"
import { PiGraph as GraphIcon2 } from "react-icons/pi"
import ResetIcon from "@mui/icons-material/RestartAlt"
import {MdUndo as UndoIcon} from "react-icons/md"
import {MdRedo as RedoIcon} from "react-icons/md"
import {LuFileJson as JsonFileIcon} from "react-icons/lu"
import {MdRestartAlt as ResetIcon2} from "react-icons/md"
import React, { useState } from "react"

import { ICanvasButton } from "./types/canvas.types"

interface CanvasButtonGroupProps {
  canvasRect: DOMRect | null
  onSelect: (buttonType: ICanvasButton["type"]) => void
}

interface CanvasButtonProps {
  onSelect: (buttonType: ICanvasButton["type"]) => void
  buttonType: ICanvasButton["type"]
  children: React.ReactNode
}

function CanvasButton(props: CanvasButtonProps) {
  const {
    onSelect,
    buttonType,
    children,
  } = props
  const [buttonHovered, setButtonHovered] = useState<ICanvasButton["type"] | null>(null)
  const [buttonDown, setButtonDown] = useState<ICanvasButton["type"] | null>(null)

  const handleMouseUpLocal = (e: React.MouseEvent) => {
    if (e.button === 2) return
    onSelect(buttonType)
  }
    return(
        <div
          className="canvas-btn2"
          onClick={handleMouseUpLocal}
          onMouseEnter={() => setButtonHovered(buttonType)}
          onMouseLeave={() => setButtonHovered(null)}
          onMouseDown={() => setButtonDown(buttonType)}
          onMouseUp={() => setButtonDown(null)}
          children={children}
          style={{
            backgroundColor: buttonDown === buttonType ? "#1a1b1e" : buttonHovered === buttonType ? "#2c2e33" : "#25262b",
            // transform: buttonHovered === buttonType ? "scale(1.05)" : "none",
            zIndex: buttonHovered === buttonType ? 10 : 1,
          }}
        />
    )
}

export default function CanvasButtonGroup(props: CanvasButtonGroupProps) {
  const {
    canvasRect,
    onSelect,
  } = props

  // const handleLayoutNodesLocal = () => {
  //   handleLayoutNodes
  // }

    return (
        <div
            className="canvas-btn-wrap"
            style={{
              left: canvasRect ? canvasRect.width / 2 : "50%",
              backgroundColor: "#25262b",
              padding: 5,
              borderRadius: "0.25rem",
              border: "1px solid #333333"
            }}
        >
          {
            BUTTON_TYPES.map(button => (
              <CanvasButton
                key={button.type}
                onSelect={onSelect}
                buttonType={button.type}
                children={button.icon}
              />
            ))
          }
        </div>
    )
}

const BUTTON_TYPES: { type: ICanvasButton["type"], icon: JSX.Element }[] = [
  { type: "layout", icon: <GraphIcon2 className="canvas-btn-icon"/> },
  { type: "undo", icon: <UndoIcon className="canvas-btn-icon"/> },
  { type: "reset", icon: <ResetIcon2 className="canvas-btn-icon"/> },
  { type: "redo", icon: <RedoIcon className="canvas-btn-icon"/> },

  { type: "saveToFile", icon: <JsonFileIcon className="canvas-btn-icon"/> }
]