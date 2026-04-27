"use server";

import { db } from "@/lib/db";
import { user, rating, store } from "@/lib/db/schema";
import { eq, sql } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export async function getAllUsers(
  limit?: number,
  offset?: number
) {
  try {
    const session = await auth.api.getSession({
        headers: await headers()
    });
    
    if (!session || session.user.role !== "admin") {
        throw new Error("Unauthorized");
    }

    // Get all users
    const users = await db.select().from(user).execute()

    // Get all stores with average ratings
    const storeStats = await db
      .select({
        ownerId: store.ownerId,
        averageRating: sql<number>`avg(${rating.rating})`,
      })
      .from(store)
      .leftJoin(rating, eq(store.id, rating.storeId))
      .groupBy(store.ownerId)
      .execute()

    // Map store stats to users
    const usersWithStats = users.map((u) => {
      const stats = storeStats.find((s) => s.ownerId === u.id)
      return {
        ...u,
        averageRating: stats ? Number(stats.averageRating) : null,
      }
    })

    // Apply pagination and ensure address/role are present
    const paginatedResult = limit
      ? usersWithStats.slice(offset || 0, (offset || 0) + limit)
      : usersWithStats

    return {
      users: paginatedResult.map(u => ({
        ...u,
        address: u.address || null, // Explicitly handle address
        role: u.role || "user"
      })),
      total: users.length,
    }
  } catch (error) {
    throw new Error(`Failed to get users: ${error}`)
  }
}

export async function getUserById(id: string) {
  try {
    const users = await db.select().from(user).where(eq(user.id, id)).execute()

    return users[0] || null
  } catch (error) {
    throw new Error(`Failed to get user: ${error}`)
  }
}

export async function getUserWithRatings(userId: string) {
  try {
    const users = await db
      .select()
      .from(user)
      .where(eq(user.id, userId))
      .execute()

    if (!users[0]) {
      return null
    }

    const userRatings = await db
      .select()
      .from(rating)
      .where(eq(rating.userId, userId))
      .execute()

    return {
      ...users[0],
      ratings: userRatings,
    }
  } catch (error) {
    throw new Error(`Failed to get user with ratings: ${error}`)
  }
}

export async function deleteUser(id: string) {
  try {
    const session = await auth.api.getSession({
        headers: await headers()
    });
    
    if (!session || session.user.role !== "admin") {
        throw new Error("Unauthorized");
    }

    await db.delete(user).where(eq(user.id, id)).execute()
    return { success: true }
  } catch (error) {
    throw new Error(`Failed to delete user: ${error}`)
  }
}
