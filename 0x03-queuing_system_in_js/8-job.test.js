import { createQueue } from 'kue';
import sinon from 'sinon';
import { expect } from 'chai';
import createPushNotificationsJobs from './8-job';

describe('tests createPushNotificationsJobs', function () {
  const queue = createQueue();
  const logSpy = sinon.spy(console, 'log');
  const queueSpy = sinon.spy(queue, 'create');
  const jobs = [
    {
      phoneNumber: '4153518780',
      message: 'This is the code 1234 to verify your account',
    },
    {
      phoneNumber: '4153518781',
      message: 'This is the code 4562 to verify your account',
    },
  ];

  before(function () {
    queue.testMode.enter(true);
  });

  afterEach(function () {
    queue.testMode.clear();
    queueSpy.resetHistory();
    logSpy.resetHistory();
  });

  after(function () {
    queue.testMode.clear();
    queue.testMode.exit();
    logSpy.restore();
    queueSpy.restore();
  });

  it('should fail if jobs not Array', function () {
    const job = { phoneNumber: '388493', message: 'should fail' };
    try {
      createPushNotificationsJobs(job, queue);
    } catch (err) {
      expect(err.message).to.equal('Jobs is not an array');
    }
  });

  it('should create two jobs', function (done) {
    createPushNotificationsJobs(jobs, queue);
    expect(queue.testMode.jobs.length).to.be.equal(2);
    expect(queue.testMode.jobs[0].data).to.deep.equal(jobs[0]);
    expect(queue.testMode.jobs[1].data).to.deep.equal(jobs[1]);
    expect(queueSpy.getCall(0).args).to.deep.equal([
      'push_notification_code_3',
      jobs[0],
    ]);
    queue.process('push_notification_code_3', () => {
      expect(logSpy.getCall(0).args[0]).to.be.equal(
        `Notification job created: ${queue.testMode.jobs[0].id}`
      );
      expect(logSpy.getCall(1).args[0]).to.be.equal(
        `Notification job created: ${queue.testMode.jobs[1].id}`
      );
      done();
    });
  });

  it('should listen on complete', function (done) {
    createPushNotificationsJobs(jobs, queue);
    queue.testMode.jobs[0].addListener('complete', () => {
      expect(
        logSpy
          .getCall(0)
          .calledWith(`Notification job ${queue.testMode.jobs[0].id} completed`)
      ).to.be.true;
      done();
    });
    queue.testMode.jobs[0].emit('complete', 'result');
  });

  it('should listen on failed', function (done) {
    createPushNotificationsJobs(jobs, queue);
    queue.testMode.jobs[0].addListener('failed', () => {
      expect(
        logSpy
          .getCall(2)
          .calledWith(
            `Notification job ${queue.testMode.jobs[0].id} failed: Error: Error`
          )
      ).to.be.true;
      done();
    });
    queue.testMode.jobs[0].emit('failed', new Error('Error'));
  });

  it('should listen on progress', function (done) {
    createPushNotificationsJobs(jobs, queue);
    queue.testMode.jobs[0].addListener('progress', () => {
      expect(
        logSpy
          .getCall(2)
          .calledWith(
            `Notification job ${queue.testMode.jobs[0].id} 50% complete`
          )
      ).to.be.true;
      done();
    });
    queue.testMode.jobs[0].emit('progress', 50);
  });
});
