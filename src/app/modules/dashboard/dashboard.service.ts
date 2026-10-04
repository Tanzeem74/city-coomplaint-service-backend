import prisma from "../../lib/prisma";

const getAdminDashboard = async () => {
  const [
    totalUsers,
    totalCitizens,
    totalStaff,
    totalComplaints,
    submitted,
    assigned,
    inProgress,
    resolved,
    closed,
    rejected,
    cancelled,
    totalDepartments,
    totalCategories,
  ] = await Promise.all([
    prisma.user.count({
      where: { isDeleted: false },
    }),

    prisma.user.count({
      where: {
        role: "CITIZEN",
        isDeleted: false,
      },
    }),

    prisma.user.count({
      where: {
        role: "STAFF",
        isDeleted: false,
      },
    }),

    prisma.complaint.count({
      where: { isDeleted: false },
    }),

    prisma.complaint.count({
      where: {
        status: "SUBMITTED",
        isDeleted: false,
      },
    }),

    prisma.complaint.count({
      where: {
        status: "ASSIGNED",
        isDeleted: false,
      },
    }),

    prisma.complaint.count({
      where: {
        status: "IN_PROGRESS",
        isDeleted: false,
      },
    }),

    prisma.complaint.count({
      where: {
        status: "RESOLVED",
        isDeleted: false,
      },
    }),

    prisma.complaint.count({
      where: {
        status: "CLOSED",
        isDeleted: false,
      },
    }),

    prisma.complaint.count({
      where: {
        status: "REJECTED",
        isDeleted: false,
      },
    }),

    prisma.complaint.count({
      where: {
        status: "CANCELLED",
        isDeleted: false,
      },
    }),

    prisma.department.count({
      where: { isDeleted: false },
    }),

    prisma.category.count({
      where: { isDeleted: false },
    }),
  ]);

  return {
    users: {
      total: totalUsers,
      citizens: totalCitizens,
      staff: totalStaff,
    },

    complaints: {
      total: totalComplaints,
      submitted,
      assigned,
      inProgress,
      resolved,
      closed,
      rejected,
      cancelled,
    },

    departments: totalDepartments,
    categories: totalCategories,
  };
};

export const DashboardService = {
  getAdminDashboard,
};
