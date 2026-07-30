import {
  PreRegisterPaymentRequest,
  PreRegisterPaymentResponse,
} from "./tranzgate.types";


export class MockTranzgateClient {

  async preRegisterPayment(
    request: PreRegisterPaymentRequest
  ): Promise<PreRegisterPaymentResponse> {

    console.log(
      "MOCK TRANZGATE REQUEST:",
      request
    );


    return {
      paymentBatchId:
        `MOCK-BATCH-${Date.now()}`,
    };
  }


  async setPaymentChannel() {
    return;
  }


  async sendToRemita() {
    return {
      paymentUrl:
        "https://mock-payment-url.com/pay",
    };
  }


  async searchPayments() {
    return [];
  }
}


export const mockTranzgateClient =
  new MockTranzgateClient();