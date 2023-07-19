import React, { useState } from "react"
import { Planet } from "react-planet"

import CloseIcon from "@mui/icons-material/Close"
import SwapHorizIcon from "@mui/icons-material/SwapHoriz"
import SyncAltIcon from "@mui/icons-material/SyncAlt"
import StraightIcon from "@mui/icons-material/Straight"
import LayersIcon from "@mui/icons-material/Layers"
import AddIcon from '@mui/icons-material/Add'
import RemoveIcon from '@mui/icons-material/Remove';

import { hoverColors } from "./types/color.palette"

interface NodePlanetProps {
  onSelect: (action: string) => void
}

interface NodeButtonProps {
  onSelect: (action: string) => void
  children: React.ReactNode
  action: string
  extended?: boolean
}

function NodeButton(props: NodeButtonProps) {
  const { onSelect, children, action, extended } = props
  const [hovered, setHovered] = useState(false)

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    onSelect(action)
  }

  const hoverColor = hoverColors[action] || hoverColors.default

  const styledChild = React.Children.map(children, (child) =>
  React.isValidElement(child)
    ? React.cloneElement(child as React.ReactElement<any>, {
        style: { color: hovered || extended ? "#1a1b1e" : hoverColor },
      })
    : child
  )

  return (
    <div
      className="node-button"
      onClick={handleClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {styledChild}
    </div>
  )
}

export default function NodePlanet(props: NodePlanetProps) {
  const { onSelect } = props
  const [extended, setExtended] = useState(false)

  const onSelectLocal = (action: string) => {

  }

  return (
    <Planet
      centerContent={<div className="node-planet" />}
      open={true}
      hideOrbit
      orbitRadius={100}
      rotation={90}
    >
      <NodeButton
        onSelect={onSelect}
        action=""
        extended={extended}
      >
        <LayersIcon />
        <Planet
          centerContent={<div className="node-planet-2" />}
          open={false}
          autoClose
          hideOrbit
          orbitRadius={70}
          rotation={0}
          onClick={() => {setExtended(!extended)}}
        >
          <div/>
          <div/>
          <div/>
          <NodeButton 
            onSelect={onSelect}
            action="layerUp"
            children={<AddIcon />}
          />
          <NodeButton 
            onSelect={onSelect}
            action="layerDown"
            children={<RemoveIcon />}
          />
          <div/>
          <div/>
          <div/>
        </Planet>
      </NodeButton>
      {/* <NodeButton onSelect={onSelect} action="layerUp">
        <div style={{ display: "inline-flex", alignItems: "center" }}>
          <LayersIcon />
          <StraightIcon />
        </div>
      </NodeButton>
      <NodeButton onSelect={onSelect} action="layerDown">
        <div style={{ display: "inline-flex", alignItems: "center" }}>
          <LayersIcon />
          <StraightIcon />
        </div>
      </NodeButton> */}
      <NodeButton
        onSelect={onSelect}
        children={<CloseIcon />}
        action="delete"
      />
    </Planet>
  )
}
