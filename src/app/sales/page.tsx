'use client';

import Showcase from '@/app/showcase/page';

export default function Sales() {
  return (
    <>
      <Showcase />
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold text-gray-800">Secure Your Fleet’s Future</h1>
          <p className="mt-2 text-lg text-gray-600">
            Trusted by leading operations, SE‑Repairs delivers end‑to‑end repair management with robust security and real‑time visibility.
          </p>
          <div className="mt-8 flex justify-center space-x-4">
            <a href="mailto:operations@senational.com.au" className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition">
              Request a Demo
            </a>
            <a href="/contact" className="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold border border-blue-600 hover:bg-blue-50 transition">
              Contact Sales
            </a>
          </div>
        </div>
      </div>
    </>
  );
}