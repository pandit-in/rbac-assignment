import { db } from "../src/db"
import { user, rating, store } from "../src/db/schema"
import { eq, sql } from "drizzle-orm"

export async function getAllUsers(
  limit?: number,
  offset?: number,
  sortBy?: string,
  sortOrder?: "asc" | "desc"
) {
  try {
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

    // Apply sorting if specified (omitted for brevity, keeping simple for now)

    // Apply pagination
    const paginatedResult = limit
      ? usersWithStats.slice(offset || 0, (offset || 0) + limit)
      : usersWithStats

    return {
      users: paginatedResult,
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
    await db.delete(user).where(eq(user.id, id)).execute()
    return { success: true }
  } catch (error) {
    throw new Error(`Failed to delete user: ${error}`)
  }
}
