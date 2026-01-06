'use client';

export default function Showcase() {
  return (
    <div className="min-h-screen bg-white text-blue-800 py-12">
      {/* Hero */}
      <section className="container mx-auto px-4 text-center">
        <h1 className="text-4xl font-bold text-blue-900">SE‑Repairs Fleet Management</h1>
        <p className="mt-2 text-lg text-slate-600">
          Boost productivity, reduce downtime, and keep every vehicle rolling.
        </p>
        <div className="mt-6 flex justify-center gap-4">
          {/* Placeholder for logo */}
          <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center text-blue-600">
            Logo
          </div>
        </div>
      </section>

      {/* Key Benefits */}
      <section className="container mx-auto px-4 mt-16">
        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-blue-50 p-6 rounded-lg text-center">
            <h2 className="text-2xl font-semibold text-blue-900">Secure Access</h2>
            <p className="mt-2 text-slate-700">
              Multi‑level authentication ensures only authorized personnel can enter.
            </p>
          </div>
          <div className="bg-blue-50 p-6 rounded-lg text-center">
            <h2 className="text-2xl font-semibold text-blue-900">Live Reporting</h2>
            <p className="mt-2 text-slate-700">
              Real‑time feed of issues, photos, and updates keeps teams aligned.
            </p>
          </div>
          <div className="bg-blue-50 p-6 rounded-lg text-center">
            <h2 className="text-2xl font-semibold text-blue-900">Full Ops Suite</h2>
            <p className="mt-2 text-slate-700">
              Kanban boards, scheduling, equipment requests, and offline queue—all in one place.
            </p>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="container mx-auto px-4 mt-16 text-center bg-blue-900 text-white p-8 rounded-lg">
        <h2 className="text-3xl font-bold mb-2">Ready to streamline your fleet?</h2>
        <p className="mb-4 text-lg">
          Contact the SE‑Repairs team for a live demo.
        </p>
        <a
          href="mailto:operations@senational.com.au"
          className="inline bg-blue-200 text-blue-900 font-semibold rounded-md px-6 py-2 hover:bg-blue-300 transition"
        >
          Get in Touch
        </a>
      </section>

      {/* Footer */}
      <footer className="container mx-auto px-4 mt-24 text-center text-sm text-slate-500">
        © {new Date().getFullYear()} SE‑Repairs. All rights reserved.
      </footer>
    </div>
  );
}