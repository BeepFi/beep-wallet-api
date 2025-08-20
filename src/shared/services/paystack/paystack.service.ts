export class PaystackService {
    paystackSecretKey = 'sk_test_b27336978f0f77d84915d7e883b0f756f6d150e7';
  
    async initTransaction(
      email: string,
      amount: number,
      userId: string,
    //   callback?: string,
    ) {
      try {
        // const paystackSecretKey = process.env.PAYSTACK_KEY;
  
        const currentDate = new Date();
        const milliseconds = currentDate.getMilliseconds();
        const response = await fetch(
          'https://api.paystack.co/transaction/initialize',
          {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${this.paystackSecretKey}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              amount: amount * 100, // Amount in kobo (e.g., 10000 kobo = ₦100)
              email: email,
              reference: milliseconds,
              metadata: {
                userId,
                amount,
              },
            //   callback_url: callback,
            }),
          },
        );
  
        const data = await response.json();
  
        if (!data.status) {
          return {
            status: false,
            message: 'Unable to initialize transactions',
          };
        }
  
        return {
          status: true,
          message: 'Payment successfully initialize',
          data: {
            url: data.data.authorization_url,
            reference: data.data.reference,
          },
        };
      } catch (error) {
        console.error('Error in initializing transaction:', error);
        return {
          status: false,
          message: 'Unable to initialize transactions',
          error: error,
        };
      }
    }
  
    async verifyTransaction(reference: string) {
      try {
        const response = await fetch(
          `https://api.paystack.co/transaction/verify/${reference}`,
          {
            method: 'GET',
            headers: {
              Authorization: `Bearer ${this.paystackSecretKey}`,
            },
          },
        );
  
        const data = await response.json();
  
        if (!data.status) {
          return {
            status: false,
            message: 'Transaction reference not found',
          };
        }
  
        if (data.data.gateway_response != 'Successful') {
          return {
            status: false,
            message: 'Transaction was not completed',
          };
        }
  
        return {
          status: true,
          message: 'Transaction verified successfully',
          data: data.data.metadata,
        };
      } catch (error) {
        console.error('Error in initializing transaction:', error);
        return {
          status: false,
          message: 'Unable to initialize transactions',
          error: error,
        };
      }
    }
  
    // async createTransferRecipient(payload: CreateTransferRecipientDto) {
    //   try {
    //     const response = await fetch(
    //       `https://api.paystack.co/transferrecipient`,
    //       {
    //         method: 'POST',
    //         headers: {
    //           Authorization: `Bearer ${this.paystackSecretKey}`,
    //           'Content-Type': 'application/json',
    //         },
    //         body: JSON.stringify({
    //           type: 'nuban',
    //           name: payload.accountName,
    //           account_number: payload.accountNumber,
    //           bank_code: payload.bankCode,
    //         }),
    //       },
    //     );
  
    //     const data = await response.json();
  
    //     if (data.status === false) {
    //       throw new BadRequestException(
    //         'Oops! There was an error\n This is not from you',
    //       );
    //     }
    //     return {
    //       status: true,
    //       data: data.data,
    //     };
    //   } catch (error) {
    //     return {
    //       status: false,
    //       message: 'Unable to create transfer recipient',
    //     };
    //   }
    // }
  
    // async initiateTransfer(payload: InitiateTransferDto) {
    //   try {
    //     const response = await fetch(`https://api.paystack.co/transfer`, {
    //       method: 'POST',
    //       headers: {
    //         Authorization: `Bearer ${this.paystackSecretKey}`,
    //         'Content-Type': 'application/json',
    //       },
    //       body: JSON.stringify({
    //         source: 'balance',
    //         amount: payload.amount * 100, // Converting from Naira to Kobo
    //         reason: payload.description,
    //         recipient: payload.recipient,
    //       }),
    //     });
  
    //     const data = await response.json();
  
    //     console.log('data', data);
  
    //     if (data.status === false) {
    //       return {
    //         status: false,
    //         message: data.message,
    //       };
    //     }
  
    //     return {
    //       status: true,
    //       data: data.data,
    //     };
    //   } catch (error) {
    //     return {
    //       status: false,
    //       message: 'Unable to initialize transfer',
    //     };
    //   }
    // }
  
    // async finalizeTransfer(payload: FinalizeTransferDto) {
    //   const response = await fetch(
    //     `https://api.paystack.co/transfer/finalize_transfer`,
    //     {
    //       method: 'POST',
    //       headers: {
    //         Authorization: `Bearer ${this.paystackSecretKey}`,
    //         'Content-Type': 'application/json',
    //       },
    //       body: JSON.stringify({
    //         transfer_code: payload.transferCode,
    //         otp: payload.otp,
    //       }),
    //     },
    //   );
    // }
}