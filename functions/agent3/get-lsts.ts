import axios from 'axios';
import fs from 'fs';
import path from 'path';

/**
 * Fetches updated LSTs with their APYs from an external API.
 * @returns {Promise<{ lsts: Array<{ mint: string; apy: number | null }> }>} Updated LSTs with APYs
 */
export async function fetchUpdatedLsts() {
  try {
    // Read and parse the local LSTs file
    const filePath = path.join(process.cwd(), 'data', 'lsts.json');
    const rawData = fs.readFileSync(filePath, 'utf-8');
    const data = JSON.parse(rawData);

    // Extract mint addresses
    const mintAddresses = data.lsts.map((lst: { mint: string }) => lst.mint);

    // Build query parameters for the external API
    const queryParams = mintAddresses.map((mint) => `lst=${mint}`).join('&');
    const apiUrl = `https://extra-api.sanctum.so/v1/apy/latest?${queryParams}`;

    // Fetch APYs from the external API
    const response = await axios.get(apiUrl);
    const apys = response.data.apys;

    // Map APYs to the local LSTs
    const updatedLsts = data.lsts.map((lst: { mint: string }) => {
      return {
        ...lst,
        apy: apys[lst.mint] || null
      };
    });

    return { lsts: updatedLsts };
  } catch (error) {
    console.error('Error fetching APYs:', error);
    throw new Error('Failed to fetch APYs');
  }
}
