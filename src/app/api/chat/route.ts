import { createGroq } from '@ai-sdk/groq';
import { streamText, convertToModelMessages } from 'ai';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/db';

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
  const { messages } = await req.json();

  const modelMessages = await convertToModelMessages(messages);

  const user = await getCurrentUser();
  let contextInfo = '';
  if (user) {
    contextInfo += `User Information: Name: ${user.name}, Role: ${user.role}, Student ID: ${user.studentId || 'N/A'}, Batch: ${user.batch || 'N/A'}. `;
    if (user.universityId) {
      const facilities = await prisma.facility.findMany({
        where: { universityId: user.universityId },
        select: { name: true, type: true, capacity: true, amenities: true, operatingHours: true, transportConfig: true }
      });
      contextInfo += `\n\nAvailable Facilities at ${user.university?.name || 'your university'}:\n`;
      facilities.forEach(f => {
        const amenitiesStr = f.amenities && typeof f.amenities === 'object' 
          ? Object.entries(f.amenities).map(([k, v]) => `${k}: ${v}`).join(', ') 
          : 'None';
        let stopsStr = '';
        if (f.type === 'TRANSPORT' && f.transportConfig && (f.transportConfig as any).stops) {
            stopsStr = `, Stops: ${((f.transportConfig as any).stops as string[]).join(' -> ')}`;
        }
        contextInfo += `- ${f.name} (Type: ${f.type}, Capacity: ${f.capacity || 'N/A'}, Amenities: ${amenitiesStr}, Hours: ${f.operatingHours || 'N/A'}${stopsStr})\n`;
      });
    }
  }

  const groq = createGroq({ apiKey: process.env.GROK_KEY });

  const result = streamText({
    model: groq('llama-3.3-70b-versatile'),
    system: `You are a helpful support chatbot for 'BookMyCampus', a university facility booking system. You help users navigate the system, book facilities, check waitlists, and manage events. Be concise and professional. Use markdown for formatting.\n\n${contextInfo}`,
    messages: modelMessages,
  });

  return result.toUIMessageStreamResponse();
}
