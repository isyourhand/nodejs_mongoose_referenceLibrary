import '@babel/polyfill';
import { displayMap } from './mapbox';
import { login, logout } from './login';
import { updateSettings } from './updateSetting';
import { bookTour } from './stripe';
import { showAlert } from './alerts';

// DOM ELEMENTS
const mapBox = document.getElementById('map');
const loginForm = document.querySelector('.form--login');
const logOutBtn = document.querySelector('.nav__el--logout');
const userUpdateForm = document.querySelector('.form-user-data');
const passUpdataForm = document.querySelector('.form-user-password');
const bookBtn = document.getElementById('book-tour');

// VALUES

if (mapBox) {
    const locations = JSON.parse(
        document.getElementById('map').dataset.locations
    );
    displayMap(locations);
}

if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault(); // Prevent the default actions, which are submitting the form and navigating away from the page.
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        login(email, password);
    });
}

if (logOutBtn) logOutBtn.addEventListener('click', logout);

if (userUpdateForm) {
    userUpdateForm.addEventListener('submit', (el) => {
        el.preventDefault();
        const form = new FormData();
        form.append('name', document.getElementById('name').value);
        form.append('email', document.getElementById('email').value);
        form.append('photo', document.getElementById('photo').files[0]); // these files are actually in array.
        //console.log(form);

        updateSettings(form, 'data');
    });
}

if (passUpdataForm) {
    passUpdataForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        document.querySelector('.btn--save-password').textContent =
            'Updating...';

        const currentPassword =
            document.getElementById('password-current').value;
        const newPassword = document.getElementById('password').value;
        const passwordConfirm =
            document.getElementById('password-confirm').value;

        await updateSettings(
            { currentPassword, newPassword, passwordConfirm },
            'password'
        );
        document.querySelector('.btn--save-password').textContent =
            'Save password';
        document.getElementById('password-current').value = '';
        document.getElementById('password').value = '';
        document.getElementById('password-confirm').value = '';
    });
}

if (bookBtn)
    bookBtn.addEventListener('click', (e) => {
        e.target.textContent = 'Processing...';
        // const tourId = e.target.dataset.tourId;
        const { tourId } = e.target.dataset; // Same effect with above.
        bookTour(tourId);
    });

console.log(document.querySelector('body'));
const alertMessage = document.querySelector('body').dataset.alert;
if (alertMessage) showAlert('success', alertMessage, 20);
