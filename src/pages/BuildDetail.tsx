import { useQuery } from "convex/react";
import {
  ArrowLeft,
  CheckCircle,
  Download,
  Loader2,
  XCircle,
} from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { humanizeStatus } from "@/lib/utils";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";

export default function BuildDetail() {
  const { buildId } = useParams<{ buildId: string }>();
  const build = useQuery(api.builds.get, {
    buildId: buildId as Id<"builds">,
  });

  if (build === undefined) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-950 text-white">
        <Loader2 className="w-8 h-8 animate-spin text-cyan-500" />
      </div>
    );
  }

  if (build === null) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-950 text-white gap-4">
        <h1 className="text-2xl font-bold">Build Not Found</h1>
        <Link to="/">
          <Button variant="outline">Return to Dashboard</Button>
        </Link>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    if (status === "success") {
      return "text-green-400";
    }
    if (status === "failure") {
      return "text-red-400";
    }
    // All other statuses show as in progress
    return "text-blue-400";
  };

  const getStatusIcon = (status: string) => {
    if (status === "success") {
      return <CheckCircle className="w-6 h-6 text-green-500" />;
    }
    if (status === "failure") {
      return <XCircle className="w-6 h-6 text-red-500" />;
    }
    // All other statuses show as in progress
    return <Loader2 className="w-6 h-6 text-blue-500 animate-spin" />;
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <header className="mb-8">
          <Link
            to="/"
            className="inline-flex items-center text-slate-400 hover:text-white mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Dashboard
          </Link>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {getStatusIcon(build.status)}
              <div>
                <h1 className="text-3xl font-bold">{build.target}</h1>
                <div className="flex items-center gap-2 text-slate-400 mt-1">
                  <span>Build ID: {build._id}</span>
                  <span>•</span>
                  <span className={getStatusColor(build.status)}>
                    {humanizeStatus(build.status)}
                  </span>
                  <span>•</span>
                  <span>{new Date(build.startedAt).toLocaleString()}</span>
                </div>
              </div>
            </div>

            {build.status === "success" && build.artifactUrl && (
              <a
                href={build.artifactUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button className="bg-cyan-600 hover:bg-cyan-700">
                  <Download className="w-4 h-4 mr-2" /> Download Firmware
                </Button>
              </a>
            )}
          </div>
        </header>
      </div>
    </div>
  );
}
