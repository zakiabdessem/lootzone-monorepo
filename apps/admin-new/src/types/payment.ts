export type Payment = {
  id: number;
  amount: number;
  status: "PENDING" | "COMPLETED" | "FAILED";
  method: string;
  proofUrl?: string;
  createdAt: string;
  user: {
    id: number;
    email: string;
  };
  company?: {
    name: string;
  };
};
