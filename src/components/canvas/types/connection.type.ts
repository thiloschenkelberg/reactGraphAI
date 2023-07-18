import INode from "./node.type"

export interface IConnection {
  start: INode,
  end: INode,
  id: string
}

export interface IDConnection {
  start: string,
  end: string
}