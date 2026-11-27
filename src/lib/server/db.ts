/** Server only: MongoDB access. */
import { MongoClient, type Binary, type Collection } from "mongodb";
import { seedData } from "../seed";
import type { Registration, SiteDocument } from "../types";

const globalForMongo = globalThis as unknown as { mongo?: Promise<MongoClient> };

async function database() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("MONGODB_URI is not set.");
  if (!globalForMongo.mongo) {
    globalForMongo.mongo = new MongoClient(uri, { serverSelectionTimeoutMS: 10_000 }).connect().catch((error) => {
      globalForMongo.mongo = undefined; // allow the next request to retry
      throw error;
    });
  }
  // MONGODB_DB can point a test run at a separate database.
  return (await globalForMongo.mongo).db(process.env.MONGODB_DB || undefined);
}

export type StoredSite = SiteDocument & { _id: "site" };
export type Attempt = { _id: string; count: number; expiresAt: Date };
export type Screenshot = { _id: string; data: Binary; uploadedAt: Date };

let utrIndex: Promise<unknown> | undefined;

export const sites = async (): Promise<Collection<StoredSite>> => (await database()).collection<StoredSite>("site");
export async function registrations() {
  const collection = (await database()).collection<Registration>("registrations");
  // The database itself guarantees that a UTR number is used only once.
  utrIndex ??= collection
    .createIndex({ utr: 1 }, { unique: true, partialFilterExpression: { utr: { $type: "string" } } })
    .catch((error) => {
      utrIndex = undefined;
      throw error;
    });
  await utrIndex;
  return collection;
}
export const screenshots = async (): Promise<Collection<Screenshot>> => (await database()).collection<Screenshot>("screenshots");
export const attempts = async (): Promise<Collection<Attempt>> => (await database()).collection<Attempt>("attempts");

/** Reads the website data, creating it from the sample data the first time. */
export async function readSite(): Promise<SiteDocument> {
  const collection = await sites();
  let site = await collection.findOne({ _id: "site" });
  if (!site) {
    await collection.updateOne(
      { _id: "site" },
      { $setOnInsert: { version: 1, competitions: seedData.competitions, content: seedData.content } },
      { upsert: true },
    );
    site = await collection.findOne({ _id: "site" });
  }
  if (!site) throw new Error("Website data could not be created.");
  return {
    version: site.version,
    competitions: site.competitions,
    // Sections added after the data was first saved still need a value.
    content: {
      ...seedData.content,
      ...site.content,
      payment: { ...seedData.content.payment, ...site.content.payment },
    },
  };
}
