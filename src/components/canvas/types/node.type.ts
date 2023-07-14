export default interface INode {
  type: "matter" | "process" | "measurement" | "parameter" | "property",
  position: {x: number, y: number}
}