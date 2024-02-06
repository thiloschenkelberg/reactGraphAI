import { Button } from "@mantine/core"

interface WorkflowPipelineProps {
  handleContextChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  requestExtractLabels: () => Promise<void>
  requestExtractAttributes: () => Promise<void>
  requestExtractNodes: () => Promise<void>
  requestExtractGraph: () => Promise<void>
  requestImportGraph: () => Promise<void>
  progress: number
}

export default function WorkflowPipeline(props: WorkflowPipelineProps) {
  const {
    handleContextChange,
    requestExtractLabels,
    requestExtractAttributes,
    requestExtractNodes,
    requestExtractGraph,
    requestImportGraph,
    progress,
  } = props

  const spaceBetween = 200

  return (
    <div
      className="workflow-table-specs"
      style={{
        width: "100%",
        height: 80,
        display: "flex",
        flexDirection: "row",
      }}
    >
      {/* Step 1 - Upload CSV -> Request label extraction */}
      <div
        style={{
          display: "flex",
          flexDirection: "row",
        }}
      >
        {/* Context label and input field */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            width: 250,
            paddingLeft: 10,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <input
            type="text"
            id="contextInput"
            placeholder={"Enter table context..."}
            defaultValue={undefined}
            onChange={handleContextChange} // write nodeName state
            autoFocus={true}
            style={{
              alignSelf: "center",
              justifySelf: "center",
            }}
          />
        </div>
        <Button
          type="submit"
          radius="sm"
          style={{
            alignSelf: "center",
            marginLeft: 15,
            marginBottom: 1,
            width: 155,
          }}
          onClick={requestExtractLabels}
          disabled={progress !== 1}
        >
          Extract Labels
        </Button>
      </div>

      {/* Arrow */}
      <div
        style={{
          width: spaceBetween,
        }}
      >
        <svg
          style={{
            position: "relative",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            pointerEvents: "none",
          }}
        >
          <defs>
            <marker
              id="arrow"
              viewBox="0 0 10 10"
              refX="9"
              refY="5"
              fill="#555"
              markerWidth="8"
              markerHeight="8"
              orient="auto-start-reverse"
            >
              <path d="M 0 0 L 10 5 L 0 10 z" />
            </marker>
          </defs>
          <path
            d={`M ${15},${40} L ${200},${40}`}
            stroke="#555"
            strokeWidth="2"
            fill="none"
            markerEnd="url(#arrow)"
            pointerEvents="none"
          />
        </svg>
      </div>

      {/* Step 2 - View extracted labels -> Request attribute extraction  */}
      <div
        style={{
          display: "flex",
        }}
      >
        <Button
          type="submit"
          radius="sm"
          style={{
            alignSelf: "center",
            marginLeft: 15,
            marginBottom: 1,
            width: 155,
          }}
          onClick={requestExtractAttributes}
          disabled={progress !== 2}
        >
          Extract Attributes
        </Button>
      </div>

      {/* Arrow */}
      <div
        style={{
          width: spaceBetween,
        }}
      >
        <svg
          style={{
            position: "relative",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            pointerEvents: "none",
          }}
        >
          <defs>
            <marker
              id="arrow"
              viewBox="0 0 10 10"
              refX="9"
              refY="5"
              fill="#555"
              markerWidth="8"
              markerHeight="8"
              orient="auto-start-reverse"
            >
              <path d="M 0 0 L 10 5 L 0 10 z" />
            </marker>
          </defs>
          <path
            d={`M ${15},${40} L ${200},${40}`}
            stroke="#555"
            strokeWidth="2"
            fill="none"
            markerEnd="url(#arrow)"
            pointerEvents="none"
          />
        </svg>
      </div>

      {/* Step 3 - View extracted attributes -> Request node extraction */}
      <div
        style={{
          display: "flex",
        }}
      >
        <Button
          type="submit"
          radius="sm"
          style={{
            alignSelf: "center",
            marginLeft: 15,
            marginBottom: 1,
            width: 155,
          }}
          onClick={requestExtractNodes}
          disabled={progress !== 3}
        >
          Extract Nodes
        </Button>
      </div>

      {/* Arrow */}
      <div
        style={{
          width: spaceBetween,
        }}
      >
        <svg
          style={{
            position: "relative",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            pointerEvents: "none",
          }}
        >
          <defs>
            <marker
              id="arrow"
              viewBox="0 0 10 10"
              refX="9"
              refY="5"
              fill="#555"
              markerWidth="8"
              markerHeight="8"
              orient="auto-start-reverse"
            >
              <path d="M 0 0 L 10 5 L 0 10 z" />
            </marker>
          </defs>
          <path
            d={`M ${15},${40} L ${200},${40}`}
            stroke="#555"
            strokeWidth="2"
            fill="none"
            markerEnd="url(#arrow)"
            pointerEvents="none"
          />
        </svg>
      </div>

      {/* Step 4 - View extracted nodes (in canvas) -> Request graph extraction */}
      <div
        style={{
          display: "flex",
        }}
      >
        <Button
          type="submit"
          radius="sm"
          style={{
            alignSelf: "center",
            marginLeft: 15,
            marginBottom: 1,
            width: 155,
          }}
          onClick={requestExtractGraph}
          disabled={progress !== 4}
        >
          Extract Graph
        </Button>
      </div>

      {/* Arrow */}
      <div
        style={{
          width: spaceBetween,
        }}
      >
        <svg
          style={{
            position: "relative",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            pointerEvents: "none",
          }}
        >
          <defs>
            <marker
              id="arrow"
              viewBox="0 0 10 10"
              refX="9"
              refY="5"
              fill="#555"
              markerWidth="8"
              markerHeight="8"
              orient="auto-start-reverse"
            >
              <path d="M 0 0 L 10 5 L 0 10 z" />
            </marker>
          </defs>
          <path
            d={`M ${15},${40} L ${200},${40}`}
            stroke="#555"
            strokeWidth="2"
            fill="none"
            markerEnd="url(#arrow)"
            pointerEvents="none"
          />
        </svg>
      </div>

      {/* Step 5 - View extracted graph (in canvas) -> Request import of graph to database */}
      <div
        style={{
          display: "flex",
        }}
      >
        <Button
          type="submit"
          radius="sm"
          style={{
            alignSelf: "center",
            marginLeft: 15,
            marginBottom: 1,
            width: 155,
          }}
          onClick={requestImportGraph}
          disabled={progress !== 5}
        >
          Save to Database
        </Button>
      </div>
    </div>
  )
}
