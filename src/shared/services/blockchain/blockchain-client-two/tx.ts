export class BeepTxClient {

    async transfer(
        recipient: string,
        amount: string,
    ) {
        return {
            transfer: {
              recipient: recipient,
              amount: amount,
            },
        };
    }

    async mint(
        recipient: string,
        amount: string,
    ) {
        return {
            mint: {
                recipient: recipient,
                amount: amount,
            },
        };
    }

    async burn(
        amount: string,
    ) {
        return {
            burn: {
                amount: amount,
            },
        };
    }

    async burnFrom(
        owner: string,
        amount: string,
    ) {
        return {
            burn_from: {
                owner: owner,
                amount: amount,
            },
        };
    }

    async balance(
        address: string,
    ) {
        return {
            balance: { 
                address: address
            },
        }
    }

    async coin(
        denom: string,
        amount: string
    ) {
        return [
            {
              denom: denom,
              amount: amount,
            },
        ]
    }

    async tokeInfo( ) {
        return {
            token_info: {}
        }
    }

}