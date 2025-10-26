import moment from "moment-timezone";
import "moment/locale/ar.js"; // Arabic locale support

moment.locale("ar"); // Set Arabic globally

const TIMEZONE = "Africa/Cairo";

/**
 * 🗓️ Returns full date & time (format: DD-MM-YYYY hh:mm صباحاً/مساءً)
 * @param {Date | string | number} [date] - Optional date. Defaults to now.
 * @returns {string}
 */
export const formatFullDateTime = (date: Date | string = new Date() ) => {
  return moment(date)
    .tz(TIMEZONE)
    .format("DD-MM-YYYY");
};

/**
 * 🕓 Returns time only (format: hh:mm صباحاً/مساءً)
 * @param {Date | string | number} [date] - Optional date. Defaults to now.
 * @returns {string}
 */
export const formatTimeOnly = (time: Date | string = new Date()) => {
  let m;

  if (typeof time === "string") {
    // Parse time with today's date context
    const today = moment().format("YYYY-MM-DD");
    m = moment.tz(`${today} ${time}`, "YYYY-MM-DD HH:mm", TIMEZONE);
  } else {
    m = moment(time).tz(TIMEZONE);
  }

  if (!m.isValid()) return "وقت غير صالح";

  return m
    .locale("ar")
    .format("hh:mm A")
    .replace("AM", "صباحاً")
    .replace("PM", "مساءً");
};


export const dateAndTimeHandeler = (arrivalDate?: Date | string, arrivalTime?: Date | string) => {
    let interviewDate:string | Date;
    let interviewTime:string | Date;
    if(arrivalDate && !arrivalTime){
        interviewDate = formatFullDateTime(arrivalDate);
        interviewTime = formatTimeOnly(arrivalDate);
    } else if(arrivalTime && !arrivalDate){
        interviewDate = formatFullDateTime(arrivalTime);
        interviewTime = formatTimeOnly(arrivalTime);
    } else if(arrivalDate && arrivalTime){
        interviewDate = formatFullDateTime(arrivalDate);
        interviewTime = formatTimeOnly(arrivalTime);
    } else {
        interviewDate = formatFullDateTime();
        interviewTime = formatTimeOnly();
    }
    return {interviewDate , interviewTime};
}