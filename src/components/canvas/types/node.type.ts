export default interface INode {
  id: number,
  name: string | null,
  type: "matter" | "process" | "measurement" | "parameter" | "property",
  position: {x: number, y: number},
  isEditing: boolean
}