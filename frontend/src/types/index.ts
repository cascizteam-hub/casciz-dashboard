// ─────────────────────────────────────────────────────────────────────────────
// Casciz Commerce OS – Global TypeScript Types
// ─────────────────────────────────────────────────────────────────────────────

// ── API Response Envelope ─────────────────────────────────────────────────

export interface ApiResponse<T = unknown> {
  success:   boolean
  message?:  string
  data?:     T
  timestamp: string
}

export interface PagedResponse<T> {
  content:       T[]
  page:          number
  size:          number
  totalElements: number
  totalPages:    number
  last:          boolean
}

export interface ValidationErrorResponse {
  success:  false
  message:  string
  data:     Record<string, string>
  timestamp: string
}

// ── Auth ──────────────────────────────────────────────────────────────────

export interface UserSummary {
  id:            string
  email:         string
  firstName:     string
  lastName:      string
  avatarUrl?:    string
  emailVerified: boolean
}

export interface AuthTokens {
  accessToken:  string
  refreshToken: string
  tokenType:    string
  expiresIn:    number
  user:         UserSummary
}

export interface UserProfile extends UserSummary {
  roles:       string[]
  createdAt:   string
  lastLoginAt: string | null
}

// ── Auth Requests ─────────────────────────────────────────────────────────

export interface RegisterRequest {
  firstName: string
  lastName:  string
  email:     string
  password:  string
}

export interface LoginRequest {
  email:    string
  password: string
}

export interface ForgotPasswordRequest {
  email: string
}

export interface ResetPasswordRequest {
  token:       string
  newPassword: string
}

export interface VerifyEmailRequest {
  token: string
}

export interface ChangePasswordRequest {
  currentPassword: string
  newPassword:     string
}

export interface UpdateProfileRequest {
  firstName:  string
  lastName:   string
  avatarUrl?: string
}

// ── Roles ─────────────────────────────────────────────────────────────────

export type Role =
  | 'ROLE_SUPER_ADMIN'
  | 'ROLE_OWNER'
  | 'ROLE_ADMIN'
  | 'ROLE_MEMBER'
  | 'ROLE_VIEWER'

// ── Store ─────────────────────────────────────────────────────────────────

export type StoreStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED'

export type StoreCurrency =
  | 'USD' | 'EUR' | 'GBP' | 'CAD' | 'AUD'
  | 'JPY' | 'INR' | 'BRL' | 'MXN' | 'SGD'
  | 'AED' | 'SAR'

export interface StoreResponse {
  id:            string
  name:          string
  slug:          string
  description?:  string
  logoUrl?:      string
  faviconUrl?:   string
  customDomain?: string
  status:        StoreStatus
  currency:      StoreCurrency
  timezone:      string
  contactEmail?: string
  contactPhone?: string
  ownerId:       string
  createdAt:     string
  updatedAt:     string
  publishedAt?:  string
  archivedAt?:   string
}

export interface StoreSummary {
  id:           string
  name:         string
  slug:         string
  logoUrl?:     string
  status:       StoreStatus
  currency:     StoreCurrency
  createdAt:    string
  publishedAt?: string
}

export interface StoreStatsResponse {
  totalStores:     number
  publishedStores: number
  draftStores:     number
  archivedStores:  number
}

export interface CreateStoreRequest {
  name:          string
  slug?:         string
  description?:  string
  currency:      StoreCurrency
  timezone:      string
  contactEmail?: string
  contactPhone?: string
}

export interface UpdateStoreRequest {
  name:          string
  description?:  string
  logoUrl?:      string
  faviconUrl?:   string
  customDomain?: string
  currency:      StoreCurrency
  timezone:      string
  contactEmail?: string
  contactPhone?: string
}

export interface UpdateStoreStatusRequest {
  status: StoreStatus
}

// ── Utility ───────────────────────────────────────────────────────────────

/** Makes all properties in T non-nullable */
export type NonNullableProperties<T> = {
  [K in keyof T]-?: NonNullable<T[K]>
}

/** Extracts the element type of an array */
export type ElementType<T extends readonly unknown[]> = T extends readonly (infer E)[] ? E : never

// ── Product Catalogue ─────────────────────────────────────────────────────

export type ProductStatus = 'DRAFT' | 'ACTIVE' | 'ARCHIVED'

export interface CategoryResponse {
  id:           string
  storeId:      string
  name:         string
  slug:         string
  description?: string
  imageUrl?:    string
  sortOrder:    number
  productCount: number
  createdAt:    string
}

export interface VariantResponse {
  id:                string
  title:             string
  sku?:              string
  price:             number
  compareAtPrice?:   number
  costPrice?:        number
  inventoryQuantity?: number
  allowBackorder:    boolean
  weightGrams?:      number
  inStock:           boolean
  hasDiscount:       boolean
  sortOrder:         number
}

export interface ProductImageResponse {
  id:       string
  url:      string
  altText?: string
  sortOrder: number
}

export interface ProductResponse {
  id:               string
  storeId:          string
  name:             string
  slug:             string
  description?:     string
  shortDescription?: string
  status:           ProductStatus
  categoryId?:      string
  categoryName?:    string
  tags?:            string
  metaTitle?:       string
  metaDescription?: string
  digital:          boolean
  variants:         VariantResponse[]
  images:           ProductImageResponse[]
  minPrice:         number
  thumbnailUrl?:    string
  inStock:          boolean
  totalInventory:   number
  createdAt:        string
  updatedAt:        string
}

export interface ProductSummary {
  id:            string
  name:          string
  slug:          string
  status:        ProductStatus
  thumbnailUrl?: string
  minPrice:      number
  inStock:       boolean
  totalInventory: number
  categoryName?: string
  variantCount:  number
  createdAt:     string
}

export interface ProductStatsResponse {
  totalProducts:     number
  activeProducts:    number
  draftProducts:     number
  archivedProducts:  number
  outOfStockProducts: number
  totalCategories:   number
}

export interface VariantRequest {
  title:              string
  sku?:               string
  price:              number
  compareAtPrice?:    number
  costPrice?:         number
  inventoryQuantity?: number
  allowBackorder:     boolean
  weightGrams?:       number
}

export interface ProductImageRequest {
  url:      string
  altText?: string
}

export interface CreateProductRequest {
  name:             string
  slug?:            string
  description?:     string
  shortDescription?: string
  categoryId?:      string
  tags?:            string
  metaTitle?:       string
  metaDescription?: string
  digital:          boolean
  variants:         VariantRequest[]
  images?:          ProductImageRequest[]
}

export interface UpdateProductRequest {
  name:             string
  description?:     string
  shortDescription?: string
  categoryId?:      string
  tags?:            string
  metaTitle?:       string
  metaDescription?: string
  digital:          boolean
  images?:          ProductImageRequest[]
}

export interface AdjustStockRequest {
  variantId: string
  delta:     number
}

export interface CreateCategoryRequest {
  name:         string
  slug?:        string
  description?: string
  imageUrl?:    string
}

export interface UpdateCategoryRequest {
  name:         string
  description?: string
  imageUrl?:    string
}

// ── Checkout & Payment ────────────────────────────────────────────────────

export type CheckoutStatus = 'OPEN' | 'PROCESSING' | 'COMPLETED' | 'ABANDONED' | 'FAILED'
export type PaymentStatus  = 'PENDING' | 'PROCESSING' | 'SUCCEEDED' | 'FAILED' | 'REFUNDED' | 'PARTIALLY_REFUNDED' | 'CANCELLED'
export type PaymentProvider = 'STRIPE' | 'PAYPAL' | 'MANUAL'

export interface AddressDto {
  fullName:    string
  line1:       string
  line2?:      string
  city:        string
  state?:      string
  postalCode:  string
  countryCode: string
  phone?:      string
}

export interface CheckoutItemResponse {
  id:           string
  productId:    string
  variantId:    string
  productName:  string
  variantTitle: string
  sku?:         string
  unitPrice:    number
  quantity:     number
  lineTotal:    number
  imageUrl?:    string
}

export interface CheckoutResponse {
  id:                 string
  sessionToken:       string
  storeId:            string
  status:             CheckoutStatus
  customerEmail?:     string
  customerFirstName?: string
  customerLastName?:  string
  shippingAddress?:   AddressDto
  billingAddress?:    AddressDto
  items:              CheckoutItemResponse[]
  totalItemCount:     number
  subtotal:           number
  shippingAmount:     number
  taxAmount:          number
  discountAmount:     number
  totalAmount:        number
  currency:           string
  couponCode?:        string
  paymentIntentId?:   string
  paymentProvider?:   string
  createdAt:          string
  expiresAt:          string
}

export interface PaymentIntentResponse {
  intentId:     string
  clientSecret: string | null
  provider:     string
  amount:       number
  currency:     string
}

export interface PaymentResultResponse {
  succeeded:         boolean
  message:           string
  paymentStatus:     PaymentStatus
  providerReference: string | null
}

export interface PaymentTransactionResponse {
  id:                  string
  provider:            string
  status:              PaymentStatus
  amount:              number
  currency:            string
  paymentMethodBrand?: string
  paymentMethodLast4?: string
  failureReason?:      string
  createdAt:           string
}

export interface PaymentSettingsResponse {
  id:          string
  provider:    PaymentProvider
  enabled:     boolean
  publicKey?:  string
  liveMode:    boolean
  displayName?: string
}

// Checkout requests
export interface CreateCheckoutRequest   { storeId: string }
export interface AddItemRequest          { variantId: string; quantity: number }
export interface UpdateItemRequest       { itemId: string; quantity: number }
export interface UpdateCustomerRequest   { email: string; firstName: string; lastName: string; phone?: string }
export interface UpdateAddressesRequest  { shippingAddress: AddressDto; billingAddress?: AddressDto; billingSameAsShipping: boolean }
export interface InitiatePaymentRequest  { provider: PaymentProvider }
export interface ConfirmPaymentRequest   { paymentIntentId: string }
export interface SavePaymentSettingsRequest {
  provider: PaymentProvider
  enabled: boolean
  publicKey?: string
  secretKey?: string
  webhookSecret?: string
  liveMode: boolean
  displayName?: string
}

// ── Orders & Fulfilment ───────────────────────────────────────────────────

export type OrderStatus =
  | 'PENDING_PAYMENT' | 'PAID' | 'PROCESSING'
  | 'SHIPPED' | 'DELIVERED' | 'CANCELLED'
  | 'REFUNDED' | 'PARTIALLY_REFUNDED'

export type FulfilmentStatus =
  | 'UNFULFILLED' | 'PARTIAL' | 'READY_TO_SHIP'
  | 'SHIPPED' | 'DELIVERED' | 'RETURNED'

export interface OrderItemResponse {
  id:               string
  productId:        string
  variantId:        string
  productName:      string
  variantTitle:     string
  sku?:             string
  unitPrice:        number
  quantity:         number
  refundedQuantity: number
  lineTotal:        number
  refundableAmount: number
  imageUrl?:        string
}

export interface OrderNoteResponse {
  id:               string
  body:             string
  system:           boolean
  visibleToCustomer: boolean
  author?:          string
  createdAt:        string
}

export interface OrderResponse {
  id:                   string
  storeId:              string
  checkoutId:           string
  orderNumber:          string
  status:               OrderStatus
  fulfilmentStatus:     FulfilmentStatus
  customerEmail:        string
  customerFirstName?:   string
  customerLastName?:    string
  customerPhone?:       string
  customerNotes?:       string
  shippingAddress?:     AddressDto
  billingAddress?:      AddressDto
  items:                OrderItemResponse[]
  totalItemCount:       number
  subtotal:             number
  shippingAmount:       number
  taxAmount:            number
  discountAmount:       number
  totalAmount:          number
  refundedAmount:       number
  refundableAmount:     number
  currency:             string
  couponCode?:          string
  paymentProvider?:     string
  paymentReference?:    string
  trackingNumber?:      string
  carrierName?:         string
  trackingUrl?:         string
  shippedAt?:           string
  deliveredAt?:         string
  estimatedDeliveryAt?: string
  createdAt:            string
  updatedAt:            string
  cancelledAt?:         string
  cancellationReason?:  string
  notes:                OrderNoteResponse[]
}

export interface OrderSummary {
  id:               string
  orderNumber:      string
  status:           OrderStatus
  fulfilmentStatus: FulfilmentStatus
  customerEmail:    string
  customerFirstName?: string
  customerLastName?:  string
  totalItemCount:   number
  totalAmount:      number
  currency:         string
  paymentProvider?: string
  trackingNumber?:  string
  createdAt:        string
}

export interface OrderStatsResponse {
  totalOrders:       number
  pendingPayment:    number
  paid:              number
  processing:        number
  shipped:           number
  delivered:         number
  cancelled:         number
  unfulfilledOrders: number
  revenueThisMonth:  number
}

export interface ShipOrderRequest {
  trackingNumber:      string
  carrierName?:        string
  trackingUrl?:        string
  estimatedDeliveryAt?: string
}

export interface AddOrderNoteRequest {
  body:              string
  visibleToCustomer: boolean
}

export interface RefundRequest {
  amount: number
  reason: string
}

export interface UpdateOrderStatusRequest {
  status: OrderStatus
  reason?: string
}
