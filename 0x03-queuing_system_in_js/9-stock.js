import express from 'express';
import { createClient } from 'redis';
import { promisify } from 'util';

const listProducts = [
  {
    id: 1,
    name: 'Suitcase 250',
    price: 50,
    stock: 4,
  },
  {
    id: 2,
    name: 'Suitcase 450',
    price: 100,
    stock: 10,
  },
  {
    id: 3,
    name: 'Suitcase 650',
    price: 350,
    stock: 2,
  },
  {
    id: 4,
    name: 'Suitcase 1050',
    price: 550,
    stock: 5,
  },
];

const app = express();
const client = createClient();

function getItemById(id) {
  return listProducts.find((obj) => obj.id === id);
}

function reserveStockById(itemId, stock) {
  client.set = promisify(client.set);
  return client.set(`item.${itemId}`, stock);
}

async function getCurrentReservedStockById(itemId) {
  client.get = promisify(client.get);
  return client.get(`item.${itemId}`);
}

app.get('/list_products', (req, res) => {
  const newList = listProducts.map((elem) => {
    return {
      itemId: elem.id,
      itemName: elem.name,
      price: elem.price,
      initialAvailableQuantity: elem.stock,
    };
  });
  res.json(newList);
});

app.get('/list_products/:itemId', async (req, res) => {
  const itemId = Number(req.params.itemId);

  const product = getItemById(itemId);
  if (!product) {
    res.json({ status: 'Product not found' });
  } else {
    let reservedStock = (await getCurrentReservedStockById(itemId)) || 0;
    reservedStock = Number.parseInt(reservedStock, 10);
    product.currentQuantity = product.stock - reservedStock;
    res.json(product);
  }
});

app.get('/reserve_product/:itemId', async (req, res) => {
  const itemId = Number(req.params.itemId);
  const product = getItemById(itemId);
  if (!product) {
    return res.json({ status: 'Product not found' });
  }
  let reservedStock = await getCurrentReservedStockById(itemId);
  reservedStock = Number.parseInt(reservedStock, 10);
  const available = product.stock - reservedStock;
  if (available < 1) {
    return res.json({ status: 'Not enough stock available', itemId });
  }
  reservedStock = reservedStock || 0;
  console.log(reservedStock);
  await reserveStockById(itemId, reservedStock + 1);
  return res.json({ status: 'Reservation confirmed', itemId });
});

app.listen(1245);
