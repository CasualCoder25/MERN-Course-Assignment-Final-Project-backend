// INPUT-VALIDATOR
const inputTaskValidator = (body, email) => {
  if (
    email === undefined ||
    body.task_name === undefined ||
    body.task_description === undefined ||
    body.star === undefined ||
    body.priority_number === undefined ||
    body.reminder_active === undefined ||
    body.reminder_time === undefined ||
    body.completed === undefined
  ) {
    return false
  } else if (
    email === null ||
    body.task_name === null ||
    body.task_description === null ||
    body.star === null ||
    body.priority_number === null ||
    body.reminder_active === null ||
    body.reminder_time === null ||
    body.completed === null
  ) {
    return false
  } else {
    return true
  }
}

module.exports = inputTaskValidator
