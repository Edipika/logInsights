import { slackRoutingMap, FALLBACK_WEBHOOK } from "../config/slackRouting";

interface AlertPayload {
    project: string;
    environment: string;
    service: string;
    errorCount: number;
    threshold: number;
    minuteBucket: string;
    sampleMessage?: string; // last error message for context
}

export async function sendSlackAlert(payload: AlertPayload): Promise<void> {
    const routingKey = `${payload.project}-${payload.environment}`;
    console.debug(`[SLACK] Routing key: ${routingKey}`);
    const webhookUrl = slackRoutingMap[routingKey] ?? FALLBACK_WEBHOOK;

    if (!webhookUrl) {
        console.warn(`[SLACK] No webhook configured for "${routingKey}", alert dropped.`);
        throw new Error(`[SLACK] No webhook configured for "${routingKey}", alert dropped.`);
        // return;
    }

    const body = {
        text: `*Error Threshold Breached*`,
        attachments: [
            {
                color: "#FF0000",
                fields: [
                    { title: "Project", value: payload.project, short: true },
                    { title: "Environment", value: payload.environment, short: true },
                    { title: "Service", value: payload.service, short: true },
                    { title: "Error Count", value: `${payload.errorCount} errors/min`, short: true },
                    { title: "Threshold", value: `${payload.threshold}`, short: true },
                    { title: "Time Bucket", value: payload.minuteBucket, short: true },
                    ...(payload.sampleMessage
                        ? [{ title: "Last Error", value: `\`${payload.sampleMessage.slice(0, 200)}\``, short: false }]
                        : []),
                ],
                footer: "Log Monitoring System",
                ts: Math.floor(Date.now() / 1000).toString(),
            },
        ],
    };

    const res = await fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
    });

    if (!res.ok) {
        throw new Error(`Slack alert failed [${res.status}]: ${await res.text()}`);
    }

    console.log(`[SLACK] Alert sent for ${routingKey} → ${payload.service}`);
}