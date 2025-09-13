'use client';

export async function sendWelcomeEmail(user_id) {
  try{
    const reponse = await fetch('/api/send-welcome-user', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({user_id}),
    });

    if(!reponse.ok){
      console.log("Failed to send welcome email");
      return;
    }

    console.log("Welcome email sent successfully");
    return true;
  } catch (error) {
    console.error("Error sending welcome email:", error);
  }

}