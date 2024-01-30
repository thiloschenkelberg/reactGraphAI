import { useState } from "react"
import { IWorkflow } from "../types/workflow.types"
import { IConnection, INode } from "../types/canvas.types"
import { convertFromJSONFormat } from "../common/helpers"
import { RiDeleteBin2Line } from "react-icons/ri"

interface WorkflowHistoryProps {
  workflows: IWorkflow[] | undefined
  deleteWorkflow: (workflowId: string) => void
  setNodes: React.Dispatch<React.SetStateAction<INode[]>>
  setConnections: React.Dispatch<React.SetStateAction<IConnection[]>>
  setNeedLayout: React.Dispatch<React.SetStateAction<boolean>>
}

export default function WorkflowHistory(props: WorkflowHistoryProps) {
  const { workflows, deleteWorkflow, setNodes, setConnections, setNeedLayout } = props
  const [hovered, setHovered] = useState<number | undefined>()
  const [trashHovered, setTrashHovered] = useState(false)

  const setNodesAndConnections = (workflow: string) => {
    const { nodes, connections } = convertFromJSONFormat(workflow)
    setNodes(nodes)
    setConnections(connections)
    setNeedLayout(true)
  }

  const handleDeleteWorkflow = (e: React.MouseEvent, index: number) => {
    e.stopPropagation()
    if (!workflows) return
    deleteWorkflow(workflows[index]._id)
  }

  return (
    <div
      className="workflow-list"
      style={{
        paddingTop: 15,
        paddingLeft: 10,
        paddingRight: 10,
      }}
    >
      {workflows &&
        workflows.map((workflow, index) => (
          <div
            key={index}
            style={{
              position: "relative",
              width: "100%",
              height: 50,
              backgroundColor: hovered === index ? "#373A40" : "transparent",
              justifyContent: "center",
              display: "flex",
              flexDirection: "column",
              marginBottom: 10,
              paddingLeft: 10,
              borderRadius: "5px",
              cursor: "pointer",
            }}
            onMouseEnter={() => setHovered(index)}
            onMouseLeave={() => setHovered(undefined)}
            onClick={() => setNodesAndConnections(workflow.workflow)}
          >
            {hovered === index && (
              <RiDeleteBin2Line
                style={{
                  position: "absolute",
                  right: "5%",
                  fontSize: 20,
                  top: 14,
                  color: trashHovered ? "#ff0000" : "#909296"
                }}
                onMouseEnter={() => setTrashHovered(true)}
                onMouseLeave={() => setTrashHovered(false)}
                onClick={(e) => handleDeleteWorkflow(e, index)}
              />
            )}
            <span
              style={{
                textAlign: "left",
                color: "inherit",
                fontSize: 16,
                fontWeight: "bold",
              }}
            >
              Workflow {index + 1}
            </span>
            <span
              style={{
                textAlign: "left",
                color: "inherit",
                fontSize: 14,
              }}
            >
              {new Date(workflow.timestamp).toLocaleString()}
            </span>
          </div>
        ))}
    </div>
  )
}
