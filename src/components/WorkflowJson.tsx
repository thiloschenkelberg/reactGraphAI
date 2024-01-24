import SearchIcon from "@mui/icons-material/Search"

interface WorkflowJsonProps {
  workflowSearch: () => Promise<void>
  workflow: string | null
}

export default function WorkflowJson(props: WorkflowJsonProps) {
  const {
    workflowSearch,
    workflow
  } = props

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