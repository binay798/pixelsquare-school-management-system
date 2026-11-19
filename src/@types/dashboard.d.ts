/**
 * Wire types of the admin dashboard (`/api/dashboard/*`).
 *
 * They mirror `backend/src/types/dashboard.types.ts` one to one. Money values
 * arrive as decimal strings and are only formatted for display, never used for
 * arithmetic in the browser.
 */
declare namespace Dashboard {
  interface IRange {
    date_from: string
    date_to: string
  }

  interface ISummary {
    generated_at: string
    school: { id: number; name: string | null }
    academic_year: {
      id: number
      name: string
      session_start_at: string
      session_end_at: string
    } | null
    period: IRange
    kpis: {
      students: {
        total: number
        active: number
        new_in_range: number
        new_this_month: number
      }
      teachers: { total: number }
      employees: { total: number }
      attendance: {
        date: string
        marked: number
        present: number
        absent: number
        on_leave: number
        percentage: number
        not_marked: number
        total_students: number
      }
    }
    actions: {
      pending_concessions: number
      pending_leave_requests: number
      payroll_runs_awaiting_approval: number
      unposted_journals: number
      draft_announcements: number
      classes_without_attendance: number
      pending_refunds: number
      open_complaints: number
      overdue_invoices: number
    }
  }

  interface IAcademics {
    period: IRange
    enrolment: {
      monthly: { month: string; students: number }[]
      total: number
    }
    class_distribution: {
      class_id: number
      class_name: string
      students: number
    }[]
    attendance: {
      date: string
      present: number
      absent: number
      on_leave: number
      percentage: number
    }[]
    performance: {
      available: boolean
      reason: string | null
    }
  }

  interface IFinance {
    period: IRange
    fees: {
      invoiced: string
      collected: string
      outstanding: string
      overdue: string
      collection_rate: number
      invoice_count: number
      payment_count: number
    }
    collection_trend: { month: string; amount: string }[]
    class_collection: { class_name: string; amount: string }[]
    income_expense: {
      income: string
      expenses: string
      net: string
      has_chart_of_accounts: boolean
      monthly: { month: string; income: string; expenses: string }[]
    }
    position: {
      as_of: string
      cash: string
      bank: string
      receivables: string
      payables: string
    }
    payroll: {
      employees: number
      processed_runs: number
      pending_runs: number
      processed_cost: string
      processed_net: string
      pending_net: string
    }
  }

  type ActivityEntity =
    | 'fee_payment'
    | 'accounting_journal'
    | 'student'
    | 'announcement'
    | 'payroll_run'
    | 'leave_request'
    | 'complaint'

  interface IActivity {
    entity_type: ActivityEntity
    entity_id: number
    title: string
    subject: string | null
    reference: string | null
    amount: string | null
    actor_name: string | null
    occurred_at: string
  }

  type EventType = 'fee_deadline' | 'holiday' | 'announcement' | 'payroll'

  interface IEvent {
    type: EventType
    title: string
    subtitle: string | null
    date: string
    amount: string | null
    reference: string | null
  }

  interface IFeed {
    activities: IActivity[]
    events: IEvent[]
  }

  /** Async state of one dashboard widget group. */
  interface IWidget<T> {
    data: T | null
    loading: boolean
    error: string | null
  }
}
