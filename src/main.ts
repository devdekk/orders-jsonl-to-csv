import axios from 'axios';
import readJsonLines from 'read-json-lines-sync';
import converter from 'json-2-csv';
import fs from 'fs';

const ordersFileLocation =
  'https://s3-ap-southeast-2.amazonaws.com/catch-code-challenge/challenge-1/orders.jsonl';

async function fetchOrdersAndConvertToCSV() {
  try {
    // fetch file from s3
    const { data } = await axios.get(ordersFileLocation, {
      headers: {
        Accept: 'application/json'
      }
    });

    // https://www.npmjs.com/package/read-json-lines-sync
    // nice package to read jsonl data
    const orderList = readJsonLines(data);

    // process order data to required spec
    const processedOrders = processOrderDataForReport(orderList);

    // convert processed json data to csv
    converter.json2csv(processedOrders, (err, csv) => {
      if (err) {
        throw err;
      }

      fs.writeFileSync('out.csv', csv);
    });
  } catch (error) {
    console.log('fetchOrdersAndConvertToCSV error: ', error);
  }
}

function processOrderDataForReport(orders) {
  return orders.map((order) => {
    const totalItems = order.items.length
      ? order.items.reduce((prev, curr) => {
          return prev + curr.quantity;
        }, 0)
      : 0;

    const totalOrderValue = order.items.length
      ? order.items.reduce((prev, curr) => {
          return prev + curr.quantity * curr.unit_price;
        }, 0)
      : 0;

    const totalOrderWithDiscounts = calcTotalOrderWithDiscounts(
      totalOrderValue,
      order.discounts
    );

    return {
      order_id: order.order_id,
      order_datetime: new Date(order.order_date),
      totalOrderValue: totalOrderValue.toFixed(2),
      total_order_value: totalOrderWithDiscounts.toFixed(2),
      average_unit_price: (totalOrderWithDiscounts / totalItems).toFixed(2),
      total_units_count: totalItems,
      distinct_unit_count: order.items.length,
      customer_state: order.customer.shipping_address.state
    };
  });
}

function calcTotalOrderWithDiscounts(total, discounts) {
  let totalValue = total;
  // iterate over discounts in priority
  const discountsOrderedByPriority = discounts.sort(
    (a, b) => a.priority - b.priority
  );

  discountsOrderedByPriority.forEach((discount) => {
    if (discount.type === 'DOLLAR') {
      totalValue = totalValue - discount.value;
    }

    if (discount.type === 'PERCENTAGE') {
      const percDiscount = totalValue * (discount.value / 100);
      totalValue = totalValue - percDiscount;
    }
  });

  return totalValue;
}

fetchOrdersAndConvertToCSV();
