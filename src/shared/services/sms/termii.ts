
export const sendSms = async (to: any, sms: any)=>{
    const data = {
        to,
        from: process.env.TERMII_SENDER_ID,
        sms,
        type: "plain",
        api_key: process.env.TERMI_API_KEY,
        // channel: "dnd",
        channel: "generic",
    };

    const options = {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
    };
    
    fetch("https://api.ng.termii.com/api/sms/send", options)
    .then((response) => {
        console.log("sent message ", response.body);
    })
    .catch((error) => {
        console.error(error);
        throw error;
    }); 
}