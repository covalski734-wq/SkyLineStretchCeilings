import { nav, site } from '../data.js'

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="container">
        <div className="site-footer__grid">
          <div>
            <img
              src="/assets/logo-white.png"
              alt={site.name}
              className="site-footer__logo"
              width="916"
              height="645"
            />
            <p className="site-footer__blurb">
              Premium stretch ceilings with integrated lighting for homes and
              businesses across Vancouver and the Lower Mainland.
            </p>
          </div>

          <div>
            <div className="site-footer__title">Explore</div>
            <div className="site-footer__col">
              {nav.map((link) => (
                <a key={link.href} href={link.href}>
                  {link.label}
                </a>
              ))}
            </div>
          </div>

          <div>
            <div className="site-footer__title">Contact</div>
            <div className="site-footer__col">
              <a href={site.phoneHref}>{site.phone}</a>
              <a href={`mailto:${site.email}`}>{site.email}</a>
              <a href={site.whatsapp} target="_blank" rel="noopener noreferrer">
                WhatsApp us
              </a>
              <span>Vancouver, BC · Canada</span>
            </div>
          </div>

          <div>
            <div className="site-footer__title">Hours</div>
            <div className="site-footer__col">
              {site.hours.map((line) => (
                <span key={line}>{line}</span>
              ))}
            </div>

            <div className="site-footer__title site-footer__title--spaced">
              Follow
            </div>
            <div className="site-footer__col">
              {site.social.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {s.label}
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="site-footer__base">
          <span>© 2026 {site.name}. All rights reserved.</span>
          <span>{site.legal}</span>
        </div>
      </div>
    </footer>
  )
}
