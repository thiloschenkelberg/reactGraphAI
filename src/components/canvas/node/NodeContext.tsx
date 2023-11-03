import React, { useEffect, useState } from "react"
import { Planet } from "react-planet"

import CloseIcon from "@mui/icons-material/Close"
// import SwapHorizIcon from "@mui/icons-material/SwapHoriz"
// import SyncAltIcon from "@mui/icons-material/SyncAlt"
// import StraightIcon from "@mui/icons-material/Straight"
import LayersIcon from "@mui/icons-material/Layers"
import AddIcon from '@mui/icons-material/Add'
import RemoveIcon from '@mui/icons-material/Remove';

import { hoverColors } from "../types/colors"

interface NodeContextProps {
  onSelect: (action: string) => void
  isOpen: boolean
  nodeSize: number
}

interface ContextButtonProps {
  onSelect: (action: string) => void
  children: React.ReactNode
  action: string
  isSmall?: boolean
  isPlanet?: boolean
  planetOpen?: boolean
}

function ContextButton(props: ContextButtonProps) {
  const { onSelect, children, action, isSmall, isPlanet, planetOpen } = props
  const [hovered, setHovered] = useState(false)

  const handleSelect = (e: React.MouseEvent) => {
    if (isPlanet) return
    e.stopPropagation()
    onSelect(action)
  }

  const hoverColor = hoverColors[action] || hoverColors.default

  const styledChild = React.Children.map(children, (child) =>
  React.isValidElement(child)
    ? React.cloneElement(child as React.ReactElement<any>, {
        style: { color: hovered || planetOpen ? hoverColor : "#1a1b1e" },
      })
    : child
  )

  return (
    <div
      className="ctxt-button"
      onMouseDown={(e: React.MouseEvent) => e.stopPropagation()}
      onMouseUp={handleSelect}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        width: isSmall ? 40 : 50,
        height: isSmall ? 40 : 50,
        backgroundColor: "#666666",
      }}
    >
      {styledChild}
    </div>
  )
}

export default function NodeContext(props: NodeContextProps) {
  const { onSelect, isOpen, nodeSize } = props
  const [layerPlanetOpen, setLayerPlanetOpen] = useState(false)

  const planetClickLocal = (e: React.MouseEvent) => {
    e.stopPropagation()
    setLayerPlanetOpen(!layerPlanetOpen)
  }

  return (
    <Planet
      centerContent={<div className="ctxt-planet" />}
      open={isOpen}
      // autoClose
      hideOrbit
      orbitRadius={nodeSize / 2 + 40}
      rotation={90}
    >
      {/* <div
        style={{
          transform: "translate(-25px, -25px)"
        }}
      >
        <Planet
          centerContent={
            <NodeButton 
              onSelect={onSelect}
              action=""
              children={<LayersIcon />}
              isPlanet={true}
              planetOpen={layerPlanetOpen}
            />
          }
          open={layerPlanetOpen}
          hideOrbit
          orbitRadius={55}
          rotation={0}
          onClick={planetClickLocal}
          
        >
          <div/>
          <div/>
          <NodeButton 
            onSelect={onSelect}
            action="layerUp"
            children={<AddIcon />}
            isSmall
          />
          <NodeButton 
            onSelect={onSelect}
            action="layerDown"
            children={<RemoveIcon />}
            isSmall
          />
          <div/>
          <div/>
        </Planet>
      </div> */}
      <div/>
      <ContextButton
        onSelect={onSelect}
        children={<CloseIcon />}
        action="delete"
      />
    </Planet>
  )
}
