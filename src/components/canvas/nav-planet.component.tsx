// import ScienceIcon from '@mui/icons-material/Science';
// import InputIcon from "@mui/icons-material/Input"
// import OutputIcon from "@mui/icons-material/Output"
// import ParameterIcon from "@mui/icons-material/Tune"

import ProcessIcon from '@mui/icons-material/PrecisionManufacturing';
import PropertyIcon from '@mui/icons-material/Description';
import ParameterIcon from "@mui/icons-material/Tune"
import MeasurementIcon from '@mui/icons-material/SquareFoot';
import MatterIcon from '@mui/icons-material/Diamond';

import { Planet } from "react-planet"

import nodeGreen from "../../img/node_green.png"
import nodeRed from "../../img/node_red.png"
import nodeBlue from "../../img/node_blue.png"
import nodeGrey from "../../img/node_grey3.png"
import nodeYellow from "../../img/node_yellow.png"

import INode from './types/node.type';

interface NavPlanetProps {
  onSelect: (nodeType: INode["type"]) => void
  open: boolean
}

interface ButtonProps {
  onSelect: (nodeType: INode["type"]) => void
  nodeType: INode["type"]
  children: React.ReactNode
}

function NavButton(props: ButtonProps) {
  const { onSelect, nodeType, children } = props

  let backgroundImage = ""

  switch (nodeType) {
    case "matter":
      backgroundImage = `url(${nodeGreen})`
      break
    case "process":
      backgroundImage = `url(${nodeRed})`
      break
    case "measurement":
      backgroundImage = `url(${nodeYellow})`
      break
    case "parameter":
      backgroundImage = `url(${nodeBlue})`
      break
    case "property":
      backgroundImage = `url(${nodeGrey})`
      break
    default:
      break
  }

  return (
    <div
      onClick={() => onSelect(nodeType)}
      className="nav-button"
      style={{
        backgroundImage,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {children}
    </div>
  )
}

export default function NavPlanet(props: NavPlanetProps) {
  const { onSelect, open } = props

  return (
    <Planet
      centerContent={
        <div
          style={{
            width: "10px",
            height: "10px",
            borderRadius: "50%",
            backgroundColor: "#808080",
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
        children={<MatterIcon />}
      />
      <NavButton
        onSelect={onSelect}
        nodeType="process"
        children={<ProcessIcon />}
      />
      <NavButton
        onSelect={onSelect}
        nodeType="parameter"
        children={<ParameterIcon />}
      />
      <NavButton
        onSelect={onSelect}
        nodeType="property"
        children={<PropertyIcon />}
      />
      <NavButton
        onSelect={onSelect}
        nodeType="measurement"
        children={<MeasurementIcon />}
      />
    </Planet>
  )
}
