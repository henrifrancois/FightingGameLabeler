import { Bot, Post } from '@skyware/bot';

import { HOST, PORT, BSKY_IDENTIFIER, BSKY_PASSWORD } from './config.js';
import { labelerServer } from './labeler.js';
import logger from './logger.js';
import { DELETE, LABELS } from './constants.js';

const bot = new Bot();
await bot.login({
  identifier: BSKY_IDENTIFIER,
  password: BSKY_PASSWORD,
});

labelerServer.start({ port: PORT, host: HOST }, (error, address) => {
  if (error) {
    logger.error('Error starting server: %s', error);
  } else {
    logger.info(`Labeler server listening on ${address}`);
  }
});

bot.on("like", async ({ subject, user }) => {
  if (subject instanceof Post) {
    const rkey = subject.uri.split('/').pop();
    switch (rkey) {
      case DELETE:
        logger.info(`User ${user.did} liked post ${subject.uri}, deleting all previous labels`);
        await user.negateProfileLabels(LABELS.map((label) => label.identifier));
        break;
      default:
        const label = LABELS.find((label) => label.rkey === subject.uri.split('/').pop());
        if (label) {
          logger.info(`User ${user.did} liked post ${subject.uri}, labeling with ${label.identifier}`);
          await user.labelProfile([label.identifier])
        }
        break;
    }
  }
});


function shutdown() {
  try {
    logger.info('Shutting down gracefully...');
    labelerServer.stop();
  } catch (error) {
    logger.error(`Error shutting down gracefully: ${error}`);
    process.exit(1);
  }
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
