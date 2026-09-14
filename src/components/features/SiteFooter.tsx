import Link from 'next/link';

export default function SiteFooter() {
  return (
    <footer className="site-footer">
      <span className="site-footer-brand">Westfold Tennis</span>
      <nav className="site-footer-links" aria-label="Información legal">
        <Link href="/privacy">Privacidad</Link>
        <Link href="/terms">Términos</Link>
        <Link href="mailto:contacto@westfold.tennis">Contacto</Link>
      </nav>
      <small className="site-footer-note">La información deportiva se utiliza para gestionar estadísticas y rankings.</small>
    </footer>
  );
}
