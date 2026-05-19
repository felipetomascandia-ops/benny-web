import { Resend } from 'resend';

const resendApiKey = process.env.RESEND_API_KEY || 're_TgWw4GwD_EoS9Q3sF7HTa4re9PmvKrnXw';

export const resend = new Resend(resendApiKey);

export const DEFAULT_FROM_EMAIL = 'info@usapoolservicesllc.com';
export const DEFAULT_FROM_NAME = 'USA Pools Services';
