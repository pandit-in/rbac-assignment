"use server";

import { db } from "@/lib/db";
import { store, rating, user } from "@/lib/db/schema";
import { eq, like, or, desc, sql } from "drizzle-orm";
import { randomUUID } from "node:crypto";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export async function getAllStores(
  limit = 10,
  offset = 0,
  search?: string
) {
  try {
    const session = await auth.api.getSession({
        headers: await headers()
    });
    const userId = session?.user?.id;

    // Subquery or join for user's specific rating
    let query = db
      .select({
        id: store.id,
        name: store.name,
        address: store.address,
        ownerId: store.ownerId,
        description: store.description,
        createdAt: store.createdAt,
        ownerEmail: user.email,
        averageRating: sql<number>`COALESCE(avg(${rating.rating}), 0)`,
        totalRatings: sql<number>`count(${rating.id})`,
        userRating: userId
          ? sql<number>`(SELECT rating FROM rating WHERE store_id = ${store.id} AND user_id = ${userId} LIMIT 1)`
          : sql<null>`NULL`,
      })
      .from(store)
      .leftJoin(user, eq(store.ownerId, user.id))
      .leftJoin(rating, eq(store.id, rating.storeId))
      .groupBy(
        store.id,
        store.name,
        store.address,
        store.ownerId,
        store.description,
        store.createdAt,
        user.id,
        user.email
      )
      .$dynamic()

    if (search) {
      query = query.where(
        or(like(store.name, `%${search}%`), like(store.address, `%${search}%`))
      )
    }

    const stores = await query
      .limit(limit)
      .offset(offset)
      .orderBy(desc(store.createdAt))
      .execute()

    // Get total count
    const countResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(store)
      .execute()

    return {
      data: stores.map((s) => ({
        ...s,
        averageRating: Number(s.averageRating),
        totalRatings: Number(s.totalRatings),
        userRating: s.userRating ? Number(s.userRating) : null,
      })),
      total: Number(countResult[0]?.count),
    }
  } catch (error) {
    console.error(error);
    throw new Error(`Failed to get stores: ${error}`);
  }
}

export async function getStoreById(id: string) {
  try {
    const result = await db
      .select()
      .from(store)
      .where(eq(store.id, id))
      .execute()
    return result[0] || null
  } catch (error) {
    throw new Error(`Failed to get store: ${error}`)
  }
}

export async function createStore(
  data: {
    name: string;
    address: string;
    description?: string;
    ownerId?: string;
  }
) {
  try {
    const session = await auth.api.getSession({
        headers: await headers()
    });
    
    if (!session || session.user.role !== "admin") {
        throw new Error("Unauthorized");
    }

    const result = await db
      .insert(store)
      .values({
        id: randomUUID(),
        ownerId: data.ownerId || session.user.id,
        name: data.name,
        address: data.address,
        description: data.description,
      })
      .returning()

    return result[0]
  } catch (error) {
    throw new Error(`Failed to create store: ${error}`)
  }
}

export async function updateStore(
  id: string,
  data: Partial<{
    name: string;
    address: string;
    description: string;
  }>
) {
  try {
    const session = await auth.api.getSession({
        headers: await headers()
    });
    
    if (!session || session.user.role !== "admin") {
        throw new Error("Unauthorized");
    }

    const result = await db
      .update(store)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(store.id, id))
      .returning()

    return result[0]
  } catch (error) {
    throw new Error(`Failed to update store: ${error}`)
  }
}

export async function deleteStore(id: string) {
  try {
    const session = await auth.api.getSession({
        headers: await headers()
    });
    
    if (!session || session.user.role !== "admin") {
        throw new Error("Unauthorized");
    }

    await db.delete(store).where(eq(store.id, id)).execute()
    return { success: true }
  } catch (error) {
    throw new Error(`Failed to delete store: ${error}`)
  }
}

export async function getStoreWithRatings(id: string) {
  try {
    const storeResult = await getStoreById(id)
    if (!storeResult) return null

    const ratings = await db
      .select({
        id: rating.id,
        rating: rating.rating,
        review: rating.review,
        createdAt: rating.createdAt,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
        },
      })
      .from(rating)
      .leftJoin(user, eq(rating.userId, user.id))
      .where(eq(rating.storeId, id))
      .orderBy(desc(rating.createdAt))
      .execute()

    const totalRatings = ratings.length
    const averageRating =
      totalRatings > 0
        ? ratings.reduce((acc, r) => acc + r.rating, 0) / totalRatings
        : 0

    return {
      ...storeResult,
      ratings,
      totalRatings,
      averageRating,
    }
  } catch (error) {
    throw new Error(`Failed to get store with ratings: ${error}`)
  }
}
