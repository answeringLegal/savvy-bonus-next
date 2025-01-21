import axios from 'axios';

const hubSpotAxiosInstance = axios.create({
  baseURL: 'https://api.hubapi.com/crm/v3',
  headers: {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${process.env.NEXT_PUBLIC_HUBSPOT_API_KEY}`,
  },
});

export { hubSpotAxiosInstance as hubspotAPI };
