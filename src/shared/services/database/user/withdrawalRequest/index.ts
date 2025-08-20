import { Schema, model, PaginateModel } from "mongoose";
import mongoosePaginate from 'mongoose-paginate-v2'
import WithdrawalRequestDto from "../../../../types/dtos/user/withdrawalRequest.dto";
import IWithdrawalRequestModel from "./type";
import { IWithdrawalRequest, WithdrawalRequestStatus } from "../../../../types/interfaces/responses/user/withdrawRequest.response";


const WithdrawalRequestSchema = new Schema<IWithdrawalRequest>({
    userId: {
      type: String,
      required: true
    },
    amount: {
        type: Number,
        required: true
      },
    bank: {
      type: String,
      required: true
    },
    accountNumber: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: WithdrawalRequestStatus
    },
    reference: {
      type: String,
      required: true
    },
    updatedAt: {
      type: String
    },
    createdAt: {
      type: String
    },
  });
  
  WithdrawalRequestSchema.plugin(mongoosePaginate);
  
  export const WithdrawalRequest = model<IWithdrawalRequest, PaginateModel<IWithdrawalRequest>>("WithrawalRequest", WithdrawalRequestSchema)


  class  WithdrawalRequestModel implements  IWithdrawalRequestModel {
    WithdrawalRequest: typeof WithdrawalRequest;
    
    constructor() {
        this.WithdrawalRequest =  WithdrawalRequest;
    }

    createWithrawalRequestToDB = async (details: Partial<IWithdrawalRequest>) => {
        try {
            const data = await this.WithdrawalRequest.create(details);
            if (data) {
              return {status: true, data: new WithdrawalRequestDto(data)};
            } else {
              return {status: false, error: "Couldn't create request"};
            }
        } catch (error) {
            return {status: false, error };
        }
    }

    checkIfExist = async (details: Partial<IWithdrawalRequest>) => {
        try {
            const data = await this.WithdrawalRequest.findOne(details);
            if (data) {
              return {status: true, data: new WithdrawalRequestDto(data)};
            } else {
              return {status: false, error: "No request find"};
            }
        } catch (error) {
            return {status: false, error };
        }
    }

    updateWithrawalRequest = async (id: string, details: Partial<IWithdrawalRequest>) => {
      try {
          const data = await this.WithdrawalRequest.findOneAndUpdate({_id: id}, details, {new: true});
          if (data) {
            return {status: true, data: new WithdrawalRequestDto(data)};
          } else {
            return {status: false, error: "Unable to update request"};
          }
      } catch (error) {
          return {status: false, error };
      }
  }

}

export default WithdrawalRequestModel;