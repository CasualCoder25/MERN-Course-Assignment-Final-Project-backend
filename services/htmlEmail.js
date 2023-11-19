const htmlEmail = (task_name, reminder_time) => {
  return `<!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Reminder</title>
      </head>
      <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif">
        <center>
          <h1>Here's a reminder for your task!</h1>
          <p>Your task ${task_name} is due at ${reminder_time}.</p>
          <button
            style="
              background-color: rgb(0, 145, 255);
              border-radius: 4px;
              border: none;
              padding: 10px;
            "
          >
            <a
              target="_blank"
              style="color: white; text-decoration: none"
              href="https://mern-final-project-frontend.vercel.app/login"
              >Go To Task</a
            >
          </button>
        </center>
      </body>
    </html>
    `
}

module.exports = htmlEmail
