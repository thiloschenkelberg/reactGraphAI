import { PiAddressBookDuotone } from "react-icons/pi"
import {
  INode,
  IConnection,
  JSONNode,
  IDConnection,
} from "../components/canvas/types/canvas.types"
import toast from "react-hot-toast"
import client from "../client"
import { v4 as uuidv4 } from "uuid"
import React, { useRef } from "react"

const connectionToRelType: Record<string, string> = {
  "matter-manufacturing": "IS_MANUFACTURING_INPUT",
  "manufacturing-matter": "IS_MANUFACTURING_OUTPUT",
  "matter-measurement": "IS_MEASUREMENT_INPUT",
  "matter-property": "HAS_PROPERTY",
  "manufacturing-parameter": "HAS_PARAMETER",
  "measurement-property": "IS_MEASUREMENT_OUTPUT",
  "manufacturing-metadata": "HAS_METADATA",
  "measurement-metadata": "HAS_METADATA",
}

/**
 * Map a node type from the application's internal format to the desired output format.
 *
 * @param type Node type from the application
 * @returns Corresponding node type for the JSON structure
 */
function mapNodeType(type: string): string {
  switch (type) {
    case "matter":
      return "EMMOMatter"
    case "manufacturing":
      return "EMMOProcess"
    case "measurement":
      return "EMMOProcess"
    case "parameter":
      return "EMMOQuantity"
    case "property":
      return "EMMOQuantity"
    case "metadata":
      return "EMMOData"
    default:
      return "UnknownType"
  }
}

/**
 * Determines the relationship type based on the start and end node types.
 *
 * @param startType Starting node's type
 * @param endType Ending node's type
 * @returns Corresponding relationship type for the connection
 */
function determineRelationshipType(startType: string, endType: string): string {
  return (
    connectionToRelType[`${startType}-${endType}`] || "UNKNOWN_RELATIONSHIP"
  )
}

/**
 * Gets a list of possible end types for a given start type.
 *
 * @param startType Starting node's type
 * @returns Array of possible end node types for the given start type
 */
export function possibleConnections(startType: string | undefined): string[] {
  if (!startType)
    return ["matter", "manufacturing", "parameter", "property", "measurement", "metadata"]

  // Filter the keys to find matches and extract the endType
  return Object.keys(connectionToRelType)
    .filter((key) => key.startsWith(`${startType}-`))
    .map((key) => key.split("-")[1])
}

/**
 * Checks if a given node type can connect to another node.
 *
 * @param nodeType Type of the node
 * @returns true if the node can connect to another node, false otherwise
 */
export function isConnectableNode(nodeType: string | undefined): boolean {
  if (!nodeType) return false

  // Check if there's a key that starts with the given nodeType followed by a '-'
  return Object.keys(connectionToRelType).some((key) =>
    key.startsWith(`${nodeType}-`)
  )
}

// export function convertToJSONFormat(
//   nodes: INode[],
//   connections: IConnection[],
//   preventMapTypes?: boolean,
// ): string {
//   // Convert connections into a map for easier lookup, and include the entire connection
//   const connectionMap = connections.reduce((acc, connection) => {
//     // Capture relationships where the node is the start point
//     if (!acc[connection.start.id]) {
//       acc[connection.start.id] = []
//     }
//     acc[connection.start.id].push(connection)

//     // Capture relationships where the node is the end point
//     if (!acc[connection.end.id]) {
//       acc[connection.end.id] = []
//     }
//     acc[connection.end.id].push(connection)

//     return acc
//   }, {} as Record<string, IConnection[]>)

//   return JSON.stringify(
//     nodes.map((node) => {
//       const relationships = (connectionMap[node.id] || []).map(
//         (connection) => ({
//           rel_type: determineRelationshipType(
//             connection.start.type,
//             connection.end.type
//           ),
//           connection: [connection.start.id, connection.end.id] as [
//             string,
//             string
//           ],
//         })
//       )
//       return {
//         id: node.id,
//         name: node.name || "",
//         value: node.value || "",
//         type: preventMapTypes ? node.type : mapNodeType(node.type),
//         relationships,
//       }
//     }),
//     null,
//     2
//   )
// }

// function convertFromJSONFormat(workflow: string) {
//   const data: JSONNode[] = JSON.parse(workflow)
//   const nodes: INode[] = []
//   const connectionsMap: Map<string, IDConnection> = new Map()

//   data.forEach((item) => {
//     nodes.push({
//       id: item.id,
//       name: item.name,
//       value: item.value,
//       operator: item.operator,
//       type: item.type,
//       // Assuming position, size, layer, isEditing are required, set to default values
//       position: { x: 0, y: 0 },
//       size: 100,
//       layer: 0,
//       isEditing: false,
//     })

//     // Reconstruct connections
//     item.relationships.forEach((rel) => {
//       // Create a unique key to prevent duplicate connections
//       const connectionKey = [rel.connection[0], rel.connection[1]]
//         .sort()
//         .join("_")

//       if (!connectionsMap.has(connectionKey)) {
//         connectionsMap.set(connectionKey, {
//           start: rel.connection[0], // Only ID is used here
//           end: rel.connection[1], // Only ID is used here
//         })
//       }
//     })
//   })

//   const connections: IConnection[] = Array.from(
//     connectionsMap.values()
//   ).flatMap((con) => {
//     const startNode = nodes.find((n) => n.id === con.start)
//     const endNode = nodes.find((n) => n.id === con.end)

//     if (!startNode || !endNode) {
//       return []
//     }

//     return [
//       {
//         start: startNode,
//         end: endNode,
//         id: uuidv4().replaceAll("-", ""),
//       },
//     ]
//   })

//   return {
//     nodes,
//     connections,
//   }
// }

/**
 * Determine if a connection between two nodes is allowed.
 *
 * @param start Starting node
 * @param end Ending node
 * @returns true if the connection is legitimate, false otherwise
 */
export function isConnectionLegitimate(start: INode, end: INode): boolean {
  const allowedConnections: Array<[string, string]> = [
    ["matter", "manufacturing"], // IS_MANUFACTURING_INPUT
    ["manufacturing", "matter"], // IS_MANUFACTURING_OUTPUT
    ["matter", "measurement"], // IS_MEASUREMENT_INPUT
    ["matter", "property"], // HAS_PROPERTY
    ["manufacturing", "parameter"], // HAS_PARAMETER
    ["measurement", "property"], // IS_MEASUREMENT_OUTPUT
    ["manufacturing", "metadata"], // HAS_METADATA
    ["measurement", "metadata"], // HAS_METADATA
  ]

  // Check if the [start.type, end.type] tuple exists in the allowed connections array
  return allowedConnections.some(
    (connection) => connection[0] === start.type && connection[1] === end.type
  )
}

// export function saveWorkflow(nodes: INode[], connections: IConnection[]) {
//   const workflow = convertToJSONFormat(nodes, connections, true)
//   saveToHistory(workflow)
//   // saveToFile(workflow, "json", "workflow.json")
// }

export async function saveToHistory(workflow: string) {
  // create timestamp
  // save to history -> backend (workflow + timestamp)
  try {
    const response = await client.saveWorkflow(workflow)

    if (response) {
      toast.success(response.data.message)
    }
  } catch (err: any) {
    toast.error(err.message)
  }
}

export function saveToFile(
  data: string,
  type: "json" | "csv",
  filename: string
) {
  // Convert the data to a JSON string
  //const jsonString = JSON.stringify(data, null, 2);  // 2 spaces for indentation

  // Create a blob with the JSON string
  const blob = new Blob([data], { type: `application/${type}` })

  // Create a URL for the blobn
  const url = URL.createObjectURL(blob)

  // Create an anchor element and set its href to the blob's URL
  const a = document.createElement("a")
  a.href = url
  a.download = filename

  // Simulate a click on the anchor element
  document.body.appendChild(a)
  a.click()

  // Clean up by removing the anchor element and revoking the blob URL
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

export function saveBlobAsFile(blob: Blob, filename: string) {
  if (!(blob instanceof Blob)) {
    console.error("Provided data is not a Blob")
    return
  }
  const url = window.URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = filename
  a.click()
  window.URL.revokeObjectURL(url)
}

export function fileToDataUri(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (event) => {
      resolve(event.target?.result as string)
    }
    reader.onerror = (err) => {
      reject(err)
    }
    reader.readAsDataURL(file)
  })
}

export function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max)
}

export function useAutoIncrementRefs() {
  const refs = useRef<React.RefObject<HTMLInputElement>[]>([])
  const getNewRef = () => {
    const newRef = React.createRef<HTMLInputElement>()
    refs.current.push(newRef)
    return newRef
  }

  return { getNewRef, refs: refs.current }
}