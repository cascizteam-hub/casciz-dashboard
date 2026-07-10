import { create } from 'zustand'
import { devtools, persist, createJSONStorage } from 'zustand/middleware'
import type { CheckoutResponse, PaymentSettingsResponse } from '@/types'

interface CheckoutState {
  // Active storefront checkout
  sessionToken:     string | null
  checkout:         CheckoutResponse | null
  isLoading:        boolean
  isSubmitting:     boolean

  // Dashboard
  checkouts:        CheckoutResponse[]
  totalElements:    number
  paymentSettings:  PaymentSettingsResponse[]

  // Storefront actions
  setSessionToken:  (token: string | null) => void
  setCheckout:      (checkout: CheckoutResponse | null) => void
  setLoading:       (loading: boolean) => void
  setSubmitting:    (submitting: boolean) => void
  clearCheckout:    () => void

  // Dashboard actions
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

        setSessionToken:  (sessionToken)  => set({ sessionToken }, false, 'setSessionToken'),
        setCheckout:      (checkout)      => set({ checkout },      false, 'setCheckout'),
        setLoading:       (isLoading)     => set({ isLoading },     false, 'setLoading'),
        setSubmitting:    (isSubmitting)  => set({ isSubmitting },  false, 'setSubmitting'),

        clearCheckout: () =>
          set({ checkout: null, sessionToken: null }, false, 'clearCheckout'),

        setCheckouts: (checkouts, total) =>
          set({ checkouts, totalElements: total }, false, 'setCheckouts'),

        setPaymentSettings: (paymentSettings) =>
          set({ paymentSettings }, false, 'setPaymentSettings'),

        updatePaymentSetting: (setting) =>
          set((state) => ({
            paymentSettings: state.paymentSettings.some((s) => s.id === setting.id)
              ? state.paymentSettings.map((s) => s.id === setting.id ? setting : s)
              : [...state.paymentSettings, setting],
          }), false, 'updatePaymentSetting'),
      }),
      {
        name:       'casciz-checkout',
        storage:    createJSONStorage(() => localStorage),
        // Only persist the session token — never persist payment details
        partialize: (state) => ({ sessionToken: state.sessionToken }),
      },
    ),
    { name: 'CheckoutStore' },
  ),
)
