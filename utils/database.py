import pymongo
from configuration.config import *

class WebChatDatabase:
    def __init__(self, host, port):
        self.host = host
        self.port = port
        self.mongodb = pymongo.MongoClient(self.host, self.port)
        self.userdb = self.mongodb[Mongo.user_db_name]
        self.user_collection = self.userdb[Mongo.user_collection]
        self.chatdb = self.mongodb[Mongo.chat_history_db]
        self.chat_collection = self.mongodb[Mongo.chat_history_collection]

    def insert_new_user(self, username):
        data = {"username" : username}
        return_result = self.user_collection.update(data, {"$setOnInsert" : data}, upsert=True)
        # if there 're existing objects, updatedExisting will be True
        # => we return false because we 're not success in inserting item
        return not return_result["updatedExisting"]

if __name__ == "__main__":
    DB = WebChatDatabase('localhost', 27017)
    DB.insert_new_user("Lam")

