import json
import pymongo
from pathlib import Path

# Connect to MongoDB (replace with your connection string if using Atlas)
client = pymongo.MongoClient("mongodb://localhost:27017/")
db = client["my_database"]  # Replace with your database name
collection = db["my_collection"]  # Replace with your collection name

# Path to the folder containing JSON files (relative to your script)
json_folder = Path("./data")  # Adjust to your JSON files' folder, e.g., "data" subfolder

# Get all JSON files
json_files = json_folder.glob("*.json")

for json_file in json_files:
    try:
        with open(json_file, 'r') as file:
            data = json.load(file)
            # Handle single object or list of objects
            if isinstance(data, list):
                collection.insert_many(data)
            else:
                collection.insert_one(data)
        print(f"Inserted data from {json_file}")
    except json.JSONDecodeError:
        print(f"Error: Invalid JSON in {json_file}")
    except Exception as e:
        print(f"Error processing {json_file}: {e}")

# Close the connection
client.close()
print("All JSON files processed!")