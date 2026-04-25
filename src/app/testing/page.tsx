import Link from "next/link";
import { ArrowRight, FileText, Sparkles } from "lucide-react";

export default function TestingRootPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-slate-900 mb-4">Testing Dashboard</h1>
          <p className="text-lg text-slate-600">Choose a testing environment</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Option 1: Original Framer */}
          <Link
            href="/testing/1"
            className="group relative bg-white rounded-2xl p-8 shadow-sm border border-slate-200 hover:shadow-lg transition-all duration-200 hover:-translate-y-1"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <FileText className="w-6 h-6 text-blue-600" />
              </div>
              <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-blue-600 transition-colors" />
            </div>
            <h2 className="text-xl font-semibold text-slate-900 mb-2">Original Framer Export</h2>
            <p className="text-slate-600 mb-4">
              View the original HTML export from Framer with all extracted components and styling preserved.
            </p>
            <div className="flex flex-wrap gap-2">
              <span className="px-3 py-1 bg-slate-100 text-slate-700 text-sm rounded-full">Static</span>
              <span className="px-3 py-1 bg-slate-100 text-slate-700 text-sm rounded-full">HTML</span>
              <span className="px-3 py-1 bg-slate-100 text-slate-700 text-sm rounded-full">Iframe</span>
            </div>
          </Link>

          {/* Option 2: Resource Dialog Component */}
          <Link
            href="/testing/2"
            className="group relative bg-white rounded-2xl p-8 shadow-sm border border-slate-200 hover:shadow-lg transition-all duration-200 hover:-translate-y-1"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 bg-purple-100 rounded-lg">
                <Sparkles className="w-6 h-6 text-purple-600" />
              </div>
              <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-purple-600 transition-colors" />
            </div>
            <h2 className="text-xl font-semibold text-slate-900 mb-2">Resource Dialog Component</h2>
            <p className="text-slate-600 mb-4">
              Interactive multi-step dialog for adding resources with validation, animations, and a gradient background.
            </p>
            <div className="flex flex-wrap gap-2">
              <span className="px-3 py-1 bg-purple-100 text-purple-700 text-sm rounded-full">Interactive</span>
              <span className="px-3 py-1 bg-purple-100 text-purple-700 text-sm rounded-full">React</span>
              <span className="px-3 py-1 bg-purple-100 text-purple-700 text-sm rounded-full">Multi-step</span>
            </div>
          </Link>
        </div>

        {/* Additional Info */}
        <div className="mt-12 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-50 border border-amber-200 rounded-lg">
            <div className="w-2 h-2 bg-amber-400 rounded-full animate-pulse"></div>
            <span className="text-sm text-amber-800">
              Both environments are isolated and safe for testing
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
