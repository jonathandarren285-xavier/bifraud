// TypeScript types for BiFraud analysis output

export interface FraudFinding {
  fraud_type: string;
  risk_level: "Risiko Rendah" | "Risiko Sedang" | "Risiko Tinggi" | "Risiko Kritis" | "Low Risk" | "Medium Risk" | "High Risk" | "Critical Risk";
  classification: string;
  detected_issue: string;
  why_suspicious: string;
  accounting_explanation: string;
  historical_comparison: string;
  materiality_assessment: string;
  financial_statement_impact: string;
  recommended_correction: string;
  suggested_audit_procedure: string;
  confidence_level_percent: string;
  confidence_reasoning: string;
}

export interface FinalSummary {
  overall_fraud_risk_score: string;
  overall_risk_percentage?: number;
  key_red_flags: string[];
  priority_actions_for_management: string[];
  auditor_recommendation: string;
  additional_data_needed: string[];
}

export interface AnalysisResult {
  findings: FraudFinding[];
  final_summary: FinalSummary;
}

export interface SavedAnalysis {
  id: string;
  userId: string;
  createdAt: Date;
  fileNames: string[];
  rawResult: AnalysisResult;
  overallRiskScore: string;
  findingsCount: number;
  title: string | null;
}

export type RiskLevel = "Risiko Rendah" | "Risiko Sedang" | "Risiko Tinggi" | "Risiko Kritis" | "Low Risk" | "Medium Risk" | "High Risk" | "Critical Risk";
