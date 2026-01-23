import logger from "../../shared/helpers/logger";
import { prisma } from "../../shared/helpers/prisma";
import { ApiResponse } from "../../shared/types";

export class DashboardService {
  async getAdminDashboard(): Promise<ApiResponse> {
    try {
      const [
        totalUsers,
        activeUsers,
        newUsersThisMonth,
        totalProducts,
        activeProducts,
        outOfStockProducts,
        totalOrders,
        pendingOrders,
        totalRevenue,
        recentOrders,
        blogStats,
        paymentStats,
      ] = await Promise.all([
        prisma.user.count(),
        prisma.user.count({ where: { status: "ACTIVE" } }),
        prisma.user.count({
          where: {
            createdAt: {
              gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
            },
          },
        }),
        prisma.product.count(),
        prisma.product.count({ where: { isActive: true } }),
        prisma.product.count({ where: { stock: 0 } }),
        prisma.order.count(),
        prisma.order.count({ where: { status: "PENDING" } }),
        prisma.order.aggregate({
          where: { paymentStatus: "PAID" },
          _sum: { total: true },
        }),
        prisma.order.findMany({
          take: 10,
          orderBy: { createdAt: "desc" },
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        }),
        prisma.blogPost.count(),
        prisma.payment.aggregate({
          where: { status: "PAID" },
          _sum: { amount: true },
        }),
      ]);

      // Get user growth data (last 6 months)
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

      const monthlyUserGrowth = await prisma.user.groupBy({
        by: ["createdAt"],
        where: {
          createdAt: {
            gte: sixMonthsAgo,
          },
        },
        _count: {
          id: true,
        },
        orderBy: {
          createdAt: "asc",
        },
      });

      // Get revenue data (last 6 months)
      const monthlyRevenue = await prisma.order.groupBy({
        by: ["createdAt"],
        where: {
          createdAt: {
            gte: sixMonthsAgo,
          },
          paymentStatus: "PAID",
        },
        _sum: {
          total: true,
        },
        orderBy: {
          createdAt: "asc",
        },
      });

      const dashboard = {
        overview: {
          users: {
            total: totalUsers,
            active: activeUsers,
            newThisMonth: newUsersThisMonth,
          },
          products: {
            total: totalProducts,
            active: activeProducts,
            outOfStock: outOfStockProducts,
          },
          orders: {
            total: totalOrders,
            pending: pendingOrders,
            revenue: totalRevenue._sum.total || 0,
          },
          blog: {
            totalPosts: blogStats,
          },
          payments: {
            totalRevenue: paymentStats._sum.amount || 0,
          },
        },
        charts: {
          userGrowth: monthlyUserGrowth.map((item) => ({
            month: item.createdAt.toLocaleDateString("en-US", {
              month: "short",
            }),
            users: item._count.id,
          })),
          revenue: monthlyRevenue.map((item) => ({
            month: item.createdAt.toLocaleDateString("en-US", {
              month: "short",
            }),
            revenue: item._sum.total || 0,
          })),
        },
        recentOrders,
        quickStats: {
          averageOrderValue:
            totalOrders > 0 ? (totalRevenue._sum.total || 0) / totalOrders : 0,
          conversionRate: totalUsers > 0 ? (totalOrders / totalUsers) * 100 : 0,
          inventoryValue: await this.calculateInventoryValue(),
        },
      };

      return {
        success: true,
        message: "Admin dashboard data retrieved successfully",
        data: dashboard,
      };
    } catch (error) {
      logger.error("Get admin dashboard error:", error);
      throw error;
    }
  }

  async getUserDashboard(userId: string): Promise<ApiResponse> {
    try {
      const [
        user,
        totalOrders,
        pendingOrders,
        totalSpent,
        recentOrders,
        favorites,
        reviews,
        notifications,
        subscription,
      ] = await Promise.all([
        prisma.user.findUnique({
          where: { id: userId },
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
            createdAt: true,
            lastLoginAt: true,
          },
        }),
        prisma.order.count({ where: { userId } }),
        prisma.order.count({ where: { userId, status: "PENDING" } }),
        prisma.order.aggregate({
          where: { userId, paymentStatus: "PAID" },
          _sum: { total: true },
        }),
        prisma.order.findMany({
          where: { userId },
          take: 5,
          orderBy: { createdAt: "desc" },
          include: {
            orderItems: {
              include: {
                product: {
                  select: {
                    id: true,
                    name: true,
                    images: true,
                  },
                },
              },
            },
          },
        }),
        prisma.favorite.count({ where: { userId } }),
        prisma.review.count({ where: { userId } }),
        prisma.notification.findMany({
          where: { userId, isRead: false },
          take: 10,
          orderBy: { createdAt: "desc" },
        }),
        prisma.subscription.findUnique({
          where: { userId },
        }),
      ]);

      // Get order history (last 6 months)
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

      const monthlyOrders = await prisma.order.groupBy({
        by: ["createdAt"],
        where: {
          userId,
          createdAt: {
            gte: sixMonthsAgo,
          },
        },
        _count: {
          id: true,
        },
        orderBy: {
          createdAt: "asc",
        },
      });

      const dashboard = {
        user,
        overview: {
          orders: {
            total: totalOrders,
            pending: pendingOrders,
            totalSpent: totalSpent._sum.total || 0,
          },
          favorites,
          reviews,
          unreadNotifications: notifications.length,
          subscription: subscription
            ? {
                plan: subscription.plan,
                status: subscription.status,
                currentPeriodEnd: subscription.currentPeriodEnd,
              }
            : null,
        },
        charts: {
          orderHistory: monthlyOrders.map((item) => ({
            month: item.createdAt.toLocaleDateString("en-US", {
              month: "short",
            }),
            orders: item._count.id,
          })),
        },
        recentOrders,
        notifications,
        quickActions: [
          { label: "Shop Now", icon: "🛍️", link: "/products" },
          { label: "Track Orders", icon: "📦", link: "/orders" },
          { label: "Write Review", icon: "⭐", link: "/reviews" },
          { label: "Update Profile", icon: "👤", link: "/profile" },
        ],
      };

      return {
        success: true,
        message: "User dashboard data retrieved successfully",
        data: dashboard,
      };
    } catch (error) {
      logger.error("Get user dashboard error:", error);
      throw error;
    }
  }

  async getManagerDashboard(): Promise<ApiResponse> {
    try {
      const [
        totalOrders,
        pendingOrders,
        processingOrders,
        totalRevenue,
        topProducts,
        recentActivities,
        inventoryAlerts,
      ] = await Promise.all([
        prisma.order.count(),
        prisma.order.count({ where: { status: "PENDING" } }),
        prisma.order.count({ where: { status: "PROCESSING" } }),
        prisma.order.aggregate({
          where: { paymentStatus: "PAID" },
          _sum: { total: true },
        }),
        prisma.product.findMany({
          take: 5,
          orderBy: { reviewCount: "desc" },
          select: {
            id: true,
            name: true,
            price: true,
            rating: true,
            reviewCount: true,
            stock: true,
          },
        }),
        prisma.activity.findMany({
          take: 10,
          orderBy: { createdAt: "desc" },
          include: {
            user: {
              select: {
                id: true,
                name: true,
                avatar: true,
              },
            },
          },
        }),
        prisma.product.findMany({
          where: { stock: { lt: 10 } },
          take: 5,
          orderBy: { stock: "asc" },
          select: {
            id: true,
            name: true,
            stock: true,
          },
        }),
      ]);

      // Get daily order stats (last 7 days)
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const dailyOrders = await prisma.order.groupBy({
        by: ["createdAt"],
        where: {
          createdAt: {
            gte: sevenDaysAgo,
          },
        },
        _count: {
          id: true,
        },
        orderBy: {
          createdAt: "asc",
        },
      });

      const dashboard = {
        overview: {
          orders: {
            total: totalOrders,
            pending: pendingOrders,
            processing: processingOrders,
            revenue: totalRevenue._sum.total || 0,
          },
        },
        charts: {
          dailyOrders: dailyOrders.map((item) => ({
            day: item.createdAt.toLocaleDateString("en-US", {
              weekday: "short",
            }),
            orders: item._count.id,
          })),
        },
        topProducts,
        recentActivities,
        inventoryAlerts,
        quickStats: {
          averageProcessingTime: await this.calculateAverageProcessingTime(),
          orderFulfillmentRate: await this.calculateOrderFulfillmentRate(),
        },
      };

      return {
        success: true,
        message: "Manager dashboard data retrieved successfully",
        data: dashboard,
      };
    } catch (error) {
      logger.error("Get manager dashboard error:", error);
      throw error;
    }
  }

  async getAnalytics(
    timeRange: "day" | "week" | "month" | "year" = "month",
  ): Promise<ApiResponse> {
    try {
      let startDate = new Date();

      switch (timeRange) {
        case "day":
          startDate.setDate(startDate.getDate() - 1);
          break;
        case "week":
          startDate.setDate(startDate.getDate() - 7);
          break;
        case "month":
          startDate.setMonth(startDate.getMonth() - 1);
          break;
        case "year":
          startDate.setFullYear(startDate.getFullYear() - 1);
          break;
      }

      const [
        newUsers,
        newOrders,
        revenue,
        topProducts,
        userGrowth,
        revenueTrend,
        categorySales,
      ] = await Promise.all([
        prisma.user.count({
          where: { createdAt: { gte: startDate } },
        }),
        prisma.order.count({
          where: { createdAt: { gte: startDate } },
        }),
        prisma.order.aggregate({
          where: {
            createdAt: { gte: startDate },
            paymentStatus: "PAID",
          },
          _sum: { total: true },
        }),
        prisma.product.findMany({
          take: 10,
          orderBy: { reviewCount: "desc" },
          include: {
            category: {
              select: {
                id: true,
                name: true,
              },
            },
            _count: {
              select: {
                orderItems: true,
              },
            },
          },
        }),
        this.getUserGrowthData(startDate),
        this.getRevenueTrendData(startDate),
        this.getCategorySalesData(startDate),
      ]);

      const analytics = {
        summary: {
          newUsers,
          newOrders,
          revenue: revenue._sum.total || 0,
        },
        topProducts,
        charts: {
          userGrowth,
          revenueTrend,
          categorySales,
        },
        metrics: {
          averageOrderValue:
            newOrders > 0 ? (revenue._sum.total || 0) / newOrders : 0,
          userRetentionRate: await this.calculateUserRetentionRate(startDate),
          conversionRate: await this.calculateConversionRate(startDate),
        },
      };

      return {
        success: true,
        message: "Analytics data retrieved successfully",
        data: analytics,
      };
    } catch (error) {
      logger.error("Get analytics error:", error);
      throw error;
    }
  }

  private async calculateInventoryValue(): Promise<number> {
    const products = await prisma.product.findMany({
      where: { isActive: true },
      select: {
        price: true,
        stock: true,
      },
    });

    return products.reduce((total, product) => {
      return total + product.price * product.stock;
    }, 0);
  }

  private async calculateAverageProcessingTime(): Promise<number> {
    const orders = await prisma.order.findMany({
      where: {
        status: "DELIVERED",
        createdAt: {
          gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
        },
      },
      select: {
        createdAt: true,
        updatedAt: true,
      },
    });

    if (orders.length === 0) return 0;

    const totalTime = orders.reduce((total, order) => {
      const processingTime =
        order.updatedAt.getTime() - order.createdAt.getTime();
      return total + processingTime;
    }, 0);

    return totalTime / orders.length / (1000 * 60 * 60 * 24); // Convert to days
  }

  private async calculateOrderFulfillmentRate(): Promise<number> {
    const [deliveredOrders, totalOrders] = await Promise.all([
      prisma.order.count({
        where: {
          status: "DELIVERED",
          createdAt: {
            gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
          },
        },
      }),
      prisma.order.count({
        where: {
          createdAt: {
            gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
          },
        },
      }),
    ]);

    return totalOrders > 0 ? (deliveredOrders / totalOrders) * 100 : 0;
  }

  private async getUserGrowthData(startDate: Date): Promise<any[]> {
    const users = await prisma.user.groupBy({
      by: ["createdAt"],
      where: {
        createdAt: { gte: startDate },
      },
      _count: {
        id: true,
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    return users.map((item) => ({
      date: item.createdAt.toISOString().split("T")[0],
      users: item._count.id,
    }));
  }

  private async getRevenueTrendData(startDate: Date): Promise<any[]> {
    const orders = await prisma.order.groupBy({
      by: ["createdAt"],
      where: {
        createdAt: { gte: startDate },
        paymentStatus: "PAID",
      },
      _sum: {
        total: true,
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    return orders.map((item) => ({
      date: item.createdAt.toISOString().split("T")[0],
      revenue: item._sum.total || 0,
    }));
  }

  private async getCategorySalesData(startDate: Date): Promise<any[]> {
    const orderItems = await prisma.orderItem.findMany({
      where: {
        order: {
          createdAt: { gte: startDate },
          paymentStatus: "PAID",
        },
      },
      include: {
        product: {
          include: {
            category: true,
          },
        },
      },
    });

    const categorySales: Record<string, number> = {};

    orderItems.forEach((item) => {
      const categoryName = item.product.category?.name || "Uncategorized";
      categorySales[categoryName] =
        (categorySales[categoryName] || 0) + item.price * item.quantity;
    });

    return Object.entries(categorySales).map(([category, revenue]) => ({
      category,
      revenue,
    }));
  }

  private async calculateUserRetentionRate(startDate: Date): Promise<number> {
    const users = await prisma.user.findMany({
      where: {
        createdAt: { gte: startDate },
      },
      select: {
        id: true,
        lastLoginAt: true,
      },
    });

    if (users.length === 0) return 0;

    const activeUsers = users.filter((user) => {
      if (!user.lastLoginAt) return false;
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      return user.lastLoginAt >= thirtyDaysAgo;
    });

    return (activeUsers.length / users.length) * 100;
  }

  private async calculateConversionRate(startDate: Date): Promise<number> {
    const [usersWithOrders, totalUsers] = await Promise.all([
      prisma.user.count({
        where: {
          createdAt: { gte: startDate },
          orders: {
            some: {},
          },
        },
      }),
      prisma.user.count({
        where: {
          createdAt: { gte: startDate },
        },
      }),
    ]);

    return totalUsers > 0 ? (usersWithOrders / totalUsers) * 100 : 0;
  }

  async getSystemStatus(): Promise<ApiResponse> {
    try {
      // Check database connection
      const dbStatus = await prisma.$queryRaw`SELECT 1 as status`
        .then(() => "healthy")
        .catch(() => "unhealthy");

      // Check external services (simplified)
      const services = {
        database: dbStatus,
        stripe: "healthy", // You would implement actual check
        cloudinary: "healthy", // You would implement actual check
        email: "healthy", // You would implement actual check
      };

      // Get system metrics
      const metrics = {
        uptime: process.uptime(),
        memoryUsage: process.memoryUsage(),
        cpuUsage: process.cpuUsage(),
        activeConnections: 0, // You would track this
      };

      return {
        success: true,
        message: "System status retrieved successfully",
        data: {
          services,
          metrics,
          lastChecked: new Date().toISOString(),
        },
      };
    } catch (error) {
      logger.error("Get system status error:", error);
      throw error;
    }
  }
}
