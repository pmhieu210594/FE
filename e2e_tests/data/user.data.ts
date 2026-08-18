const usersData = {
  standardUser: {
    username: process.env.TEST_USERNAME || "pd_khoa",
    password: process.env.TEST_PASSWORD || "Admin@123456",
  },

  adminUser: {
    username: process.env.ADMIN_USERNAME || "nk_trung",
    password: process.env.ADMIN_PASSWORD || "Admin@123456",
  },

  inactiveUser: {
    username: process.env.INACTIVE_USERNAME || "lx_loc",
    password: process.env.INACTIVE_PASSWORD || "Admin@123456",
  },

  invalidUser: {
    username: "invalidUser",
    password: "wrongPassword",
  },
};

export default usersData;
