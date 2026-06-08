export type AnalysisType = "contract" | "proposals";
export type SupportedCountry = "CO" | "US" | "BR";
export type ContractUserRole = "issuer" | "receiver";
export type ContractType = "lease" | "business_alliance" | "credit_card_or_credit" | "purchase_sale" | "other";

export type ExpertiseTool = "legal" | "financial" | "tax" | "hr" | "proposals";

export type AnalysisStatus = "awaiting_payment" | "processing" | "completed" | "failed";

export type UserProfile = {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  createdAt?: unknown;
  updatedAt?: unknown;
};

export type AnalysisContext = {
  country: SupportedCountry;
  userRole?: ContractUserRole;
  contractType?: ContractType;
  userContext?: string;
  companyContext?: string;
};

export type StructuredAnalysisResult = {
  summary: string;
  correct: string[];
  riskPartyOne: string[];
  riskPartyTwo: string[];
  protection: string[];
  missing: string[];
  keyQuestions: string[];
  metadata: {
    country: string;
    userRole?: string;
    contractType?: string;
    analysisType: "contract";
  };
};

export type ProposalItem = {
  name: string;
  alignmentScore: number; // 0-100
  strengths: string[];
  weaknesses: string[];
  whatItContributes: string[];
  whatItLacks: string[];
};

export type ProposalComparisonResult = {
  businessObjective: string;
  summary: string;
  recommendation: string;
  proposals: ProposalItem[];
  negotiationTips: string[];
  keyQuestions: string[];
  metadata: {
    country: string;
    analysisType: "proposals";
  };
};

export type AnyAnalysisResult = StructuredAnalysisResult | ProposalComparisonResult;

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

