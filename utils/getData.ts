import { FormDataFooter } from "@/pages/api/footer";
import { MongoClient } from "mongodb";

export default async function getData(name: string) {
  const client = new MongoClient(process.env.MONGO_URI as string);

  const database = client.db("site");
  const tab = database.collection(name);
  const data = await tab.find({}).toArray();
  client.close();
  data!.forEach((item:any) => {
    item["_id"] = String(item["_id"]);
  })
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

export async function getUserByLogin(login: string) {
  const client = new MongoClient(process.env.MONGO_URI as string);

  const database = client.db("site");
  const tab = database.collection("users");
  const data = await tab.findOne({login});
  client.close();
  return JSON.parse(JSON.stringify(data ? data : {
    login: "",
    permissions: {},
    password: ""
  }));
}

interface BasicConfigData {
  companyName: string,
  slogan: string,
  yearOfCreate: number
}

export async function setBasicConfig({companyName, yearOfCreate, slogan}:BasicConfigData) {
  const client = new MongoClient(process.env.MONGO_URI as string);
  const database = client.db("site");
  const tab = database.collection("info");
  const deleteAll = await tab.deleteMany({});
  if(!deleteAll.acknowledged) {
    return ({
      error: true
    })
  }
  const updateData = await tab.insertOne({companyName, yearOfCreate, slogan});
  client.close();
  return ({
    error: !updateData.acknowledged
  });
}

export async function setFooterConfig(data:FormDataFooter) {

  const client = new MongoClient(process.env.MONGO_URI as string);
  const database = client.db("site");
  const tab = database.collection("footer");
  const findOne = await tab.findOne({});
  const updateData = await tab.updateOne({_id: findOne!._id}, {$set: {...data}});
  client.close();
  return ({
    error: !updateData.acknowledged,
  });
}