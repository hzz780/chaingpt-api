import type {NextRequest} from "next/server";
import {NextResponse} from "next/server";
import {Errors, GeneralChat} from '@chaingpt/generalchat';
import {APP_SETTINGS} from '../../../../appsettings';

const generalchat = new GeneralChat({
  apiKey: APP_SETTINGS.chainGPT.apiKey as string,
});

interface Context {
  params: undefined;
}

async function chainGPTChat(question: string) {
  return new Promise(async (resolve, reject) => {
    try {
      const stream = await generalchat.createChatStream({
        question: question, // 'Explain quantum computing in simple terms',
        chatHistory: "off"
      });
      let data = '';
      stream.on('data', (chunk: any) => {
        console.log(chunk.toString());
        data += chunk.toString();
      });
      stream.on('end', () => {
        console.log("Stream ended");
        resolve(data);
      });
    } catch (error) {
      console.log('error:', error);
      if (error instanceof Errors.GeneralChatError) {
        reject(error.message);
      }
    }
  });
}

export async function POST(request: NextRequest, context: Context) {
  const body: { question: string } = await request.json();
  const { question = '' } = body;
  try {
    const data = await chainGPTChat(question);
    // await setTimeout(1000);
    // const data = 'hello world';
    return NextResponse.json({ code: 0, data });
  } catch (error) {
    return NextResponse.json({ code: -1, error: error });
  }
}
