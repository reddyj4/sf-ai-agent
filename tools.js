import axios from "axios";
import { authenticate } from "./salesforce.js";

/* =========================
   GET ACCOUNTS
========================= */
export async function getAccounts(limit = 5) {
  const auth = await authenticate();

  const query = `SELECT Id, Name FROM Account LIMIT ${limit}`;

  const response = await axios.get(
    `${auth.instance_url}/services/data/v58.0/query`,
    {
      headers: {
        Authorization: `Bearer ${auth.access_token}`,
      },
      params: { q: query },
    }
  );

  return response.data.records;
}

/* =========================
   GET OPPORTUNITIES BY ACCOUNT
========================= */
export async function getOpportunitiesByAccount(accountName) {
  const auth = await authenticate();

  const query = `
    SELECT Id, Name, StageName, Amount
    FROM Opportunity
    WHERE Account.Name = '${accountName}'
  `;

  const response = await axios.get(
    `${auth.instance_url}/services/data/v58.0/query`,
    {
      headers: {
        Authorization: `Bearer ${auth.access_token}`,
      },
      params: { q: query },
    }
  );

  return response.data.records;
}

/* =========================
   CREATE ACCOUNT
========================= */
export async function createAccount(name) {
  const auth = await authenticate();

  const response = await axios.post(
    `${auth.instance_url}/services/data/v58.0/sobjects/Account`,
    { Name: name },
    {
      headers: {
        Authorization: `Bearer ${auth.access_token}`,
        "Content-Type": "application/json",
      },
    }
  );

  return response.data;
}

/* =========================
   GET OPEN CASES
========================= */
export async function getOpenCases() {
  const auth = await authenticate();

  const query = `
    SELECT Id, CaseNumber, Subject, Status
    FROM Case
    WHERE Status != 'Closed'
    LIMIT 5
  `;

  const response = await axios.get(
    `${auth.instance_url}/services/data/v58.0/query`,
    {
      headers: {
        Authorization: `Bearer ${auth.access_token}`,
      },
      params: { q: query },
    }
  );

  return response.data.records;
}
