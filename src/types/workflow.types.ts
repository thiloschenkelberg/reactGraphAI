import { Operator, Position } from "./canvas.types"

export interface IWorkflow {
  _id: string
  workflow: string
  timestamp: Date
}

export interface ITempNode {
  id: string
  attributes: { [key: string]: any }
  label: "matter" | "manufacturing" | "measurement" | "parameter" | "property" | "metadata"
  relationships: Array<{
    rel_type: string
    connection: [string, string]
  }>
}

export interface IGraphData {
  nodes: IGraphNode[]
  relationships: IRelationship[]
}

export interface IGraphNode {
  id: string
  label: "matter" | "manufacturing" | "measurement" | "parameter" | "property" | "metadata"
  name: any
  attributes: { [key: string]: ParsableAttributes }
}

export interface IRelationship {
  rel_type: string
  connection: [string, string]
}

export interface IDictionary {
  [key: string]: {[key: string]: string}
}

export type ExtractedAttribute = {
  value: string
  index: number | string
}

export type CustomAttribute = {
  value: string | string[]
  operator?: Operator
}

export type ParsableAttributes = 
  ExtractedAttribute |
  ExtractedAttribute[] |
  CustomAttribute

export type CsvTableRow = {
  [key: string]: string | number | boolean
}
