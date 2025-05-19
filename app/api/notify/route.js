import nodemailer from 'nodemailer';

export async function POST(request) {
  try {
    const body = await request.json();
    const { email, screenshot } = body;

    if (!email) {
      return new Response(JSON.stringify({ error: 'Email is required' }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    }

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // Create the HTML content
    let htmlContent = '<h1>Security Alert</h1><p>A person has been detected in your house by the security system.</p>';
    
    // Email options
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Security Alert: Person Detected',
      text: 'A person has been detected in your house by the security system.',
      html: htmlContent,
      attachments: [],
    };

    // Add screenshot as attachment if available
    if (screenshot) {
      // Extract the base64 data from the data URL (removing the prefix like "data:image/png;base64,")
      const matches = screenshot.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
      
      if (matches && matches.length === 3) {
        const imageType = matches[1];
        const base64Data = matches[2];
        const fileExtension = imageType.split('/')[1] || 'png';
        
        mailOptions.attachments.push({
          filename: `detection-${new Date().toISOString()}.${fileExtension}`,
          content: base64Data,
          encoding: 'base64',
        });
        
        // Add a note about the attachment
        htmlContent += '<p>Please see the attached screenshot of the detected person.</p>';
        mailOptions.html = htmlContent;
      }
    }

    await transporter.sendMail(mailOptions);

    return new Response(JSON.stringify({ message: 'Notification sent successfully' }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Error sending email:', error);
    return new Response(JSON.stringify({ error: 'Failed to send notification' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
} 