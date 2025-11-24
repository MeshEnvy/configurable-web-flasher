import { useMutation, useQuery } from 'convex/react'
import { CheckCircle, Loader2, Trash2, XCircle } from 'lucide-react'
import { Link } from 'react-router-dom'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { humanizeStatus, timeAgo } from '@/lib/utils'
import { api } from '../../convex/_generated/api'
import type { Id } from '../../convex/_generated/dataModel'

interface BuildsPanelProps {
  profileId: Id<'profiles'>
}

export default function BuildsPanel({ profileId }: BuildsPanelProps) {
  const builds = useQuery(api.builds.listByProfile, { profileId })
  const deleteBuild = useMutation(api.builds.deleteBuild)

  const getStatusIcon = (status: string) => {
    if (status === 'success') {
      return <CheckCircle className="w-4 h-4 text-green-500" />
    }
    if (status === 'failure') {
      return <XCircle className="w-4 h-4 text-red-500" />
    }
    // All other statuses show as in progress
    return <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />
  }

  const getStatusColor = (status: string) => {
    if (status === 'success') {
      return 'text-green-400'
    }
    if (status === 'failure') {
      return 'text-red-400'
    }
    // All other statuses show as in progress
    return 'text-blue-400'
  }

  const handleDelete = async (buildId: Id<'builds'>) => {
    try {
      await deleteBuild({ buildId, profileId })
      toast.success('Build deleted', {
        description: 'Build record has been removed.',
      })
    } catch (error) {
      toast.error('Delete failed', {
        description: String(error),
      })
    }
  }

  if (!builds || builds.length === 0) {
    return (
      <div className="text-slate-500 text-sm py-4">
        No builds yet. Click "Build" to start.
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <h3 className="text-lg font-semibold mb-3">Build Status</h3>
      <div className="space-y-1">
        {builds.map((build) => (
          <div
            key={build._id}
            className="group flex items-center justify-between p-2 rounded-md hover:bg-slate-800/50 transition-colors border border-transparent hover:border-slate-800"
          >
            <Link
              to={`/builds/${build._id}`}
              className="flex items-center gap-3 flex-1 min-w-0"
            >
              {getStatusIcon(build.status)}
              <span className="font-medium text-sm truncate min-w-[100px]">
                {build.target}
              </span>
              <span className={`text-xs ${getStatusColor(build.status)}`}>
                {humanizeStatus(build.status)}
              </span>
              <span
                className="text-xs text-slate-500 ml-auto mr-4 whitespace-nowrap"
                title={new Date(build.startedAt).toLocaleString()}
              >
                {timeAgo(build.startedAt)}
              </span>
            </Link>

            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button
                size="icon"
                variant="ghost"
                className="h-8 w-8 text-slate-400 hover:text-red-400"
                onClick={(e) => {
                  e.preventDefault()
                  handleDelete(build._id)
                }}
                title="Delete Build"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
