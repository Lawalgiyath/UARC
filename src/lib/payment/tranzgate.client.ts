import { XMLBuilder, XMLParser } from "fast-xml-parser";

import {
  PreRegisterPaymentRequest,
  PreRegisterPaymentResponse,
  SearchPaymentRequest,
  SearchPaymentResponse,
  SendToRemitaRequest,
  SendToRemitaResponse,
  SetPaymentChannelRequest,
} from "./tranzgate.types";

import {
  tranzgateErrors,
} from "./tranzgate.errors";


const SOAP_ENDPOINT =
  process.env.TRANZGATE_SOAP_URL;

const SOAP_NAMESPACE =
  "https://services.tranzgate.com.ng/";

const SOAP_ENV =
  "http://schemas.xmlsoap.org/soap/envelope/";

const USERNAME =
  process.env.TRANZGATE_USERNAME;

const PASSWORD =
  process.env.TRANZGATE_PASSWORD;

const CLIENT_NO =
  process.env.TRANZGATE_CLIENT_NO;


function requireEnv(
  value: string | undefined,
  key: string
): string {
  if (!value) {
    throw tranzgateErrors.configuration(
      `${key} is not configured.`
    );
  }

  return value;
}

export class TranzgateClient {
  private readonly endpoint: string;

  private readonly username: string;

  private readonly password: string;

  private readonly clientNo: string;

  private readonly parser: XMLParser;

  private readonly builder: XMLBuilder;

  constructor() {
    this.endpoint = requireEnv(
      SOAP_ENDPOINT,
      "TRANZGATE_SOAP_URL"
    );

    this.username = requireEnv(
      USERNAME,
      "TRANZGATE_USERNAME"
    );

    this.password = requireEnv(
      PASSWORD,
      "TRANZGATE_PASSWORD"
    );

    this.clientNo = requireEnv(
      CLIENT_NO,
      "TRANZGATE_CLIENT_NO"
    );

    this.parser = new XMLParser({
      ignoreAttributes: false,
      parseTagValue: true,
      trimValues: true,
    });

    this.builder = new XMLBuilder({
      ignoreAttributes: false,
      format: true,
    });
  }

  async preRegisterPayment(
    request: PreRegisterPaymentRequest
  ): Promise<PreRegisterPaymentResponse> {
    const xml = this.buildPreRegisterXML(
      request
    );

    const response =
      await this.sendSoapRequest(
        "preRegisterPayment",
        xml
      );

    const parsed =
      this.parsePreRegisterResponse(
        response
      );

    return parsed;
  }

  async setPaymentChannel(
    request: SetPaymentChannelRequest
  ): Promise<void> {
    const xml =
      this.buildChannelXML(request);

    await this.sendSoapRequest(
      "setPreRegisteredPaymentChannel",
      xml
    );
  }

  async sendToRemita(
    request: SendToRemitaRequest
  ): Promise<SendToRemitaResponse> {
    const xml =
      this.buildSendToRemitaXML(request);

    const response =
      await this.sendSoapRequest(
        "sendToRemita",
        xml
      );

    return this.parseRemitaResponse(
      response
    );
  }

  async searchPayments(
    request: SearchPaymentRequest
  ): Promise<SearchPaymentResponse[]> {
    const xml =
      this.buildSearchXML(request);

    const response =
      await this.sendSoapRequest(
        "searchPaymentsFull",
        xml
      );

    return this.parseSearchResponse(
      response
    );
  }


  private async sendSoapRequest(
    action: string,
    body: string
  ): Promise<string> {
    try {
      const response = await fetch(
        this.endpoint,
        {
          method: "POST",

          headers: {
            "Content-Type":
              "text/xml; charset=utf-8",

            SOAPAction: `${SOAP_NAMESPACE}${action}`,
          },

          body,
        }
      );

      if (!response.ok) {
        throw tranzgateErrors.soapFailure(
          `SOAP request failed with status ${response.status}.`
        );
      }

      return await response.text();
    } catch (error) {
      if (error instanceof Error) {
        throw tranzgateErrors.network(
          error.message,
          error
        );
      }

      throw tranzgateErrors.network(
        "Unable to reach Tranzgate.",
        error
      );
    }
  }

 

  private buildPreRegisterXML(
    request: PreRegisterPaymentRequest
  ): string {
    return this.builder.build({
      "soap:Envelope": {
        "@_xmlns:soap": SOAP_ENV,

        "soap:Body": {
          preRegisterPayment: {
            "@_xmlns":
              SOAP_NAMESPACE,

            username:
              this.username,

            password:
              this.password,

            clientNo:
              this.clientNo,

            customerNo:
              request.customerNo,

            customerName:
              request.customerName,

            session:
              request.session,

            paymentPostingInfo: {
              PaymentPostingInfo:
                request.paymentPostingInfo.map(
                  (item) => ({
                    PaymentCode:
                      item.paymentCode,

                    PaymentText:
                      item.paymentText,

                    Currency:
                      item.currency,

                    Amount:
                      item.amount,

                    PaymentDocumentNo:
                      item.paymentDocumentNo,

                    Bank:
                      item.bank,

                    AccountNum:
                      item.accountNum,
                  })
                ),
            },
          },
        },
      },
    });
  }

  /** The following methods are currently empty; waiting for tranzgate call from the school */


  private buildChannelXML(
    request: SetPaymentChannelRequest
  ): string {
    return "";
  }

  private buildSendToRemitaXML(
    request: SendToRemitaRequest
  ): string {
    return "";
  }

  private buildSearchXML(
    request: SearchPaymentRequest
  ): string {
    return "";
  }

  private parsePreRegisterResponse(
    xml: string
  ): PreRegisterPaymentResponse {
    const json =
      this.parser.parse(xml);

    const paymentBatchId =
      json?.["soap:Envelope"]?.[
        "soap:Body"
      ]?.preRegisterPaymentResponse?.preRegisterPaymentResult;

    if (!paymentBatchId) {
      throw tranzgateErrors.invalidResponse(
        "Payment batch ID was not returned.",
        json
      );
    }

    return {
      paymentBatchId,
    };
  }

  private parseRemitaResponse(
    xml: string
  ): SendToRemitaResponse {
    const json =
      this.parser.parse(xml);

    const paymentUrl =
      json?.["soap:Envelope"]?.[
        "soap:Body"
      ]?.sendToRemitaResponse
        ?.sendToRemitaResult;

    if (!paymentUrl) {
      throw tranzgateErrors.invalidResponse(
        "Payment URL was not returned.",
        json
      );
    }

    return {
      paymentUrl,
    };
  }

  private parseSearchResponse(
    xml: string
  ): SearchPaymentResponse[] {
    return [];
  }
}

export const tranzgateClient =
  new TranzgateClient();