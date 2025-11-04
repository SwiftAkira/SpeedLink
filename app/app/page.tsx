import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#0C0C0C]">
      <main className="container mx-auto px-4 py-8">
        <nav className="flex justify-between items-center mb-24">
          <h1 className="text-3xl font-bold text-[#FAFAFA]">SpeedLink</h1>
          <div className="flex gap-4">
            <Link
              href="/login"
              className="px-4 py-2 text-[#FAFAFA] hover:text-[#84CC16] transition-colors font-semibold min-h-[44px] flex items-center"
            >
              Login
            </Link>
            <Link
              href="/signup"
              className="px-6 py-3 bg-[#84CC16] text-black rounded-lg hover:bg-[#73B812] transition-colors font-semibold min-h-[44px] flex items-center"
            >
              Sign Up
            </Link>
          </div>
        </nav>

        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-5xl md:text-7xl font-extrabold mb-8 text-[#FAFAFA]">
            Ride Together,
            <br />
            Stay Connected
          </h2>
          <p className="text-xl md:text-2xl mb-16 text-[#A3A3A3]">
            Real-time location sharing for motorcycle riders and spirited drivers.
            <br />
            Share your ride, avoid speed cameras, stay connected.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-24">
            <Link
              href="/signup"
              className="px-8 py-4 bg-[#84CC16] text-black rounded-lg hover:bg-[#73B812] transition-colors font-bold text-lg min-h-[56px] flex items-center justify-center"
            >
              Get Started Free
            </Link>
            <Link
              href="/login"
              className="px-8 py-4 bg-transparent border-2 border-[#84CC16] text-[#84CC16] rounded-lg hover:bg-[#84CC16]/10 transition-colors font-bold text-lg min-h-[56px] flex items-center justify-center"
            >
              Sign In
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-20">
            <div className="bg-[#171717] border border-[#262626] rounded-xl p-6 hover:border-[#84CC16] transition-colors">
              <div className="text-4xl mb-4" role="img" aria-label="Motorcycle">🏍️</div>
              <h3 className="text-xl font-bold mb-2 text-[#FAFAFA]">Party Mode</h3>
              <p className="text-[#A3A3A3]">Create or join riding groups with simple 6-digit codes</p>
            </div>
            <div className="bg-[#171717] border border-[#262626] rounded-xl p-6 hover:border-[#84CC16] transition-colors">
              <div className="text-4xl mb-4" role="img" aria-label="Location">📍</div>
              <h3 className="text-xl font-bold mb-2 text-[#FAFAFA]">Live Location</h3>
              <p className="text-[#A3A3A3]">Real-time tracking with ultra-low latency updates</p>
            </div>
            <div className="bg-[#171717] border border-[#262626] rounded-xl p-6 hover:border-[#84CC16] transition-colors">
              <div className="text-4xl mb-4" role="img" aria-label="Alert">🚨</div>
              <h3 className="text-xl font-bold mb-2 text-[#FAFAFA]">Speed Alerts</h3>
              <p className="text-[#A3A3A3]">Get notified about speed cameras and hazards</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
