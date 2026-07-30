export type TranzgateCurrency =
  | "Naira"
  | "Dollars"
  | "Pounds"
  | "Euros";

export type TranzgateChannel =
  | "NotSet"
  | "Bank"
  | "Interswitch2023"
  | "UnifiedPayments"
  | "RemitaBank"
  | "RemitaOnline"
  | "UnifiedPaymentsPOS"
  | "ALATPay"
  | "Zitra"
  | "ZitraTranzgate"
  | "Nomba";

export type TranzgatePaymentStatus =
  | "Pending"
  | "Finalized"
  | "Rejected"
  | "Warning"
  | "Error";

export type TranzgatePushStatus =
  | "NotPushed"
  | "Pushed"
  | "Rejected"
  | "Error"
  | "ServiceUnreachable";

export interface PaymentCode {
  paymentCodeId: string;

  paymentCodeName: string;
}

export interface PaymentPostingInfo {
  paymentCode: string;

  paymentText: string;

  currency: TranzgateCurrency;

  amount: number;

  paymentDocumentNo: string;

  bank?: string;

  accountNum?: string;
}

export interface PreRegisterPaymentRequest {
  clientNo: string;

  customerNo: string;

  customerName: string;

  session: string;

  paymentPostingInfo: PaymentPostingInfo[];
}

export interface PreRegisterPaymentResponse {
  paymentBatchId: string;
}

export interface SetPaymentChannelRequest {
  paymentBatchId: string;

  channel: TranzgateChannel;
}

export interface SendToRemitaRequest {
  customerName: string;

  customerId: string;

  email: string;

  phoneNumber: string;

  clientId: string;

  session: string;

  paymentBatchId: string;

  channel: TranzgateChannel;

  callbackUrl: string;
}

export interface SendToRemitaResponse {
 /** remita url */
  paymentUrl: string;
}

export interface PostPaymentRequest {
  bankId: string;

  clientNo: string;

  customerNo: string;

  paymentPostingInfo: PaymentPostingInfo[];

  channel: TranzgateChannel;

  session: string;

  preRegisteredPaymentBatchId: string;

  test?: boolean;
}

export interface PostPaymentResponse {
  paymentBatchId: string;

  paymentStatus: TranzgatePaymentStatus;

  paymentStatusString: string;
}

export interface GetPaymentCodesResponse {
  paymentCodes: PaymentCode[];
}

export interface SearchPaymentRequest {
  paymentBatchId?: string;

  paymentDetailId?: number;

  clientId?: string;

  customerId?: string;

  paymentCode?: string;

  paymentDocumentNo?: string;

  channel?: TranzgateChannel;

  startDate?: Date;

  endDate?: Date;

  paid?: boolean;

  cancelled?: boolean;

  page?: number;

  numberPerPage?: number;

  includeCharges?: boolean;
}

export interface SearchPaymentResponse {
  paymentBatchId: string;

  paymentDetailId: number;

  clientId: string;

  clientName: string;

  customerId: string;

  customerName: string;

  paymentCode: string;

  paymentInfo: string;

  paymentDocumentNo: string;

  session: string;

  amount: number;

  currency: TranzgateCurrency;

  paid: boolean;

  cancelled: boolean;

  paymentDate?: Date;

  paymentDateTime?: Date;

  channel: TranzgateChannel;

  channelStatus?: string;

  channelStatusDescription?: string;

  pushStatus?: TranzgatePushStatus;

  pushErrorDetails?: string;

  remitaRRR?: string;

  bankId?: string;

  settlementAccount?: string;

  raw: unknown;
}