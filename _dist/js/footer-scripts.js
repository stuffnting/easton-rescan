
const themeToggleBtn = document.getElementById('theme-toggle');
const themeToggleText = document.getElementById('theme-toggle-text');
const body = document.body;
const themeKey = 'user-theme';

// 1. On page load, apply the saved theme or default to 'theme--light'
const savedTheme = localStorage.getItem(themeKey) || 'theme--light';
body.classList.add(savedTheme);
themeToggleBtn.checked = savedTheme === 'theme--dark' ? false : true;
themeToggleText.innerHTML = savedTheme === 'theme--dark' ? 'Turn Lights On' : 'Turn Lights Off';

// 2. Add an event listener to the toggle button
themeToggleBtn.addEventListener('click', () => {
  const currentTheme = localStorage.getItem(themeKey) || 'theme--light';
  const newTheme = currentTheme === 'theme--light' ? 'theme--dark' : 'theme--light';
  body.classList.toggle('theme--dark');
  body.classList.toggle('theme--light');
  themeToggleText.innerHTML = newTheme === 'theme--dark' ? 'Turn Lights On' : 'Turn Lights Off';
  // Save the new preference to localStorage
  localStorage.setItem(themeKey, newTheme);
});
