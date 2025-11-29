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

    // Save lead to Supabase (if configured)
    const supabase = getSupabase();
    if (supabase) {
      const { error: dbError } = await supabase
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
    } else {
      console.log("Supabase not configured, skipping database save");
    }

    // Log the submission
    console.log("Lead submission:", {
      email,
      name: `${firstName} ${lastName}`,
      source,
    });

    return NextResponse.json({
      success: true,
      message: "Form submitted successfully",
    });
  } catch (error) {
    console.error("Contact form error:", error);
    return NextResponse.json(
      { error: "Failed to process submission" },
      { status: 500 }
    );
  }
}

