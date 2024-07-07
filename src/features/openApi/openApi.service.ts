import { IOpenApiRepository } from './openApi.repository';
import { ChatOpenAI, ChatOpenAICallOptions } from '@langchain/openai';
import { ChatPromptTemplate } from '@langchain/core/prompts';
import { StringOutputParser, CommaSeparatedListOutputParser } from '@langchain/core/output_parsers';
import { StructuredOutputParser } from '@langchain/core/output_parsers';
export class OpenApiService {
  constructor(private repository: IOpenApiRepository) {}

  private async callStringOutputParser(model: ChatOpenAI<ChatOpenAICallOptions>) {
    const prompt = ChatPromptTemplate.fromMessages([
      ['system', 'Generate a joke based on a word provided by the user'],
      ['human', '{input}'],
    ]);

    // Create Parser
    const parser = new StringOutputParser();

    // Create Chain
    const chain = prompt.pipe(model).pipe(parser);

    const response = await chain.invoke({
      input: 'horse',
    });

    return response;
  }

  private async callListOutputParser(model: ChatOpenAI<ChatOpenAICallOptions>) {
    const prompt = ChatPromptTemplate.fromTemplate(
      'Provide 5 synonyms, seperated by commas, for the following word {word}'
    );

    // Create Parser
    const outputParser = new CommaSeparatedListOutputParser();

    // Create Chain
    const chain = prompt.pipe(model).pipe(outputParser);

    const response = await chain.invoke({
      word: 'joy',
    });

    return response;
  }

  private async callStructuredOutputParser(model: ChatOpenAI<ChatOpenAICallOptions>) {
    const prompt = ChatPromptTemplate.fromTemplate(
      `Extract information from the following phrase.
      Formatting instructions: {format_instructions}
      Phrase: {phrase}`
    );

    // Create Parser
    const outputParser = StructuredOutputParser.fromNamesAndDescriptions({
      name: "the name of the person",
      age: "the age of the person"
    });

    // Create Chain
    const chain = prompt.pipe(model).pipe(outputParser);

    const response = await chain.invoke({
      phrase: 'max is 30 years old', format_instructions: outputParser.getFormatInstructions()
    });

    return response;
  }

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

    const prompt = ChatPromptTemplate.fromMessages([
      ['system', 'Generate a joke based on a word provided by the user'],
      ['human', '{input}'],
    ]);

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

    //const response = await this.callStringOutputParser(model);
    //const response = await this.callListOutputParser(model);
    const response = await this.callStructuredOutputParser(model);

    console.log(response);
  }
}
