import IConnection from "./types/connection.type";

interface ConnectionProps {
  connection: IConnection
}

export default function Connection(props: ConnectionProps) {
  const { connection } = props;
  const start = connection.start.position
  const end = connection.end.position

  const dx = end.x - start.x
  const dy = end.y - start.y
  const len = Math.sqrt(dx * dx + dy * dy)
  const normX = dx / len
  const normY = dy / len

  const endX = end.x - normX * 51
  const endY = end.y - normY * 51

  const handleConnectionClick = (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
    e.stopPropagation()
    console.log("Connection clicked")
    //open nav menu
  }

  return (
    <svg
      style={{ 
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none"
      }}
    >
      <defs>
        <marker id="arrow" viewBox="0 0 10 10" refX="9" refY="5" fill="#555"
                markerWidth="8" markerHeight="8" orient="auto-start-reverse">
          <path d="M 0 0 L 10 5 L 0 10 z" />
        </marker>
      </defs>
      <path
        d={`M ${start.x},${start.y} L ${endX},${endY}`}
        stroke="#555"
        strokeWidth="2"
        fill="none"
        markerEnd="url(#arrow)"
        pointerEvents="none"
      />
      <a onClick={handleConnectionClick}>
        <path
          d={`M ${start.x},${start.y} L ${endX},${endY}`}
          fill="none"
          strokeWidth="15"
          stroke="transparent"
          pointerEvents="auto"
        />
      </a>
    </svg>
  );
}