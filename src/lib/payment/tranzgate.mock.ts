import { PreRegisterPaymentRequest, PreRegisterPaymentResponse } from "./tranzgate.types";

export class MockTranzgateClient {

  async preRegisterPayment(
    request: PreRegisterPaymentRequest
  ): Promise<PreRegisterPaymentResponse> {

    console.log(
      "MOCK PRE-REGISTER PAYMENT",
      request
    );

    return {
      paymentBatchId:
        `MOCK-BATCH-${Date.now()}`,
    };
  }

  async verifyPayment(
    paymentBatchId: string,
    amount: number
  ) {
    return {
      paymentBatchId,

      transactionReference:
        `MOCK-TXN-${Date.now()}`,

      status:
        "SUCCESSFUL",

      amount,

      paidAt:
        new Date(),
    };
  }

  async setPaymentChannel() {

    return {
      success: true,
    };

  }

  async sendToRemita() {

    return {

      paymentUrl:
        "https://mock-payment-url.com/pay",

      status:
        "SUCCESSFUL",

    };

  }

  async searchPayments() {

    return [

      {

        paymentBatchId:
          "MOCK-BATCH-001",

        transactionReference:
          "MOCK-TXN-001",

        status:
          "SUCCESSFUL",

        amount:
          5000,

      },

    ];

  }

}

export const mockTranzgateClient =
  new MockTranzgateClient();