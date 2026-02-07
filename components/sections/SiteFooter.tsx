import Link from "next/link"

export function SiteFooter() {
  return (
    <footer className="landing-footer">
      <div className="landing-container footer-content">
        <p>
          <strong>Vector</strong> • Tech Performance OS
        </p>
        <div className="footer-links">
          <Link href="#system">System</Link>
          <Link href="#screens">Screens</Link>
          <Link href="#pricing">Pricing</Link>
          <Link href="/login">Get Started</Link>
        </div>
      </div>
    </footer>
  )
}
