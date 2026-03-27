import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    name: v.string(),
    email: v.optional(v.string()),
    externalId: v.string(),
    role: v.optional(v.union(v.literal("user"), v.literal("admin"))),
  }).index("byExternalId", ["externalId"]),

  products: defineTable({
    name: v.string(),
    description: v.string(),
    price: v.number(),
    imageUrl: v.string(),
    stock: v.number(),
  }),

  cartItems: defineTable({
    userId: v.id("users"),
    productId: v.id("products"),
    quantity: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_user_and_product", ["userId", "productId"]),

  orders: defineTable({
    userId: v.id("users"),
    status: v.union(
      v.literal("pending"),
      v.literal("paid"),
      v.literal("shipping"),
      v.literal("delivered")
    ),
    totalAmount: v.number(),
    stripeSessionId: v.string(),
  })
    .index("by_user", ["userId"])
    .index("by_stripeSession", ["stripeSessionId"]),

  orderItems: defineTable({
    orderId: v.id("orders"),
    productId: v.id("products"),
    quantity: v.number(),
    price: v.number(),
  }).index("by_order", ["orderId"]),
});
