import { pgTable, text, timestamp } from "drizzle-orm/pg-core"
import { user } from "./auth.js"
import { relations } from "drizzle-orm"
import { rating } from "./rating.js"

export const store = pgTable("store", {
  id: text("id").primaryKey(),
  ownerId: text("owner_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  address: text("address").notNull(),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
})

export type Store = typeof store.$inferSelect
export type StoreCreate = typeof store.$inferInsert

export const storeRelations = relations(store, ({ one, many }) => ({
  owner: one(user, {
    fields: [store.ownerId],
    references: [user.id],
  }),
  ratings: many(rating),
}))
