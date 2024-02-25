import { Select } from "@mantine/core"
import React, { useEffect, useRef, useState } from "react"

import {
  INode,
  ValOpPair,
  Operator,
  NodeAttribute,
  NodeValOpAttribute,
  AttributeIndex,
} from "../../../types/canvas.types"
import NodeInputStr from "./NodeInputStr"
import NodeInputStrOp from "./NodeInputStrOp"
import { useAutoIncrementRefs } from "../../../common/helpers"

interface NodeInputProps {
  isValueNode: boolean
  node: INode
  handleNodeRename: (node: INode) => void
}

export default React.memo(function NodeInput(props: NodeInputProps) {
  const { isValueNode, node, handleNodeRename } = props

  const [nodeName, setNodeName] = useState<NodeAttribute>(node.name)
  const [nodeValue, setNodeValue] = useState<NodeValOpAttribute>(node.value)
  const [nodeBatchNum, setNodeBatchNum] = useState<NodeAttribute>(
    node.batch_num
  )
  const [nodeRatio, setNodeRatio] = useState<NodeValOpAttribute>(node.ratio)
  const [nodeConcentration, setNodeConcentration] =
    useState<NodeValOpAttribute>(node.concentration)
  const [nodeUnit, setNodeUnit] = useState<NodeAttribute>(node.unit)
  const [nodeStd, setNodeStd] = useState<NodeValOpAttribute>(node.std)
  const [nodeError, setNodeError] = useState<NodeValOpAttribute>(node.error)
  const [nodeIdentfier, setNodeIdentifier] = useState<NodeAttribute>(
    node.identifier
  )

  const { getNewRef, refs } = useAutoIncrementRefs()

  const handleBlur = () => {
    setTimeout(() => {
      // Check if the active element is one of the refs
      if (refs.some((ref) => document.activeElement === ref.current)) {
        return
      }
      const updatedNode: INode = {
        ...node,
        name: nodeName,
        value: nodeValue,
        batch_num: nodeBatchNum,
        ratio: nodeRatio,
        concentration: nodeConcentration,
        unit: nodeUnit,
        std: nodeStd,
        error: nodeError,
        identifier: nodeIdentfier,
      }
      handleNodeRename(updatedNode)
    }, 100)
  }

  const handleKeyUp = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault()
      const updatedNode: INode = {
        ...node,
        name: nodeName,
        value: nodeValue,
        batch_num: nodeBatchNum,
        ratio: nodeRatio,
        concentration: nodeConcentration,
        unit: nodeUnit,
        std: nodeStd,
        error: nodeError,
        identifier: nodeIdentfier,
      }
      handleNodeRename(updatedNode)
    }
  }

  const handleStrChangeLocal = (
    id: string,
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const input_value = e.target.value

    switch (id) {
      case "name":
        setNodeName({ value: input_value, index: nodeName.index })
        break
      case "batch":
        setNodeBatchNum({ value: input_value, index: nodeBatchNum.index })
        break
      case "unit":
        setNodeUnit({ value: input_value, index: nodeUnit.index })
        break
      case "identifier":
        setNodeIdentifier({ value: input_value, index: nodeIdentfier.index })
        break
      default:
        break
    }
  }

  const handleValChangeLocal = (
    id: string,
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const input_value = e.target.value

    switch (id) {
      case "value":
        setNodeValue({valOp: {value: input_value, operator: nodeValue.valOp.operator}, index: nodeValue.index})
        break
      case "ratio":
        setNodeRatio({valOp: {value: input_value, operator: nodeRatio.valOp.operator}, index: nodeRatio.index})
        break
      case "concentration":
        setNodeConcentration({valOp: {value: input_value, operator: nodeConcentration.valOp.operator}, index: nodeConcentration.index})
        break
      case "std":
        setNodeStd({valOp: {value: input_value, operator: nodeStd.valOp.operator}, index: nodeStd.index})
        break
      case "error":
        setNodeError({valOp: {value: input_value, operator: nodeError.valOp.operator}, index: nodeError.index})
        break
      default:
        break
    }
  }

  const handleOpChangeLocal = (id: string, operator: string) => {
    switch (id) {
      case "value":
        setNodeValue({valOp: {value: nodeValue.valOp.value, operator: operator}, index: nodeValue.index})
        break
      case "ratio":
        setNodeRatio({valOp: {value: nodeRatio.valOp.value, operator: operator}, index: nodeRatio.index})
        break
      case "concentration":
        setNodeConcentration({valOp: {value: nodeConcentration.valOp.value, operator: operator}, index: nodeConcentration.index})
        break
      case "std":
        setNodeStd({valOp: {value: nodeStd.valOp.value, operator: operator}, index: nodeStd.index})
        break
      case "error":
        setNodeError({valOp: {value: nodeError.valOp.value, operator: operator}, index: nodeError.index})
        break
      default:
        break
    }
  }

  const handleIndexChangeLocal = (id: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const input_value = e.target.value

    switch (id) {
      case "name":
        setNodeName({value: nodeName.value, index: input_value})
        break
      case "value":
        setNodeValue({valOp: {value: nodeValue.valOp.value, operator: nodeValue.valOp.operator}, index: input_value})
        break
      case "batch":
        setNodeBatchNum({value: nodeBatchNum.value, index: input_value})
        break
      case "ratio":
        setNodeRatio({valOp: {value: nodeRatio.valOp.value, operator: nodeRatio.valOp.operator}, index: input_value})
        break
      case "concentration":
        setNodeConcentration({valOp: {value: nodeConcentration.valOp.value, operator: nodeConcentration.valOp.operator}, index: input_value})
        break
      case "unit":
        setNodeUnit({value: nodeUnit.value, index: input_value})
        break
      case "std":
        setNodeStd({valOp: {value: nodeStd.valOp.value, operator: nodeStd.valOp.operator}, index: input_value})
        break
      case "error":
        setNodeError({valOp: {value: nodeError.valOp.value, operator: nodeError.valOp.operator}, index: input_value})
        break
      case "identfier":
        setNodeIdentifier({value: nodeIdentfier.value, index: input_value})
        break
      default:
        break
    }
  }

  /**
   *
   * Matter: Identifier, Name (str), Batch (str), Ratio (strop), Concentration (strop)
   *
   * Property/Parameter: Name (str), Value (strop), Unit (str), Std (strop), Error (strop)
   *
   * Manuf, Measure, Meta: Identifier, Name (str)
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
        handleStrChange={handleStrChangeLocal}
        handleKeyUp={handleKeyUp}
        handleBlur={handleBlur}
        getNewRef={getNewRef}
        id="name"
        defaultValue={nodeName.value}
        showIndices={node.with_indices}
        index={node.name.index}
        autoFocus={true}
        add={false}
        zIndex={node.layer + 4}
      />

      {["manufacturing", "measurement", "metadata"].includes(node.type) && (
        <NodeInputStr
          handleStrChange={handleStrChangeLocal}
          handleKeyUp={handleKeyUp}
          handleBlur={handleBlur}
          getNewRef={getNewRef}
          id="identifier"
          defaultValue={nodeIdentfier.value}
          showIndices={node.with_indices}
          index={node.identifier.index}
          autoFocus={false}
          add={true}
          zIndex={node.layer + 3}
        />
      )}

      {node.type === "matter" && (
        <>
          <NodeInputStr
            handleStrChange={handleStrChangeLocal}
            handleKeyUp={handleKeyUp}
            handleBlur={handleBlur}
            getNewRef={getNewRef}
            id="identifier"
            defaultValue={nodeIdentfier.value}
            showIndices={node.with_indices}
            index={nodeIdentfier.index}
            autoFocus={false}
            add={true}
            zIndex={node.layer + 3}
          />
          <NodeInputStr
            handleStrChange={handleStrChangeLocal}
            handleKeyUp={handleKeyUp}
            handleBlur={handleBlur}
            getNewRef={getNewRef}
            id="batch"
            defaultValue={nodeBatchNum.value}
            showIndices={node.with_indices}
            index={nodeBatchNum.index}
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
            defaultOp={nodeRatio.valOp.operator}
            defaultVal={nodeRatio.valOp.value}
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
            defaultOp={nodeConcentration.valOp.operator}
            defaultVal={nodeConcentration.valOp.value}
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
            defaultOp={nodeValue.valOp.operator}
            defaultVal={nodeValue.valOp.value}
            autoFocus={
              node.name.value !== "" &&
              isValueNode &&
              node.value.valOp.value === ""
            }
            zIndex={node.layer + 3}
          />
          <NodeInputStr
            handleStrChange={handleStrChangeLocal}
            handleKeyUp={handleKeyUp}
            handleBlur={handleBlur}
            getNewRef={getNewRef}
            id="unit"
            defaultValue={nodeUnit.value}
            showIndices={node.with_indices}
            index={nodeUnit.index}
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
            defaultOp={nodeStd.valOp.operator}
            defaultVal={nodeStd.valOp.value}
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
            defaultOp={nodeError.valOp.operator}
            defaultVal={nodeError.valOp.value}
            autoFocus={false}
            zIndex={node.layer + 1}
          />
        </>
      )}
    </div>
  )
})
