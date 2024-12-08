import sys
import json
import pymongo
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.decomposition import TruncatedSVD
from bson.objectid import ObjectId
import numpy as np
import pandas as pd
import random
import warnings

# Suppress specific warnings
warnings.filterwarnings("ignore", category=RuntimeWarning, message=".*invalid value encountered in divide.*")

# MongoDB connection
client = pymongo.MongoClient("mongodb://localhost:27017/")
db = client["MajorProject"]
search_collection = db["searchhistories"]
books_collection = db["books"]

# Function to get book recommendations based on user ID
def get_recommendations(user_id, top_n=4):
    # Convert user_id to ObjectId if it's passed as a string
    user_id = ObjectId(user_id) if isinstance(user_id, str) else user_id

    # Fetch search history data for the user from MongoDB
    try:
        search_data = list(search_collection.find({"userId": user_id}))
    except Exception as e:
        return {"error": f"Error fetching search history: {str(e)}"}

    # Handle the case where no search history is found
    if not search_data:
        return {"error": f"No search history found for User {user_id}."}

    # Extract user's searches
    user_searches = None
    for record in search_data:
        if str(record["userId"]) == str(user_id):  # Ensure userId comparison is safe
            user_searches = [search["query"] for search in record.get("searches", [])]
            break

    if not user_searches:
        return {"error": f"No searches found for User {user_id}."}

    # Fetch the book details
    books = list(books_collection.find())
    book_titles = [book["name"] for book in books]
    book_descriptions = [book["description"] for book in books]
    book_ids = [str(book["_id"]) for book in books]

    # Content-based recommendation using cosine similarity
    vectorizer = TfidfVectorizer(stop_words="english")
    tfidf_matrix = vectorizer.fit_transform(book_descriptions)
    content_based_similarity = cosine_similarity(tfidf_matrix)

    # Filter searches matching book titles
    valid_searches = [search for search in user_searches if search in book_titles]
    if not valid_searches:
        return {"error": "No valid searches found for recommendations."}

    content_based_scores = np.mean([content_based_similarity[book_titles.index(search)] for search in valid_searches], axis=0)

    # Collaborative-based recommendation using matrix factorization
    user_item_data = []
    for record in search_data:
        if str(record["userId"]) == str(user_id):
            for search in record.get("searches", []):
                book_title = search["query"]
                if book_title in book_titles:
                    book_index = book_titles.index(book_title)
                    user_item_data.append([user_id, book_index, 1])

    # Create user-item matrix
    user_item_matrix = pd.DataFrame(user_item_data, columns=["userId", "bookIndex", "interaction"])
    user_item_matrix = user_item_matrix.pivot_table(index="userId", columns="bookIndex", values="interaction", fill_value=0)

    # Handle cases with insufficient features
    if user_item_matrix.shape[1] < 2:
        collaborative_scores = np.zeros(user_item_matrix.shape[1])
    else:
        # Matrix factorization using SVD
        n_components = min(user_item_matrix.shape[1] - 1, 10)
        svd = TruncatedSVD(n_components=n_components)
        matrix_factorized = svd.fit_transform(user_item_matrix)

        # Calculate collaborative scores
        user_vector = matrix_factorized[user_item_matrix.index.get_loc(user_id)]
        collaborative_scores = np.dot(user_vector, matrix_factorized.T)

    # Rank and combine recommendations
    content_based_ranking = np.argsort(content_based_scores)[::-1]
    collaborative_ranking = np.argsort(collaborative_scores)[::-1] if collaborative_scores.size else []

    final_recommendations = set()
    for i in content_based_ranking:
        final_recommendations.add((book_ids[i], book_titles[i]))
    for i in collaborative_ranking:
        final_recommendations.add((book_ids[i], book_titles[i]))

    # Shuffle and select top recommendations
    final_recommendations = list(final_recommendations)
    random.shuffle(final_recommendations)
    random_recommendations = random.sample(final_recommendations, min(top_n, len(final_recommendations)))

    # Return recommendations
    recommendations_list = [{"id": book_id, "name": book_name} for book_id, book_name in random_recommendations]
    return {"recommendations": recommendations_list}

# Main function to execute the script
if __name__ == "__main__":
    user_id = sys.argv[1]  # Get the user_id from command line arguments
    recommendations = get_recommendations(user_id)
    print(json.dumps(recommendations))
