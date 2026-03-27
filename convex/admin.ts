import { query } from "./_generated/server";
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

    let dailyTotal = 0, monthlyTotal = 0, yearlyTotal = 0, totalRevenue = 0;
    for (const order of paidOrders) {
      totalRevenue += order.totalAmount;
      if (order._creationTime >= todayStart) dailyTotal += order.totalAmount;
      if (order._creationTime >= monthStart) monthlyTotal += order.totalAmount;
      if (order._creationTime >= yearStart) yearlyTotal += order.totalAmount;
    }

    // 최근 7일 일별 매출
    const daily: { date: string; amount: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
      const start = d.getTime();
      const end = start + 86400000;
      const amount = paidOrders
        .filter((o) => o._creationTime >= start && o._creationTime < end)
        .reduce((sum, o) => sum + o.totalAmount, 0);
      daily.push({
        date: `${d.getMonth() + 1}/${d.getDate()}`,
        amount,
      });
    }

    const products = await ctx.db.query("products").take(1000);
    const allOrders = await ctx.db.query("orders").take(1000);

    // 재고 부족 상품 (stock <= 5)
    const lowStock = products.filter((p) => p.stock <= 5).slice(0, 10);

    return {
      totalRevenue, dailyTotal, monthlyTotal, yearlyTotal,
      totalOrders: allOrders.length,
      paidOrders: paidOrders.length,
      totalProducts: products.length,
      dailyChart: daily,
      lowStockProducts: lowStock,
    };
  },
});

export const getRecentOrders = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);
    const orders = await ctx.db.query("orders").order("desc").take(5);
    return await Promise.all(
      orders.map(async (order) => {
        const user = await ctx.db.get(order.userId);
        return { ...order, user };
      })
    );
  },
});
