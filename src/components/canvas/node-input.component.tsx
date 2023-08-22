import { Select } from "@mantine/core"

import { INode } from "./types/canvas.types"
import { useRef, useState } from "react"

interface NodeInputProps {
  isValueNode: boolean
  nodeLayer: number
  nodeType: INode["type"]
  nodeDotName?: string
  nodeDotValue?: number
  nodeDotOperator?: INode["operator"]
  handleNodeRename: (
    name?: string, value?: number, operator?: INode["operator"]
  ) => void
}

export default function NodeInput(props: NodeInputProps) {
  const {
    isValueNode,
    nodeLayer,
    nodeType,
    nodeDotName,
    nodeDotValue,
    nodeDotOperator,
    handleNodeRename,
  } = props
  const [nodeName, setNodeName] = useState<string | undefined>(nodeDotName)
  const [nodeValue, setNodeValue] = useState<number | undefined>(nodeDotValue)
  const [nodeOperator, setNodeOperator] = useState<
    INode["operator"] | undefined
  >(nodeDotOperator)
  const nameInputRef = useRef<HTMLInputElement>(null)
  const valueInputRef = useRef<HTMLInputElement>(null)
  const operatorInputRef = useRef<HTMLInputElement>(null)

  const handleBlur = () => {
    setTimeout(() => {
      if (
        document.activeElement === nameInputRef.current ||
        document.activeElement === valueInputRef.current ||
        document.activeElement === operatorInputRef.current
      )
        return
        handleNodeRename(nodeName, nodeValue, nodeOperator)
    }, 100)
  }

  const handleKeyUp = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault()
      handleNodeRename(nodeName, nodeValue, nodeOperator)
    }
  }

  const handleNameChangeLocal = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNodeName(e.target.value)
  }

  const handleValueChangeLocal = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNodeValue(e.target.value !== "" ? Number(e.target.value) : undefined)
  }

  const handleOperatorChangeLocal = (value: string | null) => {
    setNodeOperator(value as INode["operator"])
  }

  return (
    <div
    className="node-input"
    style={{
      borderRadius: 3,
      backgroundColor: "#1a1b1e",
      zIndex: nodeLayer + 1,
    }}
  >
    <input
      ref={nameInputRef}
      type="text"
      placeholder="Name"
      defaultValue={nodeDotName}
      onChange={handleNameChangeLocal} // write nodeName state
      onKeyUp={handleKeyUp} // confirm name with enter
      onBlur={handleBlur}
      autoFocus={!nodeDotName || !isValueNode}
      style={{
        zIndex: nodeLayer + 1,
      }}
    />
    {["parameter", "property"].includes(nodeType) && (
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          marginTop: 8,
        }}
      >
        <Select
          ref={operatorInputRef}
          onChange={handleOperatorChangeLocal}
          onKeyUp={handleKeyUp}
          onBlur={handleBlur}
          placeholder="---"
          defaultValue={nodeDotOperator}
          data={SELECT_DATA}
          style={{
            width: "25%",
            borderRight: "none",
            zIndex: nodeLayer + 1,
            filter: "drop-shadow(1px 1px 1px #111",
          }}
        />
        <input
          ref={valueInputRef}
          type="number"
          inputMode="decimal"
          placeholder="Value"
          defaultValue={nodeDotValue}
          onChange={handleValueChangeLocal}
          onKeyUp={handleKeyUp}
          onBlur={handleBlur}
          autoFocus={!(!nodeDotName || !isValueNode)}
          style={{
            width: "calc(75% - 8px)",
            marginLeft: 8,
            zIndex: nodeLayer + 1,
          }}
        />
      </div>
    )}
  </div>
  )
}

const SELECT_DATA: { value: string, label: string}[] = [
  { value: "<", label: "<" },
  { value: "<=", label: "\u2264" },
  { value: "=", label: "=" },
  { value: "!=", label: "\u2260" },
  { value: ">=", label: "\u2265" },
  { value: ">", label: ">" },
]