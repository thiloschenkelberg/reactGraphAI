import { Operator } from "./canvas.types"

export type ParsedValOpPair = {
  value: string | string[]
  operator: Operator
}

export interface IWorkflow {
  workflow: string
  timestamp: Date
}

export interface ITempNode {
  id: string
  attributes: { [key: string]: any }
  type: "matter" | "manufacturing" | "measurement" | "parameter" | "property" | "metadata"
  relationships: Array<{
    rel_type: string
    connection: [string, string]
  }>
}