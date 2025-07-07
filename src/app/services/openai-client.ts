import OpenAI from 'openai';
import { environment } from '../../environment';

export class OpenAiClient {
    private readonly client = new OpenAI({
        apiKey: environment.openaiKey,
        dangerouslyAllowBrowser: true, // Allow browser usage
    });

    /**
     * Call OpenAI's chat/completions endpoint.
     * @param model e.g. 'gpt-3.5-turbo'
     * @param messages OpenAI chat messages array
     * @param options Optional extra params (temperature, etc)
     */
    async chatCompletion(
        instructions: string,
        input: string,
        model: string = 'gpt-4o',
    ): Promise<string> {
        const response = await this.client.responses.create({
            model,
            instructions,
            input
        });
        return response.output_text;
    }
}

export const openAiClient = new OpenAiClient();