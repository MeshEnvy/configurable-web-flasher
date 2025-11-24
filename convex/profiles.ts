import { getAuthUserId } from '@convex-dev/auth/server'
import { v } from 'convex/values'
import { mutation, query } from './_generated/server'

export const list = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx)
    if (!userId) return []

    return await ctx.db
      .query('profiles')
      .withIndex('by_user', (q) => q.eq('userId', userId))
      .collect()
  },
})

export const create = mutation({
  args: {
    name: v.string(),
    targets: v.array(v.string()),
    config: v.any(),
    version: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx)
    if (!userId) throw new Error('Unauthorized')

    return await ctx.db.insert('profiles', {
      userId,
      name: args.name,
      targets: args.targets,
      config: args.config,
      version: args.version,
      updatedAt: Date.now(),
    })
  },
})

export const update = mutation({
  args: {
    id: v.id('profiles'),
    name: v.string(),
    targets: v.array(v.string()),
    config: v.any(),
    version: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx)
    if (!userId) throw new Error('Unauthorized')

    const profile = await ctx.db.get(args.id)
    if (!profile || profile.userId !== userId) {
      throw new Error('Unauthorized')
    }

    // Get new targets for comparison
    const newTargets = new Set(args.targets)

    // Update profile
    await ctx.db.patch(args.id, {
      name: args.name,
      targets: args.targets,
      config: args.config,
      version: args.version,
      updatedAt: Date.now(),
    })

    // Sync profileBuilds: delete profileBuilds for targets that are no longer in the list
    const profileBuilds = await ctx.db
      .query('profileBuilds')
      .withIndex('by_profile', (q) => q.eq('profileId', args.id))
      .collect()

    for (const profileBuild of profileBuilds) {
      if (!newTargets.has(profileBuild.target)) {
        // Target was removed, delete the profileBuild
        await ctx.db.delete(profileBuild._id)
      }
    }

    // Note: We don't create profileBuilds for new targets here.
    // User must trigger a build to create profileBuilds for new targets.
  },
})

export const remove = mutation({
  args: { id: v.id('profiles') },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx)
    if (!userId) throw new Error('Unauthorized')

    const profile = await ctx.db.get(args.id)
    if (!profile || profile.userId !== userId) {
      throw new Error('Unauthorized')
    }

    await ctx.db.delete(args.id)
  },
})
