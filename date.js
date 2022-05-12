
module.exports = getday

function getday(){
    var today = new Date()
    var currentDate = today.getDay()
    var day = ''
    var options = {
        weekday : "long",
        day : "numeric",
        month : "long"
    }
    var day = today.toLocaleDateString("en-US",options)
    return day;
}