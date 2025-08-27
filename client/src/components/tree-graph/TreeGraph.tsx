import React, { useMemo, useState } from "react";
import ReactFlow from "reactflow";
import  Position  from "reactflow";
import  Node  from "reactflow";
import  Edge  from "reactflow";
import  NodeMouseHandler from 'reactflow';
import  NodeMouseMoveHandler  from "reactflow";
import "reactflow/dist/style.css";

export interface CommitNodeData {
  label: string;
  message: string;
  author: string;
  date: string;
  branch: string;
}

export interface RepoTreeGraphProps {
  branches: string[];
  nodes: Array<{
    id: string;
    label: string;
    message: string;
    author: string;
    date: string;
    branch: string;
  }>;
  edges: Array<{ id: string; source: string; target: string }>;
  onBranchToggle?: (branch: string) => void;
}

const branchColors = ["#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6", "#06B6D4", "#F472B6", "#22C55E"]; 

export const TreeGraph: React.FC<RepoTreeGraphProps> = ({ branches, nodes, edges }) => {
  const [selected, setSelected] = useState<CommitNodeData | null>(null);
  const [hovered, setHovered] = useState<{
    data: CommitNodeData | null;
    x: number;
    y: number;
    visible: boolean;
  }>({ data: null, x: 0, y: 0, visible: false });
  const rfNodes = useMemo<Node<CommitNodeData>[]>(() => {
    const branchToColor = new Map<string, string>();
    branches.forEach((b, i) => branchToColor.set(b, branchColors[i % branchColors.length]));

    return nodes.map((n, index) => ({
      id: n.id,
      type: "default",
      position: { x: (index % 10) * 120, y: Math.floor(index / 10) * 120 },
      data: {
        label: n.label,
        message: n.message,
        author: n.author,
        date: n.date,
        branch: n.branch,
      },
      style: {
        border: `2px solid ${branchToColor.get(n.branch) || "#64748B"}`,
        background: "#fff",
        padding: 8,
        borderRadius: 8,
        fontSize: 12,
      },
      sourcePosition: Position.Right,
      targetPosition: Position.Left,
    }));
  }, [branches, nodes]);

  const rfEdges = useMemo<Edge[]>(() => {
    return edges.map((e) => ({ id: e.id, source: e.source, target: e.target, animated: false }));
  }, [edges]);

  const onNodeClick: NodeMouseHandler = (_e: any, node: any) => {
    const data = (node as any).data as CommitNodeData;
    setSelected(data);
  };

  const onNodeMouseEnter: NodeMouseHandler = (e: { clientX: any; clientY: any; }, node: any) => {
    const data = (node as any).data as CommitNodeData;
    setHovered({ data, x: e.clientX, y: e.clientY, visible: true });
  };

  const onNodeMouseMove: NodeMouseMoveHandler = (e: { clientX: any; clientY: any; }, _node: any) => {
    setHovered((h) => ({ ...h, x: e.clientX, y: e.clientY }));
  };

  const onNodeMouseLeave: NodeMouseHandler = () => {
    setHovered((h) => ({ ...h, visible: false }));
  };

  return (
    <div style={{ width: "100%", height: "600px", position: "relative" }}>
      <ReactFlow
        nodes={rfNodes}
        edges={rfEdges}
        onNodeClick={onNodeClick}
        onNodeMouseEnter={onNodeMouseEnter}
        onNodeMouseMove={onNodeMouseMove}
        onNodeMouseLeave={onNodeMouseLeave}
        fitView
        proOptions={{ hideAttribution: true }}
      />

      {hovered.visible && hovered.data && (
        <div
          className="fixed z-50 bg-white rounded-md shadow-lg border border-gray-200 p-2 text-xs max-w-xs"
          style={{ left: hovered.x + 12, top: hovered.y + 12 }}
          onClick={() => setSelected(hovered.data)}
        >
          <div className="font-semibold mb-1">{hovered.data.label}</div>
          <div className="text-gray-600">{hovered.data.author}</div>
          <div className="text-gray-500">{new Date(hovered.data.date).toLocaleString()}</div>
          <div className="mt-1 line-clamp-3 whitespace-pre-wrap break-words">
            {hovered.data.message}
          </div>
          <div className="mt-1 text-blue-600 underline cursor-pointer">View details</div>
        </div>
      )}

      {selected && (
        <div
          className="fixed inset-0 bg-black/30 flex items-center justify-center z-50"
          onClick={() => setSelected(null)}
        >
          <div
            className="bg-white rounded-lg shadow-xl max-w-lg w-full p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between mb-2">
              <h3 className="text-lg font-semibold">Commit {selected.label}</h3>
              <button
                className="text-gray-400 hover:text-gray-600"
                onClick={() => setSelected(null)}
                aria-label="Close"
              >
                ✕
              </button>
            </div>
            <div className="space-y-2 text-sm">
              <div><span className="font-medium">Author:</span> {selected.author}</div>
              <div><span className="font-medium">Branch:</span> {selected.branch}</div>
              <div><span className="font-medium">Date:</span> {new Date(selected.date).toLocaleString()}</div>
              <div>
                <span className="font-medium">Message:</span>
                <pre className="mt-1 whitespace-pre-wrap break-words text-xs bg-gray-50 p-2 rounded">
{selected.message}
                </pre>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TreeGraph;
