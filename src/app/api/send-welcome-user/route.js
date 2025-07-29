import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js"; 

export async function POST(req) {
  try{
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY,
    );
    const {user_id} = await req.json();
    
    console.log('Welcome email API called for user:', user_id);
    
    // Check if profile exists in public.profiles
    const {data:profile, error} = await supabase.from("profiles").select('email, is_new_user, welcome_email_sent').eq('user_id', user_id).single();
    
    if(error || !profile){
      console.error('Profile not found:', error);
      return NextResponse.json({error: "User profile not found"}, {status: 404});
    }

    console.log('Profile found:', { email: profile.email, is_new_user: profile.is_new_user, welcome_email_sent: profile.welcome_email_sent });

    if(profile.is_new_user && !profile.welcome_email_sent){
      try{
        console.log('Sending welcome email to:', profile.email);
        
        // Sending the welcome email to the new user
        const emailResponse = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/send_welcome_email`, {
          method: "POST",
          headers:{
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`
          },
          body: JSON.stringify({email: profile.email})
        });

        console.log('Email function response status:', emailResponse.status);
        
        const emailData = await emailResponse.json();
        console.log('Email function response:', emailData);

        if (!emailResponse.ok) {
          console.error('Email function failed:', emailData);
          return NextResponse.json({error: "Failed to send welcome email", details: emailData}, {status: 500});
        }

        // Updating the profile to indicate that the welcome email has been sent
        const { error: updateError } = await supabase 
          .from("profiles")
          .update({
            welcome_email_sent: true,
            is_new_user: false
          })
          .eq('user_id', user_id);

        if (updateError) {
          console.error('Error updating profile:', updateError);
          return NextResponse.json({error: "Failed to update profile"}, {status: 500});
        }
          
        console.log("Welcome email sent successfully from API");
        return NextResponse.json({message: "Welcome email sent successfully"}, {status: 200});
        
      } catch (emailError) {
        console.error("Error sending welcome email FROM API:", emailError);
        return NextResponse.json({error: "Failed to send welcome email", details: emailError.message}, {status: 500});
      }
    }
    else{
      console.log("User is not new or email already sent");
    }
    
    // Profile exists, welcome email already sent
    console.log("Welcome Email already sent from API");
    return NextResponse.json({message: "Welcome email already sent"}, {status: 200});
  } catch (error) {
    console.error("Error in welcome email API:", error);
    return NextResponse.json({error: "Internal server error", details: error.message}, {status: 500});
  }
}