# SNS Meet 📹

Welcome to **SNS Meet**, a modern video conferencing and collaboration platform! 🚀 This project offers seamless video meetings with additional features like PDF viewing, chat functionality, and email-based sharing for interview codes. Ideal for virtual interviews and remote team collaborations. 💻

---

## 🌟 Features
### Here's what SNS Meet has to offer:
- 🎥 **Video Conferencing**: Real-time video and audio streaming using WebRTC.
- 📨 **Email Integration**: Automatically send unique interview codes and meeting links to participants.
- 💬 **Chat Box**: Stay connected with integrated messaging during calls.
- 📄 **Resume and PDF Viewer**: View uploaded PDF files right within the app.
- 🛠️ **Tool Integration**: Dropdown menu for additional tools like report viewers.
- 🔒 **Firebase Backend**: Secure storage for call data and real-time chat messages.

---

## 🚀 Technologies Used
### Built using the latest technologies:
- **Frontend**: HTML, CSS, and JavaScript 🖼️
- **Backend**: Node.js (API with `nodemailer` for email sending) 🌐
- **Database**: Firebase Firestore and Firebase Storage 🔥
- **Video Streaming**: WebRTC with ICE servers for seamless connectivity 📡
- **Styling**: Custom CSS with responsive design 🎨
- **Environment Management**: `.env` file for secure credentials 🔑

---

## 📖 How It Works
1. **Set Up Your Environment**:
   - Clone the repository:
     ```bash
     git clone https://github.com/your-username/sns-meet.git
     cd sns-meet
     ```
   - Install dependencies:
     ```bash
     npm install
     ```

2. **Configure the Environment**:
   - Create a `.env` file in the root directory and add the following:
     ```
     DEBUG=True
     SECRET_KEY=your_secret_key
     YOUR_EMAIL=your_email@gmail.com
     YOUR_PASSWORD=your_app_password
     ALLOWED_HOSTS=localhost,127.0.0.1
     ```

3. **Start the Application**:
   - Run the development server:
     ```bash
     npm run dev
     ```
   - Open the app at [http://localhost:3000](http://localhost:3000).

---

## 🔧 Features in Detail
### Video Conferencing 🎥
- Launch your webcam and audio stream directly from the app.
- Mute/unmute webcam and audio with a single click.

### Meeting Management 📅
- Generate a unique meeting code for each session.
- Send meeting links and codes via email using `nodemailer`.

### Chat and Collaboration 💬
- Stay connected through the integrated chat feature.
- Share files (PDFs) during the meeting for enhanced collaboration.

### PDF Viewer 📄
- Upload and view resumes or other documents in a dedicated viewer.

### Real-time Backend 🔥
- Powered by Firebase for call management, chat storage, and file hosting.

---

## 🎯 Usage Instructions
1. Enter your **username** in the text field and click **Create Meeting**.
2. Click **Create Meeting ID** to generate a unique meeting code.
3. Share the code via email using the **Send Mail** button.
4. Use the **Enter Code** field and **Join Meeting** to connect.
5. During the meeting:
   - Use the **Chat Box** to message participants.
   - Upload and view PDFs as needed.
6. When done, click **Leave** to end the call.

---

## 🎨 Design Highlights
- Sleek UI with responsive design for mobile and desktop. 📱💻
- Elegant and modern styling with enhanced user experience. ✨
- Interactive elements like dropdown menus and buttons for intuitive navigation. 🖱️

---

## 🔒 Security Notes
- Use an **App Password** for your Gmail account to send emails securely.
- Store sensitive information like email credentials in the `.env` file.


