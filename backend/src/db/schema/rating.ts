import {
  pgTable,
  text,
  timestamp,
  serial,
  integer,
  uniqueIndex,
} from "drizzle-orm/pg-core"
import { user } from "./auth.js"
import { store } from "./store.js"
import { relations } from "drizzle-orm"

export const rating = pgTable(
  "rating",
  {
    id: serial("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    storeId: text("store_id")
      .notNull()
      .references(() => store.id, { onDelete: "cascade" }),
    rating: integer("rating").notNull(),
    review: text("review"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => {
    return {
      userStoreUnique: uniqueIndex("user_store_unique").on(
        table.userId,
        table.storeId
      ),
    }
  }
)

export type Rating = typeof rating.$inferSelect
export type RatingCreate = typeof rating.$inferInsert

export const ratingRelations = relations(rating, ({ one }) => ({
  user: one(user, {
    fields: [rating.userId],
    references: [user.id],
  }),
  store: one(store, {
    fields: [rating.storeId],
    references: [store.id],
  }),
}))
