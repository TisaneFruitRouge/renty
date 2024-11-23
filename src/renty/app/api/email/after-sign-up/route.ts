import AfterSignUp from "@/email-templates/AfterSignUp";
import { resend } from "@/lib/resend";

export async function POST(request: Request) {
  try {
    const { name, email } = await request.json();

    if (!name || !email) {
      return Response.json({ error: 'Name and email are required' }, { status: 400 });
    }

    const recipientEmail = process.env.NODE_ENV === 'development' 
      ? process.env.DEV_EMAIL || email
      : email;

    const { data, error } = await resend.emails.send({
      from: 'Renty <little-bot@renty.cc>',
      to: [recipientEmail],
      subject: 'Thank you for signing up!',
      react: AfterSignUp({ name }),
    });

    if (error) {
      return Response.json({ error }, { status: 500 });
    }

    return Response.json(data);
  } catch (error) {
    return Response.json({ error }, { status: 500 });
  }
}
