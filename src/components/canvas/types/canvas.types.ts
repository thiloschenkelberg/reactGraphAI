export interface Size {
  width: number
  height: number
}

export interface Position {
  x: number
  y: number
}

export interface Vector2D {
  x: number
  y: number
}

export interface Rect {
  top: number
  right?: number
  bottom?: number
  left: number
  width: number
  height: number
}

export type Operator = "<" | "<=" | "=" | "!=" | ">=" | ">"

export interface NumOpPair {
  number?: number[]
  operator?: Operator
}

export interface ValOpPair {
  value?: string
  operator?: Operator
}

export type ParsedValOpPair = {
  value: string | string[]
  operator: Operator
}

export interface INode {
  id: string
  name: string // obligatory in json for all nodes
  value?: ValOpPair // obligatory in json for property/parameter nodes
  batch_num?: string
  ratio?: ValOpPair
  concentration?: ValOpPair
  unit?: string
  std?: ValOpPair
  error?: ValOpPair
  type: "matter" | "manufacturing" | "measurement" | "parameter" | "property" | "metadata"
  position: {x: number, y: number}
  size: number
  layer: number
  isEditing: boolean
}

export interface IConnection {
  start: INode
  end: INode
  id: string
}

export interface IDConnection {
  start: string
  end: string
}

export interface JSONNode {
  id: string
  name?: string
  value?: number
  operator?: "<" | "<=" | "=" | "!=" | ">=" | ">"
  type: "matter" | "manufacturing" | "measurement" | "parameter" | "property" | "metadata"
  relationships: Array<{
    rel_type: string
    connection: [string, string]
  }>
}

interface RelationshipJSON {
  rel_type: string;
  connection: [string, string];
}

export interface NodeJSON {
  id: string;
  type: string;
  name: string;
  relationships: RelationshipJSON[];
}

export interface ICanvasButton {
  type: "undo" | "redo" | "reset" | "layout" | "saveWorkflow"
}