import axios from 'axios';
import { showAlert } from './alerts';

const stripe = Stripe(
    'pk_test_51NXenQAw3ikfz8p2nABpDyxhSrVmse2XiBMTABVU8gi2cgTIm71CeWXFMjQtRzLWP3blUm66HmfzTpvUq5bjEftq00YfBDqiOR'
);

export const bookTour = async (tourId) => {
    // 1) get checkout session from API
    try {
        const session = await axios(
            `/api/v1/bookings/checkout-session/${tourId}`
        );
        //console.log(session);

        // 2) Create checkout form + chance credit card
        await stripe.redirectToCheckout({
            sessionId: session.data.session.id,
        });
    } catch (err) {
        console.log(err);
        showAlert('error', err);
    }
};
