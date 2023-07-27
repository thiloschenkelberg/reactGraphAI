import { useState } from "react"

import DoubleArrowLeftIcon from '@mui/icons-material/KeyboardDoubleArrowLeft'
import DoubleArrowRightIcon from '@mui/icons-material/KeyboardDoubleArrowRight'

import Canvas from "./canvas/canvas.component"

interface SearchProps {
  colorIndex: number
}

export default function Search(props: SearchProps) {
  const { colorIndex } = props
  const [workflow, setWorkflow] = useState<JSON | null>(null)
  const [splitView, setSplitView] = useState(false)

  const getWorkflow = (workflow: JSON) => {

  }

  return(
    <div style={{position: "fixed", display: "flex"}}>
      <Canvas colorIndex={colorIndex} getWorkflow={getWorkflow}/>
      {splitView && (
        <div>
          <textarea
            readOnly
            // value={workflow}
            style={{
              width: "400px", height: "100vh"
            }}
          />
        </div>
      )}
    </div>
  )
}