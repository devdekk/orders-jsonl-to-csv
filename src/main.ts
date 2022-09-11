import { fetchOrdersAndConvertToCSV } from '../utils/orders';
const emailAddress = process.env.npm_config_email || '';

const ordersFileLocation =
  'https://s3-ap-southeast-2.amazonaws.com/catch-code-challenge/challenge-1/orders.jsonl';

fetchOrdersAndConvertToCSV(ordersFileLocation, emailAddress);
