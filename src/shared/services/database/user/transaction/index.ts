import { Schema, model, PaginateModel } from "mongoose";
import mongoosePaginate from 'mongoose-paginate-v2'
import { TransactionStatus, TransactionTypeEnum, IUserTransaction } from "../../../../types/interfaces/responses/user/transaction.response";
import TransactionDto from "../../../../types/dtos/user/transaction.dto";
import ITransactionModel from "./type";


const TransactionSchema = new Schema<IUserTransaction>({
    userId: {
      type: String,
      required: true
    },
    amount: {
        type: Number,
        required: true
      },
    reference: {
      type: String,
      unique: true
    },
    type: {
        type: String,
        enum: TransactionTypeEnum
    },
    status: {
        type: String,
        enum: TransactionStatus
    },
    updatedAt: {
      type: String
    },
    createdAt: {
      type: String
    },
  });
  
  TransactionSchema.plugin(mongoosePaginate);
  
  export const Transaction = model<IUserTransaction, PaginateModel<IUserTransaction>>("Transaction", TransactionSchema)


  class  TransactionModel implements  ITransactionModel {
    Transaction: typeof Transaction;
    
    constructor() {
        this.Transaction =  Transaction;
    }

    createTransactionToDB = async (details: Partial<IUserTransaction>) => {
        try {
            const data = await this.Transaction.create(details);
            if (data) {
              return {status: true, data: new TransactionDto(data)};
            } else {
              return {status: false, error: "Couldn't create transaction"};
            }
        } catch (error) {
            return {status: false, error };
        }
    }

    checkIfExist = async (details: Partial<IUserTransaction>) => {
        try {
            const data = await this.Transaction.findOne(details);
            if (data) {
              return {status: true, data: new TransactionDto(data)};
            } else {
              return {status: false, error: "no transaction find"};
            }
        } catch (error) {
            return {status: false, error };
        }
    }

    updateTransation = async (id: string, details: Partial<IUserTransaction>) => {
      try {
          const data = await this.Transaction.findOneAndUpdate({_id: id}, details, {new: true});
          if (data) {
            return {status: true, data: new TransactionDto(data)};
          } else {
            return {status: false, error: "Unable to update transaction"};
          }
      } catch (error) {
          return {status: false, error };
      }
  }

}

export default TransactionModel;