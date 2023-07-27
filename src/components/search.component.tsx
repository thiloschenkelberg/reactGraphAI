import Canvas from "./canvas/canvas.component"

interface SearchProps {
  colorIndex: number
}

export default function Search(props: SearchProps) {
  const { colorIndex } = props

  return(
    <div style={{position: "fixed"}}>
      <Canvas colorIndex={colorIndex} />
    </div>
  )
}