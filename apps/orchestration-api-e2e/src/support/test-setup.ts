/* eslint-disable */
import axios from 'axios';

module.exports = async function () {
  // Configure axios for tests to use.
  const host = process.env.HOST ?? 'localhost';
  const port =
    process.env.PORT ??
    process.env.ORCHESTRATION_API_PORT ??
    '3334';
  axios.defaults.baseURL = `http://${host}:${port}`;
};
