export{}
// import React, { useState } from "react";

// interface Node {
//   id: string;
//   type: "input" | "output" | "parameter";
//   label: string;
//   x: number;
//   y: number;
// }

// interface Connection {
//   source: string;
//   target: string;
// }

// interface CanvasProps {
//   nodes: Node[];
//   connections: Connection[];
//   onAddNode: (type: Node["type"]) => void;
//   onMoveNode: (id: string, x: number, y: number) => void;
//   onConnect: (source: string, target: string) => void;
// }

// const Canvas: React.FC<CanvasProps> = ({
//   nodes,
//   connections,
//   onAddNode,
//   onMoveNode,
//   onConnect,
// }) => {
//   const [selectedNode, setSelectedNode] = useState<string | null>(null);

//   const handleNodeClick = (id: string) => {
//     setSelectedNode(id);
//   };

//   const handleCanvasClick = (
//     event: React.MouseEvent<SVGSVGElement, MouseEvent>
//   ) => {
//     if (event.target === event.currentTarget) {
//       setSelectedNode(null);
//     }
//   };

//   const handleNodeDrag = (
//     event: React.MouseEvent<SVGElement, MouseEvent>,
//     id: string
//   ) => {
//     const { clientX, clientY } = event;
//     const svg = event.currentTarget.closest("svg");

//     if (svg) {
//       const svgRect = svg.getBoundingClientRect();
//       const x = clientX - svgRect.left;
//       const y = clientY - svgRect.top;

//       onMoveNode(id, x, y);
//     }
//   };

//   const handleNodeDrop = (event: React.DragEvent<SVGElement>) => {
//     event.preventDefault();
//     const nodeType = event.dataTransfer.getData("nodeType");
//     onAddNode(nodeType as Node["type"]);
//   };

//   const handleNodeDragOver = (event: React.DragEvent<SVGElement>) => {
//     event.preventDefault();
//   };

//   const handleNodeDragStart = (
//     event: React.DragEvent<SVGElement>,
//     type: Node["type"]
//   ) => {
//     event.dataTransfer.setData("nodeType", type);
//   };

//   const handleNodeConnect = (
//     event: React.MouseEvent<SVGElement>,
//     nodeId: string
//   ) => {
//     event.stopPropagation();

//     if (selectedNode && selectedNode !== nodeId) {
//       onConnect(selectedNode, nodeId);
//     }
//   };

//   return (
//     <svg
//       className="canvas"
//       onClick={handleCanvasClick}
//       onDrop={handleNodeDrop}
//       onDragOver={handleNodeDragOver}
//     >
//       {connections.map(({ source, target }) => (
//         <line
//           key={`${source}-${target}`}
//           x1={nodes.find((node) => node.id === source)?.x}
//           y1={nodes.find((node) => node.id === source)?.y}
//           x2={nodes.find((node) => node.id === target)?.x}
//           y2={nodes.find((node) => node.id === target)?.y}
//         />
//       ))}
//       {nodes.map(({ id, type, label, x, y }) => (
//         <g
//           key={id}
//           className={`node ${type}`}
//           transform={`translate(${x}, ${y})`}
//         >
//           <rect
// 						className={selectedNode === id ? 'selected' : ''}
// 						width="100"
// 						height="50"
// 						onClick={() => handleNodeClick(id)}
// 						onMouseDown={(event) => handleNodeDrag(event, id)}
// 						ref={(node) => {
// 							if (node) {
// 								node.setAttribute('draggable', 'true');
// 							}
// 						}}
// 					/>
//           <text>{label}</text>
//           {type === "input" && (
//             <circle
//               cx="0"
//               cy="25"
//               r="5"
//               onMouseUp={(event) => handleNodeConnect(event, id)}
//             />
//           )}
//           {type === "output" && (
//             <circle
//               cx="100"
//               cy="25"
//               r="5"
//               onMouseUp={(event) => handleNodeConnect(event, id)}
//             />
//           )}
//           {type === "parameter" && (
//             <circle
//               cx="50"
//               cy="0"
//               r="5"
//               onMouseUp={(event) => handleNodeConnect(event, id)}
//             />
//           )}
//         </g>
//       ))}
//       <div className="sidebar">
//         <h2>Add Nodes</h2>
//         <div
//           className="node-type"
//           draggable
//           onDragStart={(event) => handleNodeDragStart(event, "input")}
//         >
//           Input Node
//         </div>
//         <div
//           className="node-type"
//           draggable
//           onDragStart={(event) => handleNodeDragStart(event, "output")}
//         >
//           Output Node
//         </div>
//         <div
//           className="node-type"
//           draggable
//           onDragStart={(event) => handleNodeDragStart(event, "parameter")}
//         >
//           Parameter Node
//         </div>
//       </div>
//     </svg>
//   );
// };

// export default Canvas;
