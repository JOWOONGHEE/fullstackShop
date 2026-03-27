import { query } from "./_generated/server";
import { v } from "convex/values";
import { requireAdmin } from "./users";

export const getSalesStats = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);

    const paidOrders = await ctx.db
      .query("orders")
      .filter((q) =>
        q.or(
          q.eq(q.field("status"), "paid"),
          q.eq(q.field("status"), "shipping"),
          q.eq(q.field("status"), "delivered")
        )
      )
      .take(1000);

    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
    const yearStart = new Date(now.getFullYear(), 0, 1).getTime();

    let dailyTotal = 0;
    let monthlyTotal = 0;
    let yearlyTotal = 0;
    let totalRevenue = 0;

    for (const order of paidOrders) {
      totalRevenue += order.totalAmount;
      if (order._creationTime >= todayStart) dailyTotal += order.totalAmount;
      if (order._creationTime >= monthStart) monthlyTotal += order.totalAmount;
      if (order._creationTime >= yearStart) yearlyTotal += order.totalAmount;
    }

    const products = await ctx.db.query("products").take(1000);
    const allOrders = await ctx.db.query("orders").take(1000);

    return {
      totalRevenue,
      dailyTotal,
      monthlyTotal,
      yearlyTotal,
      totalOrders: allOrders.length,
      paidOrders: paidOrders.length,
      totalProducts: products.length,
    };
  },
});
