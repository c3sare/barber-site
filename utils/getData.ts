import { MongoClient } from "mongodb";

export default async function getData(name: string) {
  const client = new MongoClient(process.env.MONGO_URI as string);

  const database = client.db("site");
  const tab = database.collection(name);
  const data = await tab.find({}).toArray();
  client.close();
  data!.forEach((item: any) => {
    item["_id"] = String(item["_id"]);
  });
  return JSON.parse(JSON.stringify(data));
}

export async function getDataOne(name: string) {
  const client = new MongoClient(process.env.MONGO_URI as string);

  const database = client.db("site");
  const tab = database.collection(name);
  const data = await tab.findOne({});
  client.close();
  const keys = Object.keys(data as Object);
  let newObject: any = {};
  for (let i = 0; i < keys.length; i++) {
    if (keys[i] !== "_id") newObject[keys[i]] = (data as any)[keys[i]];
  }

  return newObject;
}
