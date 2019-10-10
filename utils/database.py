import pymongo
from configuration.config import *
import time

class WebChatDatabase:
    def __init__(self, host, port):
        self.host = host
        self.port = port
        self.mongodb = pymongo.MongoClient(self.host, self.port)
        self.userdb = self.mongodb[Mongo.user_db_name]
        self.user_collection = self.userdb[Mongo.user_collection]
        self.chatdb = self.mongodb[Mongo.chat_history_db]
        self.chat_collection = self.chatdb[Mongo.chat_history_collection]

    def insert_new_user(self, username, time=1570675286153):
        data = {"username" : username, "lastOnline": time}
        # return_result = self.user_collection.update({"username":username}, {"$set": {"lastOnline":time}, "$setOnInsert" : data}, upsert=True)
        return_result = self.user_collection.update({"username":username}, {"$set": {"lastOnline":time}}, upsert=True)
        # return_result = self.user_collection.update(,  ,upsert=True)
        # if there 're existing objects, updatedExisting will be True
        # => we return false because we 're not success in inserting item
        return not return_result["updatedExisting"]

    def list_user(self):
        data = []
        last_time = []
        cursors = self.user_collection.find({})
        for cursor in cursors:
            data.append(cursor["username"])
            # this_time = cursor.get("lastOneline")
            last_time.append(cursor["lastOnline"])
        last_time.sort(key=dict(zip(last_time, data)).get)
        data.sort()
        print(data, last_time)
        return data, last_time

    def generate_conversation_id(self, user1, user2):
        data = [user1, user2]
        data.sort()
        conversation_name = ''.join(data)
        save_data = {"conversation_id": conversation_name, "first_name": data[0]}
        # return_result = self.user_collection.update(save_data, {"$setOnInsert" : save_data}, upsert=True)
        return conversation_name, data[0]

    # def save_chat(self, list_of_document):
    #     "Document type : {'conversation_id': 'LamDuc', 'text':'hehe' , 'firstname':'Lam','from':'Duc', 'time':121212121}"
    #     self.chat_collection.insert_many(list_of_document)

    def save_single_message(self, **kwargs):
        self.chatdb[kwargs["conversation_id"]].insert({
            "text" : kwargs["text"],
            "firstname" : kwargs["firstname"],
            "from" : kwargs["from"],
            "to" : kwargs["to"],
            "time" : kwargs["time"]
        })

    def query_messages(self, **kwargs):
        username = kwargs["username"]
        firstname = kwargs["firstname"]
        from_time = kwargs["from_time"]
        to_time = kwargs.get("to_time", int(time.time()*1000))
        conversation_id = kwargs["conversation_id"]
        print(conversation_id)
        limit = kwargs.get("limit", 20)
        cursors = self.chatdb[conversation_id].find({"time" : {"$gte" : from_time, "$lte" : to_time}, "firstname" : firstname}).sort("time", 1).limit(limit)
        # cursors = self.chatdb[conversation_id].find({})
        receive = []
        times = []
        text = []
        for cursor in cursors:
            # print(dict(cursor))
            if cursor["from"] == username:
                receive.append(False)
            else:
                receive.append(True)
            text.append(cursor["text"])
            times.append(cursor["time"])
        return receive, times, text


                
    
    

if __name__ == "__main__":
    DB = WebChatDatabase('localhost', 27017)
    DB.insert_new_user("Lam")
    query_input = {"from_time" : 20, "to_time" : int(time.time()*1000), "username": "Lam", "conversation_id": "DatLam", "firstname" : "Dat"}
    output = DB.query_messages(**query_input)
    print(output)

