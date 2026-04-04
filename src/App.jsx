import { useState, useEffect, useRef } from "react";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;
const API_URL = import.meta.env.VITE_API_URL;

/* ─── Global Styles ─────────────────────────────────────────── */
const GlobalStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,400&display=swap');

    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    :root {
      --navy:        #0D1B2A;
      --navy-mid:    #162236;
      --navy-light:  #1E3250;
      --gold:        #BF8C3A;
      --gold-light:  #D4A84B;
      --gold-pale:   #F5EDD8;
      --white:       #FFFFFF;
      --bg:          #F7F6F3;
      --bg-card:     #FFFFFF;
      --border:      #E8E6E0;
      --border-mid:  #D4D0C8;
      --muted:       #8A8680;
      --text:        #1A1917;
      --text-mid:    #4A4845;
      --success:     #1F6B40;
      --success-bg:  #EAF5EE;
      --warn:        #9B5A00;
      --warn-bg:     #FEF3E0;
      --danger:      #B03020;
      --danger-bg:   #FCECEB;
      --font-d:      'Playfair Display', Georgia, serif;
      --font-b:      'DM Sans', -apple-system, BlinkMacSystemFont, sans-serif;
      --sh-sm:  0 1px 4px rgba(13,27,42,.07), 0 1px 2px rgba(13,27,42,.05);
      --sh-md:  0 4px 16px rgba(13,27,42,.09), 0 2px 6px rgba(13,27,42,.05);
      --sh-lg:  0 12px 40px rgba(13,27,42,.12), 0 4px 12px rgba(13,27,42,.07);
      --r-sm: 8px; --r-md: 14px; --r-lg: 22px;
      --ease: cubic-bezier(.4,0,.2,1);
      --t: .2s var(--ease);
    }

    html, body, #root { height: 100%; }
    body {
      font-family: var(--font-b);
      background: var(--bg);
      color: var(--text);
      -webkit-font-smoothing: antialiased;
      line-height: 1.5;
    }

    input, button, textarea, select {
      font-family: var(--font-b);
    }

    /* ── Scrollbar ── */
    ::-webkit-scrollbar { width: 5px; height: 5px; }
    ::-webkit-scrollbar-track { background: transparent; }
    ::-webkit-scrollbar-thumb { background: var(--border-mid); border-radius: 3px; }

    /* ── Layout shell ── */
    .shell { display: flex; height: 100vh; overflow: hidden; }

    /* ── Sidebar ── */
    .sidebar {
      width: 252px;
      background: var(--navy);
      display: flex; flex-direction: column;
      flex-shrink: 0;
      transition: left .25s var(--ease);
    }

    .sb-logo {
      padding: 24px 20px 18px;
      border-bottom: 1px solid rgba(255,255,255,.07);
      display: flex; align-items: center; gap: 10px;
    }

    .sb-logo-mark {
      width: 32px; height: 32px;
      border-radius: 8px;
      background: var(--gold);
      display: flex; align-items: center; justify-content: center;
      font-size: 16px; font-weight: 700;
      color: var(--white);
      flex-shrink: 0;
    }

    .sb-logo-text {
      font-family: var(--font-d);
      font-size: 18px; font-weight: 700;
      letter-spacing: -.2px;
    }

    .sb-logo-bee { color: var(--white); }
    .sb-logo-compass { color: var(--gold); }

    .sb-nav {
      flex: 1; padding: 16px 10px;
      overflow-y: auto; display: flex; flex-direction: column; gap: 1px;
    }

    .sb-label {
      font-size: 10px; font-weight: 600;
      letter-spacing: 1.2px; text-transform: uppercase;
      color: rgba(255,255,255,.3);
      padding: 14px 10px 5px;
    }

    .sb-item {
      display: flex; align-items: center; gap: 11px;
      padding: 9px 10px;
      border-radius: var(--r-sm);
      cursor: pointer; border: none; background: none;
      color: rgba(255,255,255,.58);
      font-size: 13.5px; font-weight: 400;
      width: 100%; text-align: left;
      transition: all var(--t);
    }
    .sb-item:hover { background: rgba(255,255,255,.06); color: var(--white); }
    .sb-item.active { background: rgba(191,140,58,.16); color: #E8C068; font-weight: 500; }
    .sb-item .si-icon { font-size: 15px; width: 18px; text-align: center; flex-shrink: 0; }

    .sb-footer {
      padding: 14px 10px;
      border-top: 1px solid rgba(255,255,255,.07);
    }

    .sb-user {
      display: flex; align-items: center; gap: 10px;
      padding: 10px;
      border-radius: var(--r-sm);
      cursor: pointer;
      transition: background var(--t);
    }
    .sb-user:hover { background: rgba(255,255,255,.05); }

    .sb-avatar {
      width: 32px; height: 32px; border-radius: 50%;
      background: var(--gold);
      display: flex; align-items: center; justify-content: center;
      font-size: 13px; font-weight: 700; color: var(--white);
      flex-shrink: 0;
    }

    .sb-user-info { flex: 1; min-width: 0; }
    .sb-user-name {
      font-size: 13px; font-weight: 500; color: var(--white);
      white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
    }
    .sb-user-role { font-size: 11px; color: rgba(255,255,255,.38); }

    /* ── Main area ── */
    .main { flex: 1; overflow-y: auto; display: flex; flex-direction: column; min-width: 0; }

    /* ── Topbar ── */
    .topbar {
      background: var(--white);
      border-bottom: 1px solid var(--border);
      padding: 0 28px; height: 60px;
      display: flex; align-items: center; justify-content: space-between;
      flex-shrink: 0; position: sticky; top: 0; z-index: 20;
    }

    .topbar-left { display: flex; align-items: center; gap: 12px; }

    .topbar-title {
      font-family: var(--font-d);
      font-size: 19px; font-weight: 600; color: var(--navy);
    }

    .topbar-right { display: flex; align-items: center; gap: 8px; }

    .icon-btn {
      width: 36px; height: 36px;
      border-radius: var(--r-sm);
      border: 1px solid var(--border);
      background: var(--white);
      display: flex; align-items: center; justify-content: center;
      cursor: pointer; font-size: 16px;
      color: var(--text-mid);
      transition: all var(--t);
    }
    .icon-btn:hover { border-color: var(--gold); color: var(--gold); }

    .hamburger {
      display: none;
      width: 36px; height: 36px;
      border: none; background: none;
      cursor: pointer; font-size: 20px;
      color: var(--navy);
      align-items: center; justify-content: center;
      border-radius: var(--r-sm);
      transition: background var(--t);
    }
    .hamburger:hover { background: var(--bg); }

    /* ── Page content ── */
    .page { padding: 28px; flex: 1; }

    .page-header { margin-bottom: 24px; }
    .page-title {
      font-family: var(--font-d);
      font-size: 24px; font-weight: 700;
      color: var(--navy); margin-bottom: 4px;
    }
    .page-sub { font-size: 14px; color: var(--muted); }

    /* ── Buttons ── */
    .btn {
      display: inline-flex; align-items: center; gap: 7px;
      padding: 10px 18px;
      border-radius: var(--r-sm);
      font-size: 13.5px; font-weight: 500;
      cursor: pointer; border: none;
      transition: all var(--t);
      white-space: nowrap; text-decoration: none;
    }
    .btn-primary { background: var(--gold); color: var(--white); }
    .btn-primary:hover { background: var(--gold-light); box-shadow: 0 4px 14px rgba(191,140,58,.3); transform: translateY(-1px); }
    .btn-navy { background: var(--navy); color: var(--white); }
    .btn-navy:hover { background: var(--navy-mid); transform: translateY(-1px); box-shadow: var(--sh-md); }
    .btn-outline { background: var(--white); color: var(--navy); border: 1.5px solid var(--border); }
    .btn-outline:hover { border-color: var(--navy); background: var(--bg); }
    .btn-ghost { background: transparent; color: var(--text-mid); padding: 9px 12px; }
    .btn-ghost:hover { background: var(--bg); color: var(--text); }
    .btn-lg { padding: 13px 26px; font-size: 15px; }
    .btn-sm { padding: 7px 13px; font-size: 12.5px; }
    .btn-full { width: 100%; justify-content: center; }
    .btn-danger { background: var(--danger-bg); color: var(--danger); }
    .btn:disabled { opacity: .5; cursor: not-allowed; transform: none !important; }

    /* ── Cards ── */
    .card {
      background: var(--white);
      border: 1px solid var(--border);
      border-radius: var(--r-md);
      padding: 22px;
      box-shadow: var(--sh-sm);
    }

    .card-title {
      font-family: var(--font-d);
      font-size: 16px; font-weight: 600;
      color: var(--navy); margin-bottom: 3px;
    }
    .card-sub { font-size: 12.5px; color: var(--muted); margin-bottom: 18px; }

    /* ── Stats grid ── */
    .stat-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
      gap: 14px; margin-bottom: 20px;
    }

    .stat-card {
      background: var(--white); border: 1px solid var(--border);
      border-radius: var(--r-md); padding: 18px 20px;
      box-shadow: var(--sh-sm);
    }

    .stat-label {
      font-size: 11px; font-weight: 600;
      letter-spacing: .6px; text-transform: uppercase;
      color: var(--muted); margin-bottom: 8px;
    }

    .stat-value {
      font-family: var(--font-d);
      font-size: 30px; font-weight: 700;
      color: var(--navy); line-height: 1; margin-bottom: 5px;
    }

    .stat-change { font-size: 12px; color: var(--muted); }
    .stat-up { color: var(--success); }
    .stat-down { color: var(--danger); }

    /* ── Progress bar ── */
    .prog-wrap {
      height: 6px; background: var(--bg);
      border-radius: 3px; overflow: hidden;
    }
    .prog-fill {
      height: 100%;
      background: linear-gradient(90deg, var(--gold), var(--gold-light));
      border-radius: 3px;
      transition: width .8s var(--ease);
    }
    .prog-fill.low { background: linear-gradient(90deg, #C03020, #E04030); }
    .prog-fill.mid { background: linear-gradient(90deg, #E07B39, #F0944A); }
    .prog-fill.good { background: linear-gradient(90deg, #1F6B40, #2D8A55); }

    /* ── Forms ── */
    .form-group { margin-bottom: 16px; }

    .form-label {
      display: block; font-size: 11.5px; font-weight: 600;
      letter-spacing: .5px; text-transform: uppercase;
      color: var(--text-mid); margin-bottom: 6px;
    }

    .form-input {
      width: 100%; padding: 11px 14px;
      background: var(--bg);
      border: 1.5px solid var(--border);
      border-radius: var(--r-sm);
      font-size: 14.5px; color: var(--text);
      transition: all var(--t); outline: none;
    }
    .form-input:focus {
      background: var(--white);
      border-color: var(--gold);
      box-shadow: 0 0 0 3px rgba(191,140,58,.13);
    }
    .form-input::placeholder { color: var(--muted); }
    .form-input.error { border-color: var(--danger); }

    .form-select {
      width: 100%; padding: 11px 14px;
      background: var(--bg);
      border: 1.5px solid var(--border);
      border-radius: var(--r-sm);
      font-size: 14.5px; color: var(--text);
      transition: all var(--t); outline: none;
      appearance: none; cursor: pointer;
    }
    .form-select:focus {
      background: var(--white);
      border-color: var(--gold);
      box-shadow: 0 0 0 3px rgba(191,140,58,.13);
    }

    .form-hint { font-size: 12px; color: var(--muted); margin-top: 4px; }

    .error-box {
      background: var(--danger-bg); color: var(--danger);
      border: 1px solid rgba(176,48,32,.18);
      border-radius: var(--r-sm);
      padding: 11px 14px; font-size: 13px;
      display: flex; align-items: flex-start; gap: 8px;
    }

    .success-box {
      background: var(--success-bg); color: var(--success);
      border: 1px solid rgba(31,107,64,.18);
      border-radius: var(--r-sm);
      padding: 11px 14px; font-size: 13px;
    }

    /* ── Badge ── */
    .badge {
      display: inline-flex; align-items: center;
      padding: 3px 9px; border-radius: 100px;
      font-size: 11px; font-weight: 600; letter-spacing: .2px;
    }
    .badge-gold { background: var(--gold-pale); color: var(--warn); }
    .badge-green { background: var(--success-bg); color: var(--success); }
    .badge-navy { background: rgba(13,27,42,.08); color: var(--navy); }
    .badge-red { background: var(--danger-bg); color: var(--danger); }
    .badge-gray { background: var(--bg); color: var(--muted); border: 1px solid var(--border); }

    /* ── Divider ── */
    .divider { height: 1px; background: var(--border); margin: 20px 0; }

    .divider-text {
      display: flex; align-items: center; gap: 10px;
      color: var(--muted); font-size: 12px; margin: 16px 0;
    }
    .divider-text::before, .divider-text::after {
      content: ''; flex: 1; height: 1px; background: var(--border);
    }

    /* ── Overlay ── */
    .overlay {
      position: fixed; inset: 0;
      background: rgba(0,0,0,.45);
      z-index: 40; display: none;
    }

    /* ── Mobile bottom nav ── */
    .mobile-nav {
      display: none;
      position: fixed; bottom: 0; left: 0; right: 0;
      background: var(--white);
      border-top: 1px solid var(--border);
      padding: 6px 0 max(6px, env(safe-area-inset-bottom));
      z-index: 30;
    }
    .mobile-nav-inner {
      display: flex; justify-content: space-around;
      max-width: 500px; margin: 0 auto;
    }
    .mn-item {
      display: flex; flex-direction: column;
      align-items: center; gap: 2px;
      padding: 6px 10px;
      cursor: pointer; border: none; background: none;
      color: var(--muted); font-size: 10px; font-weight: 500;
      transition: color var(--t);
    }
    .mn-item.active { color: var(--gold); }
    .mn-icon { font-size: 19px; }

    /* ── Landing page ── */
    .land { min-height: 100vh; background: var(--bg); }

    .land-nav {
      position: sticky; top: 0; z-index: 50;
      background: rgba(247,246,243,.94);
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
      border-bottom: 1px solid var(--border);
      padding: 0 40px; height: 64px;
      display: flex; align-items: center; justify-content: space-between;
    }

    .land-nav-links {
      display: flex; align-items: center; gap: 28px;
    }
    .land-nav-link {
      font-size: 14px; color: var(--text-mid);
      cursor: pointer; border: none; background: none;
      transition: color var(--t);
    }
    .land-nav-link:hover { color: var(--navy); }

    .land-nav-actions { display: flex; align-items: center; gap: 10px; }

    .land-hero {
      max-width: 1160px; margin: 0 auto;
      padding: 72px 40px 80px;
      display: grid; grid-template-columns: 1fr 1fr;
      gap: 60px; align-items: center;
    }

    .hero-eyebrow {
      display: inline-flex; align-items: center; gap: 7px;
      background: var(--gold-pale); color: var(--warn);
      padding: 5px 13px; border-radius: 100px;
      font-size: 11.5px; font-weight: 600;
      letter-spacing: .6px; text-transform: uppercase;
      margin-bottom: 18px;
    }

    .hero-h {
      font-family: var(--font-d);
      font-size: clamp(34px, 3.8vw, 50px);
      font-weight: 700; color: var(--navy);
      line-height: 1.15; margin-bottom: 18px;
      letter-spacing: -.3px;
    }
    .hero-h span { color: var(--gold); }

    .hero-p {
      font-size: 16.5px; color: var(--text-mid);
      line-height: 1.72; margin-bottom: 32px;
    }

    .hero-cta { display: flex; gap: 12px; flex-wrap: wrap; align-items: center; }

    .hero-trust {
      display: flex; align-items: center; gap: 6px;
      margin-top: 20px; font-size: 12.5px; color: var(--muted);
    }
    .trust-dot { width: 4px; height: 4px; border-radius: 50%; background: var(--muted); }

    .hero-visual {
      background: var(--navy);
      border-radius: var(--r-lg);
      padding: 32px; position: relative;
      overflow: hidden;
    }
    .hero-visual::before {
      content: '';
      position: absolute; top: -50px; right: -50px;
      width: 220px; height: 220px; border-radius: 50%;
      background: rgba(191,140,58,.1);
    }
    .hero-visual::after {
      content: '';
      position: absolute; bottom: -60px; left: -30px;
      width: 180px; height: 180px; border-radius: 50%;
      background: rgba(191,140,58,.06);
    }

    .hv-score-ring {
      display: flex; align-items: center; justify-content: center;
      margin-bottom: 20px;
    }

    .hv-score-inner {
      width: 120px; height: 120px; border-radius: 50%;
      background: rgba(255,255,255,.06);
      border: 3px solid var(--gold);
      display: flex; flex-direction: column;
      align-items: center; justify-content: center;
    }

    .hv-score-num {
      font-family: var(--font-d);
      font-size: 36px; font-weight: 700; color: var(--white);
      line-height: 1;
    }

    .hv-score-label { font-size: 11px; color: rgba(255,255,255,.5); }

    .hv-pillars { display: flex; flex-direction: column; gap: 10px; }

    .hv-pillar {
      display: flex; align-items: center; gap: 10px;
    }
    .hv-pillar-name { font-size: 12px; color: rgba(255,255,255,.6); width: 130px; }
    .hv-pillar-bar {
      flex: 1; height: 4px; background: rgba(255,255,255,.1);
      border-radius: 2px; overflow: hidden;
    }
    .hv-pillar-fill { height: 100%; background: var(--gold); border-radius: 2px; }
    .hv-pillar-pct { font-size: 12px; color: rgba(255,255,255,.5); width: 32px; text-align: right; }

    /* Features */
    .land-section { padding: 80px 40px; }
    .land-section.alt { background: var(--white); }

    .sec-header { text-align: center; max-width: 580px; margin: 0 auto 48px; }
    .sec-eye {
      font-size: 11.5px; font-weight: 600;
      letter-spacing: 1.4px; text-transform: uppercase;
      color: var(--gold); margin-bottom: 10px;
    }
    .sec-h {
      font-family: var(--font-d);
      font-size: clamp(26px, 3vw, 38px);
      font-weight: 700; color: var(--navy);
      line-height: 1.2; margin-bottom: 14px;
    }
    .sec-p { font-size: 15.5px; color: var(--text-mid); line-height: 1.7; }

    .feat-grid {
      max-width: 1160px; margin: 0 auto;
      display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
      gap: 18px;
    }

    .feat-card {
      background: var(--bg); border: 1px solid var(--border);
      border-radius: var(--r-md); padding: 24px;
      transition: all var(--t);
    }
    .feat-card:hover { border-color: var(--gold); transform: translateY(-2px); box-shadow: var(--sh-md); }

    .feat-icon {
      width: 40px; height: 40px; border-radius: 9px;
      background: var(--navy); display: flex;
      align-items: center; justify-content: center;
      font-size: 18px; margin-bottom: 14px;
    }

    .feat-title {
      font-family: var(--font-d);
      font-size: 16px; font-weight: 600;
      color: var(--navy); margin-bottom: 6px;
    }
    .feat-desc { font-size: 13.5px; color: var(--text-mid); line-height: 1.6; }

    /* Pricing */
    .price-grid {
      max-width: 1060px; margin: 0 auto;
      display: grid; grid-template-columns: repeat(auto-fit, minmax(230px, 1fr));
      gap: 18px; align-items: start;
    }

    .price-card {
      background: var(--white);
      border: 1.5px solid var(--border);
      border-radius: var(--r-md); padding: 26px;
      position: relative; transition: all var(--t);
    }
    .price-card:hover { box-shadow: var(--sh-md); }
    .price-card.feat { border-color: var(--gold); box-shadow: 0 0 0 1px var(--gold), var(--sh-md); }

    .price-badge {
      position: absolute; top: -11px; left: 50%;
      transform: translateX(-50%);
      background: var(--gold); color: var(--white);
      font-size: 10.5px; font-weight: 700;
      letter-spacing: .5px; text-transform: uppercase;
      padding: 3px 12px; border-radius: 100px;
      white-space: nowrap;
    }

    .price-plan {
      font-size: 11px; font-weight: 600;
      letter-spacing: .8px; text-transform: uppercase;
      color: var(--muted); margin-bottom: 10px;
    }

    .price-val {
      font-family: var(--font-d);
      font-size: 36px; font-weight: 700;
      color: var(--navy); line-height: 1; margin-bottom: 3px;
    }
    .price-val span { font-size: 16px; font-weight: 400; }

    .price-per { font-size: 12.5px; color: var(--muted); margin-bottom: 18px; }

    .price-feats { list-style: none; margin-bottom: 20px; }
    .price-feats li {
      display: flex; align-items: center; gap: 9px;
      font-size: 13px; color: var(--text-mid);
      padding: 7px 0; border-bottom: 1px solid var(--bg);
    }
    .price-feats li:last-child { border-bottom: none; }
    .pf-y { color: var(--success); font-size: 12px; }
    .pf-n { color: var(--muted); font-size: 12px; }

    /* Footer */
    .land-footer {
      background: var(--navy); padding: 40px;
      text-align: center;
    }
    .land-footer-logo {
      font-family: var(--font-d); font-size: 20px; font-weight: 700;
      margin-bottom: 12px;
    }
    .land-footer p { font-size: 12.5px; color: rgba(255,255,255,.35); line-height: 1.7; }

    /* ── Auth page ── */
    .auth-page {
      min-height: 100vh;
      display: grid; grid-template-columns: 1fr 1fr;
    }

    .auth-left {
      background: var(--navy);
      padding: 52px 52px;
      display: flex; flex-direction: column;
      justify-content: space-between;
      position: relative; overflow: hidden;
    }
    .auth-left::before {
      content: '';
      position: absolute; bottom: -80px; left: -60px;
      width: 340px; height: 340px; border-radius: 50%;
      background: rgba(191,140,58,.08);
    }
    .auth-left::after {
      content: '';
      position: absolute; top: -40px; right: -60px;
      width: 220px; height: 220px; border-radius: 50%;
      background: rgba(191,140,58,.05);
    }

    .al-logo {
      display: flex; align-items: center; gap: 10px;
    }
    .al-logo-mark {
      width: 34px; height: 34px; border-radius: 8px;
      background: var(--gold); display: flex;
      align-items: center; justify-content: center;
      font-size: 18px; font-weight: 700; color: var(--white);
    }
    .al-logo-text {
      font-family: var(--font-d); font-size: 20px; font-weight: 700;
    }
    .al-bee { color: var(--white); }
    .al-compass { color: var(--gold); }

    .al-tagline {
      position: relative; z-index: 1;
    }
    .al-tagline h2 {
      font-family: var(--font-d);
      font-size: clamp(26px, 2.8vw, 36px);
      font-weight: 700; color: var(--white);
      line-height: 1.3; margin-bottom: 16px;
    }
    .al-tagline h2 span { color: var(--gold); }
    .al-tagline p {
      font-size: 14.5px; color: rgba(255,255,255,.58);
      line-height: 1.7;
    }

    .al-points { list-style: none; margin-top: 28px; }
    .al-points li {
      display: flex; align-items: center; gap: 12px;
      color: rgba(255,255,255,.68); font-size: 14px;
      padding: 9px 0;
      border-bottom: 1px solid rgba(255,255,255,.07);
    }
    .al-points li:last-child { border-bottom: none; }
    .al-dot { width: 5px; height: 5px; border-radius: 50%; background: var(--gold); flex-shrink: 0; }

    .al-disclaimer {
      position: relative; z-index: 1;
      font-size: 11.5px; color: rgba(255,255,255,.3);
      line-height: 1.6;
    }

    .auth-right {
      background: var(--bg);
      padding: 52px; display: flex;
      flex-direction: column; justify-content: center;
      align-items: center;
    }

    .auth-box { width: 100%; max-width: 400px; }

    .auth-box-h {
      font-family: var(--font-d);
      font-size: 26px; font-weight: 700;
      color: var(--navy); margin-bottom: 4px;
    }
    .auth-box-sub { font-size: 14px; color: var(--muted); margin-bottom: 28px; }

    .auth-tabs {
      display: flex;
      background: var(--border); border-radius: 9px;
      padding: 3px; margin-bottom: 28px;
    }
    .auth-tab {
      flex: 1; padding: 9px;
      border: none; background: none;
      border-radius: 6px; font-size: 13.5px;
      font-weight: 500; cursor: pointer;
      transition: all var(--t); color: var(--muted);
    }
    .auth-tab.active { background: var(--white); color: var(--navy); box-shadow: var(--sh-sm); }

    /* ── Dashboard ── */
    .dash-grid { display: grid; grid-template-columns: 2fr 1fr; gap: 18px; }

    .pillar-list { display: flex; flex-direction: column; gap: 0; }
    .pillar-row {
      display: flex; align-items: center; gap: 12px;
      padding: 13px 0;
      border-bottom: 1px solid var(--bg);
    }
    .pillar-row:last-child { border-bottom: none; }
    .pillar-name { font-size: 13px; font-weight: 500; width: 155px; flex-shrink: 0; color: var(--text); }
    .pillar-bar-wrap { flex: 1; }
    .pillar-score { font-size: 13px; font-weight: 600; color: var(--navy); width: 44px; text-align: right; flex-shrink: 0; }
    .pillar-max { font-size: 11px; color: var(--muted); }

    .level-badge {
      display: inline-flex; align-items: center; gap: 8px;
      padding: 10px 18px;
      border-radius: var(--r-sm);
      font-family: var(--font-d);
      font-size: 18px; font-weight: 700;
    }
    .level-1 { background: var(--success-bg); color: var(--success); }
    .level-2 { background: var(--success-bg); color: #2D8A55; }
    .level-3 { background: var(--gold-pale); color: var(--warn); }
    .level-4 { background: var(--warn-bg); color: #9B5A00; }
    .level-nc { background: var(--danger-bg); color: var(--danger); }

    /* Score SVG ring */
    .score-ring { display: flex; justify-content: center; margin-bottom: 16px; }

    /* ── BeeBot chat ── */
    .chat-wrap {
      display: flex; flex-direction: column;
      height: calc(100vh - 130px);
      background: var(--white);
      border: 1px solid var(--border);
      border-radius: var(--r-md);
      overflow: hidden;
    }
    .chat-header {
      padding: 16px 20px;
      border-bottom: 1px solid var(--border);
      display: flex; align-items: center; gap: 12px;
    }
    .chat-avatar {
      width: 36px; height: 36px; border-radius: 50%;
      background: var(--gold); display: flex;
      align-items: center; justify-content: center;
      font-size: 17px;
    }
    .chat-name { font-weight: 600; font-size: 14px; color: var(--navy); }
    .chat-status { font-size: 12px; color: var(--success); }

    .chat-msgs {
      flex: 1; overflow-y: auto;
      padding: 20px; display: flex;
      flex-direction: column; gap: 14px;
    }
    .msg-row { display: flex; align-items: flex-end; gap: 8px; }
    .msg-row.user { flex-direction: row-reverse; }

    .msg-bubble {
      max-width: 72%; padding: 11px 15px;
      border-radius: 16px;
      font-size: 13.5px; line-height: 1.6;
    }
    .msg-bubble.bot {
      background: var(--bg); color: var(--text);
      border-bottom-left-radius: 4px;
      border: 1px solid var(--border);
    }
    .msg-bubble.user {
      background: var(--navy); color: var(--white);
      border-bottom-right-radius: 4px;
    }

    .msg-mini-avatar {
      width: 28px; height: 28px; border-radius: 50%;
      background: var(--gold); display: flex;
      align-items: center; justify-content: center;
      font-size: 13px; flex-shrink: 0;
    }

    .chat-input-wrap {
      padding: 14px 16px;
      border-top: 1px solid var(--border);
      display: flex; gap: 10px; align-items: center;
    }
    .chat-input {
      flex: 1; padding: 10px 15px;
      background: var(--bg);
      border: 1.5px solid var(--border);
      border-radius: 24px; font-size: 14px;
      outline: none; transition: all var(--t);
    }
    .chat-input:focus {
      border-color: var(--gold); background: var(--white);
      box-shadow: 0 0 0 3px rgba(191,140,58,.12);
    }

    /* ── Document vault ── */
    .doc-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
      gap: 14px;
    }
    .doc-card {
      background: var(--white); border: 1px solid var(--border);
      border-radius: var(--r-md); padding: 18px;
      transition: all var(--t); cursor: pointer;
    }
    .doc-card:hover { border-color: var(--gold); box-shadow: var(--sh-md); }
    .doc-icon { font-size: 28px; margin-bottom: 10px; }
    .doc-name { font-size: 13px; font-weight: 500; color: var(--navy); margin-bottom: 4px; word-break: break-word; }
    .doc-meta { font-size: 11.5px; color: var(--muted); }

    .upload-zone {
      border: 2px dashed var(--border-mid);
      border-radius: var(--r-md); padding: 36px;
      text-align: center; cursor: pointer;
      transition: all var(--t); background: var(--bg);
    }
    .upload-zone:hover { border-color: var(--gold); background: var(--gold-pale); }
    .upload-icon { font-size: 32px; margin-bottom: 10px; }
    .upload-text { font-size: 14px; color: var(--text-mid); margin-bottom: 4px; }
    .upload-hint { font-size: 12px; color: var(--muted); }

    /* ── Verifier marketplace ── */
    .verifier-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 16px;
    }
    .verifier-card {
      background: var(--white); border: 1px solid var(--border);
      border-radius: var(--r-md); padding: 20px;
      transition: all var(--t);
    }
    .verifier-card:hover { box-shadow: var(--sh-md); border-color: var(--gold-light); }
    .vc-header { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 12px; }
    .vc-name { font-weight: 600; font-size: 14.5px; color: var(--navy); margin-bottom: 3px; }
    .vc-city { font-size: 12px; color: var(--muted); }
    .vc-rating { font-size: 13px; color: var(--warn); font-weight: 600; }
    .vc-tags { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 14px; }
    .vc-tag {
      background: var(--bg); border: 1px solid var(--border);
      border-radius: 100px; padding: 2px 9px;
      font-size: 11px; color: var(--text-mid);
    }
    .vc-desc { font-size: 13px; color: var(--text-mid); line-height: 1.5; margin-bottom: 14px; }

    /* ── Tables ── */
    .tbl-wrap { overflow-x: auto; border-radius: var(--r-md); border: 1px solid var(--border); }
    table { width: 100%; border-collapse: collapse; }
    th {
      background: var(--bg); padding: 11px 16px;
      font-size: 11px; font-weight: 600;
      letter-spacing: .5px; text-transform: uppercase;
      color: var(--muted); text-align: left;
      border-bottom: 1px solid var(--border);
    }
    td {
      padding: 13px 16px; font-size: 13.5px;
      color: var(--text); border-bottom: 1px solid var(--bg);
    }
    tr:last-child td { border-bottom: none; }
    tr:hover td { background: var(--bg); }

    /* ── Animations ── */
    @keyframes fadeUp {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .fade { animation: fadeUp .35s var(--ease) both; }
    .fade-1 { animation-delay: .04s; }
    .fade-2 { animation-delay: .08s; }
    .fade-3 { animation-delay: .12s; }
    .fade-4 { animation-delay: .16s; }

    @keyframes spin { to { transform: rotate(360deg); } }
    .spinner {
      width: 17px; height: 17px;
      border: 2px solid rgba(255,255,255,.4);
      border-top-color: white; border-radius: 50%;
      animation: spin .55s linear infinite;
    }
    .spinner-gold {
      width: 17px; height: 17px;
      border: 2px solid rgba(191,140,58,.3);
      border-top-color: var(--gold); border-radius: 50%;
      animation: spin .55s linear infinite;
    }

    /* ── Responsive ── */
    @media (max-width: 1024px) {
      .dash-grid { grid-template-columns: 1fr; }
    }

    @media (max-width: 768px) {
      .sidebar {
        position: fixed; left: -260px; top: 0; bottom: 0;
        z-index: 50; transition: left .25s var(--ease);
      }
      .sidebar.open { left: 0; }
      .overlay.open { display: block; }
      .hamburger { display: flex; }
      .topbar { padding: 0 14px; }
      .page { padding: 18px 14px 80px; }
      .mobile-nav { display: block; }
      .stat-grid { grid-template-columns: 1fr 1fr; }
      .auth-page { grid-template-columns: 1fr; }
      .auth-left { display: none; }
      .auth-right { padding: 40px 22px; }
      .auth-box { max-width: 100%; }
      .land-nav { padding: 0 18px; }
      .land-nav-links { display: none; }
      .land-hero { grid-template-columns: 1fr; padding: 48px 18px 60px; gap: 36px; }
      .hero-visual { display: none; }
      .land-section { padding: 56px 18px; }
      .feat-grid { grid-template-columns: 1fr; }
      .price-grid { grid-template-columns: 1fr; max-width: 360px; }
      .verifier-grid { grid-template-columns: 1fr; }
      .doc-grid { grid-template-columns: 1fr 1fr; }
      .land-footer { padding: 36px 20px; }
      .chat-wrap { height: calc(100vh - 120px); }
    }

    @media (max-width: 480px) {
      .stat-grid { grid-template-columns: 1fr; }
      .hero-cta { flex-direction: column; }
      .doc-grid { grid-template-columns: 1fr; }
      .page-title { font-size: 20px; }
    }
  `}</style>
);

/* ─── Constants ─────────────────────────────────────────────── */
const PILLARS = [
  { name: "Ownership", score: 18, max: 25, pct: 72 },
  { name: "Management Control", score: 11, max: 19, pct: 58 },
  { name: "Skills Development", score: 15, max: 20, pct: 75 },
  { name: "Enterprise & Supplier Dev", score: 22, max: 40, pct: 55 },
  { name: "Socio-Economic Dev", score: 4, max: 5, pct: 80 },
];

const VERIFIERS = [
  { name: "EmpowerLogic", city: "Johannesburg", rating: "4.8", specialities: ["Generic Scorecard","QSE","EME"], desc: "SA's largest BEE verification agency with over 20 years of experience." },
  { name: "Honeycomb BEE Ratings", city: "Cape Town", rating: "4.6", specialities: ["QSE","EME","Tourism"], desc: "Specialist SME verifier with fast turnaround and online document portal." },
  { name: "Nkosi Advisory", city: "Durban", rating: "4.5", specialities: ["Generic","Mining","Construction"], desc: "Sector-specific expertise across mining and construction codes." },
  { name: "MDI Consulting", city: "Sandton", rating: "4.7", specialities: ["FSC","Generic","QSE"], desc: "Financial Services sector specialists with strong JSE-listed client base." },
  { name: "SERR Synergy", city: "Pretoria", rating: "4.4", specialities: ["QSE","EME","Agri"], desc: "Affordable SME packages with dedicated relationship managers." },
  { name: "Ubuntu Rating Agency", city: "Durban", rating: "4.6", specialities: ["Generic","ICT","Media"], desc: "ICT & media sector specialists, SANAS accredited with ISO 17020 certification." },
];

const FAQS = [
  { q: "Is BEEcompass SANAS accredited?", a: "No. BEEcompass is a pre-readiness and planning tool. We help you prepare for verification — we are not a verification body. Official B-BBEE certificates must be issued by a SANAS-accredited verification agency." },
  { q: "How accurate is the score estimate?", a: "Our calculator uses the latest generic scorecard codes. Scores are indicative estimates only and may differ from official verification results depending on your sector and specific circumstances." },
  { q: "Can I use BEEcompass as an official certificate?", a: "No. Reports generated by BEEcompass are internal planning documents only and have no legal standing as official B-BBEE certificates." },
];

/* ─── Small shared components ──────────────────────────────── */
const ScoreRing = ({ score, size = 130, stroke = 10 }) => {
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const pct = Math.min(score / 115, 1);
  const offset = circ * (1 - pct);
  const level = score >= 100 ? 1 : score >= 85 ? 2 : score >= 75 ? 3 : score >= 65 ? 4 : "NC";
  const colors = { 1: "#1F6B40", 2: "#2D8A55", 3: "#BF8C3A", 4: "#E07B39", NC: "#B03020" };
  const color = colors[level];
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#F0EFEB" strokeWidth={stroke} />
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color}
          strokeWidth={stroke} strokeLinecap="round"
          strokeDasharray={circ} strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 1s cubic-bezier(.4,0,.2,1)" }}
        />
      </svg>
      <div style={{ marginTop: -size * 0.72, textAlign: "center", pointerEvents: "none" }}>
        <div style={{ fontFamily: "var(--font-d)", fontSize: size * 0.28, fontWeight: 700, color: "var(--navy)", lineHeight: 1 }}>{score}</div>
        <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 2 }}>/ 115 pts</div>
      </div>
      <div style={{ marginTop: 56 }} />
    </div>
  );
};

const ProgBar = ({ pct, variant }) => {
  const cls = pct >= 70 ? "good" : pct >= 45 ? "" : "low";
  return (
    <div className="prog-wrap">
      <div className={`prog-fill ${cls}`} style={{ width: `${pct}%` }} />
    </div>
  );
};

/* ─── Landing Page ──────────────────────────────────────────── */
const LandingPage = ({ onAuth }) => {
  const [openFaq, setOpenFaq] = useState(null);
  return (
    <div className="land">
      {/* Nav */}
      <nav className="land-nav">
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div className="al-logo-mark" style={{ width: 30, height: 30, fontSize: 15 }}>B</div>
          <span style={{ fontFamily: "var(--font-d)", fontSize: 18, fontWeight: 700 }}>
            <span style={{ color: "var(--navy)" }}>BEE</span>
            <span style={{ color: "var(--gold)" }}>compass</span>
          </span>
        </div>
        <div className="land-nav-links">
          {["Features", "How It Works", "Pricing", "About BEE"].map(l => (
            <button key={l} className="land-nav-link">{l}</button>
          ))}
        </div>
        <div className="land-nav-actions">
          <button className="btn btn-ghost" onClick={() => onAuth("signin")}>Sign In</button>
          <button className="btn btn-primary" onClick={() => onAuth("signup")}>Start Free →</button>
        </div>
      </nav>

      {/* Hero */}
      <section>
        <div className="land-hero">
          <div>
            <div className="hero-eyebrow">🇿🇦 South African Compliance Tool</div>
            <h1 className="hero-h">
              Know your <span>B-BBEE score</span> before the verifier does
            </h1>
            <p className="hero-p">
              BEEcompass gives SMEs a clear, actionable picture of their B-BBEE standing — so you walk into verification fully prepared, not guessing.
            </p>
            <div className="hero-cta">
              <button className="btn btn-primary btn-lg" onClick={() => onAuth("signup")}>Start Free — No card needed</button>
              <button className="btn btn-outline btn-lg" onClick={() => onAuth("signin")}>Sign In</button>
            </div>
            <div className="hero-trust">
              <span>POPIA compliant</span>
              <div className="trust-dot" />
              <span>Pre-readiness only</span>
              <div className="trust-dot" />
              <span>Not a verification body</span>
            </div>
          </div>

          <div className="hero-visual fade">
            <div className="hv-score-ring">
              <div className="hv-score-inner">
                <div className="hv-score-num">72</div>
                <div className="hv-score-label">Level 3 · QSE</div>
              </div>
            </div>
            <div className="hv-pillars">
              {[
                ["Ownership", 72],
                ["Management Control", 58],
                ["Skills Development", 75],
                ["Enterprise & Supplier Dev", 55],
                ["Socio-Economic Dev", 80],
              ].map(([n, p]) => (
                <div key={n} className="hv-pillar">
                  <div className="hv-pillar-name">{n}</div>
                  <div className="hv-pillar-bar">
                    <div className="hv-pillar-fill" style={{ width: `${p}%` }} />
                  </div>
                  <div className="hv-pillar-pct">{p}%</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Stats bar */}
      <div style={{ background: "var(--navy)", padding: "28px 40px" }}>
        <div style={{ maxWidth: 1160, margin: "0 auto", display: "flex", justifyContent: "space-around", flexWrap: "wrap", gap: 24 }}>
          {[["5 pillars", "Analysed in detail"], ["25 questions", "Structured questionnaire"], ["8 real verifiers", "SA marketplace"], ["POPIA", "Compliant & secure"]].map(([v, l]) => (
            <div key={v} style={{ textAlign: "center" }}>
              <div style={{ fontFamily: "var(--font-d)", fontSize: 24, fontWeight: 700, color: "var(--gold)", marginBottom: 3 }}>{v}</div>
              <div style={{ fontSize: 12.5, color: "rgba(255,255,255,.45)" }}>{l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Features */}
      <section className="land-section alt">
        <div className="sec-header">
          <div className="sec-eye">What BEEcompass does</div>
          <h2 className="sec-h">Everything you need to prepare for verification</h2>
          <p className="sec-p">From questionnaire to gap analysis — we guide you through the entire pre-readiness process.</p>
        </div>
        <div className="feat-grid">
          {[
            ["📊", "Live Score Calculator", "Input your data field by field. See your score update in real time across all 5 pillars."],
            ["🎯", "Gap Analysis", "Pinpoint exactly what's holding your score back and get priority actions per pillar."],
            ["🔄", "Scenario Planner", "Model future improvements with live sliders. See what it takes to move to the next level."],
            ["🤖", "BeeBot AI Assistant", "Ask any B-BBEE question in plain language. Claude-powered, BEE-topics only."],
            ["📁", "Document Vault", "Upload and organise your supporting documents with AI-assisted type detection."],
            ["🏢", "Verifier Marketplace", "Browse and book from 8 real SANAS-accredited verification agencies across SA."],
            ["📄", "Pre-Readiness Report", "Generate a professional PDF summary ready to share with your verifier."],
            ["📚", "BEE Knowledge Base", "Understand the codes with plain-language explanations of every element."],
          ].map(([icon, title, desc]) => (
            <div key={title} className="feat-card fade">
              <div className="feat-icon">{icon}</div>
              <div className="feat-title">{title}</div>
              <div className="feat-desc">{desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="land-section">
        <div className="sec-header">
          <div className="sec-eye">How it works</div>
          <h2 className="sec-h">Prepared in 3 steps</h2>
        </div>
        <div style={{ maxWidth: 800, margin: "0 auto", display: "flex", flexDirection: "column", gap: 0 }}>
          {[
            ["01", "Complete the questionnaire", "Answer 25 structured questions about your business. Takes about 15 minutes."],
            ["02", "Review your score & gaps", "See your estimated B-BBEE level, pillar breakdown, and priority improvement areas."],
            ["03", "Book a verified agency", "When you're ready, connect with a SANAS-accredited verifier from our marketplace."],
          ].map(([num, title, desc], i) => (
            <div key={num} style={{ display: "flex", gap: 24, padding: "24px 0", borderBottom: i < 2 ? "1px solid var(--border)" : "none" }}>
              <div style={{ fontFamily: "var(--font-d)", fontSize: 40, fontWeight: 700, color: "var(--gold-pale)", lineHeight: 1, flexShrink: 0, width: 56 }}>{num}</div>
              <div>
                <div style={{ fontFamily: "var(--font-d)", fontSize: 19, fontWeight: 600, color: "var(--navy)", marginBottom: 6 }}>{title}</div>
                <div style={{ fontSize: 14.5, color: "var(--text-mid)", lineHeight: 1.7 }}>{desc}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section className="land-section alt">
        <div className="sec-header">
          <div className="sec-eye">Simple pricing</div>
          <h2 className="sec-h">No hidden costs. No surprises.</h2>
        </div>
        <div className="price-grid">
          {[
            { plan: "Free", price: "R0", per: "forever", featured: false,
              feats: [["Dashboard & score estimate", true], ["25-question questionnaire", true], ["Gap analysis summary", true], ["Pre-readiness report PDF", false], ["Scenario planner", false], ["Document vault", false]] },
            { plan: "Report", price: "R299", per: "once-off", featured: false,
              feats: [["Everything in Free", true], ["Full pre-readiness report PDF", true], ["Verifier marketplace access", true], ["Scenario planner", false], ["Document vault (1 GB)", false]] },
            { plan: "Annual", price: "R1,299", per: "per year", featured: true,
              feats: [["Everything in Report", true], ["Unlimited PDF reports", true], ["Scenario planner", true], ["Document vault (10 GB)", true], ["Priority BeeBot support", true]] },
            { plan: "Enterprise", price: "Custom", per: "contact us", featured: false,
              feats: [["Multi-company dashboard", true], ["White-label reports", true], ["API access", true], ["Dedicated account manager", true], ["Custom integrations", true]] },
          ].map(({ plan, price, per, featured, feats }) => (
            <div key={plan} className={`price-card${featured ? " feat" : ""}`}>
              {featured && <div className="price-badge">Most Popular</div>}
              <div className="price-plan">{plan}</div>
              <div className="price-val">{price !== "Custom" ? <><span>R</span>{price.replace("R","")}</> : "Custom"}</div>
              <div className="price-per">{per}</div>
              <ul className="price-feats">
                {feats.map(([f, y]) => (
                  <li key={f}>
                    <span className={y ? "pf-y" : "pf-n"}>{y ? "✓" : "–"}</span>
                    <span style={{ color: y ? "var(--text-mid)" : "var(--muted)" }}>{f}</span>
                  </li>
                ))}
              </ul>
              <button
                className={`btn btn-full ${featured ? "btn-primary" : "btn-outline"}`}
                onClick={() => onAuth("signup")}
              >
                {plan === "Enterprise" ? "Contact Us" : "Get Started"}
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="land-section">
        <div className="sec-header">
          <div className="sec-eye">Common questions</div>
          <h2 className="sec-h">Frequently Asked Questions</h2>
        </div>
        <div style={{ maxWidth: 680, margin: "0 auto", display: "flex", flexDirection: "column", gap: 0 }}>
          {FAQS.map((faq, i) => (
            <div key={i} style={{ borderBottom: "1px solid var(--border)" }}>
              <button
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                style={{
                  width: "100%", textAlign: "left", background: "none", border: "none",
                  padding: "18px 0", cursor: "pointer", display: "flex",
                  justifyContent: "space-between", alignItems: "center", gap: 16
                }}
              >
                <span style={{ fontWeight: 500, color: "var(--navy)", fontSize: 15 }}>{faq.q}</span>
                <span style={{ color: "var(--muted)", fontSize: 20, flexShrink: 0, lineHeight: 1 }}>{openFaq === i ? "−" : "+"}</span>
              </button>
              {openFaq === i && (
                <div style={{ paddingBottom: 18, fontSize: 14, color: "var(--text-mid)", lineHeight: 1.7 }}>{faq.a}</div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* CTA Banner */}
      <div style={{ background: "var(--navy)", padding: "64px 40px", textAlign: "center" }}>
        <div style={{ fontFamily: "var(--font-d)", fontSize: "clamp(26px,3vw,36px)", fontWeight: 700, color: "var(--white)", marginBottom: 14 }}>
          Ready to know where you stand?
        </div>
        <p style={{ fontSize: 15.5, color: "rgba(255,255,255,.55)", marginBottom: 28, maxWidth: 480, margin: "0 auto 28px" }}>
          Create a free account and complete your first score estimate in under 20 minutes.
        </p>
        <button className="btn btn-primary btn-lg" onClick={() => onAuth("signup")}>Start Free →</button>
      </div>

      {/* Footer */}
      <footer className="land-footer">
        <div className="land-footer-logo">
          <span style={{ color: "var(--white)" }}>BEE</span>
          <span style={{ color: "var(--gold)" }}>compass</span>
        </div>
        <p>
          BEEcompass is a pre-readiness planning tool. It is not a SANAS-accredited verification body<br />
          and does not issue official B-BBEE certificates. All scores are indicative estimates only.<br />
          <br />
          © {new Date().getFullYear()} BEEcompass · POPIA Compliant · South Africa
        </p>
      </footer>
    </div>
  );
};

/* ─── Auth Page ─────────────────────────────────────────────── */
const AuthPage = ({ initialTab = "signup", onSuccess, onBack }) => {
  const [tab, setTab] = useState(initialTab);
  const [form, setForm] = useState({ name: "", company: "", email: "", password: "" });
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async () => {
    setErr(""); setLoading(true);
    if (tab === "signup" && (!form.name || !form.company || !form.email || !form.password)) {
      setErr("Please fill in all fields."); setLoading(false); return;
    }
    if (tab === "signin" && (!form.email || !form.password)) {
      setErr("Please enter your email and password."); setLoading(false); return;
    }
    try {
      const endpoint = tab === "signup" ? "/auth/register" : "/auth/login";
      const body = tab === "signup"
        ? { name: form.name, company: form.company, email: form.email, password: form.password }
        : { email: form.email, password: form.password };

      const res = await fetch(`${API_URL}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const text = await res.text();
      let data;
      try { data = JSON.parse(text); }
      catch { throw new Error("Server error — please try again shortly."); }

      if (!res.ok) throw new Error(data?.error || data?.message || "Something went wrong.");
      onSuccess(data);
    } catch (e) {
      setErr(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      {/* Left panel */}
      <div className="auth-left">
        <div className="al-logo">
          <div className="al-logo-mark">B</div>
          <span className="al-logo-text">
            <span className="al-bee">BEE</span>
            <span className="al-compass">compass</span>
          </span>
        </div>

        <div className="al-tagline">
          <h2>Know your B-BBEE<br /><span>before verification day.</span></h2>
          <p>South Africa's pre-readiness planning platform for growth-stage businesses.</p>
          <ul className="al-points">
            {["Live score estimate across 5 pillars", "AI-powered gap analysis and action plan", "Connect with SANAS-accredited verifiers", "Secure document vault and report generator"].map(p => (
              <li key={p}><div className="al-dot" />{p}</li>
            ))}
          </ul>
        </div>

        <div className="al-disclaimer">
          BEEcompass is a pre-readiness planning tool — not a verification body. All scores are estimates only and cannot be used as official B-BBEE certificates. POPIA compliant.
        </div>
      </div>

      {/* Right panel */}
      <div className="auth-right">
        <div className="auth-box fade">
          {/* Mobile logo */}
          <div style={{ display: "none", marginBottom: 28 }} className="mobile-auth-logo">
            <span style={{ fontFamily: "var(--font-d)", fontSize: 22, fontWeight: 700 }}>
              <span style={{ color: "var(--navy)" }}>BEE</span>
              <span style={{ color: "var(--gold)" }}>compass</span>
            </span>
          </div>

          <div className="auth-tabs">
            <button className={`auth-tab ${tab === "signup" ? "active" : ""}`} onClick={() => { setTab("signup"); setErr(""); }}>
              Create Account
            </button>
            <button className={`auth-tab ${tab === "signin" ? "active" : ""}`} onClick={() => { setTab("signin"); setErr(""); }}>
              Sign In
            </button>
          </div>

          <div className="auth-box-h">{tab === "signup" ? "Get started free" : "Welcome back"}</div>
          <div className="auth-box-sub">
            {tab === "signup" ? "No credit card required." : "Sign in to your BEEcompass account."}
          </div>

          {tab === "signup" && (
            <>
              <div className="form-group fade fade-1">
                <label className="form-label">Full Name</label>
                <input className="form-input" placeholder="Jane Smith" value={form.name} onChange={set("name")} />
              </div>
              <div className="form-group fade fade-2">
                <label className="form-label">Company Name</label>
                <input className="form-input" placeholder="Acme (Pty) Ltd" value={form.company} onChange={set("company")} />
              </div>
            </>
          )}

          <div className="form-group fade fade-3">
            <label className="form-label">Email Address</label>
            <input className="form-input" type="email" placeholder="you@company.co.za" value={form.email} onChange={set("email")} />
          </div>

          <div className="form-group fade fade-4">
            <label className="form-label">Password</label>
            <input className="form-input" type="password" placeholder={tab === "signup" ? "Min. 8 characters" : "Your password"} value={form.password} onChange={set("password")} />
          </div>

          {err && (
            <div className="error-box" style={{ marginBottom: 14 }}>
              <span>⚠️</span>
              <span>{err}</span>
            </div>
          )}

          <button className="btn btn-primary btn-full btn-lg" onClick={submit} disabled={loading} style={{ marginTop: 4 }}>
            {loading ? <><div className="spinner" />{tab === "signup" ? "Creating account…" : "Signing in…"}</> : tab === "signup" ? "Create Account →" : "Sign In →"}
          </button>

          <div className="divider-text" style={{ marginTop: 20 }}>or</div>

          <button className="btn btn-ghost btn-full" onClick={onBack} style={{ fontSize: 13, color: "var(--muted)" }}>
            ← Back to homepage
          </button>

          {tab === "signup" && (
            <p style={{ fontSize: 11.5, color: "var(--muted)", textAlign: "center", marginTop: 16, lineHeight: 1.6 }}>
              By creating an account you agree to our Terms of Service and Privacy Policy. POPIA compliant.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

/* ─── App Shell ─────────────────────────────────────────────── */
const NAV_ITEMS = [
  { id: "dashboard", icon: "📊", label: "Dashboard" },
  { id: "questionnaire", icon: "📝", label: "Questionnaire" },
  { id: "calculator", icon: "🧮", label: "Calculator" },
  { id: "gap", icon: "🎯", label: "Gap Analysis" },
  { id: "scenario", icon: "🔄", label: "Scenario Planner" },
  { id: "vault", icon: "📁", label: "Document Vault" },
  { id: "beebot", icon: "🤖", label: "BeeBot" },
  { id: "marketplace", icon: "🏢", label: "Verifiers" },
  { id: "report", icon: "📄", label: "Report" },
  { id: "beeinfo", icon: "📚", label: "BEE Info" },
];

const MOBILE_NAV = [
  { id: "dashboard", icon: "📊", label: "Home" },
  { id: "calculator", icon: "🧮", label: "Score" },
  { id: "beebot", icon: "🤖", label: "BeeBot" },
  { id: "marketplace", icon: "🏢", label: "Verifiers" },
  { id: "vault", icon: "📁", label: "Vault" },
];

const AppShell = ({ user, onLogout }) => {
  const [view, setView] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const go = (v) => { setView(v); setSidebarOpen(false); };
  const title = NAV_ITEMS.find(n => n.id === view)?.label || "Dashboard";

  const initials = (user?.name || user?.email || "U").split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2);

  return (
    <div className="shell">
      {/* Overlay */}
      <div className={`overlay${sidebarOpen ? " open" : ""}`} onClick={() => setSidebarOpen(false)} />

      {/* Sidebar */}
      <aside className={`sidebar${sidebarOpen ? " open" : ""}`}>
        <div className="sb-logo">
          <div className="sb-logo-mark">B</div>
          <div className="sb-logo-text">
            <span className="sb-logo-bee">BEE</span>
            <span className="sb-logo-compass">compass</span>
          </div>
        </div>

        <nav className="sb-nav">
          <div className="sb-label">Main</div>
          {NAV_ITEMS.slice(0, 4).map(n => (
            <button key={n.id} className={`sb-item${view === n.id ? " active" : ""}`} onClick={() => go(n.id)}>
              <span className="si-icon">{n.icon}</span>{n.label}
            </button>
          ))}
          <div className="sb-label">Tools</div>
          {NAV_ITEMS.slice(4, 8).map(n => (
            <button key={n.id} className={`sb-item${view === n.id ? " active" : ""}`} onClick={() => go(n.id)}>
              <span className="si-icon">{n.icon}</span>{n.label}
            </button>
          ))}
          <div className="sb-label">Reports</div>
          {NAV_ITEMS.slice(8).map(n => (
            <button key={n.id} className={`sb-item${view === n.id ? " active" : ""}`} onClick={() => go(n.id)}>
              <span className="si-icon">{n.icon}</span>{n.label}
            </button>
          ))}
        </nav>

        <div className="sb-footer">
          <div className="sb-user" onClick={onLogout} title="Sign out">
            <div className="sb-avatar">{initials}</div>
            <div className="sb-user-info">
              <div className="sb-user-name">{user?.name || user?.email || "User"}</div>
              <div className="sb-user-role">Sign out</div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main */}
      <div className="main">
        {/* Topbar */}
        <header className="topbar">
          <div className="topbar-left">
            <button className="hamburger" onClick={() => setSidebarOpen(!sidebarOpen)}>☰</button>
            <div className="topbar-title">{title}</div>
          </div>
          <div className="topbar-right">
            <div className="icon-btn" title="Notifications">🔔</div>
            <div className="icon-btn" onClick={onLogout} title="Sign out" style={{ fontSize: 13, fontWeight: 600 }}>
              {initials}
            </div>
          </div>
        </header>

        {/* Screen */}
        <div style={{ flex: 1 }}>
          {view === "dashboard" && <DashboardScreen />}
          {view === "questionnaire" && <QuestionnaireScreen />}
          {view === "calculator" && <CalculatorScreen />}
          {view === "gap" && <GapScreen />}
          {view === "scenario" && <ScenarioScreen />}
          {view === "vault" && <VaultScreen />}
          {view === "beebot" && <BeeBotScreen user={user} />}
          {view === "marketplace" && <MarketplaceScreen />}
          {view === "report" && <ReportScreen user={user} />}
          {view === "beeinfo" && <BeeInfoScreen />}
        </div>
      </div>

      {/* Mobile bottom nav */}
      <nav className="mobile-nav">
        <div className="mobile-nav-inner">
          {MOBILE_NAV.map(n => (
            <button key={n.id} className={`mn-item${view === n.id ? " active" : ""}`} onClick={() => go(n.id)}>
              <span className="mn-icon">{n.icon}</span>
              {n.label}
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
};

/* ─── Dashboard Screen ──────────────────────────────────────── */
const DashboardScreen = () => {
  const totalScore = PILLARS.reduce((a, p) => a + p.score, 0);
  const level = totalScore >= 100 ? "Level 1" : totalScore >= 85 ? "Level 2" : totalScore >= 75 ? "Level 3" : totalScore >= 65 ? "Level 4" : "Non-compliant";
  const levelClass = totalScore >= 100 ? "level-1" : totalScore >= 85 ? "level-2" : totalScore >= 75 ? "level-3" : totalScore >= 65 ? "level-4" : "level-nc";

  return (
    <div className="page fade">
      <div className="page-header">
        <div className="page-title">Dashboard</div>
        <div className="page-sub">Your B-BBEE pre-readiness overview · Estimates only — not an official certificate</div>
      </div>

      {/* Stats */}
      <div className="stat-grid">
        <div className="stat-card fade fade-1">
          <div className="stat-label">Estimated Score</div>
          <div className="stat-value">{totalScore}</div>
          <div className="stat-change">out of 115 possible points</div>
        </div>
        <div className="stat-card fade fade-2">
          <div className="stat-label">Estimated Level</div>
          <div className="stat-value" style={{ fontSize: 22 }}>
            <span className={levelClass}>{level}</span>
          </div>
          <div className="stat-change">Generic scorecard · QSE</div>
        </div>
        <div className="stat-card fade fade-3">
          <div className="stat-label">Pillars Complete</div>
          <div className="stat-value">3<span style={{ fontSize: 16, fontWeight: 400, color: "var(--muted)" }}>/5</span></div>
          <div className="stat-change">2 need more data</div>
        </div>
        <div className="stat-card fade fade-4">
          <div className="stat-label">Documents Uploaded</div>
          <div className="stat-value">7</div>
          <div className="stat-change stat-up">↑ 3 this week</div>
        </div>
      </div>

      <div className="dash-grid">
        {/* Pillar breakdown */}
        <div className="card fade fade-1">
          <div className="card-title">Pillar Breakdown</div>
          <div className="card-sub">Score per element against maximum available points</div>
          <div className="pillar-list">
            {PILLARS.map(p => (
              <div key={p.name} className="pillar-row">
                <div className="pillar-name">{p.name}</div>
                <div className="pillar-bar-wrap">
                  <ProgBar pct={p.pct} />
                </div>
                <div className="pillar-score">{p.score}<span className="pillar-max">/{p.max}</span></div>
              </div>
            ))}
          </div>
        </div>

        {/* Right col */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {/* Score ring */}
          <div className="card fade fade-2" style={{ textAlign: "center" }}>
            <div className="card-title">Overall Score</div>
            <div className="card-sub">Estimated — pre-readiness only</div>
            <div className="score-ring">
              <ScoreRing score={totalScore} size={140} stroke={11} />
            </div>
            <div style={{ marginTop: -44 }}>
              <span className={`level-badge ${levelClass}`}>{level}</span>
            </div>
          </div>

          {/* Quick actions */}
          <div className="card fade fade-3">
            <div className="card-title">Quick Actions</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 14 }}>
              {[["📝", "Complete questionnaire", "btn-navy"], ["🎯", "View gap analysis", "btn-outline"], ["📄", "Generate report", "btn-outline"]].map(([icon, label, cls]) => (
                <button key={label} className={`btn ${cls} btn-full btn-sm`}>
                  {icon} {label}
                </button>
              ))}
            </div>
          </div>

          {/* Disclaimer */}
          <div style={{ background: "var(--warn-bg)", border: "1px solid rgba(155,90,0,.18)", borderRadius: "var(--r-sm)", padding: "12px 14px", fontSize: 12, color: "var(--warn)", lineHeight: 1.6 }}>
            ⚠️ <strong>Estimate only.</strong> This score is for planning purposes and is not an official B-BBEE certificate. Only SANAS-accredited verifiers can issue certificates.
          </div>
        </div>
      </div>
    </div>
  );
};

/* ─── Questionnaire Screen ──────────────────────────────────── */
const QUESTIONS = [
  { id: 1, pillar: "Ownership", q: "What percentage of your company is owned by Black persons?", type: "number", unit: "%" },
  { id: 2, pillar: "Ownership", q: "What percentage is owned by Black women?", type: "number", unit: "%" },
  { id: 3, pillar: "Ownership", q: "What percentage is owned by Black youth (under 35)?", type: "number", unit: "%" },
  { id: 4, pillar: "Management Control", q: "What percentage of your board members are Black?", type: "number", unit: "%" },
  { id: 5, pillar: "Management Control", q: "What percentage of senior management are Black?", type: "number", unit: "%" },
  { id: 6, pillar: "Skills Development", q: "What did you spend on Black employee training last year?", type: "number", unit: "R" },
  { id: 7, pillar: "Skills Development", q: "How many Black employees received formal training?", type: "number", unit: "people" },
  { id: 8, pillar: "Enterprise Dev", q: "Do you have any Qualifying Small Enterprise suppliers?", type: "select", opts: ["Yes","No","Unsure"] },
  { id: 9, pillar: "Enterprise Dev", q: "What % of your total procurement spend is with Black-owned suppliers?", type: "number", unit: "%" },
  { id: 10, pillar: "Socio-Economic Dev", q: "Did you make any CSI contributions in the last financial year?", type: "select", opts: ["Yes — above 1% NP", "Yes — below 1% NP", "No"] },
];

const QuestionnaireScreen = () => {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const current = QUESTIONS[step];
  const progress = Math.round(((step) / QUESTIONS.length) * 100);

  return (
    <div className="page fade">
      <div className="page-header">
        <div className="page-title">Questionnaire</div>
        <div className="page-sub">Answer {QUESTIONS.length} questions to estimate your B-BBEE score</div>
      </div>

      <div style={{ maxWidth: 640 }}>
        {/* Progress */}
        <div className="card" style={{ marginBottom: 18 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
            <div style={{ fontSize: 13, fontWeight: 500, color: "var(--text-mid)" }}>
              Question {step + 1} of {QUESTIONS.length}
            </div>
            <div style={{ fontSize: 12, color: "var(--muted)" }}>{progress}% complete</div>
          </div>
          <ProgBar pct={progress} />
          <div style={{ marginTop: 8, display: "flex", flexWrap: "wrap", gap: 4 }}>
            {QUESTIONS.map((q, i) => (
              <div key={q.id} style={{
                width: 8, height: 8, borderRadius: "50%",
                background: i < step ? "var(--gold)" : i === step ? "var(--navy)" : "var(--border)",
                cursor: "pointer", transition: "background var(--t)"
              }} onClick={() => setStep(i)} />
            ))}
          </div>
        </div>

        {/* Question */}
        <div className="card fade">
          <div style={{ marginBottom: 6 }}>
            <span className="badge badge-gold">{current.pillar}</span>
          </div>
          <div style={{ fontFamily: "var(--font-d)", fontSize: 19, fontWeight: 600, color: "var(--navy)", margin: "14px 0 22px", lineHeight: 1.4 }}>
            {current.q}
          </div>

          {current.type === "number" && (
            <div className="form-group">
              <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                <input
                  className="form-input"
                  type="number"
                  placeholder={`Enter ${current.unit === "R" ? "amount in Rands" : `value in ${current.unit}`}`}
                  value={answers[current.id] || ""}
                  onChange={e => setAnswers(a => ({ ...a, [current.id]: e.target.value }))}
                  style={{ flex: 1 }}
                />
                {current.unit !== "R" && (
                  <div style={{ padding: "11px 14px", background: "var(--bg)", border: "1px solid var(--border)", borderRadius: "var(--r-sm)", fontSize: 14, color: "var(--muted)", flexShrink: 0 }}>
                    {current.unit}
                  </div>
                )}
              </div>
              <div className="form-hint">Leave blank if not applicable.</div>
            </div>
          )}

          {current.type === "select" && (
            <div className="form-group">
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {current.opts.map(opt => (
                  <label key={opt} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 14px", border: `1.5px solid ${answers[current.id] === opt ? "var(--gold)" : "var(--border)"}`, borderRadius: "var(--r-sm)", cursor: "pointer", background: answers[current.id] === opt ? "var(--gold-pale)" : "var(--bg)", transition: "all var(--t)" }}>
                    <input type="radio" name={`q${current.id}`} value={opt} checked={answers[current.id] === opt} onChange={() => setAnswers(a => ({ ...a, [current.id]: opt }))} style={{ accentColor: "var(--gold)" }} />
                    <span style={{ fontSize: 14, color: "var(--text)" }}>{opt}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          <div style={{ display: "flex", gap: 10, marginTop: 24 }}>
            <button className="btn btn-outline" onClick={() => setStep(s => Math.max(0, s - 1))} disabled={step === 0}>← Previous</button>
            <button className="btn btn-primary" style={{ marginLeft: "auto" }} onClick={() => {
              if (step < QUESTIONS.length - 1) setStep(s => s + 1);
            }}>
              {step === QUESTIONS.length - 1 ? "Finish →" : "Next →"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ─── Calculator Screen ─────────────────────────────────────── */
const CalculatorScreen = () => {
  const [scores, setScores] = useState({ ownership: 18, management: 11, skills: 15, enterprise: 22, sed: 4 });
  const total = Object.values(scores).reduce((a, b) => a + b, 0);
  const level = total >= 100 ? "Level 1" : total >= 85 ? "Level 2" : total >= 75 ? "Level 3" : total >= 65 ? "Level 4" : "Non-compliant";
  const levelClass = total >= 100 ? "level-1" : total >= 85 ? "level-2" : total >= 75 ? "level-3" : total >= 65 ? "level-4" : "level-nc";

  const fields = [
    { key: "ownership", label: "Ownership", max: 25 },
    { key: "management", label: "Management Control", max: 19 },
    { key: "skills", label: "Skills Development", max: 20 },
    { key: "enterprise", label: "Enterprise & Supplier Dev", max: 40 },
    { key: "sed", label: "Socio-Economic Dev", max: 5 },
  ];

  return (
    <div className="page fade">
      <div className="page-header">
        <div className="page-title">Score Calculator</div>
        <div className="page-sub">Adjust scores per pillar to see your estimated B-BBEE level</div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 20, alignItems: "start" }}>
        <div className="card">
          <div className="card-title">Scorecard Entry</div>
          <div className="card-sub">Enter your points scored per element. Maximum points shown per pillar.</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
            {fields.map(f => (
              <div key={f.key} style={{ display: "flex", alignItems: "center", gap: 14, padding: "16px 0", borderBottom: "1px solid var(--bg)" }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13.5, fontWeight: 500, color: "var(--navy)", marginBottom: 6 }}>{f.label}</div>
                  <ProgBar pct={Math.round((scores[f.key] / f.max) * 100)} />
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
                  <input
                    type="number"
                    min={0} max={f.max}
                    value={scores[f.key]}
                    onChange={e => setScores(s => ({ ...s, [f.key]: Math.min(f.max, Math.max(0, Number(e.target.value))) }))}
                    style={{ width: 56, padding: "7px 10px", border: "1.5px solid var(--border)", borderRadius: "var(--r-sm)", fontSize: 14, fontWeight: 600, textAlign: "center", outline: "none" }}
                  />
                  <span style={{ fontSize: 12, color: "var(--muted)" }}>/ {f.max}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ width: 220, display: "flex", flexDirection: "column", gap: 14 }}>
          <div className="card" style={{ textAlign: "center" }}>
            <div className="card-sub" style={{ marginBottom: 12 }}>Total Score</div>
            <div style={{ fontFamily: "var(--font-d)", fontSize: 52, fontWeight: 700, color: "var(--navy)", lineHeight: 1 }}>{total}</div>
            <div style={{ fontSize: 12, color: "var(--muted)", marginBottom: 16 }}>out of 109 pts</div>
            <span className={`level-badge ${levelClass}`}>{level}</span>
          </div>
          <div className="card">
            <div style={{ fontSize: 12, color: "var(--muted)", marginBottom: 8 }}>Points to next level</div>
            {total < 100 && (
              <div style={{ fontSize: 24, fontFamily: "var(--font-d)", fontWeight: 700, color: "var(--navy)" }}>
                {total < 65 ? 65 - total : total < 75 ? 75 - total : total < 85 ? 85 - total : 100 - total} pts
              </div>
            )}
            {total >= 100 && <div style={{ fontSize: 14, color: "var(--success)" }}>✓ Maximum level achieved</div>}
          </div>
        </div>
      </div>
    </div>
  );
};

/* ─── Gap Analysis Screen ───────────────────────────────────── */
const GapScreen = () => {
  const gaps = [
    { pillar: "Enterprise & Supplier Dev", pct: 55, priority: "High", actions: ["Increase spend with Black-owned suppliers to 40%+ of procurement", "Develop at least 1 enterprise development beneficiary", "Document all preferential procurement with supporting invoices"] },
    { pillar: "Management Control", pct: 58, priority: "High", actions: ["Appoint at least 1 additional Black board member", "Set targets for Black senior management representation"] },
    { pillar: "Ownership", pct: 72, priority: "Medium", actions: ["Review ESOP structure for Black female beneficiaries", "Ensure shareholding agreements are correctly structured"] },
    { pillar: "Skills Development", pct: 75, priority: "Low", actions: ["Increase training budget allocation by 0.5% of payroll", "Register additional learners on SETA programmes"] },
    { pillar: "Socio-Economic Dev", pct: 80, priority: "Low", actions: ["Maintain current SED contribution levels"] },
  ];

  return (
    <div className="page fade">
      <div className="page-header">
        <div className="page-title">Gap Analysis</div>
        <div className="page-sub">Priority actions to improve your B-BBEE score per pillar</div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {gaps.map((g, i) => (
          <div key={g.pillar} className={`card fade fade-${i + 1}`}>
            <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 14, flexWrap: "wrap" }}>
              <div style={{ flex: 1 }}>
                <div className="card-title">{g.pillar}</div>
              </div>
              <span className={`badge ${g.priority === "High" ? "badge-red" : g.priority === "Medium" ? "badge-gold" : "badge-green"}`}>
                {g.priority} Priority
              </span>
              <span className="badge badge-navy">{g.pct}% achieved</span>
            </div>
            <ProgBar pct={g.pct} />
            <div style={{ marginTop: 14, display: "flex", flexDirection: "column", gap: 8 }}>
              {g.actions.map((a, j) => (
                <div key={j} style={{ display: "flex", gap: 10, alignItems: "flex-start", padding: "9px 12px", background: "var(--bg)", borderRadius: "var(--r-sm)", fontSize: 13.5 }}>
                  <span style={{ color: "var(--gold)", flexShrink: 0, marginTop: 1 }}>→</span>
                  <span style={{ color: "var(--text-mid)", lineHeight: 1.5 }}>{a}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

/* ─── Scenario Planner ──────────────────────────────────────── */
const ScenarioScreen = () => {
  const [vals, setVals] = useState({ ownership: 18, management: 11, skills: 15, enterprise: 22, sed: 4 });
  const maxes = { ownership: 25, management: 19, skills: 20, enterprise: 40, sed: 5 };
  const total = Object.values(vals).reduce((a, b) => a + b, 0);
  const level = total >= 100 ? "Level 1" : total >= 85 ? "Level 2" : total >= 75 ? "Level 3" : total >= 65 ? "Level 4" : "Non-compliant";
  const levelClass = total >= 100 ? "level-1" : total >= 85 ? "level-2" : total >= 75 ? "level-3" : total >= 65 ? "level-4" : "level-nc";

  return (
    <div className="page fade">
      <div className="page-header">
        <div className="page-title">Scenario Planner</div>
        <div className="page-sub">Slide each pillar to model future improvements</div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 20, alignItems: "start" }}>
        <div className="card">
          {Object.entries(vals).map(([key, val]) => (
            <div key={key} style={{ padding: "16px 0", borderBottom: "1px solid var(--bg)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                <div style={{ fontSize: 13.5, fontWeight: 500, color: "var(--navy)", textTransform: "capitalize" }}>
                  {key === "sed" ? "Socio-Economic Dev" : key.charAt(0).toUpperCase() + key.slice(1)}
                </div>
                <div style={{ fontFamily: "var(--font-d)", fontSize: 17, fontWeight: 700, color: "var(--navy)" }}>
                  {val} <span style={{ fontSize: 12, fontWeight: 400, color: "var(--muted)" }}>/ {maxes[key]}</span>
                </div>
              </div>
              <input
                type="range" min={0} max={maxes[key]} value={val}
                onChange={e => setVals(v => ({ ...v, [key]: Number(e.target.value) }))}
                style={{ width: "100%", accentColor: "var(--gold)" }}
              />
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "var(--muted)", marginTop: 3 }}>
                <span>0</span><span>{maxes[key]}</span>
              </div>
            </div>
          ))}
        </div>

        <div style={{ width: 200, display: "flex", flexDirection: "column", gap: 14 }}>
          <div className="card" style={{ textAlign: "center" }}>
            <div className="card-sub" style={{ marginBottom: 10 }}>Projected Score</div>
            <div style={{ fontFamily: "var(--font-d)", fontSize: 48, fontWeight: 700, color: "var(--navy)", lineHeight: 1 }}>{total}</div>
            <div style={{ fontSize: 11, color: "var(--muted)", marginBottom: 14 }}>/ 109 pts</div>
            <span className={`level-badge ${levelClass}`}>{level}</span>
          </div>
          <button className="btn btn-outline btn-full btn-sm" onClick={() => setVals({ ownership: 18, management: 11, skills: 15, enterprise: 22, sed: 4 })}>
            ↺ Reset to current
          </button>
        </div>
      </div>
    </div>
  );
};

/* ─── Document Vault ────────────────────────────────────────── */
const VaultScreen = () => {
  const [docs, setDocs] = useState([
    { name: "Share Register 2024.pdf", type: "Ownership", size: "284 KB", date: "12 Mar 2025" },
    { name: "BBBEE Certificate 2023.pdf", type: "Compliance", size: "1.1 MB", date: "8 Jan 2025" },
    { name: "Training Records Q1.xlsx", type: "Skills Dev", size: "540 KB", date: "1 Apr 2025" },
    { name: "Management Structure.docx", type: "Management", size: "210 KB", date: "20 Feb 2025" },
    { name: "Supplier Invoices March.zip", type: "Enterprise Dev", size: "3.2 MB", date: "2 Apr 2025" },
    { name: "CSI Report 2024.pdf", type: "SED", size: "860 KB", date: "15 Dec 2024" },
    { name: "Employment Equity Report.pdf", type: "Management", size: "1.4 MB", date: "5 Mar 2025" },
  ]);

  const typeIcon = (t) => ({ "Ownership": "📋", "Compliance": "✅", "Skills Dev": "🎓", "Management": "👔", "Enterprise Dev": "🏭", "SED": "🤝" }[t] || "📄");

  return (
    <div className="page fade">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24, flexWrap: "wrap", gap: 12 }}>
        <div>
          <div className="page-title">Document Vault</div>
          <div className="page-sub">Upload and organise your B-BBEE supporting documents</div>
        </div>
        <button className="btn btn-primary">+ Upload Document</button>
      </div>

      {/* Upload zone */}
      <div className="upload-zone" style={{ marginBottom: 22 }}>
        <div className="upload-icon">📂</div>
        <div className="upload-text">Drag and drop files here, or click to browse</div>
        <div className="upload-hint">PDF, DOCX, XLSX, images — max 50 MB per file</div>
      </div>

      {/* Documents */}
      <div className="card">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <div className="card-title">Uploaded Documents ({docs.length})</div>
          <input className="form-input" placeholder="Search documents…" style={{ width: 200, padding: "7px 12px", fontSize: 13 }} />
        </div>
        <div className="tbl-wrap">
          <table>
            <thead>
              <tr>
                <th>Document</th>
                <th>Category</th>
                <th>Size</th>
                <th>Uploaded</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {docs.map((d, i) => (
                <tr key={i}>
                  <td><div style={{ display: "flex", alignItems: "center", gap: 10 }}><span style={{ fontSize: 18 }}>{typeIcon(d.type)}</span><span style={{ fontWeight: 500 }}>{d.name}</span></div></td>
                  <td><span className="badge badge-navy">{d.type}</span></td>
                  <td style={{ color: "var(--muted)" }}>{d.size}</td>
                  <td style={{ color: "var(--muted)" }}>{d.date}</td>
                  <td><button className="btn btn-ghost btn-sm">↓ Download</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

/* ─── BeeBot Screen ─────────────────────────────────────────── */
const BeeBotScreen = ({ user }) => {
  const [msgs, setMsgs] = useState([
    { role: "bot", text: "Hello! I'm BeeBot 🐝 — your B-BBEE assistant. I can answer questions about the scorecard, codes, pillars, and how to improve your score. How can I help?" }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const endRef = useRef(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [msgs]);

  const send = async () => {
    if (!input.trim() || loading) return;
    const q = input.trim();
    setInput("");
    setMsgs(m => [...m, { role: "user", text: q }]);
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${localStorage.getItem("token") || ""}` },
        body: JSON.stringify({ message: q }),
      });
      const data = await res.json();
      setMsgs(m => [...m, { role: "bot", text: data.reply || data.message || "Sorry, I couldn't get a response right now." }]);
    } catch {
      setMsgs(m => [...m, { role: "bot", text: "⚠️ Connection error — please check your internet and try again." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page fade" style={{ padding: "20px 28px 0" }}>
      <div style={{ marginBottom: 16 }}>
        <div className="page-title">BeeBot</div>
        <div className="page-sub">AI-powered B-BBEE assistant · Restricted to B-BBEE topics only</div>
      </div>

      <div className="chat-wrap">
        <div className="chat-header">
          <div className="chat-avatar">🐝</div>
          <div>
            <div className="chat-name">BeeBot</div>
            <div className="chat-status">● Online · Powered by Claude</div>
          </div>
          <div style={{ marginLeft: "auto" }}>
            <span className="badge badge-gold">BEE topics only</span>
          </div>
        </div>

        <div className="chat-msgs">
          {msgs.map((m, i) => (
            <div key={i} className={`msg-row${m.role === "user" ? " user" : ""}`}>
              {m.role === "bot" && <div className="msg-mini-avatar">🐝</div>}
              <div className={`msg-bubble ${m.role}`}>{m.text}</div>
            </div>
          ))}
          {loading && (
            <div className="msg-row">
              <div className="msg-mini-avatar">🐝</div>
              <div className="msg-bubble bot" style={{ display: "flex", gap: 5, alignItems: "center" }}>
                <div className="spinner-gold" /><span style={{ fontSize: 13, color: "var(--muted)" }}>Thinking…</span>
              </div>
            </div>
          )}
          <div ref={endRef} />
        </div>

        <div className="chat-input-wrap">
          <input
            className="chat-input"
            placeholder="Ask a B-BBEE question…"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && send()}
          />
          <button className="btn btn-primary" onClick={send} disabled={loading || !input.trim()}>
            {loading ? <div className="spinner" /> : "Send →"}
          </button>
        </div>
      </div>
    </div>
  );
};

/* ─── Verifier Marketplace ──────────────────────────────────── */
const MarketplaceScreen = () => {
  const [filter, setFilter] = useState("All");
  const cities = ["All", "Johannesburg", "Cape Town", "Durban", "Pretoria", "Sandton"];
  const filtered = filter === "All" ? VERIFIERS : VERIFIERS.filter(v => v.city === filter);

  return (
    <div className="page fade">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
        <div>
          <div className="page-title">Verifier Marketplace</div>
          <div className="page-sub">SANAS-accredited verification agencies across South Africa</div>
        </div>
      </div>

      <div style={{ background: "var(--warn-bg)", border: "1px solid rgba(155,90,0,.18)", borderRadius: "var(--r-sm)", padding: "10px 14px", fontSize: 13, color: "var(--warn)", marginBottom: 20 }}>
        ℹ️ Only SANAS-accredited verifiers can issue official B-BBEE certificates. BEEcompass facilitates introductions only.
      </div>

      {/* Filter */}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 18 }}>
        {cities.map(c => (
          <button key={c} className={`btn btn-sm ${filter === c ? "btn-navy" : "btn-outline"}`} onClick={() => setFilter(c)}>{c}</button>
        ))}
      </div>

      <div className="verifier-grid">
        {filtered.map((v, i) => (
          <div key={v.name} className={`verifier-card fade fade-${(i % 4) + 1}`}>
            <div className="vc-header">
              <div>
                <div className="vc-name">{v.name}</div>
                <div className="vc-city">📍 {v.city}</div>
              </div>
              <div className="vc-rating">★ {v.rating}</div>
            </div>
            <div className="vc-tags">
              {v.specialities.map(s => <span key={s} className="vc-tag">{s}</span>)}
              <span className="vc-tag" style={{ background: "var(--success-bg)", color: "var(--success)", border: "1px solid rgba(31,107,64,.2)" }}>SANAS Accredited</span>
            </div>
            <div className="vc-desc">{v.desc}</div>
            <div style={{ display: "flex", gap: 8 }}>
              <button className="btn btn-primary btn-sm" style={{ flex: 1 }}>Book Consultation</button>
              <button className="btn btn-outline btn-sm">Learn More</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

/* ─── Report Screen ─────────────────────────────────────────── */
const ReportScreen = ({ user }) => {
  const totalScore = PILLARS.reduce((a, p) => a + p.score, 0);
  return (
    <div className="page fade">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24, flexWrap: "wrap", gap: 12 }}>
        <div>
          <div className="page-title">Pre-Readiness Report</div>
          <div className="page-sub">Generate a PDF report of your B-BBEE pre-readiness assessment</div>
        </div>
        <button className="btn btn-primary">📄 Download PDF</button>
      </div>

      {/* Report preview */}
      <div className="card" style={{ maxWidth: 680, border: "2px solid var(--border)", background: "var(--white)" }}>
        {/* Report header */}
        <div style={{ background: "var(--navy)", borderRadius: "10px 10px 0 0", margin: "-22px -22px 24px", padding: "28px 28px 24px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12 }}>
            <div>
              <div style={{ fontFamily: "var(--font-d)", fontSize: 22, fontWeight: 700, color: "var(--white)", marginBottom: 4 }}>B-BBEE Pre-Readiness Report</div>
              <div style={{ fontSize: 13, color: "rgba(255,255,255,.5)" }}>Prepared by BEEcompass · {new Date().toLocaleDateString("en-ZA", { day: "2-digit", month: "long", year: "numeric" })}</div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontFamily: "var(--font-d)", fontSize: 36, fontWeight: 700, color: "var(--gold)", lineHeight: 1 }}>{totalScore}</div>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,.45)", marginTop: 2 }}>estimated points</div>
            </div>
          </div>
        </div>

        <div className="success-box" style={{ marginBottom: 20, fontSize: 12 }}>
          ⚠️ This report is for internal planning purposes only. It is not an official B-BBEE certificate and has no legal standing.
        </div>

        <div style={{ marginBottom: 20 }}>
          <div className="card-title">Company Information</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 12 }}>
            {[["Company", "Autonomylabs (Pty) Ltd"], ["Contact", user?.name || "—"], ["Scorecard", "Generic · QSE"], ["Assessment Date", new Date().toLocaleDateString("en-ZA")]].map(([l, v]) => (
              <div key={l}>
                <div style={{ fontSize: 11, fontWeight: 600, color: "var(--muted)", textTransform: "uppercase", letterSpacing: ".5px", marginBottom: 3 }}>{l}</div>
                <div style={{ fontSize: 14, color: "var(--navy)", fontWeight: 500 }}>{v}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="divider" />

        <div className="card-title" style={{ marginBottom: 14 }}>Pillar Scores</div>
        {PILLARS.map(p => (
          <div key={p.name} className="pillar-row">
            <div className="pillar-name" style={{ width: "auto", flex: 1, fontSize: 13 }}>{p.name}</div>
            <div style={{ flex: 2, margin: "0 12px" }}><ProgBar pct={p.pct} /></div>
            <div style={{ fontSize: 13, fontWeight: 600, color: "var(--navy)", flexShrink: 0 }}>{p.score}/{p.max}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

/* ─── BEE Info Screen ───────────────────────────────────────── */
const BeeInfoScreen = () => {
  const [open, setOpen] = useState(null);
  const topics = [
    { title: "What is B-BBEE?", body: "Broad-Based Black Economic Empowerment (B-BBEE) is South Africa's policy framework to redress apartheid-era inequalities by promoting black participation across the economy. It applies to all businesses operating in SA and affects government procurement, licensing, and private contracts." },
    { title: "The 5 Pillars of the Generic Scorecard", body: "1. Ownership (25 pts) — Black shareholding in the business.\n2. Management Control (19 pts) — Black representation at board and executive level.\n3. Skills Development (20 pts) — Training investment for Black employees.\n4. Enterprise & Supplier Development (40 pts) — Procurement from Black-owned suppliers and support for Black-owned SMEs.\n5. Socio-Economic Development (5 pts) — CSI contributions benefiting Black communities." },
    { title: "EME, QSE, and Generic Scorecards", body: "Exempted Micro-Enterprises (EMEs) have a turnover under R10m — they automatically qualify as Level 1 if 100% Black-owned, or Level 2 if 51%+ Black-owned, with no scorecard required.\n\nQualifying Small Enterprises (QSEs) have turnover R10m–R50m and measure only the top 4 of 5 pillars.\n\nGeneric Companies have turnover above R50m and must measure all 5 pillars." },
    { title: "How B-BBEE levels work", body: "Level 1 = 100+ pts · Level 2 = 85–99 pts · Level 3 = 75–84 pts · Level 4 = 65–74 pts · Level 5 = 55–64 pts · Level 6 = 45–54 pts · Level 7 = 40–44 pts · Level 8 = 30–39 pts · Non-Compliant = below 30 pts.\n\nHigher levels mean more recognition value when clients or government calculate their own procurement scores." },
    { title: "Priority elements and sub-minimums", body: "Ownership, Skills Development, and Enterprise & Supplier Development are 'priority elements' on the generic scorecard. Failing to score at least 40% of the weighting points for any priority element results in your overall level being discounted by one level." },
    { title: "Sector codes and their impact", body: "Several sectors have their own B-BBEE codes: Financial Services (FSC), Construction, Mining, Tourism, ICT, Agriculture, and more. Sector codes take precedence over the generic scorecard for businesses in those sectors and may have different weightings and thresholds." },
  ];
  return (
    <div className="page fade">
      <div className="page-header">
        <div className="page-title">B-BBEE Knowledge Base</div>
        <div className="page-sub">Plain-language explanations of B-BBEE codes, pillars, and compliance</div>
      </div>
      <div style={{ maxWidth: 720, display: "flex", flexDirection: "column", gap: 0 }}>
        {topics.map((t, i) => (
          <div key={i} style={{ borderBottom: "1px solid var(--border)" }}>
            <button onClick={() => setOpen(open === i ? null : i)} style={{ width: "100%", textAlign: "left", background: "none", border: "none", padding: "18px 4px", cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16 }}>
              <span style={{ fontFamily: "var(--font-d)", fontWeight: 600, color: "var(--navy)", fontSize: 16 }}>{t.title}</span>
              <span style={{ color: "var(--muted)", fontSize: 20, flexShrink: 0 }}>{open === i ? "−" : "+"}</span>
            </button>
            {open === i && (
              <div style={{ paddingBottom: 20, fontSize: 14, color: "var(--text-mid)", lineHeight: 1.8, whiteSpace: "pre-line", paddingLeft: 4 }}>{t.body}</div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

/* ─── Root App ───────────────────────────────────────────────── */
export default function App() {
  const [screen, setScreen] = useState("landing"); // landing | auth | app
  const [authTab, setAuthTab] = useState("signup");
  const [user, setUser] = useState(null);

  // Check for saved session
  useEffect(() => {
    const saved = localStorage.getItem("bee_user");
    if (saved) {
      try { const u = JSON.parse(saved); setUser(u); setScreen("app"); } catch {}
    }
  }, []);

  const handleAuth = (tab) => { setAuthTab(tab); setScreen("auth"); };

  const handleAuthSuccess = (data) => {
    const u = data.user || data;
    setUser(u);
    localStorage.setItem("bee_user", JSON.stringify(u));
    if (data.token) localStorage.setItem("token", data.token);
    setScreen("app");
  };

  const handleLogout = () => {
    localStorage.removeItem("bee_user");
    localStorage.removeItem("token");
    setUser(null);
    setScreen("landing");
  };

  return (
    <>
      <GlobalStyles />
      {screen === "landing" && <LandingPage onAuth={handleAuth} />}
      {screen === "auth" && (
        <AuthPage
          initialTab={authTab}
          onSuccess={handleAuthSuccess}
          onBack={() => setScreen("landing")}
        />
      )}
      {screen === "app" && <AppShell user={user} onLogout={handleLogout} />}
    </>
  );
}
