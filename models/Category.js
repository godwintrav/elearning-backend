const mongoose = require('mongoose');
mongoose.set('useFindAndModify', false);

const categorySchema = new mongoose.Schema({
    category: {
        required: [true, "Please enter the category name"],
        type: String,
        max: [255, 'Maximum characters allowed is 255 characters']
    }
}, {timestamps: true});

const Category = mongoose.model('category', categorySchema);

module.exports = Category;