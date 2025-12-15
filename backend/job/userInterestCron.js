const cron = require("node-cron");
const { callInterestAgent } = require("../agent/InterestAgent");
const { getAllUsersId } = require("../lib/userAPI");
const { logInfo, logError } = require("../lib/commonfunc");

// 每天凌晨 3 点跑一次
function registerUserInterestCron() {
  cron.schedule(
    "0 3 * * *", // 每天 3 点跑一次
    // "*/60 * * * * *", // 每 60 秒跑一次，测试用
    async () => {
      logInfo("[CRON/userInterest] Job started");

      try {
        const userIds = await getAllUsersId(); // $id
        logInfo("[CRON/userInterest] total users:", userIds);
        for (const userId of userIds) {
          const threadId = `cron-${userId}-${Date.now()}`;
          logInfo("[CRON/userInterest] processing user:", userId);

          try {
            await callInterestAgent(userId, threadId);
          } catch (e) {
            logError("[CRON/userInterest] error for user:", userId, e);
          }
        }

        logInfo("[CRON/userInterest] Job finished");
      } catch (e) {
        logError("[CRON/userInterest] unexpected error:", e);
      }
    },
    {
      timezone: "Asia/Shanghai", // 设置为上海时间
    }
  );

  logInfo('[CRON/userInterest] Registered: "0 3 * * *"');
}

module.exports = { registerUserInterestCron };
