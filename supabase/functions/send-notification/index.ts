import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface NotificationRequest {
  type: 'sms' | 'email' | 'in_app';
  title: string;
  message: string;
  recipients?: string[]; // user IDs for in_app, phone numbers for SMS, emails for email
  channel_data?: {
    phone?: string;
    email?: string;
    user_id?: string;
  };
  reference?: {
    type: string;
    id: string;
  };
}

interface NotificationResponse {
  success: boolean;
  message: string;
  notifications_sent: number;
  errors?: string[];
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    // Verify user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      throw new Error('Unauthorized');
    }

    // Get user profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('dealership_id')
      .eq('user_id', user.id)
      .single();

    if (!profile) {
      throw new Error('User profile not found');
    }

    const request: NotificationRequest = await req.json();
    
    console.log(`Sending ${request.type} notification: ${request.title}`);

    let notificationsSent = 0;
    const errors: string[] = [];

    if (request.type === 'in_app') {
      // Handle in-app notifications
      const recipients = request.recipients || [];
      
      if (request.channel_data?.user_id) {
        recipients.push(request.channel_data.user_id);
      }

      for (const userId of recipients) {
        try {
          const { error } = await supabase
            .from('notifications')
            .insert({
              dealership_id: profile.dealership_id,
              user_id: userId,
              title: request.title,
              message: request.message,
              type: 'info',
              channel: 'in_app',
              reference_type: request.reference?.type,
              reference_id: request.reference?.id,
              sent_at: new Date().toISOString()
            });

          if (error) {
            errors.push(`Failed to send in-app notification to user ${userId}: ${error.message}`);
          } else {
            notificationsSent++;
          }
        } catch (error) {
          errors.push(`Error sending in-app notification to user ${userId}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }

    } else if (request.type === 'sms') {
      // Handle SMS notifications
      // For now, we'll log the SMS and store it as a notification
      // In production, you would integrate with Twilio or similar service
      
      const phoneNumber = request.channel_data?.phone || (request.recipients?.[0]);
      
      if (phoneNumber) {
        try {
          // Store SMS notification record
          const { error } = await supabase
            .from('notifications')
            .insert({
              dealership_id: profile.dealership_id,
              title: request.title,
              message: request.message,
              type: 'info',
              channel: 'sms',
              reference_type: request.reference?.type,
              reference_id: request.reference?.id,
              sent_at: new Date().toISOString()
            });

          if (error) {
            errors.push(`Failed to log SMS notification: ${error.message}`);
          } else {
            notificationsSent++;
            console.log(`SMS would be sent to ${phoneNumber}: ${request.message}`);
          }
        } catch (error) {
          errors.push(`Error sending SMS: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      } else {
        errors.push('No phone number provided for SMS notification');
      }

    } else if (request.type === 'email') {
      // Handle email notifications
      // For now, we'll log the email and store it as a notification
      // In production, you would integrate with SendGrid or similar service
      
      const email = request.channel_data?.email || (request.recipients?.[0]);
      
      if (email) {
        try {
          // Store email notification record
          const { error } = await supabase
            .from('notifications')
            .insert({
              dealership_id: profile.dealership_id,
              title: request.title,
              message: request.message,
              type: 'info',
              channel: 'email',
              reference_type: request.reference?.type,
              reference_id: request.reference?.id,
              sent_at: new Date().toISOString()
            });

          if (error) {
            errors.push(`Failed to log email notification: ${error.message}`);
          } else {
            notificationsSent++;
            console.log(`Email would be sent to ${email}: ${request.title}`);
          }
        } catch (error) {
          errors.push(`Error sending email: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      } else {
        errors.push('No email address provided for email notification');
      }
    }

    const response: NotificationResponse = {
      success: errors.length === 0,
      message: `Sent ${notificationsSent} notifications`,
      notifications_sent: notificationsSent,
      ...(errors.length > 0 && { errors })
    };

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: errors.length === 0 ? 200 : 207, // 207 for partial success
    });

  } catch (error) {
    console.error('Error in send-notification function:', error);
    
    const errorResponse: NotificationResponse = {
      success: false,
      message: 'Failed to send notifications',
      notifications_sent: 0,
      errors: [error instanceof Error ? error.message : 'Unknown error occurred']
    };

    return new Response(JSON.stringify(errorResponse), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});