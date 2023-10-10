import axios from 'axios';
import { showAlert } from './alerts';

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
