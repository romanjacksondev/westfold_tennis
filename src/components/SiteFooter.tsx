import Link from 'next/link';

export default function SiteFooter() {
  return (
    <footer className="site-footer">
      <span>Westfold Tennis</span>
      <nav aria-label="Información legal">
        <Link href="/privacy">Privacidad</Link>
        <Link href="/terms">Términos</Link>
        <Link href="mailto:contacto@westfold.tennis">Contacto</Link>
      </nav>
      <small>La información deportiva se utiliza para gestionar estadísticas y rankings.</small>
    </footer>
  );
}
