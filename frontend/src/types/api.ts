/** Bentuk ini berasal dari fixture mentah /tests/fixtures (23 November 2026). */
export type OptimizationStatus = "INTERIOR_OPTIMUM" | "CAPACITY_BOUND" | "NO_PRODUCTION";

export interface OptimizeOptions {
  include_steps?: boolean;
  include_curves?: boolean;
  include_sensitivity?: boolean;
  curve_points?: number;
  verify_symbolic?: boolean;
}

export interface OptimizeRequest {
  fixed_cost: number;
  variable_cost: number;
  quad_cost: number;
  ref_price: number;
  ref_demand: number;
  sensitivity: number;
  capacity: number | null;
  options?: OptimizeOptions;
}

export interface Preset extends Omit<OptimizeRequest, "options"> {
  id: "G1" | "G2" | "G3";
  label: string;
}

export interface Outcome { x: number; price: number; revenue: number; cost: number; profit: number }
export interface IntegerOutcome extends Outcome { candidates: Array<Pick<Outcome, "x" | "profit">> }
export interface FormulaSet { price: string; revenue: string; cost: string; profit: string; dprofit: string; d2profit: string }
export interface Model { a: number; b: number; alpha: number; beta: number; formulas: FormulaSet }
export interface Optimum { status: OptimizationStatus; continuous: Outcome; integer: IntegerOutcome; second_derivative: number; is_maximum: boolean }
export interface BreakEven { exists: boolean; discriminant: number; x_low: number | null; x_high: number | null; x_low_int: number | null; x_high_int: number | null }
export interface Marginal { mr_at_opt: number; mc_at_opt: number; elasticity: number | null; elasticity_label: string | null }
export interface SensitivityScenario { label: string; delta_pct: number; param_changed: "variable_cost" | "fixed_cost"; x: number; price: number; profit: number; delta_profit: number }
export interface Sensitivity { partials: { dx_dv: number; dx_dFC: number; dx_da: number; dP_dFC: number; dP_dv: number; dP_da: number } | null; scenarios: SensitivityScenario[] }
export interface CurvePoint { x: number; price: number; R: number; C: number; P: number; MR: number; MC: number; dP: number }
export interface Curves { x_range: [number, number]; points: CurvePoint[]; markers: { optimum: { x: number; P: number }; break_even: Array<{ x: number }>; capacity: { x: number } | null; reference: { x: number; P: number } } }
export interface Step { id: number; title: string; latex: string; explanation: string; values: Record<string, unknown> }
export interface ApiWarning { code: string; level: "info" | "warning" | "error"; message: string }
export interface OptimizeResponse { model: Model; optimum: Optimum; break_even: BreakEven; marginal: Marginal; sensitivity: Sensitivity; curves: Curves; steps: Step[]; warnings: ApiWarning[]; verification: unknown | null }
export type CurvesResponse = Curves;
export interface ApiValidationError { detail: Array<{ field: string; message: string }> }
