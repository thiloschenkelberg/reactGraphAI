import { Select } from "@mantine/core"
import { useEffect, useRef, useState } from "react"

import { INode, StrOpPair, Operator } from "../types/canvas.types"
import NodeInputStr from "./NodeInputStr"
import NodeInputStrOp from "./NodeInputStrOp"
import { useAutoIncrementRefs } from "../../../common/helpers"

interface NodeInputProps {
  isValueNode: boolean
  node: INode
  handleNodeRename: (
    name: string,
    value?: StrOpPair,
    batchNum?: string,
    ratio?: StrOpPair,
    concentration?: StrOpPair,
    unit?: string,
    std?: StrOpPair,
    error?: StrOpPair
  ) => void
}

export default function NodeInput(props: NodeInputProps) {
  const {
    isValueNode,
    node,
    handleNodeRename,
  } = props

  const [nodeName, setNodeName] = useState<string>(node.name)
  const [nodeValue, setNodeValue] = useState<StrOpPair | undefined>(node.value)
  const [nodeBatchNum, setNodeBatchNum] = useState<string | undefined>(node.batch_num)
  const [nodeRatio, setNodeRatio] = useState<StrOpPair | undefined>(node.ratio)
  const [nodeConcentration, setNodeConcentration] = useState<StrOpPair | undefined>(node.concentration)
  const [nodeUnit, setNodeUnit] = useState<string | undefined>(node.unit)
  const [nodeStd, setNodeStd] = useState<StrOpPair | undefined>(node.std)
  const [nodeError, setNodeError] = useState<StrOpPair | undefined>(node.error)

  const nameInputRef = useRef<HTMLInputElement>(null)
  const valueInputRef = useRef<HTMLInputElement>(null)
  const operatorInputRef = useRef<HTMLInputElement>(null)
  const batchInputRef = useRef<HTMLInputElement>(null)
  const ratioInputRef = useRef<HTMLInputElement>(null)
  const concentrationInputRef = useRef<HTMLInputElement>(null)
  const unitInputRef = useRef<HTMLInputElement>(null)
  const stdInputRef = useRef<HTMLInputElement>(null)
  const errorInputRef = useRef<HTMLInputElement>(null)

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
      console.log(nodeRatio)
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
        setNodeValue({ string: value, operator: valOp as Operator })
        break
      case "ratio":
        const ratOp = nodeRatio?.operator
        setNodeRatio({ string: value, operator: ratOp as Operator })
        break
      case "concentration":
        const conOp = nodeConcentration?.operator
        setNodeConcentration({ string: value, operator: conOp as Operator })
        break
      case "std":
        const stdOp = nodeStd?.operator
        setNodeStd({ string: value, operator: stdOp as Operator })
        break
      case "error":
        const errOp = nodeError?.operator
        setNodeError({ string: value, operator: errOp as Operator })
        break
      default:
        break
    }
  }

  const handleOpChangeLocal = (id: string, operator: string | null) => {
    switch (id) {
      case "value":
        const val = nodeValue?.string
        setNodeValue({ string: val, operator: operator as Operator })
        break
      case "ratio":
        const rat = nodeRatio?.string
        setNodeRatio({ string: rat, operator: operator as Operator })
        break
      case "concentration":
        const con = nodeConcentration?.string
        setNodeConcentration({ string: con, operator: operator as Operator })
        break
      case "std":
        const std = nodeStd?.string
        setNodeStd({ string: std, operator: operator as Operator })
        break
      case "error":
        const err = nodeError?.string
        setNodeError({ string: err, operator: operator as Operator })
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
        autoFocus={!node.name || !isValueNode}
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
            defaultVal={nodeRatio?.string}
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
            defaultOp={nodeRatio?.operator}
            defaultVal={nodeRatio?.string}
            autoFocus={false}
            zIndex={node.layer + 1}
          />
        </>
      )}

      {["parameter", "property"].includes(node.type) && (
        <NodeInputStrOp
          handleOpChange={handleOpChangeLocal}
          handleValChange={handleValChangeLocal}
          handleKeyUp={handleKeyUp}
          handleBlur={handleBlur}
          id="value"
          opReference={getNewRef()}
          valReference={getNewRef()}
          defaultOp={nodeValue?.operator}
          defaultVal={nodeValue?.string}
          autoFocus={!(!node.name || !isValueNode)}
          zIndex={node.layer + 1}
        />
      )}
    </div>
  )
}
