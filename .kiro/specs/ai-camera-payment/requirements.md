# Requirements Document

## Introduction

The AI Camera Payment feature transforms the existing AI plastic scanner in the GREEN LOOP picker app into a payment-processing tool. After a successful scan, the system evaluates the scanned material, calculates a coin reward based on plastic type and estimated weight, credits the picker's `coin_balance` in the database, creates a `pickup_transactions` record, and displays a receipt. No payment is issued without a successful scan. Contaminated or low-recyclability items are rejected.

## Glossary

- **Scanner**: The `analyzeImageElement()` / `tryVisionEndpoint()` pipeline that classifies plastic items from a camera image and returns a `ScanAnalysis` object.
- **ScanAnalysis**: The structured result returned by the Scanner, containing detected items, recyclability level, contamination flags, and weight estimates.
- **DetectedItem**: A single plastic item within a `ScanAnalysis`, carrying `plasticType`, `condition`, `contamination`, and `weightEstimateGrams`.
- **Payment_Engine**: The client-side module that evaluates a `ScanAnalysis` and determines eligibility, calculates coin reward, and calls the Supabase RPC to persist the transaction.
- **Supabase_RPC**: The `process_scan_payment` PostgreSQL function (to be created) that atomically credits `coin_balance`, updates profile stats, and inserts a `pickup_transactions` row.
- **Receipt**: The post-payment UI panel shown to the picker summarising material type, weight, coins earned, and transaction ID.
- **Picker**: An authenticated GREEN LOOP user with `role = 'picker'` who performs the scan.
- **Coin**: The unit of reward stored in `profiles.coin_balance`.
- **Recyclability_Level**: One of `"high"`, `"moderate"`, or `"low"` as returned by the Scanner.
- **Contamination_Flag**: A non-empty `contamination` array on a `DetectedItem`.

---

## Requirements

### Requirement 1: Scan-Gated Payment

**User Story:** As a Picker, I want payment to be issued only after a successful camera scan, so that the system cannot be gamed without physically presenting recyclable material.

#### Acceptance Criteria

1. THE Payment_Engine SHALL require a valid `ScanAnalysis` object with `quality.ok === true` before initiating any payment flow.
2. WHEN the Scanner returns `quality.ok === false`, THE Payment_Engine SHALL reject the scan and display an error message without creating a transaction.
3. WHEN no scan has been performed in the current session, THE Payment_Engine SHALL keep the payment confirmation UI hidden.

---

### Requirement 2: Material Eligibility Check

**User Story:** As a facility operator, I want contaminated and low-recyclability items to be rejected automatically, so that only genuinely recyclable material earns payment.

#### Acceptance Criteria

1. WHEN the primary `DetectedItem` has `recyclability === "low"` (plastic types PS or Other), THE Payment_Engine SHALL reject the scan and display a rejection reason to the Picker.
2. WHEN any `DetectedItem` in the `ScanAnalysis` has a non-empty `contamination` array, THE Payment_Engine SHALL flag the scan for rejection and display the contamination reasons to the Picker.
3. WHEN a scan is rejected due to eligibility, THE Payment_Engine SHALL not call the Supabase_RPC and SHALL not create a transaction record.
4. THE Payment_Engine SHALL display the rejection reason clearly, distinguishing between low-recyclability rejection and contamination rejection.

---

### Requirement 3: Payment Calculation

**User Story:** As a Picker, I want to know exactly how many coins I will earn before I confirm, so that I can make an informed decision.

#### Acceptance Criteria

1. WHEN a scan passes eligibility checks, THE Payment_Engine SHALL calculate coins using the formula: `coins = round(midpoint_weight_kg * rate_per_kg)`, where `midpoint_weight_kg = (weightEstimateGrams[0] + weightEstimateGrams[1]) / 2 / 1000` and `rate_per_kg` is determined by plastic type.
2. THE Payment_Engine SHALL apply the following rates: PET → 100 coins/kg, HDPE → 90 coins/kg, PP → 85 coins/kg, LDPE → 60 coins/kg, PVC → 50 coins/kg.
3. WHEN multiple `DetectedItem` entries are present, THE Payment_Engine SHALL sum the individual coin amounts for all eligible items.
4. THE Payment_Engine SHALL display the calculated coin amount to the Picker on a confirmation screen before payment is processed.
5. THE Payment_Engine SHALL guarantee a minimum of 1 coin for any accepted scan.

---

### Requirement 4: Picker Confirmation Step

**User Story:** As a Picker, I want to review and confirm the scan result before payment is processed, so that I can verify the system identified my items correctly.

#### Acceptance Criteria

1. WHEN a scan passes eligibility checks, THE Payment_Engine SHALL display a confirmation screen showing: detected plastic type(s), estimated weight range, calculated coin reward, and recyclability level.
2. WHEN the Picker confirms, THE Payment_Engine SHALL proceed to call the Supabase_RPC.
3. WHEN the Picker cancels, THE Payment_Engine SHALL discard the pending payment and return to the scan result view without creating a transaction.
4. THE Payment_Engine SHALL disable the confirm button while a payment submission is in progress to prevent duplicate submissions.

---

### Requirement 5: Atomic Database Transaction

**User Story:** As a system administrator, I want each scan payment to be recorded atomically, so that coin balances and transaction records are always consistent.

#### Acceptance Criteria

1. THE Supabase_RPC SHALL accept `picker_id`, `weight_kg`, `plastic_type`, `coins_earned`, and `scan_metadata` (JSONB) as parameters.
2. THE Supabase_RPC SHALL increment `profiles.coin_balance` by `coins_earned` for the authenticated picker within a single database transaction.
3. THE Supabase_RPC SHALL increment `profiles.total_recycled_kg` by `weight_kg` for the authenticated picker within the same transaction.
4. THE Supabase_RPC SHALL insert exactly one row into `pickup_transactions` with `picker_id`, `weight_kg`, and `points_earned` within the same transaction.
5. IF any step of the Supabase_RPC fails, THEN THE Supabase_RPC SHALL roll back all changes and return an error code.
6. THE Supabase_RPC SHALL enforce that `picker_id` matches `auth.uid()` to prevent cross-user payment fraud.

---

### Requirement 6: Receipt Display

**User Story:** As a Picker, I want to see a receipt after payment is processed, so that I have confirmation of what I earned and a record I can reference.

#### Acceptance Criteria

1. WHEN the Supabase_RPC returns successfully, THE Payment_Engine SHALL display a receipt screen to the Picker.
2. THE Receipt SHALL show: transaction ID, plastic type(s) detected, weight in kg, coins earned, updated coin balance, and timestamp.
3. THE Receipt SHALL provide a "Scan another item" action that resets the scanner to the idle state.
4. THE Receipt SHALL provide a "View transaction history" action that navigates to the picker's profile or transaction history page.
5. WHEN the Supabase_RPC returns an error, THE Payment_Engine SHALL display a human-readable error message and offer a retry option without re-running the scan.

---

### Requirement 7: Duplicate Transaction Prevention

**User Story:** As a system administrator, I want each scan to produce at most one transaction, so that pickers cannot earn coins multiple times from the same scan.

#### Acceptance Criteria

1. THE Payment_Engine SHALL generate a unique `scan_id` (UUID) for each completed scan at the time the `ScanAnalysis` is produced.
2. THE Supabase_RPC SHALL accept `scan_id` as a parameter and store it in the `pickup_transactions` row.
3. THE Supabase_RPC SHALL enforce a unique constraint on `scan_id` in `pickup_transactions` so that a second call with the same `scan_id` returns a conflict error rather than inserting a duplicate row.
4. WHEN the Supabase_RPC returns a duplicate `scan_id` conflict, THE Payment_Engine SHALL display a message indicating the scan was already processed and SHALL NOT show an error.

---

### Requirement 8: Authenticated Access Only

**User Story:** As a system administrator, I want only authenticated pickers to trigger payments, so that anonymous or unauthorized users cannot earn coins.

#### Acceptance Criteria

1. WHEN the Picker is not authenticated, THE Payment_Engine SHALL redirect to the login page instead of showing the payment confirmation screen.
2. THE Supabase_RPC SHALL use `security definer` and verify `auth.uid()` is not null before processing any payment.
3. IF `auth.uid()` is null when the Supabase_RPC is called, THEN THE Supabase_RPC SHALL raise an `unauthorized` exception and roll back.

---

### Requirement 9: Offline and Error Resilience

**User Story:** As a Picker operating in low-connectivity areas, I want clear feedback when a payment submission fails, so that I know whether to retry or seek assistance.

#### Acceptance Criteria

1. WHEN the Supabase_RPC call fails due to a network error, THE Payment_Engine SHALL display a retry option and preserve the pending payment data for the current session.
2. WHEN the retry succeeds, THE Payment_Engine SHALL display the receipt as normal.
3. WHEN the Picker navigates away before confirming payment, THE Payment_Engine SHALL discard the pending payment state without creating a transaction.
