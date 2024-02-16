const today = new Date(); // Create a new Date object representing the current date and time
today.setUTCHours(0, 0, 0, 0); // Set hours, minutes, seconds, and milliseconds to 0
const todayISOString = today.toISOString(); // Convert the date to its ISO string representation
console.log(todayISOString); // Output: "2024-02-09T00:00:00.000Z"
const inputDate = new Date("2024-02-09")
console.log(inputDate)
console.log(inputDate === todayISOString)

const todatDate = new Date().toISOString().slice(0, 10)
console.log(todatDate)

