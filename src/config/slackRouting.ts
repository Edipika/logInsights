import 'dotenv/config';
// Each project+env combo points to a different Slack incoming webhook URL
// Create webhooks at: https://api.slack.com/apps → Incoming Webhooks
// console.log("ENV:", process.env.SLACK_WEBHOOK_HRMS_PROD);
export const slackRoutingMap: Record<string,  string | undefined> = {
  "hrms-production" :    process.env.SLACK_WEBHOOK_HRMS_PROD!, 
//   "hrms-staging":       process.env.SLACK_WEBHOOK_HRMS_STAGING!,

};

export const FALLBACK_WEBHOOK = process.env.SLACK_WEBHOOK_DEFAULT!; // catch-all channelv