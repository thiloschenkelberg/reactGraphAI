// import ScienceIcon from '@mui/icons-material/Science';
// import InputIcon from "@mui/icons-material/Input"
// import OutputIcon from "@mui/icons-material/Output"
// import ParameterIcon from "@mui/icons-material/Tune"

import React, { useEffect, useMemo, useState } from "react"
import { Planet } from "react-planet"
import chroma from "chroma-js"
import { useSpring, animated } from "react-spring"

import ManufacturingIcon from "@mui/icons-material/PrecisionManufacturing"
import PropertyIcon from "@mui/icons-material/Description"
import ParameterIcon from "@mui/icons-material/Tune"
import MeasurementIcon from "@mui/icons-material/SquareFoot"
import MatterIcon from "@mui/icons-material/Diamond"

import { colorPalette } from "../types/colorPalette"
import { INode } from "../types/canvas.types"
import { possibleConnections } from "../../../common/helpers"
import zIndex from "@mui/material/styles/zIndex"

interface CanvasContextProps {
  onSelect: (nodeType: INode["type"]) => void
  open: boolean
  colorIndex: number
  contextRestrict?: INode["type"]
}

interface ContextButtonProps {
  onSelect: (nodeType: INode["type"]) => void
  nodeType: INode["type"]
  children: React.ReactNode
  colorIndex: number
  hovered: INode["type"] | null
  setHovered: React.Dispatch<React.SetStateAction<INode["type"] | null>>
}

function ContextButton(props: ContextButtonProps) {
  const { onSelect, nodeType, children, colorIndex, hovered, setHovered } = props

  const colors = colorPalette[colorIndex]
  const backgroundColor = colors[nodeType]

  const handleMouseUpLocal = (e: React.MouseEvent) => {
    if (e.button === 2) return
    onSelect(nodeType)
  }

  const springProps = useSpring({
    scale: hovered === nodeType ? 1.2 : 1,
    config: {
      tension: 1300,
      friction: 26,
    }
  });

  const capitalizeFirstLetter = (str: string) => {
    return str.charAt(0).toUpperCase() + str.slice(1)
  }

  return (
    <div style={{position: "relative", zIndex: hovered === nodeType ? 5 : 3}}>
    <animated.div 
      className="ctxt-button"
      onMouseUp={handleMouseUpLocal}
      onMouseEnter={() => setHovered(nodeType)}
      onMouseLeave={() => setHovered(null)}
      style={{
        position: "relative",
        width: "80px",
        height: "80px",
        transform: springProps.scale.to(scale => `scale(${scale})`),
        backgroundColor,
        outline: hovered === nodeType
          ? `3px solid ${chroma(backgroundColor).brighten(1).hex()}`
          : `3px solid ${chroma(backgroundColor).darken(0.5).hex()}`,
        outlineOffset: "-3px",
        zIndex: hovered === nodeType ? 5 : 3
      }}
    >
      {children}
    </animated.div>
    </div>
  )
}

export default function CanvasContext(props: CanvasContextProps) {
  const { onSelect, open, colorIndex, contextRestrict } = props
  const [hovered, setHovered] = useState<INode["type"] | null>(null)

  const buttonsToRender = useMemo(() => {
    const buttonList = possibleConnections(contextRestrict)
    return BUTTON_TYPES.filter(button => 
      buttonList.includes(button.type) || !contextRestrict
    );
  }, [contextRestrict])


  return (
    <>
      <Planet
        centerContent={
          <div 
            className="ctxt-planet"
            style={{
              width: "0px",
              height: "0px",
              backgroundColor: "#808080",
              transform: "translate(-50%, -50%)"
            }}
          />
        }
        open={open}
        hideOrbit
        orbitRadius={buttonsToRender.length > 1 ? 80 : 1}
        rotation={ROTATIONS[buttonsToRender.length] || 0}
      >
        {buttonsToRender.map(button => (
          <ContextButton
            key={button.type}
            onSelect={onSelect}
            nodeType={button.type}
            children={button.icon}
            colorIndex={colorIndex}
            hovered={hovered}
            setHovered={setHovered}
          />
        ))}
      </Planet>

    </>
  )
}

const BUTTON_TYPES: { type: INode["type"], icon: JSX.Element }[] = [
  { type: 'matter', icon: <MatterIcon style={{ color: "#1a1b1e" }} /> },
  { type: 'manufacturing', icon: <ManufacturingIcon style={{ color: "#ececec" }} /> },
  { type: 'parameter', icon: <ParameterIcon style={{ color: "#ececec" }} /> },
  { type: 'property', icon: <PropertyIcon style={{ color: "#ececec" }} /> },
  { type: 'measurement', icon: <MeasurementIcon style={{ color: "#1a1b1e" }} /> },
];

const ROTATIONS: { [key: number]: number } = {
  1: 0,
  2: 90,
  3: 120,
  5: 144
};
