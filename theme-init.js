(() => {
  let savedTheme = null;
  try {
    savedTheme = localStorage.getItem('bbin-theme');
  } catch (_) {
    // Storage can be unavailable in privacy-restricted browsing contexts.
  }

  const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  document.documentElement.dataset.theme = ['light', 'dark'].includes(savedTheme) ? savedTheme : systemTheme;
})();
