import { db } from "../src/db/index.js"
import { rating, store, user } from "../src/db/schema/index.js"
import { eq, and } from "drizzle-orm"

export async function getRatingsByStore(storeId: string) {
  try {
    const storeRatings = await db
      .select({
        id: rating.id,
        rating: rating.rating,
        review: rating.review,
        userId: rating.userId,
        createdAt: rating.createdAt,
        userName: user.name,
      })
      .from(rating)
      .leftJoin(user, eq(rating.userId, user.id))
      .where(eq(rating.storeId, storeId))
      .execute()

    return storeRatings
  } catch (error) {
    throw new Error(`Failed to get store ratings: ${error}`)
  }
}

export async function getUserRatings(userId: string) {
  try {
    const userRatings = await db
      .select()
      .from(rating)
      .where(eq(rating.userId, userId))
      .execute()

    return userRatings
  } catch (error) {
    throw new Error(`Failed to get user ratings: ${error}`)
  }
}

export async function getRating(userId: string, storeId: string) {
  try {
    const ratings = await db
      .select()
      .from(rating)
      .where(and(eq(rating.userId, userId), eq(rating.storeId, storeId)))
      .execute()

    return ratings[0] || null
  } catch (error) {
    throw new Error(`Failed to get rating: ${error}`)
  }
}

export async function createRating(
  userId: string,
  storeId: string,
  ratingValue: number,
  review?: string
) {
  try {
    // Check if store exists
    const stores = await db
      .select()
      .from(store)
      .where(eq(store.id, storeId))
      .execute()

    if (!stores[0]) {
      throw new Error("Store not found")
    }

    // Check if user already rated this store
    const existingRating = await getRating(userId, storeId)
    if (existingRating) {
      throw new Error("You have already rated this store")
    }

    const result = await db
      .insert(rating)
      .values({
        userId,
        storeId,
        rating: ratingValue,
        review,
      })
      .returning()

    return result[0]
  } catch (error) {
    throw new Error(`Failed to create rating: ${error}`)
  }
}

export async function updateRating(
  id: number,
  ratingValue?: number,
  review?: string
) {
  try {
    const updateData: Partial<typeof rating.$inferInsert> = {
      updatedAt: new Date(),
    }

    if (ratingValue !== undefined) {
      if (ratingValue < 1 || ratingValue > 5) {
        throw new Error("Rating must be between 1 and 5")
      }
      updateData.rating = ratingValue
    }

    if (review !== undefined) {
      updateData.review = review
    }

    const result = await db
      .update(rating)
      .set(updateData)
      .where(eq(rating.id, id))
      .returning()

    return result[0]
  } catch (error) {
    throw new Error(`Failed to update rating: ${error}`)
  }
}

export async function deleteRating(id: number) {
  try {
    await db.delete(rating).where(eq(rating.id, id)).execute()
    return { success: true }
  } catch (error) {
    throw new Error(`Failed to delete rating: ${error}`)
  }
}

export async function getStoreMetrics(storeId: string) {
  try {
    const storeRatings = await getRatingsByStore(storeId)

    if (storeRatings.length === 0) {
      return {
        storeId,
        totalRatings: 0,
        averageRating: 0,
        ratingDistribution: {
          "1": 0,
          "2": 0,
          "3": 0,
          "4": 0,
          "5": 0,
        },
      }
    }

    const totalRatings = storeRatings.length
    const sum = storeRatings.reduce((acc, r) => acc + r.rating, 0)
    const averageRating = parseFloat((sum / totalRatings).toFixed(2))

    const ratingDistribution = {
      "1": 0,
      "2": 0,
      "3": 0,
      "4": 0,
      "5": 0,
    }

    storeRatings.forEach((r) => {
      ratingDistribution[String(r.rating) as keyof typeof ratingDistribution]++
    })

    return {
      storeId,
      totalRatings,
      averageRating,
      ratingDistribution,
    }
  } catch (error) {
    throw new Error(`Failed to get store metrics: ${error}`)
  }
}
