import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const {
      firstName,
      lastName,
      email,
      phone,
      company,
      practiceSize,
      currentEMR,
      inquiryType,
      message,
      source,
    } = body;

    // Validate required fields
    if (!firstName || !lastName || !email || !company) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Build email content
    const emailSubject = source 
      ? `[${source}] New Contact Form Submission from ${firstName} ${lastName}`
      : `New Contact Form Submission from ${firstName} ${lastName}`;

    const emailBody = `
New Contact Form Submission
============================

Name: ${firstName} ${lastName}
Email: ${email}
Phone: ${phone || "Not provided"}
Practice/Organization: ${company}
Practice Size: ${practiceSize || "Not specified"}
Current EMR: ${currentEMR || "Not specified"}
Inquiry Type: ${inquiryType || "Not specified"}
Source: ${source || "Main Contact Form"}

Message:
${message || "No message provided"}

---
Submitted at: ${new Date().toISOString()}
    `.trim();

    // Send email using mailto link workaround for client-side
    // In production, you'd use a service like SendGrid, Resend, etc.
    // For now, we'll return the data to be handled client-side
    
    // You can implement email sending here with services like:
    // - Resend (npm install resend)
    // - SendGrid
    // - Nodemailer
    // - AWS SES
    
    // Example with Resend (uncomment when API key is available):
    // const resend = new Resend(process.env.RESEND_API_KEY);
    // await resend.emails.send({
    //   from: 'noreply@writegreatnotes.ai',
    //   to: 'matthew.weiner@poundofcureweightloss.com',
    //   subject: emailSubject,
    //   text: emailBody,
    // });

    // For now, log the submission and return success
    console.log("Contact form submission:", {
      to: "matthew.weiner@poundofcureweightloss.com",
      subject: emailSubject,
      body: emailBody,
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

