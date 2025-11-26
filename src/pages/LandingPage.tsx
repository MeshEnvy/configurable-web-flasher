import { useAuthActions } from '@convex-dev/auth/react'
import { Authenticated, Unauthenticated, useQuery } from 'convex/react'
import { useNavigate } from 'react-router-dom'
import {
  ProfileCardContent,
  profileCardClasses,
} from '@/components/ProfileCard'
import { Button } from '@/components/ui/button'
import { api } from '../../convex/_generated/api'

function QuickBuildIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      role="img"
      aria-label="Quick build"
      {...props}
    >
      <title>Quick build</title>
      <path fill="currentColor" d="M11 15H6l7-14v8h5l-7 14z" />
    </svg>
  )
}

export default function LandingPage() {
  const navigate = useNavigate()
  const { signIn } = useAuthActions()
  const profiles = useQuery(api.profiles.listPublic)

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="max-w-7xl mx-auto">
        <div className="text-center py-20 px-8">
          <h1 className="text-6xl md:text-7xl font-bold mb-6 leading-[1.1]">
            <span className="bg-gradient-to-r from-cyan-400 to-blue-600 bg-clip-text text-transparent inline-block pb-2">
              Build firmware right from your bench
            </span>
          </h1>
          <p className="text-xl md:text-2xl text-slate-400 max-w-2xl mx-auto mb-10">
            Craft custom Meshtastic firmware in the cloud, flash from your
            browser, and share your builds with the community.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 mb-10">
            <Button
              onClick={() => navigate('/builds/new')}
              size="lg"
              variant="outline"
              className="border-cyan-500/50 text-white hover:bg-slate-900/60"
            >
              <QuickBuildIcon className="mr-2 h-5 w-5" />
              Quick Build
            </Button>
            <Authenticated>
              <Button
                onClick={() => navigate('/dashboard')}
                size="lg"
                className="bg-white text-slate-900 hover:bg-slate-200"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  className="w-8 h-8"
                  aria-label="Dashboard icon"
                >
                  <title>Dashboard icon</title>
                  <path
                    fill="currentColor"
                    fillRule="evenodd"
                    d="M14.748 0a1.75 1.75 0 0 0-1.75 1.75v4.5c0 .966.784 1.75 1.75 1.75h7.5a1.75 1.75 0 0 0 1.75-1.75v-4.5A1.75 1.75 0 0 0 22.248 0zm0 10a1.75 1.75 0 0 0-1.75 1.75v10.5c0 .967.784 1.75 1.75 1.75h7.5a1.75 1.75 0 0 0 1.75-1.75v-10.5a1.75 1.75 0 0 0-1.75-1.75zM.002 1.75C.002.784.785 0 1.752 0h7.5c.966 0 1.75.784 1.75 1.75v10.5A1.75 1.75 0 0 1 9.252 14h-7.5a1.75 1.75 0 0 1-1.75-1.75zM1.752 16a1.75 1.75 0 0 0-1.75 1.75v4.5c0 .966.783 1.75 1.75 1.75h7.5a1.75 1.75 0 0 0 1.75-1.75v-4.5A1.75 1.75 0 0 0 9.252 16z"
                    clipRule="evenodd"
                  />
                </svg>
                Go to Dashboard
              </Button>
            </Authenticated>
            <Unauthenticated>
              <Button
                onClick={() =>
                  signIn('google', { redirectTo: window.location.href })
                }
                size="lg"
                className="bg-white text-slate-900 hover:bg-slate-200"
              >
                Sign in
              </Button>
            </Unauthenticated>
          </div>

          {/* Benefits Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-5xl mx-auto mb-10">
            <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-6 text-left">
              <h3 className="text-lg font-semibold text-cyan-400 mb-2">
                Zero Install
              </h3>
              <p className="text-slate-300 text-sm">
                No downloads, no toolchains. Everything runs in your browser.
              </p>
            </div>
            <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-6 text-left">
              <h3 className="text-lg font-semibold text-cyan-400 mb-2">
                Custom Firmware
              </h3>
              <p className="text-slate-300 text-sm">
                Build bespoke Meshtastic firmware tailored to your exact needs.
              </p>
            </div>
            <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-6 text-left">
              <h3 className="text-lg font-semibold text-cyan-400 mb-2">
                Community Extensions
              </h3>
              <p className="text-slate-300 text-sm">
                Include community modules and extensions beyond core Meshtastic.
              </p>
            </div>
            <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-6 text-left md:col-span-2 lg:col-span-1">
              <h3 className="text-lg font-semibold text-cyan-400 mb-2">
                Share & Remix
              </h3>
              <p className="text-slate-300 text-sm">
                Publish your build profiles and let others remix your configs.
              </p>
            </div>
            <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-6 text-left md:col-span-2 lg:col-span-2">
              <h3 className="text-lg font-semibold text-cyan-400 mb-2">
                Cloud Builds
              </h3>
              <p className="text-slate-300 text-sm">
                Compile in the cloud, flash directly to your device—no local
                setup required.
              </p>
            </div>
          </div>
        </div>

        <main className="px-8 pb-8">
          {profiles === undefined ? (
            <div className="text-center text-slate-400 py-12">
              Loading profiles...
            </div>
          ) : profiles.length === 0 ? (
            <div className="text-center text-slate-400 py-12">
              No public profiles available yet.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {profiles.map((profile) => (
                <button
                  key={profile._id}
                  type="button"
                  onClick={() => navigate(`/profiles/${profile._id}`)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault()
                      navigate(`/profiles/${profile._id}`)
                    }
                  }}
                  className={`${profileCardClasses} hover:bg-slate-900 cursor-pointer transition-colors text-left`}
                >
                  <ProfileCardContent profile={profile} />
                </button>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
