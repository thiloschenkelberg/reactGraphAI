import { Planet } from "react-planet"

import CloseIcon from "@mui/icons-material/Close"
import SwapHorizIcon from "@mui/icons-material/SwapHoriz"
import SyncAltIcon from "@mui/icons-material/SyncAlt"
import StraightIcon from "@mui/icons-material/Straight"

interface NodePlanetProps {
  onSelect: (action: string) => void
}

interface NodeButtonProps {
  onSelect: (action: string) => void
  children: React.ReactNode
  action: string
}

function NodeButton(props: NodeButtonProps) {
  const { onSelect, children, action } = props

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    onSelect(action)
  }

  return (
    <div 
      className="node-button"
      onClick={handleClick}
      >
      {children}
    </div>
  )
}

export default function NodePlanet(props: NodePlanetProps) {
  const { onSelect } = props

  return (
    <Planet
      centerContent={<div className="node-planet" />}
      open={true}
      hideOrbit
      orbitRadius={100}
      rotation={-90}
    >
      <NodeButton
        onSelect={onSelect}
        children={<CloseIcon />}
        action="delete"
      />
      <NodeButton
        onSelect={onSelect}
        children={<StraightIcon style={{ color: "#1a1b1e" }} />}
        action="connect"
      />
    </Planet>
  )
}