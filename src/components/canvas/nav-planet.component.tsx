// import ScienceIcon from '@mui/icons-material/Science';
// import InputIcon from "@mui/icons-material/Input"
// import OutputIcon from "@mui/icons-material/Output"
// import ParameterIcon from "@mui/icons-material/Tune"

import { useState } from "react"
import { Planet } from "react-planet"
import chroma from "chroma-js"

import ProcessIcon from "@mui/icons-material/PrecisionManufacturing"
import PropertyIcon from "@mui/icons-material/Description"
import ParameterIcon from "@mui/icons-material/Tune"
import MeasurementIcon from "@mui/icons-material/SquareFoot"
import MatterIcon from "@mui/icons-material/Diamond"

import { colorPalette } from "./types/colorPalette"
import { INode } from "./types/canvas.types"

interface NavPlanetProps {
  onSelect: (nodeType: INode["type"]) => void
  open: boolean
  colorIndex: number
}

interface NavButtonProps {
  onSelect: (nodeType: INode["type"]) => void
  nodeType: INode["type"]
  children: React.ReactNode
  colorIndex: number
}

function NavButton(props: NavButtonProps) {
  const { onSelect, nodeType, children, colorIndex } = props
  const [hovered, setHovered] = useState(false)

  const colors = colorPalette[colorIndex]
  const backgroundColor = colors[nodeType]

  return (
    <div
      className="nav-button"
      onClick={() => onSelect(nodeType)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        backgroundColor,
        outline: hovered
          ? `3px solid ${chroma(backgroundColor).brighten().hex()}`
          : `3px solid ${chroma(backgroundColor).darken(0.75).hex()}`,
        outlineOffset: "-3px",
      }}
    >
      {children}
    </div>
  )
}

export default function NavPlanet(props: NavPlanetProps) {
  const { onSelect, open, colorIndex } = props

  return (
    <Planet
      centerContent={
        <div 
          className="nav-planet"
          style={{
            transform: "translate(-50%, -50%)"
          }}
        />
      }
      open={open}
      hideOrbit
      orbitRadius={75}
      rotation={144}
    >
      <NavButton
        onSelect={onSelect}
        nodeType="matter"
        children={<MatterIcon style={{ color: "#1a1b1e" }} />}
        colorIndex={colorIndex}
      />
      <NavButton
        onSelect={onSelect}
        nodeType="process"
        children={<ProcessIcon style={{ color: "#ececec" }} />}
        colorIndex={colorIndex}
      />
      <NavButton
        onSelect={onSelect}
        nodeType="parameter"
        children={<ParameterIcon style={{ color: "#ececec" }} />}
        colorIndex={colorIndex}
      />
      <NavButton
        onSelect={onSelect}
        nodeType="property"
        children={<PropertyIcon style={{ color: "#ececec" }} />}
        colorIndex={colorIndex}
      />
      <NavButton
        onSelect={onSelect}
        nodeType="measurement"
        children={<MeasurementIcon style={{ color: "#1a1b1e" }} />}
        colorIndex={colorIndex}
      />
    </Planet>
  )
}
