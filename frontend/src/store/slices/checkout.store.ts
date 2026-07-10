import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'
import type { CheckoutResponse, PaymentSettingsResponse } from '@/types'

interface CheckoutState {
  sessionToken:     string | null
  checkout:         CheckoutResponse | null
  isLoading:        boolean
  isSubmitting:     boolean
  checkouts:        CheckoutResponse[]
  totalElements:    number
  paymentSettings:  PaymentSettingsResponse[]

  setSessionToken:  (token: string | null) => void
  setCheckout:      (checkout: CheckoutResponse | null) => void
  setLoading:       (loading: boolean) => void
  setSubmitting:    (submitting: boolean) => void
  clearCheckout:    () => void
  setCheckouts:     (checkouts: CheckoutResponse[], total: number) => void
  setPaymentSettings: (settings: PaymentSettingsResponse[]) => void
  updatePaymentSetting: (setting: PaymentSettingsResponse) => void
}

export const useCheckoutStore = create<CheckoutState>()(
  devtools(
    persist(
      (set) => ({
        sessionToken:    null,
        checkout:        null,
        isLoading:       false,
        isSubmitting:    false,
        checkouts:       [],
        totalElements:   0,
        paymentSettings: [],

        setSessionToken:  (sessionToken)  => set({ sessionToken }),
        setCheckout:      (checkout)      => set({ checkout }),
        setLoading:       (isLoading)     => set({ isLoading }),
        setSubmitting:    (isSubmitting)  => set({ isSubmitting }),
        clearCheckout: () => set({ checkout: null, sessionToken: null }),
        setCheckouts: (checkouts, total) => set({ checkouts, totalElements: total }),
        setPaymentSettings: (paymentSettings) => set({ paymentSettings }),
        updatePaymentSetting: (setting) =>
          set((state) => ({
            paymentSettings: state.paymentSettings.some((s) => s.id === setting.id)
              ? state.paymentSettings.map((s) => s.id === setting.id ? setting : s)
              : [...state.paymentSettings, setting],
          })),
      }),
      {
        name: 'casciz-checkout',
        partialize: (state) => ({ sessionToken: state.sessionToken }),
      },
    ),
  ),
)
