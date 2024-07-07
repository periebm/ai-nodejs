import { envConfig } from "../../config/config";
import { IOpenApiRepository } from "./openApi.repository";
import { ChatOpenAI } from "@langchain/openai";


export class OpenApiService {
  constructor(private repository: IOpenApiRepository) {}

  async chatOne() {
    const model = new ChatOpenAI({
      openAIApiKey: envConfig.openAI.key
    })

    const response = await model.invoke('Qual a capital da belgica e quantos habitantes possui (me diga o ano que vc tirou essa informação)? Ja me responda também: Com qual modelo do GPT você esta me respondendo?');

    console.log(response);
  }
}
