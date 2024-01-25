import SearchIcon from "@mui/icons-material/Search"

import client from "../client"
import { saveBlobAsFile } from "../common/helpers"
import toast from "react-hot-toast"

interface WorkflowJsonProps {
  workflow: string | null
}

export default function WorkflowJson(props: WorkflowJsonProps) {
  const {
    workflow
  } = props

  async function workflowSearch() {
    try {
      const response = await client.workflowSearch(workflow)
      if (response) {
        saveBlobAsFile(response.data, "workflows.csv")
      }
    } catch (err: any) {
      toast.error(err.message)
    }
  }

  return (
    <>
      <div className="workflow-window-json-btn-group">
        <SearchIcon onClick={workflowSearch} />
      </div>
      <div
        className="workflow-window-json-textarea"
        style={{
          position: "relative",
          width: "100%",
          flex: 1,
        }}
      >
        <textarea
          readOnly
          value={workflow ? workflow : "asd"}
          style={{
            position:"relative",
            top: 0,
            width: "100%",
            height: "100%",
            resize: "none",
          }}
        />
      </div>
    </>
  )
}