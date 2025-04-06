export const UserSchema = {
    username: String,
    password: String,
    isAdmin: Boolean,

    ratings: [
        {
            itemId: String,
            rating: Number,
        }
    ],

    reviews: [
        {
            itemId: String,
            text: String,
            date: Date,
        }
    ]
};

export function getAverageRating(user) {
    if (!user.ratings || user.ratings.length === 0) {
        return 0;
    }

    const sum = user.ratings.reduce((total, rating) => total + rating.rating, 0);
    return sum / user.rating.length;
}