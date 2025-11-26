import { useMutation, useQuery } from 'convex/react'
import { pick } from 'convex-helpers'
import { ArrowLeft, CheckCircle, Loader2, XCircle } from 'lucide-react'
import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { humanizeStatus } from '@/lib/utils'
import { api } from '../../convex/_generated/api'
import { type BuildFields, buildFields } from '../../convex/schema'
import { TARGETS } from '../constants/targets'

export default function BuildProgress() {
  const { buildHash } = useParams<{ buildHash: string }>()
  const build = useQuery(
    api.builds.getByHash,
    buildHash ? { buildHash } : 'skip'
  )
  const generateDownloadUrl = useMutation(
    api.builds.generateAnonymousDownloadUrl
  )
  const generateSourceDownloadUrl = useMutation(
    api.builds.generateAnonymousSourceDownloadUrl
  )
  const [downloadError, setDownloadError] = useState<string | null>(null)
  const [sourceDownloadError, setSourceDownloadError] = useState<string | null>(
    null
  )

  if (!buildHash) {
    return (
      <div className="min-h-screen bg-slate-950 text-white p-8">
        <div className="max-w-4xl mx-auto">
          <p className="text-slate-300">
            Build hash missing.{' '}
            <Link to="/builds/new" className="text-cyan-400">
              Start a new build
            </Link>
            .
          </p>
        </div>
      </div>
    )
  }

  if (build === undefined) {
    return (
      <div className="min-h-screen bg-slate-950 text-white p-8 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-cyan-500" />
      </div>
    )
  }

  if (!build) {
    return (
      <div className="min-h-screen bg-slate-950 text-white p-8">
        <div className="max-w-4xl mx-auto space-y-4">
          <Link
            to="/builds/new"
            className="inline-flex items-center text-slate-400 hover:text-white"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Quick Build
          </Link>
          <div className="bg-slate-900/60 border border-slate-800 rounded-lg p-6">
            <p className="text-slate-300">
              No build found for hash{' '}
              <span className="font-mono">{buildHash}</span>
            </p>
          </div>
        </div>
      </div>
    )
  }

  const targetMeta = build.config.target
    ? TARGETS[build.config.target]
    : undefined
  const targetLabel = targetMeta?.name ?? build.config.target
  const status = build.status || 'queued'

  const handleDownload = async () => {
    setDownloadError(null)
    try {
      const url = await generateDownloadUrl({
        build: pick(build, Object.keys(buildFields) as (keyof BuildFields)[]),
        slug: `quick-build`,
      })
      window.location.href = url
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      setDownloadError('Failed to generate download link.')
      console.error('Download error', message)
    }
  }

  const handleSourceDownload = async () => {
    setSourceDownloadError(null)
    try {
      const url = await generateSourceDownloadUrl({
        build: pick(build, Object.keys(buildFields) as (keyof BuildFields)[]),
        slug: `quick-build`,
      })
      window.location.href = url
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      setSourceDownloadError('Failed to generate source download link.')
      console.error('Source download error', message)
    }
  }

  const getStatusIcon = () => {
    if (status === 'success') {
      return <CheckCircle className="w-6 h-6 text-green-500" />
    }
    if (status === 'failure') {
      return <XCircle className="w-6 h-6 text-red-500" />
    }
    return <Loader2 className="w-6 h-6 text-blue-500 animate-spin" />
  }

  const getStatusColor = () => {
    if (status === 'success') return 'text-green-400'
    if (status === 'failure') return 'text-red-400'
    return 'text-blue-400'
  }

  const githubActionUrl =
    build.githubRunId && build.githubRunId > 0
      ? `https://github.com/MeshEnvy/configurable-web-flasher/actions/runs/${build.githubRunId}`
      : null

  return (
    <div className="min-h-screen bg-slate-950 text-white p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <Link
            to="/builds/new"
            className="inline-flex items-center text-slate-400 hover:text-white"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Quick Build
          </Link>
          <p className="text-sm text-slate-500 font-mono break-all">
            Hash: {build.buildHash}
          </p>
        </div>

        <div className="bg-slate-900/60 rounded-lg border border-slate-800 p-6 space-y-4">
          <div className="flex items-center gap-4">
            {getStatusIcon()}
            <div>
              <p className="text-sm uppercase tracking-wide text-slate-500">
                Target
              </p>
              <h2 className="text-2xl font-semibold">{targetLabel}</h2>
              <div className="flex items-center gap-2 text-slate-400 mt-1 text-sm">
                <span className={getStatusColor()}>
                  {humanizeStatus(status)}
                </span>
                <span>•</span>
                <span>{new Date(build.updatedAt).toLocaleString()}</span>
                {githubActionUrl && (
                  <>
                    <span>•</span>
                    <a
                      href={githubActionUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-slate-500 hover:text-slate-300"
                    >
                      View run
                    </a>
                  </>
                )}
              </div>
            </div>
          </div>

          {status !== 'success' && status !== 'failure' && (
            <div className="rounded-lg border border-slate-800/70 bg-slate-950/60 p-4">
              <p className="text-sm text-slate-400">
                Builds run in GitHub Actions. When the status is
                <span className="text-green-400 font-medium"> success</span>,
                your firmware artifact will be ready to download.
              </p>
            </div>
          )}

          {status === 'success' && build.artifactPath && (
            <div className="space-y-2">
              <Button
                onClick={handleDownload}
                className="w-full bg-cyan-600 hover:bg-cyan-700"
              >
                Download firmware
              </Button>
              {downloadError && (
                <p className="text-sm text-red-400">{downloadError}</p>
              )}
              <Button
                onClick={handleSourceDownload}
                className="w-full bg-slate-700 hover:bg-slate-600"
                variant="outline"
              >
                Download source
              </Button>
              {sourceDownloadError && (
                <p className="text-sm text-red-400">{sourceDownloadError}</p>
              )}
            </div>
          )}

          {status === 'failure' && (
            <div className="rounded-lg border border-red-500/40 bg-red-500/10 p-4 text-sm text-red-100">
              <p className="font-medium text-red-200">
                Build failed. Please try tweaking your configuration or
                re-running the build.
              </p>
            </div>
          )}

          {status !== 'success' && status !== 'failure' && (
            <div className="rounded-lg border border-blue-500/30 bg-blue-500/5 p-4 text-sm text-blue-100">
              <p className="font-medium text-blue-200">
                This build is still running. Leave this tab open or come back
                later using the URL above.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
