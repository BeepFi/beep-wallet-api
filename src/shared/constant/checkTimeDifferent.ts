
export let isSessionExpired = (startAt: any) => {
    const startTime = new Date(startAt).getTime(); // Convert to timestamp
    const currentTime = Date.now(); // Current time in milliseconds
  
    const diffInMs = currentTime - startTime;
    const diffInMinutes = diffInMs / (1000 * 60);
  
    return diffInMinutes >= 5;
}