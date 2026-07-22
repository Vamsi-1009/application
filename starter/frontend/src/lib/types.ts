export interface User {
  id: string;
  email: string;
}

export interface Link {
  id: string;
  code: string;
  targetUrl: string;
  shortUrl: string;
  clickCount: number;
  createdAt: string;
}
