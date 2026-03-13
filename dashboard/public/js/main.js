// Language switcher
function applyLang() {
  const lang = localStorage.getItem('lang') || 'ar';
  document.querySelectorAll('[data-ar][data-en]').forEach(el => {
    el.textContent = el.dataset[lang] || el.textContent;
  });
}
document.addEventListener('DOMContentLoaded', applyLang);

// Auto-update stats
async function updateStats() {
  try {
    const res = await fetch('/api/stats');
    const data = await res.json();
    ['guilds','users','commands','ping'].forEach(k => {
      const el = document.getElementById('stat-' + k);
      if (el) el.textContent = data[k];
    });
  } catch {}
}
if (document.getElementById('stat-guilds')) {
  updateStats();
  setInterval(updateStats, 30000);
}

// Active sidebar link
document.querySelectorAll('.sidebar-link').forEach(link => {
  link.addEventListener('click', () => {
    document.querySelectorAll('.sidebar-link').forEach(l => l.classList.remove('active'));
    link.classList.add('active');
  });
});

// Smooth scroll
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const el = document.querySelector(a.getAttribute('href'));
    if (el) { e.preventDefault(); el.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
  });
});

// Animate cards on scroll
const observer = new IntersectionObserver(entries => {
  entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('animate-in'); observer.unobserve(e.target); } });
}, { threshold: 0.1 });
document.querySelectorAll('.feature-card,.stat-card,.card').forEach(el => observer.observe(el));
