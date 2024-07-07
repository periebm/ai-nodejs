import { envConfig } from '../../config/config';
import { IOpenApiRepository } from './openApi.repository';
import { ChatOpenAI } from '@langchain/openai';
import { ChatPromptTemplate } from '@langchain/core/prompts';

export class OpenApiService {
  constructor(private repository: IOpenApiRepository) {}

  public async chatOne() {
    const model = new ChatOpenAI({
      modelName: 'gpt-3.5-turbo',
      temperature: 0.7,
      maxTokens: 1000,
      verbose: true,
    });

    const response = await model.invoke('Escreva um poema sobre NodeJS');

    console.log('RESPONSE CHATONE:', response);
  }

  public async promptTemplates() {
    const model = new ChatOpenAI({
      modelName: 'gpt-3.5-turbo',
      temperature: 0.7,
    });

    /*
    const prompt = ChatPromptTemplate.fromTemplate(
      'You are a comedian. Tell me a joke based on the following word {input}',
    ); */

    const prompt = ChatPromptTemplate.fromMessages(
      [
        ['system', 'Generate a joke based on a word provided by the user'],
        ['human', '{input}'],
      ],
    );

    //Create chain
    const chain = prompt.pipe(model);

    const response = await chain.invoke({
      input: 'dog',
    });
    console.log(response);
  }

  public async outputParsers() {
    const model = new ChatOpenAI({
      modelName: 'gpt-3.5-turbo',
      temperature: 0.7,
    });

    /*
    const prompt = ChatPromptTemplate.fromTemplate(
      'You are a comedian. Tell me a joke based on the following word {input}',
    ); */

    const prompt = ChatPromptTemplate.fromMessages(
      [
        ['system', 'Generate a joke based on a word provided by the user'],
        ['human', '{input}'],
      ],
    );

    //Create chain
    const chain = prompt.pipe(model);

    const response = await chain.invoke({
      input: 'dog',
    });
    console.log(response);
  }
}
