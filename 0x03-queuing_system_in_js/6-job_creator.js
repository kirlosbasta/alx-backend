import { createQueue } from 'kue';

const data = {
  phoneNumber: '+2348383',
  message: 'hello world',
};

const push_notification_code = createQueue();
const job = push_notification_code
  .create('push_notification_code', data)
  .save((err) => {
    if (!err) {
      console.log(`Notification job created: ${job.id}`);
    }
  });

job
  .on('complete', () => {
    console.log('Notification job completed');
  })
  .on('failed', () => {
    console.log('Notification job failed');
  });
