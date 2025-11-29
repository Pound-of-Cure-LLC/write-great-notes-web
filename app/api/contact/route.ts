import { NextRequest, NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const {
      firstName,
      lastName,
      email,
      phone,
      company,
      practiceName,
      practiceSize,
      currentEMR,
      inquiryType,
      message,
      source,
    } = body;

    // Validate required fields - email is always required, others depend on form type
    if (!email) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }

    // Save lead to Supabase
    const { error: dbError } = await getSupabase()
      .from("marketing_leads")
      .insert({
        first_name: firstName,
        last_name: lastName,
        email,
        phone: phone || null,
        practice_name: practiceName || company || null,
        practice_size: practiceSize || null,
        current_emr: currentEMR || null,
        inquiry_type: inquiryType || null,
        message: message || null,
        source: source || "Website",
      });

    if (dbError) {
      console.error("Supabase error:", dbError);
      // Don't fail the request if DB save fails - still process the lead
    }

    // Build email content
    const emailSubject = source 
      ? `[${source}] New Lead from ${firstName} ${lastName}`
      : `New Lead from ${firstName} ${lastName}`;

    const emailBody = `
New Lead Submission
============================

Name: ${firstName} ${lastName}
Email: ${email}
Phone: ${phone || "Not provided"}
Practice/Organization: ${practiceName || company || "Not specified"}
Practice Size: ${practiceSize || "Not specified"}
Current EMR: ${currentEMR || "Not specified"}
Inquiry Type: ${inquiryType || "Not specified"}
Source: ${source || "Website"}

Message:
${message || "No message provided"}

---
Submitted at: ${new Date().toISOString()}
    `.trim();

    // Log the submission
    console.log("Lead submission:", {
      to: "matthew.weiner@poundofcureweightloss.com",
      subject: emailSubject,
      email,
      source,
    });

    return NextResponse.json({
      success: true,
      message: "Form submitted successfully",
      // Return mailto data for client-side fallback
      mailto: {
        to: "matthew.weiner@poundofcureweightloss.com",
        subject: encodeURIComponent(emailSubject),
        body: encodeURIComponent(emailBody),
      },
    });
  } catch (error) {
    console.error("Contact form error:", error);
    return NextResponse.json(
      { error: "Failed to process submission" },
      { status: 500 }
    );
  }
}

