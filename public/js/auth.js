// Listening for the submit event that the browser will fire off whenever a user clicks on the submit button on the form.
import axios from 'axios';
import { showAlert } from './alerts';

export const login = async (email, password) => {
    try {
        const res = await axios({
            method: 'POST',
            url: '/api/v1/users/login',
            data: {
                email,
                password,
            },
        });
        console.log('in login...');

        if (res.data.status === 'success') {
            showAlert('success', 'Logged in successfully!');
            window.setTimeout(() => {
                location.assign('/');
            }, 1500);
        }

        // console.log(res);
    } catch (err) {
        showAlert('error', err.response.data.message);
    }
};

export const logout = async () => {
    try {
        const res = await axios({
            method: 'GET',
            url: '/api/v1/users/login',
        });

        if ((res.data.status = 'success')) {
            // 'true' means force a reload from the server and not from the browser cache.
            // If there is no 'ture it might simply load the same page from the cache.
            window.setTimeout(() => {
                location.assign('/');
            }, 1000);
        }
    } catch (err) {
        console.log(err);
        showAlert('error', 'logout error! please try again.');
    }
};

export const signup = async (user) => {
    try {
        const res = await axios({
            method: 'POST',
            url: '/api/v1/users/signup',
            data: user,
        });
        console.log(user);
        if (res.data.status === 'success') {
            showAlert('success', 'Sign Up successfully');
            window.setTimeout(() => {
                location.assign('/');
            }, 500);
        }
    } catch (err) {
        console.log(err.response.data.message);
        showAlert('error', err.response.data.message);
    }
};

export const sendResetPasswordEmail = async (email, button) => {
    try {
        button.textContent = 'sending...';
        const res = await axios({
            method: 'POST',
            url: '/api/v1/users/forgotPassword',
            data: { email },
        });
        if (res.data.status === 'success') {
            button.textContent = 'success';
            showAlert('success', 'send successfully');
        }
    } catch (err) {
        button.textContent = 'send';
        console.log(err.response.data.message);
        showAlert('error', err.response.data.message);
    }
};

export const resetPassword = async (password, passwordConfirm, token) => {
    try {
        console.log('try to reset password now....');
        const res = await axios({
            method: 'PATCH',
            url: `/api/v1/users/resetPassword/${token}`,
            data: {
                password,
                passwordConfirm,
            },
        });

        if (res.data.status === 'success') {
            showAlert('success', 'Reset successfully');
            window.setTimeout(() => {
                location.assign('/login');
            }, 500);
        }
    } catch (err) {
        console.log(err.response.data.message);
        showAlert('error', err.response.data.message);
    }
};
