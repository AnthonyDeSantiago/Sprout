
/* comment the full calendar for this to work */

const date = document.getElementById("date");
const day = document.getElementById("day");
const month = document.getElementById("month");
const year = document.getElementById("year");

const today = new Date();
const weekDays = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
const months = ["January","Febuary","March","April","May","June","July","August","September","October","November","December"];


date.innerHTML = (today.getDate()<10?"0":"") + today.getDate();
day.innerHTML = weekDays[today.getDay()];
month.innerHTML = months[today.getMonth()];
year.innerHTML = today.getFullYear();

    
//full cal
/* isLeapYear = (year) =>{
    return (year % 4 === 0 && year % 100 !== 0 && year % 400 !==0 || (year % 100 === 0 && year % 400 === 0))
}

getFebDays = (year) => {
    return isLeapYear(year) ? 29 : 28
}

let calendar = document.querySelector('.popCal')
let month_pick = document.querySelector('#month-pick')
const monthss = ["January","Febuary","March","April","May","June","July","August","September","October","November","December"];

month_pick.onclick = ()=>{
    month_list.classList.add('show')
}
generateCal = (months,years) =>{
    let cal_days = document.querySelector('.calendar-days')
    let cal_head_year = document.querySelector('#year')

    let days_of_month = [31, getFebDays(years), 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]
    let currDate = new Date()
    cal_days.innerHTML =''
    month_pick.innerHTML = monthss[months]
    cal_head_year.innerHTML = years

    let first_day = new Date(years, months, 1)

    for(let i = 0; i <= days_of_month[months] + first_day.getDay() - 1; i++){
        let dayy = document.createElement('div')
        if (i >= first_day.getDay()){
            dayy.classList.add('calendar-day-hover')
            dayy.innerHTML = i - first_day.getDay() + 1
            dayy.innerHTML += `<span></span><span></span><span></span><span></span>`
            
            if(i - first_day.getDay() + 1 === currDate.getDate() && years === currDate.getFullYear() && months === currDate.getMonth()){
                dayy.classList.add('curr-date')
            }
        }
        cal_days.appendChild(dayy)
    }
}

let month_list = calendar.querySelector('.month-list')
monthss.forEach((e,index) => {
    let monthh = document.createElement('div')
    monthh.innerHTML = `<div>${e}</div>`
    monthh.onclick = () =>{
        month_list.classList.remove('show')
        curr_month.value = index
        generateCal(curr_month.value, curr_year.value)
    }
    month_list.appendChild(monthh)
})

document.querySelector('#prev-year').onclick = ()=>{
    --curr_year.value
    generateCal(curr_month.value, curr_year.value)
}

document.querySelector('#next-year').onclick = ()=>{
    ++curr_year.value
    generateCal(curr_month.value, curr_year.value)
}

let currDate = new Date()

let curr_month = {value: currDate.getMonth()}
let curr_year = {value: currDate.getFullYear()}

generateCal(curr_month.value, curr_year.value)


/* button to get calendar to hide or show */
/* const button = document.querySelector("cal-btn");

button.onclick = () =>{
    const but = document.getElementsByClassName("wrapper2");
    but.style.opacity = "100";

}  */