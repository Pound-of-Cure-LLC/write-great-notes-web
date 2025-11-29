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
      practiceName,
      practiceSize,
      currentEMR,
      inquiryType,
      message,
      source,
    } = body;

    // Map to external API format (snake_case)
    const externalApiBody = {
      first_name: firstName,
      last_name: lastName,
      email,
      phone: phone || null,
      practice_name: practiceName || company || null,
      company: company || null, // Include company as well if available
      practice_size: practiceSize || null,
      current_emr: currentEMR || null,
      inquiry_type: inquiryType || null,
      message: message || null,
      source: source || "Website",
    };

    const response = await fetch('https://api.writegreatnotes.ai/contact', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(externalApiBody),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("External API error:", data);
      return NextResponse.json(
        data, // Forward the error details from external API
        { status: response.status }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Form submitted successfully",
      ...data // Include any other data returned by the external API
    });

  } catch (error) {
    console.error("Contact proxy error:", error);
    return NextResponse.json(
      { error: "Failed to process submission" },
      { status: 500 }
    );
  }
}

