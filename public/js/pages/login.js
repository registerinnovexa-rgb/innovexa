import { signIn } from '../auth.js'
import { toast } from '../app.js'

export function renderLogin(app) {
  app.innerHTML = `
    <div class="auth-page">
      <div class="auth-card">
        <div class="auth-logo">
          <img src="/assets/logo.png" alt="Innovexa Hub">
          <h1>Innovexa Hub</h1>
          <p>Sign in to your member portal</p>
        </div>
        <form id="login-form">
          <div class="form-group">
            <label>Email</label>
            <input type="email" id="email" placeholder="your@email.com" required>
          </div>
          <div class="form-group">
            <label>Password</label>
            <input type="password" id="password" placeholder="••••••••" required>
          </div>
          <button type="submit" class="btn btn-primary btn-lg" style="width:100%" id="login-btn">Sign In</button>
        </form>
      </div>
    </div>
  `

  document.getElementById('login-form').addEventListener('submit', async (e) => {
    e.preventDefault()
    const btn = document.getElementById('login-btn')
    btn.textContent = 'Signing in...'
    btn.disabled = true
    try {
      await signIn(document.getElementById('email').value, document.getElementById('password').value)
      toast('Welcome back!', 'success')
    } catch (err) {
      toast(err.message, 'error')
      btn.textContent = 'Sign In'
      btn.disabled = false
    }
  })
}
