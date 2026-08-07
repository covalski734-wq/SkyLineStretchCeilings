import { useState } from 'react'
import { Link } from 'react-router-dom'
import { nav, site } from '../data.js'

export default function Header() {
  const [open, setOpen] = useState(false)

  return (
    <header id="top" className="site-header">
      <div className="site-header__inner">
        <Link to="/" className="logo-box">
          <img
            src="/assets/logo-white.png"
            alt={site.name}
            className="site-header__logo"
            width="916"
            height="645"
          />
        </Link>

        <nav className="nav-links">
          {nav.map((link) => (
            <Link key={link.href} to={link.href}>
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="header-actions">
          <a href={site.phoneHref} className="header-phone">
            {site.phone}
          </a>
          <Link to="/#contact" className="btn btn--primary btn--header">
            Free Quote
          </Link>
          <button
            type="button"
            className={`nav-burger${open ? ' is-open' : ''}`}
            aria-label={open ? 'Close navigation' : 'Open navigation'}
            aria-expanded={open}
            aria-controls="mobile-nav"
            onClick={() => setOpen((v) => !v)}
          >
            <span className="nav-burger__bars" aria-hidden="true">
              <span />
              <span />
              <span />
            </span>
          </button>
        </div>
      </div>

      {/* Always rendered so opening and closing can animate. */}
      <div
        id="mobile-nav"
        className={`mobile-nav${open ? ' is-open' : ''}`}
        aria-hidden={!open}
      >
        <div className="mobile-nav__inner">
          {nav.map((link) => (
            <Link
              key={link.href}
              to={link.href}
              tabIndex={open ? 0 : -1}
              onClick={() => setOpen(false)}
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>
    </header>
  )
}
