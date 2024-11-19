const STORAGE_KEY = 'isSignedIn';
const navLinks = document.querySelector('.nav-links');
const form = document.querySelector('.signin-form');
const loader = document.getElementById('loader');

function updateAuthNav() {
    const isSignedIn = localStorage.getItem(STORAGE_KEY) === 'true';
    const authButton = `<li><a href="#" class="nav-button text-primary-dark" id="${isSignedIn ? 'signOutBtn' : 'signInBtn'}">${isSignedIn ? 'Sign Out' : 'Sign In'}</a></li>`;

    const existingAuth = document.querySelector('#signInBtn, #signOutBtn');
    if (existingAuth) {
        existingAuth.closest('li').remove();
    }
    navLinks.insertAdjacentHTML('beforeend', authButton);

    document.getElementById('signOutBtn')?.addEventListener('click', signOut);
}

async function signIn(e) {
    e.preventDefault();
    loader.style.display = 'block';
    await new Promise(resolve => setTimeout(resolve, 3000));
    localStorage.setItem(STORAGE_KEY, 'true');
    updateAuthNav();
    loader.style.display = 'none';
}

async function signOut(e) {
    e.preventDefault();
    loader.style.display = 'block';
    await new Promise(resolve => setTimeout(resolve, 3000));
    localStorage.setItem(STORAGE_KEY, 'false');
    window.location.href = 'signin.html';
}

document.addEventListener('DOMContentLoaded', () => {
    updateAuthNav();
    form?.addEventListener('submit', signIn);
});