require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cron = require('node-cron');
const nodemailer = require('nodemailer');

const app = express();

// --- MIDDLEWARES ---
app.use(cors());
app.use(express.json());

// --- IN-MEMORY DATABASE ---
let usersDB = [];
let scheduleDB = [];

// --- API ENDPOINTS ---
app.post('/api/users', (req, res) => {
  const newUser = req.body;
  const exists = usersDB.find(u => u.email === newUser.email);
  if (!exists) {
    usersDB.push(newUser);
    console.log(`[API] New user registered: ${newUser.name} (${newUser.email})`);
  }
  res.json({ success: true, message: 'User registered successfully' });
});

app.post('/api/schedule', (req, res) => {
  const { userId, classes } = req.body; 
  scheduleDB = scheduleDB.filter(c => c.userId !== userId);
  scheduleDB.push(...classes);
  console.log(`[API] Saved ${classes.length} classes for user ${userId}`);
  res.json({ success: true, message: 'Schedule saved successfully' });
});

// Đã thu gọn chỉ nhận cài đặt thông báo lịch học
app.post('/api/settings', (req, res) => {
  const { userId, emailNotifs } = req.body;
  const userIndex = usersDB.findIndex(u => u.id === userId);
  
  if (userIndex !== -1) {
    usersDB[userIndex] = { ...usersDB[userIndex], emailNotifs };
    console.log(`[API] Updated notification settings for user ${userId}: ${emailNotifs}`);
    res.json({ success: true, message: 'Settings updated successfully' });
  } else {
    res.status(404).json({ success: false, message: 'User not found' });
  }
});

// --- EMAIL CONFIGURATION ---
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// =====================================================================
// 1. CRON JOB: TOMORROW'S SCHEDULE REMINDER (Runs at 21:00 daily)
// =====================================================================
cron.schedule('0 21 * * *', async () => {
  console.log('[CRON] 21:00 - Checking schedule for tomorrow...');
  
  const todayIndex = new Date().getDay() === 0 ? 6 : new Date().getDay() - 1;
  const tomorrowIndex = (todayIndex + 1) % 7; 

  const activeUsers = usersDB.filter(u => u.emailNotifs === true);

  for (const user of activeUsers) {
    const tomorrowsClasses = scheduleDB.filter(c => c.userId === user.id && c.dayIndex === tomorrowIndex);
    
    if (tomorrowsClasses.length > 0) {
      const classListHtml = tomorrowsClasses.map(c => {
        const startH = String(c.startHour).padStart(2, '0');
        const startM = String(c.startMin).padStart(2, '0');
        const endH = String(c.startHour + Math.floor((c.startMin + c.durationMins) / 60)).padStart(2, '0');
        const endM = String((c.startMin + c.durationMins) % 60).padStart(2, '0');
        return `<li style="margin-bottom: 10px;">
           <b style="color: #2563eb;">${c.subject}</b><br/>
           ⏰ ${startH}:${startM} - ${endH}:${endM} | 🏫 Room: ${c.room}
         </li>`;
      }).join('');
      
      const mailOptions = {
        from: `"Academix Notifications" <${process.env.EMAIL_USER}>`,
        to: user.email,
        subject: '🌙 Reminder: Your Schedule for Tomorrow',
        html: `
          <div style="font-family: Arial, sans-serif; color: #333; max-width: 500px; padding: 20px; border: 1px solid #e2eaf8; border-radius: 10px;">
            <h2 style="color: #0f172a; margin-top: 0;">Good evening, ${user.name}! 🌌</h2>
            <p style="color: #475569;">Don't forget you have <b>${tomorrowsClasses.length} class(es)</b> tomorrow. Please be prepared:</p>
            <ul style="list-style-type: none; padding: 0; background: #f8faff; padding: 15px; border-radius: 8px;">
              ${classListHtml}
            </ul>
            <p style="color: #475569; margin-bottom: 0;">Have a good night and see you tomorrow!</p>
          </div>
        `
      };

      try {
        await transporter.sendMail(mailOptions);
        console.log(`[MAIL] Sent tomorrow's reminder to: ${user.email}`);
      } catch (error) {
        console.error(`[MAIL ERROR] Failed to send to ${user.email}:`, error);
      }
    }
  }
});

// =====================================================================
// 2. CRON JOB: 1-HOUR BEFORE CLASS ALERT (Runs every minute)
// =====================================================================
cron.schedule('* * * * *', async () => {
  const now = new Date();
  const currentHour = now.getHours();
  const currentMin = now.getMinutes();
  
  const nowTotalMins = currentHour * 60 + currentMin; 
  const todayIndex = now.getDay() === 0 ? 6 : now.getDay() - 1;

  const activeUsers = usersDB.filter(u => u.emailNotifs === true);

  for (const user of activeUsers) {
    const todaysClasses = scheduleDB.filter(c => c.userId === user.id && c.dayIndex === todayIndex);
    
    for (const c of todaysClasses) {
      const classStartMins = c.startHour * 60 + c.startMin;
      
      if (classStartMins - nowTotalMins === 60) {
        
        const startH = String(c.startHour).padStart(2, '0');
        const startM = String(c.startMin).padStart(2, '0');

        const mailOptions = {
          from: `"Academix Alert" <${process.env.EMAIL_USER}>`,
          to: user.email,
          subject: `⏳ ${c.subject} starts in 1 hour!`,
          html: `
            <div style="font-family: Arial, sans-serif; color: #333; max-width: 500px; padding: 20px; border: 2px solid #3b82f6; border-radius: 10px;">
              <h2 style="color: #2563eb; margin-top: 0;">Class Alert! ⏰</h2>
              <p style="color: #475569;">Hi ${user.name}, your class starts in <b>1 hour</b>:</p>
              
              <div style="background: #eff6ff; padding: 15px; border-radius: 8px; text-align: center; margin: 20px 0;">
                <h3 style="margin: 0; color: #1e3a8a; font-size: 22px;">${c.subject}</h3>
                <p style="margin: 8px 0 0 0; font-size: 16px; color: #3b82f6;"><b>Room: ${c.room}</b></p>
                <p style="margin: 4px 0 0 0; font-size: 16px; color: #475569;">Starts at: <b>${startH}:${startM}</b></p>
              </div>
              
              <p style="color: #475569; margin-bottom: 0;">Please get ready and head to your class!</p>
            </div>
          `
        };

        try {
          await transporter.sendMail(mailOptions);
          console.log(`[MAIL ALERT] Sent 1-hour alert for ${c.subject} to: ${user.email}`);
        } catch (error) {
          console.error(`[MAIL ERROR] Failed to send alert to ${user.email}:`, error);
        }
      }
    }
  }
});

// --- START SERVER ---
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Academix Backend is running on http://localhost:${PORT}`);
  console.log('⏱️ Cron jobs (21:00 Reminder & 1-Hour Alert) are active...');
});