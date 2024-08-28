import { createQueue } from 'kue';
import { createClient } from 'redis';
import { promisify } from 'util';
import express from 'express';

const client = createClient();
const queue = createQueue();
const app = express();

async function reserveSeat(number) {
  client.set = promisify(client.set);
  await client.set('available_seats', number);
}

async function getCurrentAvailableSeats() {
  client.get = promisify(client.get);
  const availableSeats = await client.get('available_seats');
  return parseInt(availableSeats, 10);
}
let reservationEnabled;

reserveSeat(50).then(() => {
  reservationEnabled = true;
});

app.get('/available_seats', async (req, res) => {
  const availableSeats = await getCurrentAvailableSeats();
  res.json({ numberOfAvailableSeats: `${availableSeats}` });
});

app.get('/reserve_seat', async (req, res) => {
  if (!reservationEnabled) {
    return res.json({ status: 'Reservation are blocked' });
  }
  const job = queue.create('reserve_seat');
  job
    .on('complete', () => {
      console.log(`Seat reservation job ${job.id} completed`);
    })
    .on('failed', (err) => {
      console.log(`Seat reservation job ${job.id} failed: ${err}`);
    });
  job.save((err) => {
    return err
      ? res.json({ status: 'Reservation failed' })
      : res.json({ status: 'Reservation in process' });
  });
});

app.get('/process', async (req, res) => {
  queue.process('reserve_seat', async (job, done) => {
    const availableSeats = await getCurrentAvailableSeats();
    const newAvailable = availableSeats - 1;
    await reserveSeat(newAvailable);
    if (newAvailable === 0) {
      reservationEnabled = false;
    }
    if (newAvailable < 0) {
      done(new Error('Not enough seats available'));
    }
    done();
  });
  return res.json({ status: 'Queue processing' });
});

app.listen(1245);
