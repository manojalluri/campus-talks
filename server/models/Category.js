import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema({
    id: { type: String, required: true, unique: true },
    label: { type: String, required: true },
    icon: { type: String, default: '✨' },
    order: { type: Number, default: 0 }
});

const Category = mongoose.model('Category', categorySchema);
export default Category;
