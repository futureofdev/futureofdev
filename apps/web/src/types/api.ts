export interface NewsletterSuccessResponse {
  success: true;
  alreadySubscribed: boolean;
  analyticsId?: string;
  downloadUrl?: string;
}

export interface NewsletterErrorResponse {
  success?: false;
  error: string;
}

export type NewsletterResponse = NewsletterSuccessResponse | NewsletterErrorResponse;
