const menuButton = document.querySelector('.menu-toggle');
const navigation = document.querySelector('.site-nav');
const themeButton = document.querySelector('[data-theme-toggle]');

function updateThemeButton() {
  if (!themeButton) return;
  const currentTheme = document.documentElement.dataset.theme || 'light';
  const nextTheme = currentTheme === 'dark' ? 'light' : 'dark';
  const label = themeButton.querySelector('[data-theme-label]');
  if (label) label.textContent = currentTheme;
  themeButton.setAttribute('aria-label', `Switch to ${nextTheme} mode`);
  themeButton.setAttribute('aria-pressed', String(currentTheme === 'dark'));
}

if (themeButton) {
  updateThemeButton();
  themeButton.addEventListener('click', () => {
    const nextTheme = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
    document.documentElement.dataset.theme = nextTheme;
    try {
      localStorage.setItem('bbin-theme', nextTheme);
    } catch (_) {
      // The toggle still works for this page if storage is unavailable.
    }
    updateThemeButton();
  });
}

if (menuButton && navigation) {
  menuButton.addEventListener('click', () => {
    const isOpen = menuButton.getAttribute('aria-expanded') === 'true';
    menuButton.setAttribute('aria-expanded', String(!isOpen));
    menuButton.textContent = isOpen ? 'menu' : 'close';
    navigation.classList.toggle('is-open', !isOpen);
  });
}

document.querySelectorAll('[data-current-year]').forEach((year) => {
  year.textContent = new Date().getFullYear();
});
