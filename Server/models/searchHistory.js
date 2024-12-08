import mongoose from 'mongoose';

const searchHistorySchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    searches: [{
        query: { type: String, required: true },
        createdAt: { type: Date, default: Date.now }
    }]
});

export const SearchHistory = mongoose.model('SearchHistory', searchHistorySchema);
