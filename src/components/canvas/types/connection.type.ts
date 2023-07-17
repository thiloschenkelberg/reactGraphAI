import INode from "./node.type"

export interface IConnection {
  start: INode,
  end: INode
}

export interface IDConnection {
  start: number,
  end: number
}