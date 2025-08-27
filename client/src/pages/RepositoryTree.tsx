import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import TreeGraph from "../components/tree-graph/TreeGraph";
import { apiService } from "../services/api";

interface RepoTree {
  branches: string[];
  nodes: Array<{ id: string; label: string; message: string; author: string; date: string; branch: string }>;
  edges: Array<{ id: string; source: string; target: string }>;
}

const RepositoryTree: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const params = useMemo(() => new URLSearchParams(location.search), [location.search]);
  const [owner, setOwner] = useState(() => params.get("owner") || "facebook");
  const [repo, setRepo] = useState(() => params.get("repo") || "react");
  const [data, setData] = useState<RepoTree | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTree = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await apiService.get<RepoTree>(`/repos/${owner}/${repo}/tree`);
      setData(res.data);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Failed to load repo tree";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTree();
    const t = setInterval(fetchTree, 60_000);
    return () => clearInterval(t);
  }, [owner, repo]);

  useEffect(() => {
    const s = new URLSearchParams();
    s.set("owner", owner);
    s.set("repo", repo);
    navigate({ search: s.toString() }, { replace: true });
  }, [owner, repo, navigate]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-semibold text-gray-900">Repository Tree</h1>
          <div className="flex space-x-2">
            <input className="input" placeholder="owner" value={owner} onChange={(e) => setOwner(e.target.value)} />
            <input className="input" placeholder="repo" value={repo} onChange={(e) => setRepo(e.target.value)} />
            <button className="btn-primary" onClick={fetchTree}>Refresh</button>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">{error}</div>
        )}
        {loading && (
          <div className="text-gray-600 mb-4">Loading tree...</div>
        )}

        {data && <TreeGraph branches={data.branches} nodes={data.nodes} edges={data.edges} />}
      </div>
    </div>
  );
};

export default RepositoryTree;


