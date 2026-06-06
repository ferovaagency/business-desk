export type AnalysisType = "contract" | "proposals";

export type AnalysisStatus = "awaiting_payment" | "processing" | "completed" | "failed";

export type UserProfile = {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  createdAt?: unknown;
  updatedAt?: unknown;
};

export type AnalysisRecord = {
  id: string;
  uid: string;
  type: AnalysisType;
  title: string;
  status: AnalysisStatus;
  amount: number;
  result?: string;
  error?: string;
  createdAt?: unknown;
  updatedAt?: unknown;
};

