import React, { useState } from "react";
import SendIcon from "@mui/icons-material/Send";
import Button from "@mui/material/Button";
import emailjs from "@emailjs/browser";

const SendMail = () => {
  const [status, setStatus] = useState("");
  const [errorDetails, setErrorDetails] = useState("");

  const sendEmail = (e) => {
    e.preventDefault();
    setStatus("sending");
    setErrorDetails("");
    
    emailjs.sendForm(
      "service_djmp7u9",
      "template_vzj7j58",
      e.target,
      "nag2WXetTRlbxdQms"
    )
    .then((result) => {
      console.log("Email sent successfully:", result.text);
      setStatus("sent");
      e.target.reset(); // Clear form after successful submission
    })
    .catch((error) => {
      // More detailed error logging
      console.error("Failed to send email:", error);
      console.error("Error text:", error.text);
      console.error("Error details:", error.status, error.name);
      
      // Set a more helpful error message for the user
      if (error.text && error.text.includes("authentication credentials")) {
        setErrorDetails("Authentication error with email service. Please contact support.");
      } else {
        setErrorDetails(error.text || "Unknown error occurred");
      }
      
      setStatus("error");
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="mail bg-white rounded-xl shadow-2xl p-8 w-full max-w-md transform transition-all duration-500 hover:scale-105">
        <div className="flex items-center justify-center mb-8">
          <h1 className="text-3xl font-bold text-center text-indigo-500 animate-pulse">Send The Reward</h1>
        </div>
        
        <form className="space-y-6" onSubmit={sendEmail}>
          <div className="relative">
            <label htmlFor="emailFrom" className="text-sm font-medium text-gray-700 block mb-2">
              Email
            </label>
            <input
              type="email"
              name="email_from"
              id="emailFrom"
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-300 outline-none"
              placeholder="person@example.com"
              required
            />
          </div>
          
          <div className="relative">
            <label htmlFor="message" className="text-sm font-medium text-gray-700 block mb-2">
              Message
            </label>
            <textarea
              name="message"
              id="message"
              rows="5"
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-300 outline-none resize-none"
              placeholder="Your message here..."
              required
            ></textarea>
          </div>
          
          <div className="flex justify-center">
            <Button
              type="submit"
              variant="contained"
              endIcon={<SendIcon />}
              className={`w-full py-3 px-6 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-medium transition-all duration-300 transform hover:-translate-y-1 ${status === "sending" ? "opacity-70 cursor-not-allowed" : ""}`}
              style={{ marginTop: "12px", backgroundColor: "#4F46E5" }}
              disabled={status === "sending"}
            >
              <span className="mr-2">
                {status === "sending" ? "Sending..." : "Send Message"}
              </span>
            </Button>
          </div>
          
          {/* Status messages with animations */}
          {status === "sent" && (
            <div className="bg-green-50 border-l-4 border-green-500 p-4 mt-4 rounded animate-fadeIn">
              <p className="text-green-700 font-medium">Message sent successfully!</p>
            </div>
          )}
          
          {status === "error" && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 mt-4 rounded animate-fadeIn">
              <div className="text-red-700 font-medium">
                <p>Please wait....</p>
                {errorDetails && (
                  <p className="text-sm mt-1 text-red-600">{errorDetails}</p>
                )}
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default SendMail;

/* Add these custom animations to your global CSS file */
/*
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(-10px); }
  to { opacity: 1; transform: translateY(0); }
}

.animate-fadeIn {
  animation: fadeIn 0.5s ease-in-out;
}
*/