export type Subscription = {
  id: number;
  status: "PENDING" | "ACTIVE" | "EXPIRED";
  createdAt: string;
  updatedAt: string;
  user: {
    id: number;
    email: string;
  };
  plan: {
    name: string;
  };
  package?: {
    name: string;
  };
};
