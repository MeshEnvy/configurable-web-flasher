import { httpRouter } from 'convex/server'
import { internal } from './_generated/api'
import { httpAction } from './_generated/server'
import { auth } from './auth'

const http = httpRouter()

auth.addHttpRoutes(http)

http.route({
  path: '/github-webhook',
  method: 'POST',
  handler: httpAction(async (ctx, request) => {
    const payload = await request.json()

    // Verify signature (TODO: Add HMAC verification)

    // Validate build_id and state are present
    if (!payload.build_id || !payload.state) {
      return new Response('Missing build_id or state', { status: 400 })
    }

    // Verify build exists
    const build = await ctx.runMutation(internal.builds.getInternal, {
      buildId: payload.build_id,
    })

    if (!build) {
      return new Response('Build not found', { status: 404 })
    }

    const githubRunId = payload.github_run_id
      ? Number(payload.github_run_id)
      : undefined

    await ctx.runMutation(internal.builds.updateBuildStatus, {
      buildId: payload.build_id,
      status: payload.state,
      artifactPath: payload.artifactPath,
      githubRunId,
    })

    return new Response(null, { status: 200 })
  }),
})

export default http
