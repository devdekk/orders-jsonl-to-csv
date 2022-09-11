import axios from 'axios';
import readJsonLines from 'read-json-lines-sync';
import converter from 'json-2-csv';
import { writeFile } from 'fs/promises';
import { sendTestEmail } from '../utils/nodemailer';

/**
 * Fetch an order file from web, process order data to spec
 * and convert json to csv file out.csv
 *
 * Send email using nodemailer ethereal test account if
 * an email address is provided
 */
export const fetchOrdersAndConvertToCSV = async (
  ordersFileLocation: string,
  emailAddress: string
) => {
  try {
    const { data } = await axios.get(ordersFileLocation, {
      headers: {
        Accept: 'application/json'
      }
    });
    // https://www.npmjs.com/package/read-json-lines-sync
    const orderList = readJsonLines(data);
    const processedOrders = processOrderDataForReport(orderList);

    converter.json2csv(processedOrders, (err, csv) => {
      if (err) {
        console.log('fetchOrdersAndConvertToCSV error json2csv: ', err);
      }

      writeFile('out.csv', csv).then(() => {
        console.log('fetchOrdersAndConvertToCSV: out.csv file created!');

        // Send test email if email address provided
        if (emailAddress !== '') {
          sendTestEmail(emailAddress, csv).then(() => {
            console.log('fetchOrdersAndConvertToCSV: test email sent!');
          });
        }
      });
    });
  } catch (error) {
    console.log('fetchOrdersAndConvertToCSV error try/catch: ', error);
  }
};

/**
 * Function that iterates over orders data and retrieves/calculares desired output
 * listed in code test spec
 */
const processOrderDataForReport = (orders: any) => {
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
};

/**
 * Function that calculates total order value minus discounts in their priority order
 */
const calcTotalOrderWithDiscounts = (total: number, discounts: any) => {
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
};
