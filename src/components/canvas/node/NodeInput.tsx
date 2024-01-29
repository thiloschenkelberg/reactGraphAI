import { Select } from "@mantine/core"
import { useEffect, useRef, useState } from "react"

import { INode, ValOpPair, Operator } from "../../../types/canvas.types"
import NodeInputStr from "./NodeInputStr"
import NodeInputStrOp from "./NodeInputStrOp"
import { useAutoIncrementRefs } from "../../../common/helpers"

interface NodeInputProps {
  isValueNode: boolean
  node: INode
  handleNodeRename: (
    name: string,
    value?: ValOpPair,
    batchNum?: string,
    ratio?: ValOpPair,
    concentration?: ValOpPair,
    unit?: string,
    std?: ValOpPair,
    error?: ValOpPair
  ) => void
}

export default function NodeInput(props: NodeInputProps) {
  const {
    isValueNode,
    node,
    handleNodeRename,
  } = props

  const [nodeName, setNodeName] = useState<string>(node.name)
  const [nodeValue, setNodeValue] = useState<ValOpPair | undefined>(node.value)
  const [nodeBatchNum, setNodeBatchNum] = useState<string | undefined>(node.batch_num)
  const [nodeRatio, setNodeRatio] = useState<ValOpPair | undefined>(node.ratio)
  const [nodeConcentration, setNodeConcentration] = useState<ValOpPair | undefined>(node.concentration)
  const [nodeUnit, setNodeUnit] = useState<string | undefined>(node.unit)
  const [nodeStd, setNodeStd] = useState<ValOpPair | undefined>(node.std)
  const [nodeError, setNodeError] = useState<ValOpPair | undefined>(node.error)

  const { getNewRef, refs } = useAutoIncrementRefs()

  const handleBlur = () => {
    setTimeout(() => {
      // Check if the active element is one of the refs
      if (refs.some(ref => document.activeElement === ref.current)) {
        return;
      }
      handleNodeRename(
        nodeName,
        nodeValue,
        nodeBatchNum,
        nodeRatio,
        nodeConcentration,
        nodeUnit,
        nodeStd,
        nodeError
      );
    }, 100);
  };
  
  

  const handleKeyUp = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault()
      handleNodeRename(
        nodeName,
        nodeValue,
        nodeBatchNum,
        nodeRatio,
        nodeConcentration,
        nodeUnit,
        nodeStd,
        nodeError
      )
    }
  }

  const handleStrChangeLocal = (
    id: string,
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = e.target.value

    switch (id) {
      case "name":
        setNodeName(value)
        break
      case "batch":
        setNodeBatchNum(value)
        break
      case "unit":
        setNodeUnit(value)
        break
      default:
        break
    }
  }

  const handleValChangeLocal = (
    id: string,
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = e.target.value

    switch (id) {
      case "value":
        const valOp = nodeValue?.operator
        setNodeValue({ value: value, operator: valOp as Operator })
        break
      case "ratio":
        const ratOp = nodeRatio?.operator
        setNodeRatio({ value: value, operator: ratOp as Operator })
        break
      case "concentration":
        const conOp = nodeConcentration?.operator
        setNodeConcentration({ value: value, operator: conOp as Operator })
        break
      case "std":
        const stdOp = nodeStd?.operator
        setNodeStd({ value: value, operator: stdOp as Operator })
        break
      case "error":
        const errOp = nodeError?.operator
        setNodeError({ value: value, operator: errOp as Operator })
        break
      default:
        break
    }
  }

  const handleOpChangeLocal = (id: string, operator: string | null) => {
    switch (id) {
      case "value":
        const val = nodeValue?.value
        setNodeValue({ value: val, operator: operator as Operator })
        break
      case "ratio":
        const rat = nodeRatio?.value
        setNodeRatio({ value: rat, operator: operator as Operator })
        break
      case "concentration":
        const con = nodeConcentration?.value
        setNodeConcentration({ value: con, operator: operator as Operator })
        break
      case "std":
        const std = nodeStd?.value
        setNodeStd({ value: std, operator: operator as Operator })
        break
      case "error":
        const err = nodeError?.value
        setNodeError({ value: err, operator: operator as Operator })
        break
      default:
        break
    }
  }

  /**
   *
   * Matter: Id, Name (str), Batch (str), Ratio (strop), Concentration (strop)
   *
   * Property/Parameter: Id, Name (str), Value (strop), Unit (str), Std (strop), Error (strop)
   *
   * Manuf, Measure, Meta: Id, Name (str)
   *
   */

  return (
    <div
      className="node-input"
      onClick={(e) => e.stopPropagation()}
      onMouseUp={(e) => e.stopPropagation()}
      style={{
        display: "flex",
        flexDirection: "column",
        borderRadius: 3,
        backgroundColor: "#1a1b1e",
        zIndex: node.layer + 1,
      }}
    >
      <NodeInputStr
        handleChange={handleStrChangeLocal}
        handleKeyUp={handleKeyUp}
        handleBlur={handleBlur}
        id="name"
        reference={getNewRef()}
        defaultValue={nodeName}
        autoFocus={true}
        add={false}
        zIndex={node.layer + 4}
      />

      {node.type === "matter" && (
        <>
          <NodeInputStr
            handleChange={handleStrChangeLocal}
            handleKeyUp={handleKeyUp}
            handleBlur={handleBlur}
            id="batch"
            reference={getNewRef()}
            defaultValue={nodeBatchNum}
            autoFocus={false}
            add={true}
            zIndex={node.layer + 3}
          />
          <NodeInputStrOp
            handleOpChange={handleOpChangeLocal}
            handleValChange={handleValChangeLocal}
            handleKeyUp={handleKeyUp}
            handleBlur={handleBlur}
            id="ratio"
            opReference={getNewRef()}
            valReference={getNewRef()}
            defaultOp={nodeRatio?.operator}
            defaultVal={nodeRatio?.value}
            autoFocus={false}
            zIndex={node.layer + 2}
          />
          <NodeInputStrOp
            handleOpChange={handleOpChangeLocal}
            handleValChange={handleValChangeLocal}
            handleKeyUp={handleKeyUp}
            handleBlur={handleBlur}
            id="concentration"
            opReference={getNewRef()}
            valReference={getNewRef()}
            defaultOp={nodeConcentration?.operator}
            defaultVal={nodeConcentration?.value}
            autoFocus={false}
            zIndex={node.layer + 1}
          />
        </>
      )}

      {["parameter", "property"].includes(node.type) && (
        <>
          <NodeInputStrOp
            handleOpChange={handleOpChangeLocal}
            handleValChange={handleValChangeLocal}
            handleKeyUp={handleKeyUp}
            handleBlur={handleBlur}
            id="value"
            opReference={getNewRef()}
            valReference={getNewRef()}
            defaultOp={nodeValue?.operator}
            defaultVal={nodeValue?.value}
            autoFocus={!(!node.name || !isValueNode || node.value?.value)}
            zIndex={node.layer + 3}
          />
          <NodeInputStr
            handleChange={handleStrChangeLocal}
            handleKeyUp={handleKeyUp}
            handleBlur={handleBlur}
            id="unit"
            reference={getNewRef()}
            defaultValue={nodeUnit}
            autoFocus={false}
            add={true}
            zIndex={node.layer + 2}
          />
          <NodeInputStrOp
            handleOpChange={handleOpChangeLocal}
            handleValChange={handleValChangeLocal}
            handleKeyUp={handleKeyUp}
            handleBlur={handleBlur}
            id="std"
            opReference={getNewRef()}
            valReference={getNewRef()}
            defaultOp={nodeStd?.operator}
            defaultVal={nodeStd?.value}
            autoFocus={false}
            zIndex={node.layer + 2}
          />
          <NodeInputStrOp
            handleOpChange={handleOpChangeLocal}
            handleValChange={handleValChangeLocal}
            handleKeyUp={handleKeyUp}
            handleBlur={handleBlur}
            id="error"
            opReference={getNewRef()}
            valReference={getNewRef()}
            defaultOp={nodeError?.operator}
            defaultVal={nodeError?.value}
            autoFocus={false}
            zIndex={node.layer + 1}
          />
        </>
      )}
    </div>
  )
}
