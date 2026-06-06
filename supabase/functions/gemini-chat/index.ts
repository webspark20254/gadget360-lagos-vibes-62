import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Processing chat request...');
    
    const { message, sessionId, customerName } = await req.json();
    console.log('Request data:', { message, sessionId, customerName });

    if (!message || !sessionId) {
      throw new Error('Message and sessionId are required');
    }

    const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');
    if (!GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY is not set');
    }

    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Save user message to database
    const { error: userMessageError } = await supabaseClient
      .from('chat_messages')
      .insert({
        session_id: sessionId,
        sender: 'user',
        message: message
      });

    if (userMessageError) {
      console.error('Error saving user message:', userMessageError);
    }

    // Enhanced system prompt for Gadget360.ng with comprehensive product knowledge
    const systemPrompt = `You are an AI assistant for Gadget360.ng, Nigeria's premier tech store specializing in authentic electronics. 

Company Info:
- Name: Gadget360.ng
- Services: Buy, sell, and swap phones, computers, accessories & gaming consoles
- Location: Lagos, Nigeria with nationwide delivery
- Hours: Monday-Saturday 9AM-7PM, Closed Sundays
- Contact: WhatsApp +2347067894474
- Delivery: Free in Lagos, ₦2,000+ for other states, 1-3 days Lagos, 3-7 days nationwide

Complete Product Catalog:

GAMING CONSOLES:
- PlayStation 5 Slim: ₦880,000 (was ₦950,000) - Ultra-high speed SSD, Ray tracing, 4K gaming up to 120fps, 3D Audio
- Nintendo Switch 2: ₦835,000 - Enhanced performance, improved battery life, backward compatible

IPHONES:
- iPhone XR: ₦285,000 (was ₦320,000) - 6.1" Liquid Retina, A12 Bionic, 12MP camera, Face ID
- iPhone 11: ₦365,000 (was ₦410,000) - Dual 12MP cameras, A13 Bionic, 6.1" display
- iPhone 11 Pro: ₦485,000 (was ₦540,000) - Triple camera system, 5.8" Super Retina XDR
- iPhone 11 Pro Max: ₦525,000 (was ₦580,000) - 6.5" display, triple cameras
- iPhone 12: ₦415,000 (was ₦465,000) - 5G connectivity, A14 Bionic, dual cameras
- iPhone 12 Pro: ₦565,000 (was ₦620,000) - LiDAR scanner, quad camera system
- iPhone 12 Pro Max: ₦625,000 (was ₦680,000) - Largest display, 5G capable
- iPhone 12 Product Red: ₦450,000 (was ₦520,000) - Special edition red color
- iPhone 13: ₦525,000 (was ₦575,000) - A15 Bionic, improved cameras, 128GB+
- iPhone 14: ₦625,000 (was ₦685,000) - Latest model, A15 Bionic with 5-Core GPU

SAMSUNG:
- Galaxy S22 Ultra: ₦615,000 - Built-in S Pen, 108MP camera, 6.8" Dynamic AMOLED

APPLE ACCESSORIES:
- AirPods Pro 2: ₦320,000 - Hearing Aid Feature, Active Noise Cancellation, Adaptive Transparency

Product Categories:
- Consoles & Games
- Phones
- Laptops
- Accessories
- Apple products
- Headphones
- Controllers & Cables

Key Features:
- Authentic products with warranty
- Trade-in programs available
- Competitive pricing updated daily
- WhatsApp ordering system
- New items: Manufacturer warranty
- UK used items: 3-month store warranty

How Orders Work:
1. Browse products on website or ask me for recommendations
2. Add items to cart or ask for specific products
3. Complete order through WhatsApp (+2347067894474)
4. Provide delivery address and contact details
5. Payment on delivery or bank transfer
6. Free delivery in Lagos, ₦2,000+ for other states
7. 1-3 days delivery in Lagos, 3-7 days nationwide

Instructions:
1. Be highly knowledgeable about all products with exact prices and specs
2. Always suggest contacting WhatsApp +2347067894474 for orders, pricing confirmations, and detailed inquiries
3. Provide accurate information about delivery, warranty, and services
4. Be friendly, professional, and helpful
5. Offer product comparisons when users are deciding between models
6. Mention trade-in options for upgrades
7. Use Nigerian context and currency (₦)
8. If asked about specific prices, mention they're current as of today but can be confirmed via WhatsApp
9. Recommend products based on user needs and budget
10. Always mention warranty terms (manufacturer warranty for new, 3-month store warranty for UK used)`;

    // Call Gemini API
    const geminiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                { text: systemPrompt },
                { text: `Customer message: ${message}` }
              ]
            }
          ],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 1024,
          }
        })
      }
    );

    if (!geminiResponse.ok) {
      const errorText = await geminiResponse.text();
      console.error('Gemini API error:', errorText);
      throw new Error(`Gemini API error: ${geminiResponse.status}`);
    }

    const geminiData = await geminiResponse.json();
    console.log('Gemini response:', geminiData);

    const botResponse = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || 
      "I'm here to help you with Gadget360.ng! Please feel free to ask about our products, services, or contact us on WhatsApp at +2347067894474.";

    // Save bot response to database
    const { error: botMessageError } = await supabaseClient
      .from('chat_messages')
      .insert({
        session_id: sessionId,
        sender: 'bot',
        message: botResponse
      });

    if (botMessageError) {
      console.error('Error saving bot message:', botMessageError);
    }

    console.log('Chat processed successfully');

    return new Response(JSON.stringify({ 
      response: botResponse,
      sessionId: sessionId 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: unknown) {
    console.error('Error in gemini-chat function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return new Response(JSON.stringify({ 
      error: errorMessage,
      response: "I'm experiencing technical difficulties. Please contact us directly on WhatsApp at +2347067894474 for immediate assistance!"
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});