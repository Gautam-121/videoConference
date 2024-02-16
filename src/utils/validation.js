function isValidDate(dateStr) {
    // Regular expression to match the 'YYYY-MM-DD' format
    const regex = /^\d{4}-\d{2}-\d{2}$/;
    // Check if the provided string matches the regex pattern
    return regex.test(dateStr);
}

function isTimeGreaterThanCurrent(scheduledDate , startTime){
     // Parse the input time string into a Date object
      const currentTime = new Date()
      startTime = new Date(`${scheduledDate}T${startTime}`);

      console.log("currntTime" , currentTime)
      console.log("startTime" , startTime)

      return startTime>currentTime
}

function isEndTimeGreaterThanStart(scheduledDate , startTime , endTime){
    // Parse the input time string into a Date object
     startTime = new Date(`${scheduledDate}T${startTime}`);
     endTime = new Date(`${scheduledDate}T${endTime}`);

     return endTime>startTime
}




module.exports = {isValidDate , isTimeGreaterThanCurrent , isEndTimeGreaterThanStart}