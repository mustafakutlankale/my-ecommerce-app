export const ItemSchema = {
    name: String,
    description: String,
    price: Number,
    seller: String,
    image: String,
    category: String,

    batteryLife: String,
    age: Number,
    size: String,
    material: String,

    ratingSum: Number,
    reviewerCount: Number,
    avgRating: Number,

    reviews: [
        {
            userId: String,
            username: String,
            text: String,
            date: Date
        }
    ]
};

export function getAverageRating(item) {
    if (!item.reviewerCount || item.reviewerCount === 0) {
        return 0;
    }

    return item.ratingSum / item.reviewerCount;

}
