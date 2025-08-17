export  const modifiedPhoneNumber = (mobileNumber:string) => {
    if (mobileNumber.charAt(0) === "0") {
      let n = mobileNumber.substring(1);
      return "234" + n.toString();
    }else if(mobileNumber.startsWith("+234")){
        let n = mobileNumber.substring(4);
        return "234" + n.toString();
    } else {
      return mobileNumber.toString();
    }
};

export const generateWhatsappPin = ()  => {
  // Get the current timestamp in milliseconds
  const timestamp = Date.now().toString();

  console.log("pin", timestamp)
  
  // Take the last 4 digits of the timestamp
  return timestamp.slice(-4);
}