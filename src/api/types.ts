// Shapes of the data returned by the seniorlove-back API.

export type Tag = {
  id: number;
  name: string;
  color?: string; // hex without "#", e.g. "b92bcc"
};

export type UserSummary = {
  id: number;
  userName: string;
  picture?: string | null;
};

export type User = UserSummary & {
  gender: string; // "F" or "M"
  age: number;
  email?: string;
  hometown?: string | null;
  bio?: string | null;
  tags: Tag[];
};

export type EventItem = {
  id: number;
  title: string;
  description: string;
  location: string;
  date: string; // free text, e.g. "29/11/2024"
  picture?: string | null;
  creator: UserSummary;
  tags: Tag[];
  attendees?: UserSummary[]; // only on GET /events/:id
};

export type Message = {
  id: number;
  sender_id: number;
  receiver_id: number;
  content: string;
  created_at: string;
};

export type LoginResponse = {
  accessToken: string;
  user: { id: number; gender: string; userName: string; age: number; email: string };
};
