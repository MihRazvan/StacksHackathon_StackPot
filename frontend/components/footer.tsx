import Link from 'next/link';
import { Github, Linkedin, ExternalLink, Code2 } from 'lucide-react';

export function Footer() {
  return (
    <footer className="border-t border-slate-800 bg-slate-950">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <h3 className="text-xl font-bold">
                <span className="text-white">Stack</span>
                <span className="text-emerald-400">Pot</span>
              </h3>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed">
              No-loss lottery powered by Stacks blockchain. Win Bitcoin yield while keeping your STX safe.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-sm text-slate-400 hover:text-emerald-400 transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/pool" className="text-sm text-slate-400 hover:text-emerald-400 transition-colors">
                  Pool
                </Link>
              </li>
              <li>
                <Link href="/history" className="text-sm text-slate-400 hover:text-emerald-400 transition-colors">
                  History
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="text-white font-semibold mb-4">Resources</h4>
            <ul className="space-y-2">
              <li>
                <a
                  href="https://dorahacks.io/hackathon/stacks-vibe-coding/detail"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-slate-400 hover:text-emerald-400 transition-colors inline-flex items-center gap-1"
                >
                  Hackathon Page
                  <ExternalLink className="w-3 h-3" />
                </a>
              </li>
              <li>
                <a
                  href="https://github.com/MihRazvan"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-slate-400 hover:text-emerald-400 transition-colors inline-flex items-center gap-1"
                >
                  GitHub Repository
                  <ExternalLink className="w-3 h-3" />
                </a>
              </li>
              <li>
                <a
                  href="https://www.stacks.co/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-slate-400 hover:text-emerald-400 transition-colors inline-flex items-center gap-1"
                >
                  Stacks Blockchain
                  <ExternalLink className="w-3 h-3" />
                </a>
              </li>
              <li>
                <a
                  href="https://docs.stacks.co/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-slate-400 hover:text-emerald-400 transition-colors inline-flex items-center gap-1"
                >
                  Stacks Docs
                  <ExternalLink className="w-3 h-3" />
                </a>
              </li>
            </ul>
          </div>

          {/* Connect */}
          <div>
            <h4 className="text-white font-semibold mb-4">Connect</h4>
            <div className="space-y-3">
              <a
                href="https://github.com/MihRazvan"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-slate-400 hover:text-emerald-400 transition-colors"
              >
                <Github className="w-5 h-5" />
                <span>GitHub</span>
              </a>
              <a
                href="https://www.linkedin.com/in/razvanmih/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-slate-400 hover:text-emerald-400 transition-colors"
              >
                <Linkedin className="w-5 h-5" />
                <span>LinkedIn</span>
              </a>
              <a
                href="https://dorahacks.io/hackathon/stacks-vibe-coding/detail"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-slate-400 hover:text-emerald-400 transition-colors"
              >
                <Code2 className="w-5 h-5" />
                <span>Hackathon</span>
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-slate-800">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-slate-500">
              © {new Date().getFullYear()} StackPot. Built for Stacks Vibe Coding Hackathon.
            </p>
            <div className="flex items-center gap-6">
              <a
                href="https://github.com/MihRazvan"
                target="_blank"
                rel="noopener noreferrer"
                className="text-slate-500 hover:text-emerald-400 transition-colors"
              >
                <Github className="w-5 h-5" />
              </a>
              <a
                href="https://www.linkedin.com/in/razvanmih/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-slate-500 hover:text-emerald-400 transition-colors"
              >
                <Linkedin className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
