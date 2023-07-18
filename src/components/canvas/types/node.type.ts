export default interface INode {
  id: string,
  name: string | null,
  type: "matter" | "process" | "measurement" | "parameter" | "property",
  position: {x: number, y: number},
  layer: number,
  isEditing: boolean
}