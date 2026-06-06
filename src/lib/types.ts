export type AnalysisType = "contract" | "proposals";

export type UserProfile = {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  credits: number;
  createdAt?: unknown;
  updatedAt?: unknown;
};

export type AnalysisRecord = {
  id: string;
  uid: string;
  type: AnalysisType;
  title: string;
  result: string;
  createdAt?: unknown;
};
