### Model Introduction

#### bookingModel

The model of User Bookings, which includes userID, tourID, price, createdAt, paid.

#### reviewModel

The model of User Reviews, which includes review, rating, createAt, userID, tourID.

#### tourModel

The model of Tour, which includes name, slug, duration, maxGroupSize, difficulty, ratingsAverage, ratingsQuantity, price, priceDiscount, summary, description, imageCover, images, startDates, secretTour, startLocation, locations, guides.

#### userModel

The model of User, which includes name, email, photo, role, password, passwordConfirm, passwordChangedAt, passwordResetToken, passwordResetExpires, active.

#### middlewares

there are a lot of middlewares in these files, but I think it need to see them for yourself to understand.

##### - BookingModel's middlewares

1. Add 'user' and 'tour' populate to query before executing the find.

...

##### - ReviewModel's middlewares

1. Add a compound index for 'tour' and 'user'with the 'unique' option set to true.

2. Add 'user' populate to query before executing the find.

3. Use statics methos to calculate average ratings and save them into respective Tour document after saving review document.

4. Update Tour's review statistics data when 'findOneAndUpdate' or 'findOneAndDelete' occurs.

...

##### - tourModel's middlewares

1. Create three indexes.

2. Create a virtual property 'durationWeeks' that can be retrieved in database queries using the populate function.

...

##### - UserModel's middlewares

1. Create Instance methods for managing passwords.
