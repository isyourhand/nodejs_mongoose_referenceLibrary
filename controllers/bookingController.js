const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Booking = require('../models/bookingModel');
const Tour = require('../models/tourModel');
const User = require('../models/userModel');

const catchAsync = require('../Utils/catchAsync');
const factory = require('./handlerFactory');

exports.getCheckoutSession = catchAsync(async (req, res, next) => {
    // 1）Get the currently booked tour.
    const tour = await Tour.findById(req.params.tourID);

    // 2) Create checkout session.
    const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        // success_url: `${req.protocol}://${req.get('host')}/?tour=${
        //     req.params.tourID
        // }&user=${req.user.id}&price=${tour.price}`,
        success_url: `${req.protocol}://${req.get('host')}/my-tours`,
        cancel_url: `${req.protocol}://${req.get('host')}/tour/${tour.slug}`,
        customer_email: req.user.email,
        client_reference_id: req.params.tourID,
        line_items: [
            {
                price_data: {
                    product_data: {
                        name: `${tour.name} Tour`,
                        description: tour.summary,
                        images: [
                            `https://www.natours.dev/img/tours/${tour.imageCover}`,
                        ],
                    },
                    unit_amount: tour.price * 100,
                    currency: 'usd',
                },
                quantity: 1,
            },
        ],
        mode: 'payment',
    });

    // 3) Creaate session as response
    res.status(200).json({
        status: 'success',
        session,
    });
});

const createBookingCheckout = async (session) => {
    console.log(session);
    const tour = session.client_reference_id;
    const user = await User.findOne({ email: session.customer_email });
    const price = session.amount_total / 100;
    await Booking.create({ tour, user, price });
};

exports.webhookCheckout = (req, res, next) => {
    const signature = req.headers['stripe-signature'];

    let event;
    try {
        console.log(req.body, signature);
        event = stripe.webhooks.constructEvent(
            req.body,
            signature,
            process.env.STRIPE_WEBHOOK_ID // 被这个B密钥坑傻了，操了，真傻逼玩意，点击一下Signing secret下面的reveal就出来的玩意，我找了一个下午，TMD
        );
    } catch (err) {
        return res.status(400).send(`Webhook error: ${err.message}`);
    }

    if (event.type === 'checkout.session.completed') {
        createBookingCheckout(event.data.object);
    }
    res.status(200).json({ received: true });
};

exports.getBooking = factory.getOne(Booking);
exports.getAllBookings = factory.getAll(Booking);
exports.createBooking = factory.createOne(Booking);
exports.deleteBooking = factory.deleteOne(Booking);
exports.updateBooking = factory.updateOne(Booking);
