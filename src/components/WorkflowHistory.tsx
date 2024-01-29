import { useEffect, useState } from "react"
import toast from "react-hot-toast"
import client from "../client"
import { IWorkflow } from "../types/workflow.types"
import { IConnection, INode } from "../types/canvas.types"
import { convertFromJSONFormat } from "../common/helpers"

interface WorkflowHistoryProps {
  setNodes: React.Dispatch<React.SetStateAction<INode[]>>
  setConnections: React.Dispatch<React.SetStateAction<IConnection[]>>
}

export default function WorkflowHistory(props: WorkflowHistoryProps) {
  const {setNodes, setConnections} = props
  const [workflows, setWorkflows] = useState<IWorkflow[]>([])
  const [hovered, setHovered] = useState<number | undefined>()

  useEffect(() => {
    async function fetchWorkflows() {
      try {
        const response = await client.getWorkflows()

        if (!response || !response.data.workflows || !response.data.message) {
          toast.error("Error while retrieving workflows!")
        }

        setWorkflows(response.data.workflows)
      } catch (err: any) {
        toast.error(err.message)
      }
    }

    fetchWorkflows()
  }, [])

  const setNodesAndConnections = (workflow: string) => {
    const {nodes, connections} = convertFromJSONFormat(workflow)
    setNodes(nodes)
    setConnections(connections)
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
      {workflows.map((workflow, index) => (
        <div
          key={index}
          style={{
            width: "100%",
            height: 50,
            backgroundColor: hovered === index ? "#373A40" : "transparent",
            justifyContent: "center",
            display: "flex",
            flexDirection: "column",
            marginBottom: 10,
            paddingLeft: 10,
            borderRadius: "5px",
          }}
          onMouseEnter={() => setHovered(index)}
          onMouseLeave={() => setHovered(undefined)}
          onClick={() => setNodesAndConnections(workflow.workflow)}
        >
          <span
            style={{
              textAlign: "left",
              color: "inherit",
              fontSize: 16,
              fontWeight: "bold"
            }}
          >
            Workflow {index + 1}
          </span>
          <span
            style={{
              textAlign: "left",
              color: "inherit",
              fontSize: 14
            }}
          >
            {new Date(workflow.timestamp).toLocaleString()}
          </span>
        </div>
      ))}
    </div>
  )
}