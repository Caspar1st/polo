import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="border-t border-primary-900/10 bg-primary-900 text-surface">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 sm:grid-cols-3 sm:px-6">
        <div>
          <p className="text-lg text-accent-200">Frankfurter Polo Club e.V.</p>
          <p className="mt-2 text-sm leading-relaxed text-surface/70">
            Oeserstr. 80
            <br />
            65934 Frankfurt am Main
          </p>
        </div>
        <div>
          <p className="text-sm tracking-[0.2em] uppercase text-surface/50">
            Club
          </p>
          <ul className="mt-2 space-y-1.5 text-sm">
            <li>
              <Link href="/book" className="hover:text-accent-200">
                Book a field or lesson
              </Link>
            </li>
            <li>
              <Link href="/news" className="hover:text-accent-200">
                News &amp; events
              </Link>
            </li>
            <li>
              <Link href="/live" className="hover:text-accent-200">
                Live streams
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <p className="text-sm tracking-[0.2em] uppercase text-surface/50">
            Legal
          </p>
          <ul className="mt-2 space-y-1.5 text-sm">
            {/* TODO: link to the club's real Impressum / Datenschutzerklärung */}
            <li>
              <a
                href="https://frankfurterpoloclub.de/"
                className="hover:text-accent-200"
              >
                frankfurterpoloclub.de
              </a>
            </li>
            <li className="text-surface/50">Impressum (coming soon)</li>
            <li className="text-surface/50">Datenschutzerklärung (coming soon)</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-surface/10 py-4 text-center text-xs text-surface/50">
        Est. 1902 · Revived 1992 · © {new Date().getFullYear()} Frankfurter
        Polo Club e.V.
      </div>
    </footer>
  );
}

export default SiteFooter;
