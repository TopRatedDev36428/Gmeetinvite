// app.js
const express = require('express');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
const cors = require("cors")
const ics = require('ics');
const fs = require('fs').promises


const app = express();
const port = 3000;

app.use(cors())

app.use(bodyParser.urlencoded({ extended: true }));

app.get('/', (req, res) => {
  console.log("HEllo")
  res.sendFile(__dirname + '/index.html');
});


app.post('/send-invitation', async (req, res) => {

  console.log("ME")
  // Google Meet details
  const meetingId = 'abc-123-def';
  const meetingUrl = `https://meet.google.com/${meetingId}`;

  // Create iCal event
  const event = {
    start: [2024, 2, 11, 13, 0],
    end: [2024, 2, 11, 14, 0],
    title: 'Google Meet Invitation',
    description: `Join the meeting at ${meetingUrl}`,
    location: 'Virtual Meeting',
    organizer: { name: 'Yurii', email: 'yurii@janusipm.com' },
    attendees: [{ name: 'Me', email: "beautifuldevsworld@gmail.com" }],
  };

  const writeFileAsync = (filePath, content) => {
    return new Promise((res, rej) => {
      fs.writeFile(filePath, content)
        .then(() => {
          res();
        })
        .catch((error) => {
          rej(error);
        });
    });
  }
  console.log(event)

  // Create iCal file
  const { error, value } = ics.createEvent(event);
  if (error) {
    console.error(error);
    return res.status(500).send('Error creating iCal event');
  }

  // Nodemailer configuration
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
      user: 'yurii@janusipm.com',
      pass: 'lpxr vsxi pcsr vjuf',
    },
  });


  const icalData = value;

  // Create iCal file

  const filePath = __dirname + '/invitation.ics';
  writeFileAsync(filePath, icalData)
    .then(() => {
      console.log('File has been written successfully.');
    }).then(() => {
      // Email configuration
      const mailOptions = {
        from: 'yurii@janusipm.com',
        to: "beautifuldevsworld@gmail.com",
        subject: 'Google Meet Invitation',
        text: 'Join the meeting',
        attachments: [
          {
            filename: 'invitation.ics',
            content: icalData,
            encoding: 'base64',
          },
        ],
      };

      return mailOptions
    }).then((mailOptions) => {
      // Send email
      console.log(mailOptions)
      transporter.sendMail(mailOptions, (error, info) => {
        console.log(info)
        if (error) {
          console.error(error);
          res.status(500).send('Error sending email');
        } else {
          console.log('Email sent: ' + info.response);
        }

        console.log("OK")
        fs.unlinkSync(filePath);
      });
    })
    .catch((error) => {
      console.log(`Error writing file: ${error}`);
    });
});

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});