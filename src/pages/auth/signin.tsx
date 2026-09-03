import { FormEvent, useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/router';
import SiteFooter from '@/components/SiteFooter';

export default function SignInPage() {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setLoading(true);
    const form = new FormData(event.currentTarget);
    const result = await signIn('credentials', { email: form.get('email'), password: form.get('password'), redirect: false, callbackUrl: String(router.query.callbackUrl || '/') });
    if (result?.error) setError('No pudimos validar tus credenciales.');
    else window.location.assign(result?.url || '/');
    setLoading(false);
  }

  return (
    <main className="auth-page">
      <section className="auth-card" aria-labelledby="login-title">
        <p className="eyebrow">Westfold Tennis</p>
        <h1 id="login-title">Ingresar</h1>
        <p className="muted">Accedé a la experiencia completa del circuito.</p>
        {error && <p className="auth-error" role="alert">{error}</p>}
        <form onSubmit={handleSubmit}>
          <label className="field"><span>Email <b>*</b></span><input name="email" type="email" autoComplete="email" required /></label>
          <label className="field"><span>Contraseña <b>*</b></span><input name="password" type="password" autoComplete="current-password" required /></label>
          <p className="legal-notice">Al ingresar, consultá los <a href="/terms">Términos</a> y la <a href="/privacy">Política de privacidad</a>. La aceptación se solicita únicamente al crear una cuenta.</p>
          <button className="primary-button" disabled={loading}>{loading ? 'Validando...' : 'Ingresar'}</button>
        </form>
      </section>
      <SiteFooter />
    </main>
  );
}
