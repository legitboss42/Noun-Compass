import {
  deliverNotificationBatch,
  type NotificationDeliveryDatabase,
  type NotificationDeliveryResult,
} from "./notification-delivery-core";
import { preflightStageBatch } from "./stage-email-safety";
import { stageNotification, type InactiveStage, type StageContext } from "./stage-email-core";

export type StageDeliveryCandidate = {
  userId: string;
  email: string | null;
  display_name: string | null;
  stage: InactiveStage;
  context: StageContext;
};

/**
 * The testable delivery core performs the secret preflight before handing a
 * candidate to the notification adapter, so a missing secret cannot claim a
 * dedupe key or create an in-app notification.
 */
export async function deliverStageNotificationBatch(args: {
  environment: Record<string, string | undefined>;
  candidates: StageDeliveryCandidate[];
  database: NotificationDeliveryDatabase<StageDeliveryCandidate>;
  sendEmail(candidate: StageDeliveryCandidate): Promise<void>;
}): Promise<NotificationDeliveryResult> {
  return preflightStageBatch(args.environment, () => deliverNotificationBatch({
    candidates: args.candidates,
    database: args.database,
    makeNotification: (student) => {
      const note = stageNotification(student.stage, student.context);
      return { kind: "reengagement", title: note.title, body: note.body, actionUrl: note.actionUrl };
    },
    sendEmail: args.sendEmail,
  }));
}
